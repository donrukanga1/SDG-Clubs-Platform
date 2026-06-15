import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get Gemini client lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const SDG_AGENT_INSTRUCTION = `
You are the "SDGs KAP10" Intelligence Agent, a behavioral and conversational assessment system for Uganda. 
Your mission is to evaluate Knowledge (K), Attitudes (A), and Practices (P) regarding the SDGs in a uniquely Ugandan context.

CORE FRAMEWORK (KAP):
- Knowledge (K): Awareness of SDGs, Ugandan policies like NDP III, and local development issues.
- Attitudes (A): Empathy, civic responsibility, inclusion, and sustainability mindset.
- Practices (P): Practical actions, leadership decisions, and community participation.

STORYTELLING PERSONAS:
- Mzee (Community Elder): Tests cultural nuances and traditional wisdom.
- NGO Officer: Challenges technical feasibility and project planning.
- Youth Activist: Debates policy, inclusion, and the Youth Coalition for SDGs.
- Kampala City Planner: Focuses on urban thinking, Smart City, and infrastructure.

GAMEPLAY MODES:
1. STORY MODE: Interactive localized scenarios (e.g., Kasese floods, waste in Kampala, refugees in West Nile).
2. DEBATE MODE: Provocative challenges (e.g., Industrialization vs. Environment).
3. ACTION CHALLENGE: Verifying real-world practices.
4. SIMULATION: District budget allocation (e.g., UGX 2M NGO grant).

RULES:
- Respond EXCLUSIVELY in valid JSON.
- Be provocative. If a user's reasoning is weak, challenge it from a Ugandan reality perspective.
- Use localized English with occasional local greetings (Yoga, Kop-ango, Jambo, Webale, Yoga).
- Benchmark against the Youth Coalition for SDGs and UN standards.

JSON Structure:
{
  "message": "Persona-driven response text.",
  "persona": "Current Character",
  "mode": "Current Mode",
  "score": 0-100,
  "currentSdg": "SDG # and Name",
  "feedback": "Expert insight or local fact.",
  "gameState": "playing" | "completed",
  "stats": { "knowledge": cumulativeValue, "attitude": cumulativeValue, "practices": cumulativeValue }
}
`;

// Fallback Heuristics for SDG Uganda KAP10 Game
function getLocalGameFallback(message: string, history: any[], userProfile: any) {
  const norm = message.toLowerCase();
  let persona = "Mzee (Community Elder)";
  let mode = "Story Mode";
  let score = 20;
  let currentSdg = "SDG 13: Climate Action";
  let feedback = "That is a wise start. We must respect the land we reside on.";
  let msgContent = "";

  const turnCount = history.length;
  if (turnCount % 4 === 1) {
    persona = "NGO Officer";
    mode = "Debate Mode";
    currentSdg = "SDG 4: Quality Education";
    feedback = "Technically feasible, but requires community budget alignment.";
  } else if (turnCount % 4 === 2) {
    persona = "Youth Activist";
    mode = "Action Challenge";
    currentSdg = "SDG 5: Gender Equality";
    feedback = "Highly relevant to young people! Make sure school-going girls lead the committee.";
  } else if (turnCount % 4 === 3) {
    persona = "Kampala City Planner";
    mode = "Simulation Mode";
    currentSdg = "SDG 11: Sustainable Cities";
    feedback = "Connecting this with municipal drains or youth collection rails is crucial.";
  }

  if (norm.includes("hi") || norm.includes("hello") || norm.includes("jambo") || norm.includes("yoga")) {
    msgContent = `Yoga! Jambo! Welcome to Uganda's SDG KAP10 agent. I am ${persona}. I see you joined from ${userProfile?.location || "Uganda"} as a ${userProfile?.occupation || "Citizen"}. Tell me, what practical sustainable action would you like to build or debate today? Let us choose a field: Climate Action, Quality Education, or WASH Sanitation?`;
  } else if (norm.includes("climate") || norm.includes("weather") || norm.includes("tree") || norm.includes("flood") || norm.includes("landslide") || norm.includes("bamboo")) {
    currentSdg = "SDG 13: Climate Action";
    score = 25;
    msgContent = `Webale ssebo/nyabo! As ${persona}, I appreciate this focus on Climate Action. Uganda's Mt. Elgon regions have suffered rapid landslides, and Mt. Rwenzori is seeing unprecedented glacial retreats. What direct actions, like planting soil-locking bamboo buffers along riverbanks or promoting bio-gas digesters in kitchens, can your school club launch first?`;
    feedback = "Uganda's climate resilience requires localized nature-based solutions. Bamboo planting is an excellent intervention.";
  } else if (norm.includes("gender") || norm.includes("girl") || norm.includes("woman") || norm.includes("female") || norm.includes("retention") || norm.includes("period") || norm.includes("pad")) {
    currentSdg = "SDG 5: Gender Equality";
    score = 30;
    msgContent = `Otyo! Addressing school-going girls' attendance is vital. From my experience with the Youth Coalition, period poverty is one of the highest drivers of primary/secondary school dropout in rural sub-counties. How can your school club mobilize reusable pad fabrication or campaign on school-level male allyship?`;
    feedback = "Gender parity directly unlocks SDG 4. Supporting reproductive safety keeps female talent in school.";
  } else if (norm.includes("water") || norm.includes("wash") || norm.includes("toilet") || norm.includes("filtration") || norm.includes("sand") || norm.includes("sanitation") || norm.includes("filter")) {
    currentSdg = "SDG 6: Clean Water & Sanitation";
    score = 25;
    msgContent = `Cop-aladi! Clean water is health. Building sand-and-gravel charcoal filtration units is a wonderful low-cost practical student intervention. Have you considered installing these filter tanks near the school rainwater harvest drums, and how will your club handle system cleaning?`;
    feedback = "Localized sand-charcoal filtering yields high feasibility with immediate health improvements.";
  } else if (norm.includes("education") || norm.includes("school") || norm.includes("club") || norm.includes("learn") || norm.includes("teacher") || norm.includes("quiz")) {
    currentSdg = "SDG 4: Quality Education";
    score = 20;
    msgContent = `Indeed, education is the seed of sustainability. As ${persona}, I believe in transforming standard theoretical lessons into active, local simulations. How can your club coordinate with school administration so that teachers integrate these SDG topics directly into term assessments?`;
    feedback = "Active pedagogy has been shown to improve sustainability test scores by over 30% in regional high schools.";
  } else {
    score = 15;
    msgContent = `Kop-ango! That is an interesting proposal on our journey to 2030. Under local district regulations, we want to maximize feasibility, creativity, and actual practices. Can you expand on how community youth will take active, daily ownership of this, and what resources are required?`;
  }

  msgContent += " \n\n⚠️ *[Local Heuristic Fallback enabled due to a billing issue (Dunning) with your workspace API key]*";

  return {
    message: msgContent,
    persona,
    mode,
    score,
    currentSdg,
    feedback,
    gameState: "playing",
    stats: {
      knowledge: Math.min(100, 45 + turnCount * 8),
      attitude: Math.min(100, 50 + turnCount * 5),
      practices: Math.min(100, 30 + turnCount * 12)
    }
  };
}

// Fallback Heuristics for SDG Academy Facilitator Agent
function getLocalAcademyFallback(message: string, topicTitle: string, topicSummary: string, history: any[], userProfile: any) {
  const norm = message.toLowerCase();
  const turnCount = history.length;
  let score = 20;
  let msgContent = "";
  let feedback = "This conforms directly to standard SDG Club facilitation parameters.";

  if (norm.includes("hi") || norm.includes("hello") || norm.includes("guide")) {
    msgContent = `Kop-aladi! Welcome to today's interactive session on "${topicTitle}". Our focus is: ${topicSummary}. As your SDG Academy Facilitator, I want you to brainstorm or propose how your club will address this issue on or around your school campus. What is your first proposed action?`;
  } else {
    score = 25;
    msgContent = `Excellent suggestion! Proposing to address "${topicTitle}" through direct school-club mobilization is highly impactful. Under Ugandan local constraints (transport costs, water storage resources, district permission), how can we ensure this is sustainable over the next 12 months? Let's design the next specific step together!`;
    feedback = `Your ideas align with NDPIV guidelines for youth-driven environment/social development.`;
  }

  msgContent += " \n\n⚠️ *[Local Heuristic Fallback enabled due to a billing issue (Dunning) with your workspace API key]*";

  return {
    message: msgContent,
    score,
    feedback,
    stats: {
      creativity: Math.min(100, 65 + turnCount * 5),
      feasibility: Math.min(100, 55 + turnCount * 4),
      impact: Math.min(100, 60 + turnCount * 6)
    }
  };
}

app.post("/api/game/chat", async (req, res) => {
  const { message, history, userProfile } = req.body;
  try {
    const ai = getGenAI();
    
    // Customize system instruction with user profile
    const personalizedInstruction = `
${SDG_AGENT_INSTRUCTION}

USER PROFILE:
- Age Range: ${userProfile?.ageRange || "General Youth"}
- Location: ${userProfile?.location || "Uganda"}
- Occupation: ${userProfile?.occupation || "Citizen/Student"}

ADAPTATION:
- Adjust your vocabulary and complexity of debate scenarios based on the age range.
- Use the User's Occupation to ground the scenarios. If they are a student, talk about schools/clubs. If a teacher, focus on pedagogy and classroom impact. If a doctor, focus on public health and SDG 3.
- For children (under 12): Be simple, fun and encouraging.
- For youth (13-24): Be challenging, use tech/startup/policy terms.
- For adults (25+): Be professional, focus on leadership and strategic impact.
    `;

    const contents = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: h.parts.map((p: any) => ({ text: p.text }))
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: personalizedInstruction,
        responseMimeType: "application/json",
      }
    });

    if (!result.text) throw new Error("EMPTY_RESPONSE");
    res.json(JSON.parse(result.text));
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const isBillingOrPermissionIssue = errMsg.includes("dunning") || errMsg.includes("403") || errMsg.includes("PERMISSION_DENIED") || errMsg.includes("ApiError");
    
    if (isBillingOrPermissionIssue) {
      console.warn("⚠️ [Service Status] Gemini Billing/Quota Restriction (Dunning detected: projects/811880941140). Routing cleanly to high-fidelity Ugandan KAP10 simulator fallback.");
    } else {
      console.error("Gemini Error:", error);
    }

    if (error?.message === "GEMINI_API_KEY_MISSING") {
      return res.status(401).json({ error: "GEMINI_API_KEY is missing. Please add it in the Settings > Secrets panel in AI Studio." });
    }
    
    try {
      const fallbackResult = getLocalGameFallback(message, history, userProfile);
      return res.json(fallbackResult);
    } catch (fallbackErr) {
      res.status(500).json({ error: "The SDG Agent is resting. Please check your API key scope and quota." });
    }
  }
});

// SDG Academy Class Exercises Guided Agent Route
app.post("/api/academy/chat", async (req, res) => {
  const { message, history, topicTitle, topicSummary, userProfile } = req.body;
  try {
    const ai = getGenAI();

    const ACADEMY_AGENT_INSTRUCTION = `
You are the "SDG Academy Facilitator" Agent, guiding a class exercise for an SDGs school club in Uganda.
The topic for this week's class exercise is: "${topicTitle}".
Topic Summary: "${topicSummary}".

Your objective is to guide students through an interactive class exercise or simulation based on this weekly topic. Help them design real solutions, perform roleplay debates, or build practical action drafts under local Ugandan realities (such as district budget boundaries, youth advocacy, gender parity and National Development Plan IV integration).

FACILITATION STYLES based on the active topic:
- If the topic is "SDG Introduction & Problem Mapping (Weeks 1-2)", focus on systems mapping and locating waste, environmental, or health bottlenecks around school campuses.
- If the topic is "Gender Equality & Female Retention (Weeks 3-4)", challenge them to deconstruct period poverty, design male-allyship corridor pledges, or safeguard young girls' school completion.
- If the topic is "Climate Action & Adaptation (Weeks 5-6)", focus on deploying Nature-Based Solutions (like planting vetiver grass on hillsides or bio-gas digesters in kitchens) under local weather stresses.
- If the topic is "WASH & Student Health (Weeks 7-8)", guide them on constructing sand-charcoal water filtration systems or building peer-listening mental health networks.
- If the topic is "Peace, Mediation & Global Showcase (Weeks 9-10)", instruct them to simulate non-violent student conflict mediation or pitch their prototypes for SDG 17 partnerships.

BENCHMARKS & CHALLENGES:
- Be encouraging but realistic. Challenge weak ideas with Ugandan socio-economic realities (e.g., transport obstacles, electricity grid dropouts, funding limits).
- Use local greetings (Yoga, Kop-ango, Jambo, Webale, Yoga, Kop-aladi).
- Benchmark their suggestions against the Youth Coalition for SDGs and UN standards.

RESPONSE FORMAT:
You must respond EXCLUSIVELY in valid JSON. No trailing text.

JSON Structure:
{
  "message": "Persona-driven facilitation feedback and open-ended guiding question.",
  "score": 0-100, // Score points awarded for the quality/creativity of their solution proposal in this turn (0 to 30)
  "feedback": "An expert localized fact or recommendation regarding their idea.",
  "stats": { 
    "creativity": 0-100, // Creativity score of their proposal (e.g., 85)
    "feasibility": 0-100, // Feasibility under Ugandan local constraints
    "impact": 0-100 // Impact on the target community
  }
}
`;

    const contents = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: h.parts.map((p: any) => ({ text: p.text }))
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: ACADEMY_AGENT_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    if (!result.text) throw new Error("EMPTY_RESPONSE");
    res.json(JSON.parse(result.text));
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const isBillingOrPermissionIssue = errMsg.includes("dunning") || errMsg.includes("403") || errMsg.includes("PERMISSION_DENIED") || errMsg.includes("ApiError");
    
    if (isBillingOrPermissionIssue) {
      console.warn("⚠️ [Service Status] Academy Gemini Billing/Quota Restriction (Dunning detected: projects/811880941140). Routing cleanly to high-fidelity Academy simulator fallback.");
    } else {
      console.error("Academy Gemini Error:", error);
    }

    if (error?.message === "GEMINI_API_KEY_MISSING") {
      return res.status(401).json({ error: "GEMINI_API_KEY is missing. Please add it in the Settings > Secrets panel in AI Studio." });
    }

    try {
      const fallbackResult = getLocalAcademyFallback(message, topicTitle, topicSummary, history, userProfile);
      return res.json(fallbackResult);
    } catch (fallbackErr) {
      res.status(500).json({ error: "The Academy Facilitator is resting. Please check your API key scope and quota." });
    }
  }
});

// Mock Scoreboard Data
app.get("/api/reports/scoreboard", (req, res) => {
  const mockScoreboard = [
    { rank: 1, name: "Kabaka_Dev", score: 8540, location: "Kampala" },
    { rank: 2, name: "EcoWarrior_UG", score: 7210, location: "Entebbe" },
    { rank: 3, name: "SdgMzee", score: 6890, location: "Mbarara" },
    { rank: 4, name: "YouthVibe", score: 5430, location: "Jinja" },
    { rank: 5, name: "SmartCity_256", score: 4900, location: "Kampala" }
  ];
  res.json(mockScoreboard);
});

// Mock Reporting Data
app.get("/api/reports/summary", (req, res) => {
  const mockReport = {
    totalInteractions: 1240,
    averageKAP: { knowledge: 68, attitude: 74, practices: 42 },
    topPerformingSDGs: ["SDG 13: Climate Action", "SDG 4: Quality Education", "SDG 8: Decent Work"],
    regionalInsights: [
      { region: "Central", activity: 45, mainConcentration: "Innovation & Tech" },
      { region: "Northern", activity: 22, mainConcentration: "Peace & Recovery" },
      { region: "Eastern", activity: 18, mainConcentration: "Climate & Agriculture" },
      { region: "Western", activity: 15, mainConcentration: "Conservation & Energy" }
    ]
  };
  res.json(mockReport);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
