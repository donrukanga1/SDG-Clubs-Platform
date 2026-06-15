/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { CloudRunManagementView } from "./components/CloudRunManagementView";
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  getDocs,
  getDocFromServer,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_CURRICULUM, CourseTopic } from "./defaultCurriculum";

// Firestore Operation helpers
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export const handleFirestoreError = (
  error: unknown,
  operationType: OperationType,
  path: string | null,
) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// Verify initial connection to Firestore as mandated by critical constraints
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
import { ALL_QUIZ_QUESTIONS } from "./quizData";
import {
  Send,
  Target,
  Smartphone,
  ChevronRight,
  RefreshCcw,
  Sparkles,
  Info,
  BookOpen,
  BarChart3,
  Search,
  Users,
  GraduationCap,
  Globe,
  PieChart,
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  MessageSquare,
  Award,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  ThumbsUp,
  Share2,
  Link,
  FileText,
  Heart,
  Sprout,
  Lightbulb,
  Microscope,
  Compass,
  Rocket,
  Lock,
  Shield,
  CheckSquare,
  Sparkle,
  ShieldAlert,
  KeyRound,
  Check,
  ShieldCheck,
} from "lucide-react";

interface GameState {
  message: string;
  persona: string;
  mode: string;
  score: number;
  currentSdg: string;
  feedback: string;
  gameState: "playing" | "completed";
  stats: {
    knowledge: number;
    attitude: number;
    practices: number;
  };
}

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface UserProfile {
  ageRange: string;
  location: string;
  occupation: string;
}

interface SchoolClub {
  id: string;
  name: string;
  institution: string;
  level: "High School" | "University";
  region: "Western" | "Central" | "Eastern" | "Northern";
  score: number;
  subscribed?: boolean;
  credits?: number;
  geminiLinked?: boolean;
  downloadCount?: number;
  email?: string;
  passcode?: string;
  status?: "pending" | "approved" | "suspended";
}

const MODES = [
  { id: "story", name: "Story Mode", icon: "📖", color: "bg-sdg-4" },
  { id: "debate", name: "Debate Mode", icon: "⚖️", color: "bg-sdg-16" },
  { id: "practices", name: "Practices Mode", icon: "⚡", color: "bg-sdg-9" },
  { id: "simulation", name: "Simulation", icon: "🏢", color: "bg-sdg-11" },
];

const SDG_LIST = [
  { id: 1, name: "No Poverty", color: "bg-sdg-1" },
  { id: 2, name: "Zero Hunger", color: "bg-sdg-2" },
  { id: 3, name: "Good Health", color: "bg-sdg-3" },
  { id: 4, name: "Quality Education", color: "bg-sdg-4" },
  { id: 5, name: "Gender Equality", color: "bg-sdg-5" },
  { id: 6, name: "Clean Water", color: "bg-sdg-6" },
  { id: 7, name: "Affordable Energy", color: "bg-sdg-7" },
  { id: 8, name: "Decent Work", color: "bg-sdg-8" },
  { id: 9, name: "Industry & Innovation", color: "bg-sdg-9" },
  { id: 10, name: "Reduced Inequalities", color: "bg-sdg-10" },
  { id: 11, name: "Sustainable Cities", color: "bg-sdg-11" },
  { id: 12, name: "Responsible Consumption", color: "bg-sdg-12" },
  { id: 13, name: "Climate Action", color: "bg-sdg-13" },
  { id: 14, name: "Life Below Water", color: "bg-sdg-14" },
  { id: 15, name: "Life on Land", color: "bg-sdg-15" },
  { id: 16, name: "Peace & Justice", color: "bg-sdg-16" },
  { id: 17, name: "Partnerships", color: "bg-sdg-17" },
];

export default function App() {
  const [activeView, setActiveView] = useState<
    "onboarding" | "assessment" | "academy" | "reports" | "scoreboard"
  >("onboarding");
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    ageRange: "",
    location: "Uganda",
    occupation: "",
  });
  const [userRole, setUserRole] = useState<"user" | "admin">("user");
  const [registeredClub, setRegisteredClub] = useState<SchoolClub | null>(
    () => {
      try {
        const saved = localStorage.getItem("kap10_registered_club");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    },
  );

  // Assessment State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [activeMode, setActiveMode] = useState("story");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Data States
  const [reportData, setReportData] = useState<any>(null);
  const [scoreboardData, setScoreboardData] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [coursesList, setCoursesList] =
    useState<CourseTopic[]>(DEFAULT_CURRICULUM);

  // Keep registeredClub ref in sync to avoid stale closures in listeners
  const registeredClubRef = useRef(registeredClub);
  useEffect(() => {
    registeredClubRef.current = registeredClub;
  }, [registeredClub]);

  // 1. Live synchronization and Seeding of clubs and courses in Firestore at App startup
  useEffect(() => {
    const unsubClubs = onSnapshot(
      collection(db, "clubs"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            const defaultClubs = [
              {
                id: "SC-C-MAK-01",
                name: "Makerere Environmental Coalition",
                institution: "Makerere University",
                level: "University",
                region: "Central",
                score: 410,
                members: 45,
                sdgFocus: "SDG 13: Climate Action",
                leader: "Dr. Nakasi Florence",
                bio: "Mobilizing students to advocate for sustainable urban spaces, restoration of wetlands, and holding municipal cleanups in Kampala suburb swamp lines.",
                email: "contact@makcoalition.org",
                lastActive: "Active 5 mins ago",
                leaders:
                  "Dr. Nakasi Florence (President), Okello David (Vice President), Namara Alice (Secretary)",
                patron: "Prof. Charles Ssekyewa",
                membersList:
                  "Jane Nsubuga, Mark Lukwago, Sarah Namara, John Bosco, Timothy Wandera, Evelyn Akot, Ronald Ssemwogerere",
                mission:
                  "To inspire, educate, and mobilize university youth towards aggressive local wetland protection, urban waste stream reduction, and ecological data cataloging.",
                achievements:
                  "Planted 500 indigenous trees along Kampala swamps, ran 12 zero-trash cleanup drives, and successfully lobbied the municipal council for water quality monitors.",
              },
              {
                id: "SC-C-BUD-02",
                name: "King's College Budo Green Club",
                institution: "King's College Budo",
                level: "High School",
                region: "Central",
                score: 320,
                members: 30,
                sdgFocus: "SDG 12: Responsible Consumption",
                leader: "Kakooza Ronald",
                bio: "Engaging high school peers in eco-friendly innovations, trash sorting campaigns, and running the school's cafeteria organic composting pits.",
                email: "budogreen@budo.ac.ug",
                lastActive: "Active today",
                leaders:
                  "Kakooza Ronald (Chairman), Catherine Atwiine (Co-Chair), Kimbugwe Trevor (Treasury)",
                patron: "Madam Joanita Mukasa",
                membersList:
                  "Douglas Kato, Phiona Nankya, Arnold Mukwaya, Christine Opio, Mathew Kabugo, Patricia Atuhaire",
                mission:
                  "To champion zero-waste circular loops on the school campus through organic composting, recycling assemblies, and low-waste school store guidelines.",
                achievements:
                  "Constructed 4 functional organic composting pits, fully recycled 1,200kg of school paper, and established a native botanical nursery with 150 species.",
              },
              {
                id: "SC-W-MHS-03",
                name: "Mbarara High Climate Sentinels",
                institution: "Mbarara High School",
                level: "High School",
                region: "Western",
                score: 260,
                members: 25,
                sdgFocus: "SDG 6: Clean Water & Sanitation",
                leader: "Atwine Derrick",
                bio: "Defending dry hillsides through community awareness, rainwater gathering kits and river health workshops in Western Uganda regional streams.",
                email: "atwined@mbararahigh.sc.ug",
                lastActive: "Active 2 days ago",
                leaders:
                  "Atwine Derrick (Team Lead), Matsiko Joshua (Water Lead), Nahabwe Brenda (Outreach)",
                patron: "Mr. Herbert Tumwesigye",
                membersList:
                  "Emmanuel Nuwagaba, Davis Mugisha, Chrispus Tugume, Timothy Twesigye, Mark Ayebare",
                mission:
                  "To fortify dry Western Uganda hillsides through community awareness, rainwater gathering kits and river health workshops.",
                achievements:
                  "Distributed 20 low-cost rainwater harvesting containers to rural standard units, mapped 5 dry river sections, and trained 120 local youth.",
              },
              {
                id: "SC-N-GUL-04",
                name: "Gulu University SDG Activists",
                institution: "Gulu University",
                level: "University",
                region: "Northern",
                score: 190,
                members: 35,
                sdgFocus: "SDG 2: Zero Hunger",
                leader: "Acan Grace",
                bio: "Pioneering climate-smart bio-gardens, sorghum farming nurseries, and distributing nutrient-dense seeds to households across Gulu drought hotspots.",
                email: "acan.g@gulu.ac.ug",
                lastActive: "Active today",
                leaders:
                  "Acan Grace (Director), Kilama Samuel (Agro-Lead), Oyella Gladys (Liaison)",
                patron: "Dr. Collins Benson Okech",
                membersList:
                  "Walter Odong, Fiona Akello, Justin Komakech, Sharon Auma, Patrick Oola, Irene Labol",
                mission:
                  "Pioneering climate-smart bio-gardens, sorghum farming nurseries, and distributing nutrient-dense seeds to households across Gulu drought hotspots.",
                achievements:
                  "Constructed 5 climate-smart seed drying nursery beds, distributed 80 high-yield sorghum bags to refugee host families, and hosted 3 community agro-fairs.",
              },
              {
                id: "SC-E-KCB-05",
                name: "Kiira College Butiki Innovators",
                institution: "Kiira College Butiki",
                level: "High School",
                region: "Eastern",
                score: 140,
                members: 22,
                sdgFocus: "SDG 9: Industry & Innovation",
                leader: "Wafula Paul",
                bio: "Developing low-cost crop solar-dryers to prevent aflatoxins in agricultural corn harvests across Eastern region networks.",
                email: "wafulap@butiki.sc.ug",
                lastActive: "Active yesterday",
                leaders:
                  "Wafula Paul (Chief Engineer), Mugisha Ivan (Hardware Lead), Tenywa Edgar (Testing Coordinator)",
                patron: "Mr. James Kirya",
                membersList:
                  "Arthur Mwase, Geofrey Isabirye, Allan Nabihamba, Philip Mukisa, Charles Waiswa",
                mission:
                  "Developing low-cost crop solar-dryers and electronic microgrids to prevent aflatoxins in agricultural corn harvests across Eastern region networks.",
                achievements:
                  "Successfully built 2 full-scale solar grain dryers with local bamboo and UV sheeting, reducing post-harvest mold losses for 30 neighboring sub-county farms.",
              },
            ];
            for (const c of defaultClubs) {
              const clubWithAuth = {
                ...c,
                status: "approved",
                passcode: "1234",
              };
              await setDoc(doc(db, "clubs", c.id), clubWithAuth);
            }
          } else {
            const list: any[] = [];
            const isDefaultClub = (id: string) =>
              [
                "SC-C-MAK-01",
                "SC-C-BUD-02",
                "SC-W-MHS-03",
                "SC-N-GUL-04",
                "SC-E-KCB-05",
              ].includes(id);
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                ...data,
                status:
                  data.status ||
                  (isDefaultClub(data.id) ? "approved" : "pending"),
                passcode:
                  data.passcode || (isDefaultClub(data.id) ? "1234" : ""),
              });
            });
            setAllClubs(list);

            const activeRegClub = registeredClubRef.current;
            if (activeRegClub) {
              const currentMatch = list.find((c) => c.id === activeRegClub.id);
              if (currentMatch) {
                const localRep = {
                  id: currentMatch.id,
                  name: currentMatch.name,
                  institution: currentMatch.institution,
                  level: currentMatch.level,
                  region: currentMatch.region,
                  score: currentMatch.score,
                  subscribed: currentMatch.subscribed || false,
                  credits:
                    currentMatch.credits !== undefined
                      ? currentMatch.credits
                      : 5,
                  geminiLinked: currentMatch.geminiLinked || false,
                  downloadCount: currentMatch.downloadCount || 0,
                  email: currentMatch.email,
                  passcode: currentMatch.passcode,
                  status: currentMatch.status,
                };
                if (
                  JSON.stringify(activeRegClub) !== JSON.stringify(localRep)
                ) {
                  localStorage.setItem(
                    "kap10_registered_club",
                    JSON.stringify(localRep),
                  );
                  setRegisteredClub(localRep);
                }
              } else {
                localStorage.removeItem("kap10_registered_club");
                setRegisteredClub(null);
                alert(
                  "Your SDGs Club Chapter account has been deleted by the administrator.",
                );
              }
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, "clubs");
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "clubs");
      },
    );

    const unsubCourses = onSnapshot(
      collection(db, "courses"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            for (const course of DEFAULT_CURRICULUM) {
              await setDoc(doc(db, "courses", String(course.id)), course);
            }
          } else {
            const list: CourseTopic[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as CourseTopic);
            });
            list.sort((a, b) => Number(a.id) - Number(b.id));
            setCoursesList(list);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, "courses");
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "courses");
      },
    );

    return () => {
      unsubClubs();
      unsubCourses();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeView === "reports") {
      fetch("/api/reports/summary")
        .then((res) => res.json())
        .then((data) => setReportData(data));
    }
    if (activeView === "scoreboard") {
      fetch("/api/reports/scoreboard")
        .then((res) => res.json())
        .then((data) => setScoreboardData(data));
    }
  }, [activeView]);

  const handleOnboarding = (age: string, occupation: string) => {
    setUserProfile({ ...userProfile, ageRange: age, occupation });
    setActiveView("assessment");
    handleChat(
      `Hello! I'm a ${occupation} (${age}) and I'm ready to learn and co-create on the SDGs platform.`,
    );
  };

  const handleChat = async (userMessage: string, forceMode?: string) => {
    if (!userMessage.trim() || loading) return;

    // 1. Message limit validation for unsubscribed chapters (max 5 dialogues)
    const userMsgCount = messages.filter((m) => m.role === "user").length;
    const isSubscribed = registeredClub?.subscribed || false;
    if (userMsgCount >= 5 && !isSubscribed) {
      setMessages((prev) => [
        ...prev,
        { role: "user", parts: [{ text: userMessage }] },
        {
          role: "model",
          parts: [
            {
              text: "⚠️ CONVERSATION LOCKED: You have run out of free trial messages (5 messages limit reached). Feel free to click the '💎 Premium Club Hub' button in the toolbar above to activate your subscription for UGX 10,000 (High School) or UGX 20,000 (Campus Connect) to get unlimited agent messages, download templates, and earn badges!",
            },
          ],
        },
      ]);
      setPremiumModalOpen(true);
      return;
    }

    // 2. Credits threshold validation (paid version has maximum threshold of 25 unless direct key linked)
    if (registeredClub) {
      const isLinked = registeredClub.geminiLinked || false;
      const currentCredits =
        registeredClub.credits !== undefined
          ? registeredClub.credits
          : isSubscribed
            ? 25
            : 5;
      if (currentCredits <= 0 && !isLinked) {
        setMessages((prev) => [
          ...prev,
          { role: "user", parts: [{ text: userMessage }] },
          {
            role: "model",
            parts: [
              {
                text: "⚠️ OUT OF SDG CREDITS: Your SDG Credit Vault has 0 credits. Since standard paid subscription holds a maximum of 25 credits, please open '💎 Premium Club Hub' and direct connect your own custom Gemini API Key to bypass the threshold and authorize unlimited credits!",
              },
            ],
          },
        ]);
        setPremiumModalOpen(true);
        return;
      }
    }

    const messageWithMode = forceMode
      ? `[MODE: ${forceMode}] ${userMessage}`
      : userMessage;
    const newUserMessage: ChatMessage = {
      role: "user",
      parts: [{ text: userMessage }],
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/game/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageWithMode,
          history: messages,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const modelResponse: ChatMessage = {
        role: "model",
        parts: [{ text: data.message }],
      };
      setMessages((prev) => [...prev, modelResponse]);
      setGameState(data);
      if (data.mode) setActiveMode(data.mode.toLowerCase());
      setTotalScore((prev) => prev + (data.score || 0));

      // 3. Decrement credit if user belongs to registered club
      if (registeredClub) {
        const isLinked = registeredClub.geminiLinked || false;
        if (!isLinked) {
          const oldCredits =
            registeredClub.credits !== undefined
              ? registeredClub.credits
              : isSubscribed
                ? 25
                : 5;
          const newCredits = Math.max(0, oldCredits - 1);
          const updatedClub: SchoolClub = {
            ...registeredClub,
            credits: newCredits,
          };
          setRegisteredClub(updatedClub);
          localStorage.setItem(
            "kap10_registered_club",
            JSON.stringify(updatedClub),
          );
          try {
            updateDoc(doc(db, "clubs", registeredClub.id), {
              credits: newCredits,
            }).catch(() => {});
          } catch (e) {}
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            {
              text:
                error.message || "Something went wrong. Check your API key.",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (activeView === "onboarding") {
    return <OnboardingView onComplete={handleOnboarding} />;
  }

  return (
    <div id="sdgs-platform-root" className="min-h-screen bg-[#F8F9FA] text-[#141414] font-sans flex flex-col pb-16 md:pb-0">
      <header id="platform-desktop-header" className="border-b-4 border-black bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div
          id="header-profile-toggle"
          className="flex items-center gap-4 cursor-help hover:opacity-90"
          onClick={() => setUserRole(userRole === "user" ? "admin" : "user")}
        >
          <div className="w-12 h-12 bg-sdg-3 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-white font-black text-xl">CP</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black uppercase leading-none font-display text-gray-950">
              SDG CLUBS PLATFORM
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-[10px] uppercase font-bold text-sdg-4 tracking-wider">
                CoCreate for a better Uganda
              </p>
              {registeredClub && (
                <div className="flex items-center gap-2">
                  <span className="bg-sdg-16 text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-tight">
                    Club Active: {registeredClub.id}
                  </span>
                  <button
                    id="btn-header-premium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPremiumModalOpen(true);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 border border-black text-[8px] font-black uppercase transition-all ${registeredClub.subscribed ? "bg-amber-100 text-amber-700 font-extrabold" : "bg-red-100 text-red-700 animate-pulse"} rounded`}
                  >
                    <Sparkle size={8} className="animate-spin text-amber-500" />
                    <span>
                      {registeredClub.subscribed
                        ? "💎 Premium Portal"
                        : "⚠️ Free Trial"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav id="desktop-navbar" className="hidden md:flex items-center gap-2">
          <NavButton
            active={activeView === "assessment"}
            onClick={() => setActiveView("assessment")}
            icon={<Target size={16} />}
            label="SDG Agent"
          />
          <NavButton
            active={activeView === "academy"}
            onClick={() => setActiveView("academy")}
            icon={<GraduationCap size={16} />}
            label="SDG Academy"
          />
          <NavButton
            active={activeView === "scoreboard"}
            onClick={() => setActiveView("scoreboard")}
            icon={<Users size={16} />}
            label="Konnect-Booth"
          />
          {userRole === "admin" && (
            <NavButton
              active={activeView === "reports"}
              onClick={() => setActiveView("reports")}
              icon={<BarChart3 size={16} />}
              label="Reports"
            />
          )}
        </nav>

        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black uppercase text-gray-400">
            {userRole === "admin"
              ? "Admin Mode"
              : registeredClub
                ? `${registeredClub.name} Score`
                : "Intelligence Score"}
          </span>
          <span className="text-2xl font-black">
            {userRole === "admin"
              ? "∞"
              : registeredClub
                ? registeredClub.score
                : totalScore}
          </span>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav id="mobile-bottom-nav" className="md:hidden flex border-t-4 border-black bg-white fixed bottom-0 left-0 right-0 z-50 h-16 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] divide-x-2 divide-black">
        <button
          id="mobile-nav-btn-agent"
          onClick={() => setActiveView("assessment")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeView === "assessment" ? "bg-black text-white" : "bg-white text-black h-full hover:bg-gray-50"}`}
        >
          <Target size={16} />
          <span className="text-[10px] font-black uppercase tracking-wider">SDG Agent</span>
        </button>
        <button
          id="mobile-nav-btn-academy"
          onClick={() => setActiveView("academy")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeView === "academy" ? "bg-black text-white" : "bg-white text-black h-full hover:bg-gray-50"}`}
        >
          <GraduationCap size={16} />
          <span className="text-[10px] font-black uppercase tracking-wider">Academy</span>
        </button>
        <button
          id="mobile-nav-btn-kb"
          onClick={() => setActiveView("scoreboard")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeView === "scoreboard" ? "bg-black text-white" : "bg-white text-black h-full hover:bg-gray-50"}`}
        >
          <Users size={16} />
          <span className="text-[10px] font-black uppercase tracking-wider">KB Booth</span>
        </button>
        {userRole === "admin" && (
          <button
            id="mobile-nav-btn-admin"
            onClick={() => setActiveView("reports")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeView === "reports" ? "bg-black text-white" : "bg-white text-black h-full hover:bg-gray-50"}`}
          >
            <BarChart3 size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Admin</span>
          </button>
        )}
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {activeView === "assessment" && (
          <AssessmentView
            gameState={gameState}
            activeMode={activeMode}
            handleChat={handleChat}
            messages={messages}
            loading={loading}
            inputText={inputText}
            setInputText={setInputText}
            chatEndRef={chatEndRef}
            userProfile={userProfile}
            onReset={() => setMessages([])}
          />
        )}
        {activeView === "academy" && (
          <AcademyView
            registeredClub={registeredClub}
            setRegisteredClub={setRegisteredClub}
            userProfile={userProfile}
            onSdgSelect={(sdg) => {
              setActiveView("assessment");
              handleChat(`I want to learn about SDG ${sdg.id}: ${sdg.name}`);
            }}
            setPremiumModalOpen={setPremiumModalOpen}
            allClubs={allClubs}
            coursesList={coursesList}
          />
        )}
        {activeView === "reports" && userRole === "admin" && (
          <ReportsView
            data={reportData}
            allClubs={allClubs}
            coursesList={coursesList}
          />
        )}
        {activeView === "scoreboard" && (
          <ScoreboardView
            data={scoreboardData}
            userProfile={userProfile}
            userScore={totalScore}
            registeredClub={registeredClub}
            setRegisteredClub={setRegisteredClub}
            setPremiumModalOpen={setPremiumModalOpen}
            allClubs={allClubs}
            setAllClubs={setAllClubs}
            coursesList={coursesList}
            setCoursesList={setCoursesList}
          />
        )}
      </main>

      <PremiumHubModal
        open={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        registeredClub={registeredClub}
        setRegisteredClub={setRegisteredClub}
      />
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 text-xs font-black uppercase tracking-tight transition-all border-2 border-transparent ${
        active
          ? "bg-black text-white rounded-none border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
          : "hover:scale-105"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OnboardingView({
  onComplete,
}: {
  onComplete: (age: string, occupation: string) => void;
}) {
  const [step, setStep] = useState<"age" | "occupation">("age");
  const [selectedAge, setSelectedAge] = useState("");

  const ages = ["Under 12", "13-17", "18-24", "25-35", "Above 35"];
  const occupations = [
    "Student",
    "Teacher",
    "Doctor",
    "Engineer",
    "Farmer",
    "Entrepreneur",
    "Civil Servant",
    "Artist",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-sdg-17 flex items-center justify-center p-6">
      <motion.div
        key={step}
        initial={{
          opacity: 0,
          scale: 0.9,
          x: step === "occupation" ? 20 : -20,
        }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-sdg-3 border-4 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Globe className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase font-display italic leading-none">
            Welcome to SDG CLUBS PLATFORM
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-tight">
            {step === "age"
              ? "Identify your age to calibrate the platform"
              : "Select your occupation for personalized scenarios"}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 text-center">
            {step === "age" ? "Select Your Age Range" : "What do you do?"}
          </h3>
          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {step === "age"
              ? ages.map((age) => (
                  <button
                    key={age}
                    onClick={() => {
                      setSelectedAge(age);
                      setStep("occupation");
                    }}
                    className="p-4 border-2 border-black font-black uppercase hover:bg-black hover:text-white transition-all flex items-center justify-between group"
                  >
                    {age}
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))
              : occupations.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => onComplete(selectedAge, occ)}
                    className="p-4 border-2 border-black font-black uppercase hover:bg-black hover:text-white transition-all flex items-center justify-between group"
                  >
                    {occ}
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
          </div>
          {step === "occupation" && (
            <button
              onClick={() => setStep("age")}
              className="w-full text-[10px] font-black uppercase text-gray-400 hover:text-black"
            >
              Back to age selection
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AssessmentView({
  gameState,
  activeMode,
  handleChat,
  messages,
  loading,
  inputText,
  setInputText,
  chatEndRef,
  userProfile,
  onReset,
}: any) {
  const [showModesMobile, setShowModesMobile] = useState(false);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      <aside
        className={`w-full lg:w-96 border-r-4 border-black bg-white p-6 space-y-8 overflow-y-auto ${showModesMobile ? "block absolute inset-0 z-30 lg:relative" : "hidden lg:block"}`}
      >
        <div className="flex justify-between items-center lg:hidden mb-4">
          <h3 className="text-xl font-black uppercase italic">Select Mode</h3>
          <button
            onClick={() => setShowModesMobile(false)}
            className="bg-black text-white p-2"
          >
            CLOSE
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                handleChat(`Switch to ${m.name}`, m.id);
                setShowModesMobile(false);
              }}
              className={`p-3 text-left border-2 border-black rounded-none transition-all space-y-1 ${activeMode.includes(m.id) ? `${m.color} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` : "bg-white hover:bg-gray-50"}`}
            >
              <span className="text-xl">{m.icon}</span>
              <div className="text-[10px] font-black uppercase leading-none">
                {m.name}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onReset}
          className="w-full p-4 border-2 border-black bg-sdg-7 font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
        >
          Switch Goal / Goal Explorer
        </button>

        <div className="p-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <h3 className="text-xs font-black uppercase italic border-b-2 border-black pb-2">
            KAP Scorecard
          </h3>
          <StatRow
            label="Knowledge"
            value={gameState?.stats.knowledge || 0}
            color="bg-sdg-3"
          />
          <StatRow
            label="Attitude"
            value={gameState?.stats.attitude || 0}
            color="bg-sdg-4"
          />
          <StatRow
            label="Practices"
            value={gameState?.stats.practices || 0}
            color="bg-sdg-9"
          />
        </div>

        <div className="p-4 bg-black text-white border-2 border-black">
          <div className="text-[10px] font-black uppercase text-sdg-7">
            Persona Active
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="text-sdg-7 w-6 h-6" />
            <h4 className="font-black text-lg">
              {gameState?.persona || "Kyeyo Agent"}
            </h4>
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col bg-[#FDFDFB] relative">
        {/* Mobile Header for Assessment */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b-2 border-black bg-white">
          <button
            onClick={() => setShowModesMobile(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase border-2 border-black px-3 py-1"
          >
            <Smartphone size={14} />
            {activeMode} Mode
          </button>
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-sdg-3 border border-black" />
            <div className="w-4 h-4 bg-sdg-4 border border-black" />
            <div className="w-4 h-4 bg-sdg-9 border border-black" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto space-y-8 pt-10">
              <div className="text-center space-y-4">
                <h2 className="text-2xl sm:text-4xl font-black uppercase italic leading-none font-display">
                  Select a Goal to Start
                </h2>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                  Active SDG Explorer
                </p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {SDG_LIST.map((g) => (
                  <button
                    key={g.id}
                    onClick={() =>
                      handleChat(
                        `I want to start a quest about SDG ${g.id}: ${g.name}`,
                      )
                    }
                    className={`${g.color} aspect-square border-4 border-black hover:scale-105 hover:-rotate-3 transition-all flex flex-col items-center justify-center p-2 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1`}
                  >
                    <span className="text-2xl font-black">{g.id}</span>
                    <span className="text-[6px] font-black uppercase text-center leading-tight mt-1">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-5 border-2 border-black rounded-none ${m.role === "user" ? "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"}`}
                >
                  {m.parts[0].text
                    .split("\n")
                    .map((line: string, idx: number) => (
                      <p
                        key={idx}
                        className="mb-2 last:mb-0 text-sm font-medium leading-relaxed"
                      >
                        {line}
                      </p>
                    ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {gameState?.feedback && !loading && (
          <div className="mx-6 mb-4 p-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(227,29,35,1)] flex gap-4 items-center">
            <Info className="text-sdg-4" />
            <div className="flex-1">
              <div className="text-[8px] font-black text-gray-400 uppercase">
                Expert Intelligence
              </div>
              <p className="text-xs font-bold leading-tight">
                {gameState.feedback}
              </p>
            </div>
          </div>
        )}

        <div className="p-6 border-t-4 border-black bg-white">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat(inputText)}
              placeholder="Commit your response to the platform..."
              className="flex-1 p-4 border-2 border-black outline-none font-bold text-sm bg-gray-50 rounded-none focus:bg-white"
            />
            <button
              onClick={() => handleChat(inputText)}
              disabled={loading}
              className="px-8 bg-black hover:bg-sdg-4 text-white font-black uppercase transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <span>Commit</span>
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AcademyView({
  registeredClub,
  setRegisteredClub,
  userProfile,
  onSdgSelect,
  setPremiumModalOpen,
  allClubs = [],
  coursesList = [],
}: {
  registeredClub: SchoolClub | null;
  setRegisteredClub: (club: SchoolClub | null) => void;
  userProfile: any;
  onSdgSelect: (sdg: any) => void;
  setPremiumModalOpen: (open: boolean) => void;
  allClubs?: any[];
  coursesList?: CourseTopic[];
}) {
  const isUniversity = registeredClub?.level === "University";
  const [activeTab, setActiveTab] = useState<
    "courses" | "curriculum" | "actions" | "resilience" | "cloudrun"
  >("curriculum");
  const [curriculumActiveTab, setCurriculumActiveTab] = useState<
    "hs" | "uni" | "quiz" | "solution"
  >(isUniversity ? "uni" : "hs");
  const [coursesMode, setCoursesMode] = useState<"curriculum" | "academic">(
    "academic",
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // SDG Agent Class-guided exercise states
  const [courseDetailTab, setCourseDetailTab] = useState<
    "slides" | "agent-exercise" | "quiz"
  >("slides");
  const [academyMessagesByTopic, setAcademyMessagesByTopic] = useState<
    Record<number, ChatMessage[]>
  >({});
  const [academyLoading, setAcademyLoading] = useState(false);
  const [academyInputText, setAcademyInputText] = useState("");
  const [exerciseStateByTopic, setExerciseStateByTopic] = useState<
    Record<
      number,
      {
        score?: number;
        feedback?: string;
        stats?: { creativity: number; feasibility: number; impact: number };
      }
    >
  >({});

  const handleAcademyChat = async (userMessage: string, topic: any) => {
    if (!userMessage.trim() || academyLoading) return;

    const topicId = topic.id;
    const currentHistory = academyMessagesByTopic[topicId] || [];

    // 1. Message limit validation for unsubscribed chapters (max 5 dialogues)
    const userMsgCount = currentHistory.filter((m) => m.role === "user").length;
    const isSubscribed = registeredClub?.subscribed || false;
    if (userMsgCount >= 5 && !isSubscribed) {
      setAcademyMessagesByTopic((prev) => ({
        ...prev,
        [topicId]: [
          ...currentHistory,
          { role: "user", parts: [{ text: userMessage }] },
          {
            role: "model",
            parts: [
              {
                text: "⚠️ CONVERSATION LOCKED: You have run out of free trial Academy Facilitator messages (5 messages limit reached). Please open the '💎 Premium Club Hub' at the top to activate your subscription for UGX 10,000 (High School) or UGX 20,000 (Campus Connect) to get unlimited dialogues!",
              },
            ],
          },
        ],
      }));
      setPremiumModalOpen(true);
      return;
    }

    // 2. Credits threshold validation (paid version has maximum threshold of 25 unless direct key linked)
    if (registeredClub) {
      const isLinked = registeredClub.geminiLinked || false;
      const currentCredits =
        registeredClub.credits !== undefined
          ? registeredClub.credits
          : isSubscribed
            ? 25
            : 5;
      if (currentCredits <= 0 && !isLinked) {
        setAcademyMessagesByTopic((prev) => ({
          ...prev,
          [topicId]: [
            ...currentHistory,
            { role: "user", parts: [{ text: userMessage }] },
            {
              role: "model",
              parts: [
                {
                  text: "⚠️ OUT OF SDG CREDITS: Your SDG Credit Vault has 0 credits. Since standard paid subscription holds a maximum of 25 credits, please open '💎 Premium Club Hub' and connect your own custom Gemini API Key to bypass the threshold and authorize unlimited credits!",
                },
              ],
            },
          ],
        }));
        setPremiumModalOpen(true);
        return;
      }
    }

    const newUserMessage: ChatMessage = {
      role: "user",
      parts: [{ text: userMessage }],
    };
    setAcademyMessagesByTopic((prev) => ({
      ...prev,
      [topicId]: [...currentHistory, newUserMessage],
    }));
    setAcademyInputText("");
    setAcademyLoading(true);

    try {
      const response = await fetch("/api/academy/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: currentHistory,
          topicTitle: topic.title,
          topicSummary: topic.summary,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const modelResponse: ChatMessage = {
        role: "model",
        parts: [{ text: data.message }],
      };

      setAcademyMessagesByTopic((prev) => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), modelResponse],
      }));

      // Decrement credit if user belongs to registered club
      if (registeredClub) {
        const isLinked = registeredClub.geminiLinked || false;
        if (!isLinked) {
          const oldCredits =
            registeredClub.credits !== undefined
              ? registeredClub.credits
              : isSubscribed
                ? 25
                : 5;
          const newCredits = Math.max(0, oldCredits - 1);
          const updatedClub: SchoolClub = {
            ...registeredClub,
            credits: newCredits,
          };
          setRegisteredClub(updatedClub);
          localStorage.setItem(
            "kap10_registered_club",
            JSON.stringify(updatedClub),
          );
          try {
            updateDoc(doc(db, "clubs", registeredClub.id), {
              credits: newCredits,
            }).catch(() => {});
          } catch (e) {}
        }
      }

      // Update exercise results state
      if (data.score !== undefined || data.feedback || data.stats) {
        setExerciseStateByTopic((prev) => ({
          ...prev,
          [topicId]: {
            score: (prev[topicId]?.score || 0) + (data.score || 0),
            feedback: data.feedback || prev[topicId]?.feedback,
            stats: data.stats || prev[topicId]?.stats,
          },
        }));

        // Award points to the corresponding Club if they score in their dialogue solutions!
        if (registeredClub && (data.score || 0) > 0) {
          const award = data.score;
          const updatedClub = {
            ...registeredClub,
            score: registeredClub.score + award,
          };
          localStorage.setItem(
            "kap10_registered_club",
            JSON.stringify(updatedClub),
          );
          setRegisteredClub(updatedClub);
        }
      }
    } catch (error: any) {
      setAcademyMessagesByTopic((prev) => ({
        ...prev,
        [topicId]: [
          ...(prev[topicId] || []),
          {
            role: "model",
            parts: [
              {
                text:
                  error.message ||
                  "The Academy Facilitator is resting. Please check your network and try again.",
              },
            ],
          },
        ],
      }));
    } finally {
      setAcademyLoading(false);
    }
  };

  useEffect(() => {
    if (registeredClub) {
      setCurriculumActiveTab(
        registeredClub.level === "University" ? "uni" : "hs",
      );
    }
  }, [registeredClub?.level]);
  const [hsCurrentWeek, setHsCurrentWeek] = useState(0);
  const [hsQuizAnswered, setHsQuizAnswered] = useState(false);
  const [hsSelectedQuizOpt, setHsSelectedQuizOpt] = useState<number | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Registration and Authentication states
  const [authTab, setAuthTab] = useState<"register" | "signin">("register");
  const [regClubEmail, setRegClubEmail] = useState("");
  const [regPasscode, setRegPasscode] = useState("");
  const [signinIdentifier, setSigninIdentifier] = useState("");
  const [signinPasscode, setSigninPasscode] = useState("");
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Forgot Passcode flow states
  const [forgotPasscodeMode, setForgotPasscodeMode] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotSending, setForgotSending] = useState(false);

  // Registration Form State
  const [regRepName, setRegRepName] = useState("");
  const [regClubName, setRegClubName] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regLevel, setRegLevel] = useState<"High School" | "University">(
    "High School",
  );
  const [regRegion, setRegRegion] = useState<
    "Western" | "Central" | "Eastern" | "Northern"
  >("Central");
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(
    null,
  );

  // Youth Action Guide state
  const [enlistedProjects, setEnlistedProjects] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kap10_enlisted_projects");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        title: "Kampala Plastic Eco-Tech",
        leader: "Jojo Kakooza (Youth Coalition Member)",
        level: "University",
        sdg: "SDG 11: Sustainable Cities",
        region: "Central",
        description:
          "Repurposing urban waste into durable, heat-resistant community paving materials.",
        achievements:
          "Over 4.5 tons of plastic recycled; 3 primary school pathways paved in Kisenyi slum.",
        status: "Active",
      },
      {
        id: 2,
        title: "Karamoja Sorghum Food Sovereignty",
        leader: "Lomongin Moses",
        level: "Community / Youth Alliance",
        sdg: "SDG 2: Zero Hunger",
        region: "Northern",
        description:
          "Permaculture training and resilient traditional crop seeding for dry-season security.",
        achievements:
          "12 youth-led smart gardens established, training over 180 homesteads in bio-fencing.",
        status: "Active",
      },
      {
        id: 3,
        title: "Gulu Peace Agro-Forestry Network",
        leader: "Acan Grace",
        level: "High School Club League",
        sdg: "SDG 13: Climate Action",
        region: "Northern",
        description:
          "Planting indigenous shea nut trees to secure local carbon-sink credits and prevent rapid deforestation.",
        achievements:
          "2,400 saplings planted across 4 sub-counties; integrated with local youth cooperatives.",
        status: "Completed",
      },
      {
        id: 4,
        title: "Nile Water Quality Sentinels",
        leader: "Okello Paul",
        level: "University",
        sdg: "SDG 6: Clean Water & Sanitation",
        region: "Eastern",
        description:
          "Deploying low-cost internet-of-things water sensors to alert Lake Victoria communities on toxicity spikes.",
        achievements:
          "5 active sensor boats built; SMS alert system subscribed by 400 local fishermen.",
        status: "Active",
      },
    ];
  });

  // Action submission form
  const [actionTitle, setActionTitle] = useState("");
  const [actionLeader, setActionLeader] = useState("");
  const [actionLevel, setActionLevel] = useState("High School");
  const [actionSdg, setActionSdg] = useState("SDG 13: Climate Action");
  const [actionRegion, setActionRegion] = useState("Central");
  const [actionDesc, setActionDesc] = useState("");
  const [actionAchievements, setActionAchievements] = useState("");
  const [showActionForm, setShowActionForm] = useState(false);

  // SDGs for Resilience news digest posts
  const [resilienceNews] = useState([
    {
      date: "May 28, 2026",
      location: "Kasese District",
      title: "Kasese Bamboo Buffers Planted on Mt. Rwenzori Slopes",
      content:
        "Local youth councils and high school clubs have completed planting over 5,000 bamboo shoots along the banks of River Nyamwamba. This nature-based solution is designed to lock loose volcanic soils, decrease bank erosion, and prevent the rapid flood surges that routinely displace low-lying Kasese families.",
      source: "Youth Coalition News",
      tag: "Disaster Risk Reduction",
    },
    {
      date: "May 24, 2026",
      location: "Karamoja Sub-Region",
      title: "Solar Sorghum Irrigators Deployed in Kotido",
      content:
        "SDG Action hubs in Karamoja have successfully deployed 15 low-cost solar-powered water pumping grids. This initiative secures critical watering options for semi-arid farms, allowing high-yield sorghum and millet to survive prolonged dry spells currently exacerbated by high temperature fluxes.",
      source: "Eastern Resilience Wire",
      tag: "Climate Adaptation",
    },
    {
      date: "May 19, 2026",
      location: "Wakiso & Kampala",
      title: "Kampala Schools Drop Fuel Bills 35% with Bio-Gas Digesters",
      content:
        "Under the Green School Scheme, three leading secondary boarding institutions in Wakiso have completely replaced firewood kitchens with organic bio-gas digesters. The digesters run entirely on recycled cafeteria food scraps and biodegradable matter, slashing schools' carbon impacts and fuel budgets.",
      source: "Uganda Edu-Sphere",
      tag: "Waste to Energy",
    },
    {
      date: "May 12, 2026",
      location: "Katwe Slum, Kampala",
      title: "Floating Gardens Reclaim 12 Hectares of Critical Wetland Buffer",
      content:
        "Urban informal settlement collectives in Katwe have pioneered floating lettuce and kale gardens. This system allows farming to survive high-water seasons while preserving the structural wetland buffer from encroachment, providing direct urban income and solid food access.",
      source: "Kampala Smart City Forum",
      tag: "Urban Ecosystems",
    },
    {
      date: "May 05, 2026",
      location: "Sironko District",
      title: "SMS Early Warnings Set Up on Mt. Elgon Slope Farms",
      content:
        "Uganda Youth Coalition volunteers have built six solar rain-gauge telemetry stations. Using standard cell networks, the system broadcasts instant high-risk alert SMS texts to 1,200 smallholders when rainfall climbs past safety buffers, averting disaster fatalities.",
      source: "Mount Elgon Action Force",
      tag: "Early Warning Systems",
    },
  ]);

  const [resilienceFilter, setResilienceFilter] = useState("All");

  // Auto incremental generator for club ID
  const handleRegisterClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !regRepName.trim() ||
      !regClubName.trim() ||
      !regInstitution.trim() ||
      !regClubEmail.trim() ||
      !regPasscode.trim()
    ) {
      alert(
        "Please fill out all club registration details including Email and Passcode PIN!",
      );
      return;
    }

    if (regPasscode.trim().length < 4) {
      alert("Security passcode PIN must be at least 4 characters long!");
      return;
    }

    const emailInUse = allClubs.some(
      (c) => c.email?.toLowerCase() === regClubEmail.trim().toLowerCase(),
    );
    if (emailInUse) {
      alert(
        `The club email address "${regClubEmail}" is already registered. Please sign in or use a different unique club email.`,
      );
      return;
    }

    // SC + Region Letter + Month Registered + Date Registered + incremental numeric
    const getRegionLetter = (reg: string) => {
      if (reg === "Western") return "W";
      if (reg === "Central") return "C";
      if (reg === "Eastern") return "E";
      return "N";
    };

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    // Auto increment counter via localStorage
    const savedCounter = Number(
      localStorage.getItem("kap10_club_counter") || "0",
    );
    const newCounter = savedCounter + 1;
    localStorage.setItem("kap10_club_counter", String(newCounter));

    const numericPart = String(newCounter).padStart(2, "0");
    const regionLetter = getRegionLetter(regRegion);
    const assignedId = `SC${regionLetter}${mm}${dd}${numericPart}`;

    const newClub: SchoolClub = {
      id: assignedId,
      name: regClubName,
      institution: regInstitution,
      level: regLevel,
      region: regRegion,
      score: 50, // Welcoming gift score
      subscribed: false,
      credits: 5,
      geminiLinked: false,
      downloadCount: 0,
      email: regClubEmail.trim(),
      passcode: regPasscode.trim(),
      status: "pending",
    };

    const fullNewClub = {
      id: assignedId,
      name: regClubName,
      institution: regInstitution,
      level: regLevel,
      region: regRegion,
      score: 50,
      members: 15,
      sdgFocus: "SDG 4: Quality Education",
      leader: userProfile.occupation || "Club Representative",
      bio: "Welcome to our newly registered school club! We are excited to collaborate, co-create, and build a sustainable Uganda together.",
      email: regClubEmail.trim(),
      passcode: regPasscode.trim(),
      status: "pending",
      lastActive: "Active now",
      leaders: `${userProfile.occupation || "Representative"} (President)`,
      patron: "To Be Appointed",
      membersList: "Add your members list here",
      mission:
        "To co-create sustainable solutions for local regional development and track indicator outcomes.",
      achievements: "No achievements registered yet.",
      subscribed: false,
      credits: 5,
      geminiLinked: false,
      downloadCount: 0,
    };

    setDoc(doc(db, "clubs", assignedId), fullNewClub)
      .then(() => {
        localStorage.setItem("kap10_registered_club", JSON.stringify(newClub));
        setRegisteredClub(newClub);
        setRegSuccessMessage(
          `Registration Issued Successfully! Pending Admin verification/approval. Account ID: ${assignedId}`,
        );

        setRegRepName("");
        setRegClubName("");
        setRegInstitution("");
        setRegClubEmail("");
        setRegPasscode("");
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `clubs/${assignedId}`);
      });
  };

  const handleForgotPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMessage(null);
    setForgotSuccessMessage(null);

    const identifier = forgotIdentifier.trim();
    if (!identifier) {
      setAuthErrorMessage("Please enter your Club ID or Registered Email!");
      return;
    }

    setForgotSending(true);

    const match = allClubs.find(
      (c) =>
        c.id.toLowerCase() === identifier.toLowerCase() ||
        c.email?.toLowerCase() === identifier.toLowerCase(),
    );

    let email = identifier;
    if (match && match.email) {
      email = match.email;
    } else if (!identifier.includes("@")) {
      setForgotSending(false);
      setAuthErrorMessage(
        "No registered club was found matching this identifier. Please verify spelling or register a new chapter."
      );
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setForgotSending(false);
        setForgotSuccessMessage(
          `🎉 PASSWORD RESET DISPATCHED! A real Firebase Authentication password reset email has been successfully sent to: ${email}.\n\nPlease check your inbox and follow the secure reset instructions.\n\n🔑 Testing convenience: Your current Club Passcode PIN for login is revealed as: [ ${match ? (match.passcode || "1234") : "1234"} ]`
        );
      })
      .catch((err: any) => {
        setForgotSending(false);
        let friendlyMessage = err.message || "An error occurred while sending the reset email.";
        if (err.code === "auth/user-not-found") {
          friendlyMessage = `No active auth user profile found for "${email}".`;
        } else if (err.code === "auth/invalid-email") {
          friendlyMessage = `The email address "${email}" is invalid.`;
        }
        setAuthErrorMessage(friendlyMessage);
      });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinIdentifier.trim() || !signinPasscode.trim()) {
      setAuthErrorMessage(
        "Please enter both the Club ID/Email and your Passcode PIN!",
      );
      return;
    }

    const identifier = signinIdentifier.trim().toLowerCase();
    const passcode = signinPasscode.trim();

    const match = allClubs.find(
      (c) =>
        c.id.toLowerCase() === identifier ||
        c.email?.toLowerCase() === identifier,
    );

    if (!match) {
      setAuthErrorMessage(
        "No registered club was found matching this Club ID or Email. Please register a new club instead.",
      );
      return;
    }

    const expectedPasscode = match.passcode || "1234";
    if (expectedPasscode !== passcode) {
      setAuthErrorMessage(
        "Incorrect security passcode PIN entered. Access denied!",
      );
      return;
    }

    const localRep = {
      id: match.id,
      name: match.name,
      institution: match.institution,
      level: match.level,
      region: match.region,
      score: match.score,
      subscribed: match.subscribed || false,
      credits: match.credits !== undefined ? match.credits : 5,
      geminiLinked: match.geminiLinked || false,
      downloadCount: match.downloadCount || 0,
      email: match.email,
      passcode: match.passcode,
      status: match.status,
    };

    localStorage.setItem("kap10_registered_club", JSON.stringify(localRep));
    setRegisteredClub(localRep);
    setAuthErrorMessage(null);
    setSigninIdentifier("");
    setSigninPasscode("");
  };

  const handleDeregister = () => {
    setShowLogoutConfirm(true);
  };

  // Quiz evaluation handle
  const handleAnswerSubmit = () => {
    if (!selectedOption) return;
    const currentQuiz = selectedTopic.quiz[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuiz.answer;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    setQuizSubmitted(true);
  };

  const handleNextQuizQuestion = () => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    if (currentQuestionIndex + 1 < selectedTopic.quiz.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      // Award club points on 100% score (3/3)
      if (registeredClub) {
        if (registeredClub.status === "suspended") {
          alert("Your club status is currently SUSPENDED. Points contribution and data logging are blocked.");
          return;
        }
        if (registeredClub.status === "pending" || !registeredClub.status) {
          alert("Your club registration is currently PENDING admin verification. Points contribution will activate on approval.");
          return;
        }
        const correctAnswersCount =
          quizScore +
          (selectedOption === selectedTopic.quiz[currentQuestionIndex].answer
            ? 1
            : 0);
        if (correctAnswersCount === 3) {
          const updatedClub = {
            ...registeredClub,
            score: registeredClub.score + 50,
          };
          localStorage.setItem(
            "kap10_registered_club",
            JSON.stringify(updatedClub),
          );
          setRegisteredClub(updatedClub);
        } else {
          // Part score contribution
          const updatedClub = {
            ...registeredClub,
            score: registeredClub.score + 20,
          };
          localStorage.setItem(
            "kap10_registered_club",
            JSON.stringify(updatedClub),
          );
          setRegisteredClub(updatedClub);
        }
      }
    }
  };

  const startQuiz = () => {
    if (registeredClub) {
      if (registeredClub.status === "suspended") {
        alert("Your club is currently SUSPENDED by administrators. Suspended chapters are blocked from starting or submitting quiz performance evaluations.");
        return;
      }
      if (registeredClub.status === "pending" || !registeredClub.status) {
        alert("Your club registration is currently PENDING. You can engage with lesson quizzes once verified by administrators!");
        return;
      }
    }
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizSubmitted(false);
  };

  // Youth Action Project submission
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !actionLeader.trim() || !actionDesc.trim()) {
      alert("Please fill out all action description fields!");
      return;
    }

    const newProj = {
      id: Date.now(),
      title: actionTitle,
      leader: actionLeader,
      level: actionLevel,
      sdg: actionSdg,
      region: actionRegion,
      description: actionDesc,
      achievements:
        actionAchievements || "Initiated community campaign with local LCs.",
      status: "Active",
    };

    const updatedProjects = [newProj, ...enlistedProjects];
    setEnlistedProjects(updatedProjects);
    localStorage.setItem(
      "kap10_enlisted_projects",
      JSON.stringify(updatedProjects),
    );

    // Award club action points
    if (registeredClub) {
      const updatedClub = {
        ...registeredClub,
        score: registeredClub.score + 25,
      };
      localStorage.setItem(
        "kap10_registered_club",
        JSON.stringify(updatedClub),
      );
      setRegisteredClub(updatedClub);
    }

    // Reset Form
    setActionTitle("");
    setActionLeader("");
    setActionDesc("");
    setActionAchievements("");
    setShowActionForm(false);
    alert(
      "Project Enlisted Successfully under Uganda Youth Coalition! Your school club has received +25 pts.",
    );
  };

  // If NOT registered, they must register to access the full Academy View
  if (!registeredClub) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#F6F5F2]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-4 border-black p-4 sm:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4">
              <div className="p-3 bg-sdg-4 text-white border-2 border-black">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black uppercase italic leading-none font-display">
                  SDGs Club Gateway
                </h2>
                <p className="text-xs uppercase font-black text-gray-400 mt-1">
                  Access the National SDGs Club Network Portal
                </p>
              </div>
            </div>

            <div className="flex border-b-4 border-black font-display text-sm uppercase">
              <button
                onClick={() => {
                  setAuthTab("signin");
                  setAuthErrorMessage(null);
                  setRegSuccessMessage(null);
                }}
                className={`flex-1 py-3 text-center font-black transition-all ${
                  authTab === "signin"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                🔐 Sign In (Existing Club)
              </button>
              <button
                onClick={() => {
                  setAuthTab("register");
                  setAuthErrorMessage(null);
                  setRegSuccessMessage(null);
                }}
                className={`flex-1 py-3 text-center font-black transition-all ${
                  authTab === "register"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                🌱 Register New Chapter
              </button>
            </div>

            {authErrorMessage && (
              <div className="p-4 bg-red-100 text-red-800 border-2 border-red-500 text-xs font-bold leading-relaxed uppercase">
                ⚠️ Error: {authErrorMessage}
              </div>
            )}

            {regSuccessMessage && (
              <div className="p-4 bg-green-50 text-green-900 border-2 border-green-500 font-bold leading-relaxed">
                <p className="text-sm font-black uppercase">🎉 Success!</p>
                <p className="text-xs mt-1 uppercase font-black">
                  {regSuccessMessage}
                </p>
                <p className="text-xs mt-3 bg-white p-3 border-2 border-black uppercase text-gray-700">
                  ⚠️ Note: Your SDGs Club Chapter account has been created. All
                  newly registered clubs are verified by an Admin before full
                  approval. You can still login to track your setup progress.
                </p>
              </div>
            )}

            {authTab === "signin" ? (
              forgotPasscodeMode ? (
                <form id="forgot-passcode-form" onSubmit={handleForgotPasscodeSubmit} className="space-y-4 pt-2">
                  <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-none space-y-2">
                    <h3 className="text-xs font-black uppercase text-amber-800">Passcode PIN Recovery</h3>
                    <p className="text-[11px] text-amber-900 leading-normal font-medium">
                      Enter your chapter's registered Club ID or Email address below. The platform will simulate sending a passcode reminder/reset instruction to that school address.
                    </p>
                  </div>

                  {forgotSuccessMessage && (
                    <div className="p-4 bg-emerald-50 text-emerald-900 border-2 border-emerald-500 font-bold leading-relaxed text-xs whitespace-pre-wrap uppercase">
                      {forgotSuccessMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Registered Club ID or Email
                    </label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. SC-C-MAK-01 or wafulap@butiki.sc.ug"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white focus:ring-0"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasscodeMode(false);
                        setAuthErrorMessage(null);
                        setForgotSuccessMessage(null);
                      }}
                      className="flex-1 py-3 border-2 border-black hover:bg-gray-100 font-black uppercase text-xs"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSending}
                      className="flex-1 py-3 bg-black hover:bg-sdg-4 text-white font-black uppercase text-xs disabled:opacity-50"
                    >
                      {forgotSending ? "Sending Alert..." : "Request Reset"}
                    </button>
                  </div>
                </form>
              ) : (
                <form id="signin-form" onSubmit={handleSignIn} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Club Identifier (Club ID or Registered Email)
                    </label>
                    <input
                      type="text"
                      value={signinIdentifier}
                      onChange={(e) => setSigninIdentifier(e.target.value)}
                      placeholder="e.g. SC-C-MAK-01 or wafulap@butiki.sc.ug"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white focus:ring-0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Passcode PIN
                    </label>
                    <input
                      type="password"
                      value={signinPasscode}
                      onChange={(e) => setSigninPasscode(e.target.value)}
                      placeholder="Enter your secret passcode PIN (e.g. 1234)"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white focus:ring-0"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-gray-500 leading-normal">
                    <div className="border-l-4 border-black pl-3 py-1 font-mono">
                      💡 Demo Credentials Hint: Try default club{" "}
                      <strong>SC-C-MAK-01</strong> with PIN <strong>1234</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasscodeMode(true);
                        setForgotIdentifier(signinIdentifier);
                        setAuthErrorMessage(null);
                        setForgotSuccessMessage(null);
                      }}
                      className="text-[#109E75] hover:underline font-black uppercase text-left self-start sm:self-auto"
                    >
                      Forgot Passcode?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-black text-white hover:bg-sdg-4 font-black uppercase text-sm mt-4 tracking-wider transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Sign In to Club Chapter Portal
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleRegisterClub} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Club Representative Name
                    </label>
                    <input
                      type="text"
                      value={regRepName}
                      onChange={(e) => setRegRepName(e.target.value)}
                      placeholder="e.g. Kakooza Ronald"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white focus:ring-0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Club Level Focus
                    </label>
                    <select
                      value={regLevel}
                      onChange={(e) => setRegLevel(e.target.value as any)}
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-black text-sm bg-gray-50 uppercase"
                    >
                      <option value="High School">
                        High School (O & A level)
                      </option>
                      <option value="University">
                        University / Tertiary Chapter
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Proposed SDGs Club Name
                    </label>
                    <input
                      type="text"
                      value={regClubName}
                      onChange={(e) => setRegClubName(e.target.value)}
                      placeholder="e.g. Budo Sustainable Action Chapter"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      School / Institution Name
                    </label>
                    <input
                      type="text"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      placeholder="e.g. King's College Budo"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-[#ffffff] focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Club Email Address (Anti-bot Verification)
                    </label>
                    <input
                      type="email"
                      value={regClubEmail}
                      onChange={(e) => setRegClubEmail(e.target.value)}
                      placeholder="e.g. chapter@school.ac.ug"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                      Choose Passcode PIN (Min 4 chars)
                    </label>
                    <input
                      type="password"
                      value={regPasscode}
                      onChange={(e) => setRegPasscode(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full p-3 border-2 border-black rounded-none outline-none font-bold text-sm bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    Country Region
                  </label>
                  <select
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value as any)}
                    className="w-full p-3 border-2 border-black rounded-none outline-none font-black text-sm bg-gray-50 uppercase"
                  >
                    <option value="Central">
                      Central (Kampala, Wakiso, Masaka)
                    </option>
                    <option value="Western">
                      Western (Kasese, Mbarara, Kabale)
                    </option>
                    <option value="Eastern">
                      Eastern (Jinja, Mbale, Soroti)
                    </option>
                    <option value="Northern">
                      Northern (Gulu, Lira, Kotido)
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white hover:bg-sdg-4 font-black uppercase text-sm mt-4 tracking-wider transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Register SDGs Club Chapter
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active view inside the Academy
  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Club Banner Info */}
      <div className="bg-black text-white px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black gap-2">
        <div className="flex items-center gap-3">
          <Award className="text-sdg-7 w-8 h-8 shrink-0 animate-bounce" />
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight leading-tight">
              {registeredClub.name}{" "}
              <span className="text-gray-400">({registeredClub.level})</span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-sdg-7 uppercase tracking-wider">
                REG ID: {registeredClub.id}
              </span>
              <span className="text-[10px] text-gray-400 uppercase">
                • Region: {registeredClub.region}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-3 py-1.5 border border-white/20 text-xs font-black uppercase tracking-tight">
            League Points:{" "}
            <span className="text-sdg-7 text-sm">{registeredClub.score}</span>
          </div>
          <button
            onClick={handleDeregister}
            className="text-[9px] font-black uppercase bg-sdg-1 cursor-pointer text-white px-2 py-1 hover:bg-white hover:text-black transition-all"
          >
            Switch/Logout Club
          </button>
        </div>
      </div>

      {/* SDG Banner Strip */}
      <div
        id="academy-sdgs-banner-strip-container"
        className="w-full border-b-4 border-black bg-white overflow-hidden relative"
      >
        <img
          src="sdgs_banner_carousel_banner.png"
          alt="Sustainable Development Goals Banner Carousel"
          className="w-full h-auto object-cover max-h-[140px] md:max-h-[160px] lg:max-h-[180px] block"
          referrerPolicy="no-referrer"
          id="academy-sdgs-banner-strip-img"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b-4 border-black bg-white select-none overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => {
            setActiveTab("curriculum");
            setSelectedTopic(null);
          }}
          className={`flex-1 min-w-[200px] py-4 text-center text-xs font-black uppercase tracking-widest border-r-2 border-black transition-all ${activeTab === "curriculum" ? "bg-sdg-12 text-white" : "hover:bg-gray-50"}`}
        >
          📋 Club Curriculum & Planner
        </button>
        <button
          onClick={() => {
            setActiveTab("courses");
            setSelectedTopic(null);
          }}
          className={`flex-1 min-w-[200px] py-4 text-center text-xs font-black uppercase tracking-widest border-r-2 border-black transition-all ${activeTab === "courses" ? "bg-sdg-4 text-white" : "hover:bg-gray-50"}`}
        >
          🎓 Courses & Smart Quizzes
        </button>
        <button
          onClick={() => {
            setActiveTab("actions");
            setSelectedTopic(null);
          }}
          className={`flex-1 min-w-[200px] py-4 text-center text-xs font-black uppercase tracking-widest border-r-2 border-black transition-all ${activeTab === "actions" ? "bg-sdg-10 text-white" : "hover:bg-gray-50"}`}
        >
          🤝 Youth Action Guide
        </button>
        <button
          onClick={() => {
            setActiveTab("resilience");
            setSelectedTopic(null);
          }}
          className={`flex-1 min-w-[200px] py-4 text-center text-xs font-black uppercase tracking-widest border-r-2 border-black transition-all ${activeTab === "resilience" ? "bg-sdg-13 text-white" : "hover:bg-gray-50"}`}
        >
          🌧️ SDGs for Resilience
        </button>
        <button
          onClick={() => {
            setActiveTab("cloudrun");
            setSelectedTopic(null);
          }}
          className={`flex-1 min-w-[200px] py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${activeTab === "cloudrun" ? "bg-[#2563EB] text-white" : "hover:bg-gray-50"}`}
        >
          ⚙️ Cloud Run Services
        </button>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        {activeTab === "courses" && (
          <div className="max-w-5xl mx-auto space-y-10">
            {false ? ( // Official 10-Week Club Curriculum section removed in favor of main Club Curriculum & Planner tab
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0F6E56] bg-[#E1F5EE] border border-[#5DCAA5] px-3 py-1 inline-block">
                    UGANDA CO-CREATE PATHWAY
                  </span>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none font-display">
                    SDG Clubs Curriculum & Planner
                  </h2>
                  <p className="text-gray-500 font-bold max-w-2xl text-xs uppercase tracking-wide leading-relaxed">
                    Aligned with National Development Plan IV (NDPIV) &
                    Project-Based Learning (PBL) formats for elite High School &
                    University chapters across Uganda.
                  </p>
                </div>

                {/* Curriculum Sub-tab Selectors */}
                <div className="flex border-4 border-black bg-white shrink-0 overflow-x-auto scrollbar-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none">
                  <button
                    onClick={() => setCurriculumActiveTab("hs")}
                    className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 transition-all ${curriculumActiveTab === "hs" ? "bg-sdg-12 text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                  >
                    🏫 High School Planner
                  </button>
                  <button
                    onClick={() => setCurriculumActiveTab("uni")}
                    className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 transition-all ${curriculumActiveTab === "uni" ? "bg-sdg-12 text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                  >
                    🎓 University Roadmap
                  </button>
                  <button
                    onClick={() => setCurriculumActiveTab("quiz")}
                    className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 transition-all ${curriculumActiveTab === "quiz" ? "bg-sdg-12 text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                  >
                    🎯 Sample Warmups
                  </button>
                  <button
                    onClick={() => setCurriculumActiveTab("solution")}
                    className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider transition-all ${curriculumActiveTab === "solution" ? "bg-sdg-12 text-white" : "hover:bg-[#F6F5F2] bg-white text-black"}`}
                  >
                    🚀 Solutions Sprint
                  </button>
                </div>

                {/* Sub-tab Views */}
                {curriculumActiveTab === "hs" && (
                  <HighSchoolPlannerView
                    hsCurrentWeek={hsCurrentWeek}
                    setHsCurrentWeek={setHsCurrentWeek}
                    hsQuizAnswered={hsQuizAnswered}
                    setHsQuizAnswered={setHsQuizAnswered}
                    hsSelectedQuizOpt={hsSelectedQuizOpt}
                    setHsSelectedQuizOpt={setHsSelectedQuizOpt}
                  />
                )}

                {curriculumActiveTab === "uni" && <UniversityRoadmapView />}

                {curriculumActiveTab === "quiz" && <SampleWarmupsView />}

                {curriculumActiveTab === "solution" && <SolutionsSprintView />}
              </div>
            ) : !selectedTopic ? (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic border-b-4 sm:border-b-8 border-sdg-4 inline-block font-display">
                    School League Core Curriculums
                  </h2>
                  <p className="text-gray-500 font-bold max-w-2xl text-xs uppercase tracking-wide">
                    Select a lesson, complete the pedagogical slide deck, and
                    solve the quiz to award score points to your SDGs Club!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coursesList.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedTopic(t);
                        setCourseDetailTab("slides");
                        startQuiz();
                      }}
                      className="cursor-pointer border-4 border-black p-6 bg-white hover:bg-black group transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className={`w-12 h-12 ${t.color} border-2 border-black mb-4 group-hover:rotate-12 transition-transform h-12`}
                        />
                        <h3 className="text-xl font-black uppercase group-hover:text-white mb-2 leading-none">
                          {t.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-300 leading-relaxed mb-4">
                          {t.summary}
                        </p>
                      </div>
                      <div className="border-t-2 border-gray-100 group-hover:border-white/10 pt-4 flex justify-between items-center group-hover:text-white">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Open Course Room
                        </span>
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-2 transition-transform"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* SDG Quick Map */}
                <div className="p-8 bg-sdg-17 text-white space-y-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3">
                    <Info className="text-sdg-7" />
                    <h3 className="font-black uppercase italic text-xl tracking-tighter">
                      SDG Explorer
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
                    {SDG_LIST.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => onSdgSelect(g)}
                        className={`${g.color} aspect-square border-2 border-white/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center font-black text-white text-xs cursor-pointer group relative`}
                        title={g.name}
                      >
                        {g.id}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-[6px] text-center uppercase">
                          {g.name}
                          <ArrowRight size={8} className="mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Inside selected topic: show lesson guide, SDG Agent Guided Class exercises, and Quiz
              <div className="bg-white border-4 border-black p-4 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 animate-fadeIn">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="flex items-center gap-2 font-black uppercase text-xs hover:border-b-2 border-black"
                >
                  <ArrowRight className="rotate-180" size={14} />
                  Back to Course Selection
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${selectedTopic.color} border-2 border-black shrink-0`}
                    />
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                        Active Course Room
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black uppercase italic font-display">
                        {selectedTopic.title}
                      </h2>
                    </div>
                  </div>
                  {/* Tab controllers inside course room */}
                  <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-x-auto scrollbar-none text-xs">
                    <button
                      onClick={() => setCourseDetailTab("slides")}
                      className={`px-4 py-2 font-black uppercase border-r border-black last:border-r-0 transition-all ${courseDetailTab === "slides" ? "bg-black text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                    >
                      📖 Slides
                    </button>
                    <button
                      onClick={() => setCourseDetailTab("agent-exercise")}
                      className={`px-4 py-2 font-black uppercase border-r border-black last:border-r-0 transition-all ${courseDetailTab === "agent-exercise" ? `${selectedTopic.color} text-white` : "hover:bg-gray-50 bg-white text-black"}`}
                    >
                      🤖 Class Exercise
                    </button>
                    <button
                      onClick={() => setCourseDetailTab("quiz")}
                      className={`px-4 py-2 font-black uppercase transition-all ${courseDetailTab === "quiz" ? "bg-black text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                    >
                      🎯 Quick Quiz
                    </button>
                  </div>
                </div>

                {/* Subtab Contents */}
                {courseDetailTab === "slides" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Lesson Course Slides
                      </h3>
                      <div className="space-y-6">
                        {selectedTopic.content.map(
                          (slide: any, idx: number) => (
                            <div
                              key={idx}
                              className="border-l-4 border-black pl-4 py-1 space-y-1"
                            >
                              <h4 className="font-black text-sm uppercase text-sdg-16">
                                {slide.subtitle}
                              </h4>
                              <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                {slide.text}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    {/* Sidebar briefing */}
                    <div className="bg-[#FAF9F6] border-2 border-black p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="space-y-4">
                        <span className="text-[8px] font-black uppercase bg-black text-white px-2 py-1">
                          INSTRUCTIONAL DECK
                        </span>
                        <h4 className="font-black text-lg uppercase">
                          Uganda Co-Create Learning Format
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed uppercase font-semibold">
                          These slide decks outline key concepts tailored
                          directly to systems thinking, National Development
                          Plan IV integration, and regional project targets.
                        </p>
                        <div className="p-3 bg-white border border-gray-200 text-[11px] text-gray-500 font-mono">
                          Review this deck fully, then click the{" "}
                          <strong className="text-black">Class Exercise</strong>{" "}
                          tab to build a project proposal with the SDG
                          Facilitator Agent!
                        </div>
                      </div>
                      <button
                        onClick={() => setCourseDetailTab("agent-exercise")}
                        className="w-full mt-4 py-2 bg-black hover:bg-sdg-4 text-white hover:text-white font-black uppercase text-xs transition-all flex items-center justify-center gap-2"
                      >
                        Proceed to Class Exercise
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {courseDetailTab === "agent-exercise" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn items-stretch">
                    {/* Left column (Active Chat Arena) */}
                    <div className="lg:col-span-8 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col justify-between h-[520px]">
                      {/* Chat header briefing */}
                      <div className="bg-black text-white p-3 px-4 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-sdg-7" />
                          <span className="font-black uppercase">
                            SDG Facilitator Class Arena
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 uppercase">
                          Interactive Simulation
                        </span>
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF9F5]">
                        {/* Welcome Facilitator message if history is empty */}
                        {(!academyMessagesByTopic[selectedTopic.id] ||
                          academyMessagesByTopic[selectedTopic.id].length ===
                            0) && (
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-none border border-black flex items-center justify-center text-xs font-black shrink-0 ${selectedTopic.color} text-white`}
                            >
                              UG
                            </div>
                            <div className="bg-white border-2 border-black p-3 text-xs max-w-[85%] space-y-2">
                              <p className="font-bold">Yoga! Kop-aladi! 👋</p>
                              <p className="leading-relaxed text-gray-700">
                                Welcome to the{" "}
                                <strong>SDG Class Exercise Room</strong> for{" "}
                                <strong>{selectedTopic.title}</strong>.
                              </p>
                              <p className="leading-relaxed text-gray-700">
                                I am your AI facilitator. Let's design a
                                sustainable, real-world initiative for our
                                school or local community matching this week's
                                goals. Propose your ideas, ask questions, or
                                select one of the classic starting class prompts
                                below!
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Dialogue list */}
                        {(academyMessagesByTopic[selectedTopic.id] || []).map(
                          (msg, msgIdx) => {
                            const isUser = msg.role === "user";
                            return (
                              <div
                                key={msgIdx}
                                className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                              >
                                {!isUser && (
                                  <div
                                    className={`w-8 h-8 rounded-none border border-black flex items-center justify-center text-xs font-black shrink-0 ${selectedTopic.color} text-white`}
                                  >
                                    UG
                                  </div>
                                )}
                                <div
                                  className={`p-3 text-xs max-w-[85%] border-2 border-black ${isUser ? "bg-[#E1F5EE] text-[#0F6E56] border-[#5DCAA5]" : "bg-white text-black"}`}
                                >
                                  <span className="block text-[8px] font-black uppercase text-gray-400 mb-1">
                                    {isUser ? "You" : "SDG Agent Facilitator"}
                                  </span>
                                  <p className="leading-relaxed whitespace-pre-wrap">
                                    {msg.parts?.[0]?.text}
                                  </p>
                                </div>
                                {isUser && (
                                  <div className="w-8 h-8 rounded-none border border-black flex items-center justify-center text-xs font-black shrink-0 bg-black text-white">
                                    ME
                                  </div>
                                )}
                              </div>
                            );
                          },
                        )}

                        {academyLoading && (
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-none border border-black flex items-center justify-center text-xs font-black shrink-0 ${selectedTopic.color} text-white animate-spin`}
                            >
                              ⚙️
                            </div>
                            <div className="bg-white border-2 border-black p-3 text-xs text-gray-500 italic">
                              The SDG Academy Facilitator is reviewing your
                              proposal...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prompt starters panel */}
                      <div className="p-3 bg-white border-t-2 border-black bg-gray-50/50">
                        <span className="text-[8px] font-black uppercase text-gray-400 block mb-1.5 uppercase tracking-wide">
                          Class Exercise Starter Prompts:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedTopic.id === 1
                            ? [
                                "Identify school cafeteria waste systems mapping under NDPIV.",
                                "Recommend a PBL school walk strategy for mapping waste pits.",
                                "Draft a campus energy and water system improvement map.",
                              ]
                            : selectedTopic.id === 2
                              ? [
                                  "Design a sustainable 'menstrual sanitary pad bank' for our school cluster.",
                                  "Draft a 'Male Allyship Corridor Pledge' matching our cultural needs.",
                                  "Deconstruct barriers causing 35% female candidate class dropouts.",
                                ]
                              : selectedTopic.id === 3
                                ? [
                                    "Design a nature-based vetiver grass buffer shield near riverbanks.",
                                    "Pitch a school green bio-gas digester kitchen pilot to sub-counties.",
                                    "Formulate mountain bamboo soil anchors for Sironko landslide slopes.",
                                  ]
                                : selectedTopic.id === 4
                                  ? [
                                      "Draft a low-cost gravity sand-and-charcoal water filtration unit.",
                                      "Structure an active 'student peer listening circle' to target exam anxiety.",
                                      "Design public tap reminders to keep wash basins sanitized.",
                                    ]
                                  : [
                                      "Formulate a non-violent student court mediation guide.",
                                      "Pitch an SDG 17 partnership to adjacent Town Councils for shared waste clean-ups.",
                                      "Create a physical club project showcase pitch deck for secondary schools.",
                                    ]
                          ).map((starter, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() =>
                                !academyLoading &&
                                handleAcademyChat(starter, selectedTopic)
                              }
                              disabled={academyLoading}
                              className="text-[10px] font-bold uppercase py-1 px-2 border border-black bg-white hover:bg-black hover:text-white transition-all text-[#1c1c1c] max-w-full truncate text-left"
                            >
                              🚀 {starter}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Chat input box */}
                      <div className="p-3 border-t-2 border-black bg-white flex gap-2">
                        <input
                          type="text"
                          value={academyInputText}
                          onChange={(e) => setAcademyInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !academyLoading &&
                              academyInputText.trim()
                            ) {
                              handleAcademyChat(
                                academyInputText,
                                selectedTopic,
                              );
                            }
                          }}
                          disabled={academyLoading}
                          placeholder="Suggest an implementation idea or ask the facilitator..."
                          className="flex-1 px-3 py-2 border-2 border-black text-xs font-medium focus:outline-none focus:ring-0 placeholder:text-gray-400"
                        />
                        <button
                          onClick={() =>
                            handleAcademyChat(academyInputText, selectedTopic)
                          }
                          disabled={academyLoading || !academyInputText.trim()}
                          className="px-4 bg-black hover:bg-sdg-4 text-white font-black uppercase text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          Send
                          <Send size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Right column (Scoring & Feedback helper) */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
                      <div className="border-4 border-black p-5 bg-[#FCFAF2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                        <div className="flex items-center gap-2 border-b border-black pb-2">
                          <Award className="text-sdg-11" size={20} />
                          <h4 className="font-black uppercase text-xs tracking-tight">
                            Active Exercise Status
                          </h4>
                        </div>
                        {registeredClub && (
                          <div className="text-xs">
                            <span className="font-bold text-gray-500 block uppercase text-[10px]">
                              Active Club Chapter
                            </span>
                            <span className="font-black text-md text-[#0c4a3a]">
                              {registeredClub.name}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="border-2 border-black p-2 bg-white">
                            <span className="text-[9px] font-bold text-gray-400 block uppercase">
                              Weekly Exercise Score
                            </span>
                            <span className="text-xl font-black">
                              +
                              {exerciseStateByTopic[selectedTopic.id]?.score ||
                                0}
                            </span>
                          </div>
                          <div className="border-2 border-black p-2 bg-white">
                            <span className="text-[9px] font-bold text-gray-400 block uppercase">
                              Evaluation Level
                            </span>
                            <span className="text-xl font-black">
                              {(exerciseStateByTopic[selectedTopic.id]?.score ||
                                0) >= 40
                                ? "⭐ Elite"
                                : (exerciseStateByTopic[selectedTopic.id]
                                      ?.score || 0) >= 15
                                  ? "👍 Good"
                                  : "🌱 Basic"}
                            </span>
                          </div>
                        </div>

                        {exerciseStateByTopic[selectedTopic.id]?.stats && (
                          <div className="space-y-2 pt-2 border-t border-dashed border-gray-300">
                            <span className="font-black uppercase text-[9px] tracking-wider text-gray-500 block animate-pulse">
                              Assessment KPIs
                            </span>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between font-bold">
                                <span>🎨 Creativity</span>
                                <span>
                                  {
                                    exerciseStateByTopic[selectedTopic.id]
                                      ?.stats?.creativity
                                  }
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 border border-black overflow-hidden">
                                <div
                                  className="bg-sdg-12 h-full transition-all"
                                  style={{
                                    width: `${exerciseStateByTopic[selectedTopic.id]?.stats?.creativity}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-1 text-xs pt-1">
                              <div className="flex justify-between font-bold">
                                <span>⚡ Feasibility (Local Constraints)</span>
                                <span>
                                  {
                                    exerciseStateByTopic[selectedTopic.id]
                                      ?.stats?.feasibility
                                  }
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 border border-black overflow-hidden">
                                <div
                                  className="bg-sdg-13 h-full transition-all"
                                  style={{
                                    width: `${exerciseStateByTopic[selectedTopic.id]?.stats?.feasibility}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="space-y-1 text-xs pt-1">
                              <div className="flex justify-between font-bold">
                                <span>🏆 Community Impact</span>
                                <span>
                                  {
                                    exerciseStateByTopic[selectedTopic.id]
                                      ?.stats?.impact
                                  }
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 border border-black overflow-hidden">
                                <div
                                  className="bg-sdg-3 h-full transition-all"
                                  style={{
                                    width: `${exerciseStateByTopic[selectedTopic.id]?.stats?.impact}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {exerciseStateByTopic[selectedTopic.id]?.feedback && (
                          <div className="p-3 bg-white border-2 border-black text-[11px] leading-relaxed italic text-gray-700 animate-fadeIn">
                            <strong className="text-black uppercase tracking-wider block font-black text-[9px] not-italic mb-1">
                              💡 Facilitator Local Insight:
                            </strong>
                            "{exerciseStateByTopic[selectedTopic.id]?.feedback}"
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gray-50 border-2 border-black text-[10px] text-gray-500 leading-normal uppercase font-semibold">
                        🤖 The <strong>SDG Agent</strong> analyzes your
                        proposals and answers based on real-world constraints
                        across Ugandan schools and districts!
                      </div>
                    </div>
                  </div>
                )}

                {courseDetailTab === "quiz" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-x-2 divide-gray-100 divide-black/10 animate-fadeIn items-stretch">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Evaluation Rules
                      </h3>
                      <div className="p-5 border-2 border-black bg-[#FAF9F6] space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-[8px] font-black uppercase bg-sdg-4 text-white px-2 py-1 inline-block">
                          ACADEMY ASSESSMENT
                        </span>
                        <h4 className="font-extrabold text-sm uppercase leading-none">
                          Complete the Topic Quiz
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed uppercase font-semibold">
                          Answer all {selectedTopic.quiz.length} multiple-choice
                          questions correctly to award +50 points to your school
                          club chapter. Incomplete or partially correct quizzes
                          award up to +20 points!
                        </p>
                        <div className="border border-dashed border-gray-300 p-3 bg-white text-[10px] font-mono text-gray-400">
                          - Points won instantly sync with your global
                          scoreboard rank.
                          <br />- Retakes are allowed to master the knowledge.
                        </div>
                      </div>
                    </div>
                    {/* Right Column: Quiz Evaluation */}
                    <div className="space-y-6 pl-0 lg:pl-6 pt-6 lg:pt-0">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-sdg-3" />
                        Topic Evaluation Quiz
                      </h3>

                      {!quizCompleted ? (
                        <div className="bg-gray-50 border-2 border-black p-4 space-y-4">
                          <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                            <span>
                              Question {currentQuestionIndex + 1} of{" "}
                              {selectedTopic.quiz.length}
                            </span>
                            <span>
                              Score: {quizScore}/{selectedTopic.quiz.length}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm leading-snug">
                            {selectedTopic.quiz[currentQuestionIndex].question}
                          </h4>

                          <div className="space-y-2 pt-2">
                            {selectedTopic.quiz[
                              currentQuestionIndex
                            ].options.map((opt: string, optIdx: number) => {
                              const isSelected = selectedOption === opt;
                              let btnBg =
                                "bg-white hover:bg-gray-100 text-black";

                              if (quizSubmitted) {
                                if (
                                  opt ===
                                  selectedTopic.quiz[currentQuestionIndex]
                                    .answer
                                ) {
                                  btnBg = "bg-sdg-3 text-white border-sdg-3";
                                } else if (isSelected) {
                                  btnBg = "bg-sdg-1 text-white border-sdg-1";
                                }
                              } else if (isSelected) {
                                btnBg = "bg-black text-white border-black";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() =>
                                    !quizSubmitted && setSelectedOption(opt)
                                  }
                                  disabled={quizSubmitted}
                                  className={`w-full p-3 border-2 border-black text-left text-xs font-bold transition-all uppercase flex justify-between items-center ${btnBg}`}
                                >
                                  {opt}
                                  {quizSubmitted &&
                                    opt ===
                                      selectedTopic.quiz[currentQuestionIndex]
                                        .answer && (
                                      <span className="text-[8px] font-black bg-white text-sdg-3 px-1 border border-sdg-3 inline-block uppercase animate-pulse">
                                        Correct
                                      </span>
                                    )}
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2">
                            {!quizSubmitted ? (
                              <button
                                onClick={handleAnswerSubmit}
                                disabled={!selectedOption}
                                className="w-full py-2.5 bg-black hover:bg-sdg-4 text-white font-black uppercase text-xs transition-all disabled:opacity-50"
                              >
                                Check Answer
                              </button>
                            ) : (
                              <button
                                onClick={handleNextQuizQuestion}
                                className="w-full py-2.5 bg-sdg-16 text-white hover:bg-black font-black uppercase text-xs transition-all"
                              >
                                {currentQuestionIndex + 1 <
                                selectedTopic.quiz.length
                                  ? "Proceed to Next Question"
                                  : "Complete Quiz"}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Quiz scoring card and points award
                        <div className="bg-sdg-7/10 border-4 border-black p-6 space-y-4 text-center">
                          <Award className="w-12 h-12 mx-auto text-black animate-spin" />
                          <h3 className="font-black text-xl uppercase italic">
                            Evaluation Complete!
                          </h3>
                          <p className="text-xs font-bold leading-relaxed uppercase">
                            You scored{" "}
                            <span className="text-lg font-black">
                              {quizScore} / {selectedTopic.quiz.length}
                            </span>{" "}
                            correct answers.
                          </p>
                          {quizScore === selectedTopic.quiz.length ? (
                            <div className="p-3 bg-sdg-3 text-white border-2 border-black font-black uppercase text-xs">
                              🏆 Perfect Score! +50 Club Points Distributed to{" "}
                              {registeredClub?.name || "Your Club"}!
                            </div>
                          ) : (
                            <div className="p-3 bg-sdg-4 text-white border-2 border-black font-black uppercase text-xs">
                              🎖️ Decent Effort! +20 Club Points Distributed to{" "}
                              {registeredClub?.name || "Your Club"}!
                            </div>
                          )}
                          <button
                            onClick={startQuiz}
                            className="px-6 py-2 border-2 border-black bg-white hover:bg-black hover:text-white font-black uppercase text-xs transition-all mt-2"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Youth Action Guide */}
        {activeTab === "actions" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic border-b-4 sm:border-b-8 border-sdg-10 inline-block font-display">
                  Youth Action Guide
                </h2>
                <p className="text-gray-500 font-bold max-w-xl text-xs uppercase tracking-wide">
                  A persistent directory tracking community-focused sustainable
                  initiatives registered by the Youth Coalition for SDGs across
                  Uganda.
                </p>
              </div>
              <button
                onClick={() => setShowActionForm(!showActionForm)}
                className="px-5 py-3 border-4 border-black bg-sdg-10 text-white font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              >
                {showActionForm ? "Close Form" : "Enlist Your SDGs Action"}
              </button>
            </div>

            {/* Project submission neobrutalist Form toggle */}
            {showActionForm && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <h3 className="font-black text-lg uppercase italic border-b-2 border-black pb-2">
                  Enlist Your Project Details
                </h3>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Project Title / Theme
                      </label>
                      <input
                        type="text"
                        value={actionTitle}
                        onChange={(e) => setActionTitle(e.target.value)}
                        placeholder="e.g. Masaka Tree Nursery Chapter"
                        className="w-full p-2.5 border-2 border-black outline-none font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Lead Activist / Team Contact
                      </label>
                      <input
                        type="text"
                        value={actionLeader}
                        onChange={(e) => setActionLeader(e.target.value)}
                        placeholder="e.g. Kakembo Moses"
                        className="w-full p-2.5 border-2 border-black outline-none font-bold text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Club Level Context
                      </label>
                      <select
                        value={actionLevel}
                        onChange={(e) => setActionLevel(e.target.value)}
                        className="w-full p-2.5 border-2 border-black font-bold text-xs bg-gray-50 uppercase"
                      >
                        <option value="High School">
                          High School Representative
                        </option>
                        <option value="University">
                          University Coalition Chapter
                        </option>
                        <option value="Community / Youth Alliance">
                          Community / Youth Alliance
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Primary SDG Target
                      </label>
                      <select
                        value={actionSdg}
                        onChange={(e) => setActionSdg(e.target.value)}
                        className="w-full p-2.5 border-2 border-black font-bold text-xs bg-gray-50 product-select uppercase"
                      >
                        <option value="SDG 1: No Poverty">
                          SDG 1: No Poverty
                        </option>
                        <option value="SDG 2: Zero Hunger">
                          SDG 2: Zero Hunger
                        </option>
                        <option value="SDG 4: Quality Education">
                          SDG 4: Quality Education
                        </option>
                        <option value="SDG 6: Clean Water">
                          SDG 6: Clean Water
                        </option>
                        <option value="SDG 11: Sustainable Cities">
                          SDG 11: Sustainable Cities
                        </option>
                        <option value="SDG 13: Climate Action">
                          SDG 13: Climate Action
                        </option>
                        <option value="SDG 15: Life on Land">
                          SDG 15: Life on Land
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Impact Region
                      </label>
                      <select
                        value={actionRegion}
                        onChange={(e) => setActionRegion(e.target.value)}
                        className="w-full p-2.5 border-2 border-black font-bold text-xs bg-gray-50 uppercase"
                      >
                        <option value="Central">
                          Central (Kampala, Wakiso)
                        </option>
                        <option value="Western">
                          Western (Rwenzoris, Kasese)
                        </option>
                        <option value="Eastern">Eastern (Jinja, Mbale)</option>
                        <option value="Northern">Northern (Gulu, Lira)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                      Description of Work (Practices)
                    </label>
                    <textarea
                      value={actionDesc}
                      onChange={(e) => setActionDesc(e.target.value)}
                      placeholder="What does your club do? How does it solve the local issue?"
                      rows={3}
                      className="w-full p-2.5 border-2 border-black outline-none font-medium text-xs focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                      Tangible Achievements thus far
                    </label>
                    <input
                      type="text"
                      value={actionAchievements}
                      onChange={(e) => setActionAchievements(e.target.value)}
                      placeholder="e.g. Planted 500 fruit trees at Masaka Secondary School."
                      className="w-full p-2.5 border-2 border-black outline-none font-bold text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-white hover:bg-sdg-10 font-black uppercase text-xs transition-all"
                  >
                    Submit Project & Award +25 Club Score
                  </button>
                </form>
              </div>
            )}

            {/* Interactive projects feed list */}
            <div className="space-y-4">
              {enlistedProjects.map((p, idx) => (
                <div
                  key={idx}
                  className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden space-y-4"
                >
                  {/* Sdg Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-sdg-10 border border-black rounded-none inline-block" />
                      <span className="text-[10px] font-black uppercase text-sdg-16 leading-none">
                        {p.sdg}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-black text-white rounded-none">
                      Region: {p.region}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black uppercase leading-none mb-1 text-black">
                      {p.title}
                    </h3>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Led by:{" "}
                      <span className="text-black font-black">{p.leader}</span>{" "}
                      • {p.level} level
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-gray-600 leading-relaxed">
                      <strong className="text-black uppercase text-[10px] block">
                        The Project Target:
                      </strong>{" "}
                      {p.description}
                    </p>
                    <p className="font-bold text-gray-900 leading-relaxed">
                      <strong className="text-black uppercase text-[10px] block">
                        Impact Metrics:
                      </strong>{" "}
                      {p.achievements}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[10px] font-black uppercase tracking-wider">
                    <span className="text-gray-400">
                      Coalition Verified Status
                    </span>
                    <span className="text-sdg-3 bg-sdg-3/10 px-2 py-0.5 border border-sdg-3">
                      ● {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: SDGs for Resilience */}
        {activeTab === "resilience" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic border-b-4 sm:border-b-8 border-sdg-13 inline-block font-display">
                  SDGs for Resilience
                </h2>
                <p className="text-gray-500 font-bold max-w-xl text-xs uppercase tracking-wide">
                  Latest short digests on environmental security, ecosystem
                  rehabilitation, and adaptive climate farming across Uganda's
                  territory.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "Climate Adaptation",
                  "Disaster Risk Reduction",
                  "Waste to Energy",
                  "Urban Ecosystems",
                ].map((filter, i) => (
                  <button
                    key={i}
                    onClick={() => setResilienceFilter(filter)}
                    className={`px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase tracking-tight transition-all rounded-none ${resilienceFilter === filter ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* News Digest Feed lists */}
            <div className="space-y-6">
              {resilienceNews
                .filter(
                  (news) =>
                    resilienceFilter === "All" || news.tag === resilienceFilter,
                )
                .map((post, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform space-y-4"
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2 text-[9px] font-bold text-gray-400 uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-black shrink-0" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1 text-black font-black">
                        <MapPin size={12} className="text-sdg-1 shrink-0" />
                        {post.location}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[9px] font-black uppercase inline-block bg-sdg-13/10 text-sdg-13 border border-sdg-13 px-2 py-0.5 leading-none">
                        {post.tag}
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-gray-950 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[9px] font-black uppercase text-gray-400">
                      <span>Source: {post.source}</span>
                      <span className="text-black">Digest Verified</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Official Club Curriculum & Term Planner */}
        {activeTab === "curriculum" && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white border-4 border-black p-4 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0F6E56] bg-[#E1F5EE] border border-[#5DCAA5] px-3 py-1 inline-block">
                UGANDA CO-CREATE PATHWAY
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic leading-none font-display">
                SDG Clubs Curriculum
              </h2>
              <p className="text-gray-500 font-bold max-w-2xl text-xs uppercase tracking-wide leading-relaxed">
                Aligned with National Development Plan IV (NDPIV) &
                Project-Based Learning (PBL) formats for elite High School &
                University chapters across Uganda.
              </p>
            </div>

            {/* Curriculum Sub-tab Selectors */}
            <div className="flex border-4 border-black bg-white shrink-0 overflow-x-auto scrollbar-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none">
              {registeredClub?.level !== "University" && (
                <button
                  onClick={() => setCurriculumActiveTab("hs")}
                  className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 transition-all ${curriculumActiveTab === "hs" ? "bg-sdg-12 text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                >
                  🏫 High School Planner
                </button>
              )}
              {registeredClub?.level === "University" && (
                <button
                  onClick={() => setCurriculumActiveTab("uni")}
                  className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 transition-all ${curriculumActiveTab === "uni" ? "bg-sdg-12 text-white" : "hover:bg-gray-50 bg-white text-black"}`}
                >
                  🎓 University Roadmap
                </button>
              )}
              <button
                onClick={() => setCurriculumActiveTab("quiz")}
                className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 transition-all ${curriculumActiveTab === "quiz" ? "bg-sdg-12 text-white" : "hover:bg-gray-50 bg-white text-black"}`}
              >
                🎯 Sample Warmups
              </button>
              <button
                onClick={() => setCurriculumActiveTab("solution")}
                className={`flex-1 min-w-[150px] py-3 text-center text-xs font-black uppercase tracking-wider transition-all ${curriculumActiveTab === "solution" ? "bg-sdg-12 text-white" : "hover:bg-[#F6F5F2] bg-white text-black"}`}
              >
                🚀 Solutions Sprint
              </button>
            </div>

            {/* Sub-tab Views */}
            {curriculumActiveTab === "hs" &&
              registeredClub?.level !== "University" && (
                <HighSchoolPlannerView
                  hsCurrentWeek={hsCurrentWeek}
                  setHsCurrentWeek={setHsCurrentWeek}
                  hsQuizAnswered={hsQuizAnswered}
                  setHsQuizAnswered={setHsQuizAnswered}
                  hsSelectedQuizOpt={hsSelectedQuizOpt}
                  setHsSelectedQuizOpt={setHsSelectedQuizOpt}
                />
              )}

            {curriculumActiveTab === "uni" &&
              registeredClub?.level === "University" && (
                <UniversityRoadmapView />
              )}

            {curriculumActiveTab === "quiz" && <SampleWarmupsView />}

            {curriculumActiveTab === "solution" && <SolutionsSprintView />}
          </div>
        )}

        {activeTab === "cloudrun" && (
          <CloudRunManagementView
            registeredClub={registeredClub}
            onClubUpdate={setRegisteredClub}
          />
        )}
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 text-left">
          <div className="w-full max-w-md bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fadeIn">
            <h3 className="text-lg font-black uppercase text-black tracking-tight mb-2 flex items-center gap-2">
              ⚠️ Log Out / Switch Club
            </h3>
            <p className="text-xs font-semibold text-gray-750 leading-relaxed mb-6">
              Are you sure you want to log out or switch from the active school
              club session? Your active progress will remain locally saved, and
              you can switch back or re-register at any time.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                }}
                className="px-4 py-2 text-xs font-black uppercase bg-gray-150 border-2 border-black hover:bg-gray-200 transition-all cursor-pointer"
              >
                No, Keep Session
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  localStorage.removeItem("kap10_registered_club");
                  setRegisteredClub(null);
                  setSelectedTopic(null);
                  setRegSuccessMessage(null);
                }}
                className="px-4 py-2 text-xs font-black uppercase bg-red-600 text-white border-2 border-black hover:bg-red-700 hover:text-white transition-all cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreboardView({
  data,
  userProfile,
  userScore,
  registeredClub,
  setRegisteredClub,
  setPremiumModalOpen,
  allClubs = [],
  setAllClubs,
  coursesList = [],
  setCoursesList,
}: {
  data: any[];
  userProfile: UserProfile;
  userScore: number;
  registeredClub: SchoolClub | null;
  setRegisteredClub: (club: SchoolClub | null) => void;
  setPremiumModalOpen: (open: boolean) => void;
  allClubs?: any[];
  setAllClubs: (clubs: any[]) => void;
  coursesList?: CourseTopic[];
  setCoursesList: (courses: CourseTopic[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "directory" | "lounge" | "resources"
  >("directory");

  // Local states for directory, filtering, searching
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryRegion, setDirectoryRegion] = useState("All");
  const [directoryLevel, setDirectoryLevel] = useState("All");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  // States for Editing own registered club profile
  const [editMode, setEditMode] = useState(false);
  const [editLeader, setEditLeader] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSdgFocus, setEditSdgFocus] = useState("");
  const [editMembersCount, setEditMembersCount] = useState(20);
  const [editEmail, setEditEmail] = useState("");
  const [editLeaders, setEditLeaders] = useState("");
  const [editPatron, setEditPatron] = useState("");
  const [editMembersList, setEditMembersList] = useState("");
  const [editMission, setEditMission] = useState("");
  const [editAchievements, setEditAchievements] = useState("");

  // Keep DEFAULT_CLUBS synced with local changes & custom user club injection
  const getFullClubsList = () => {
    const list = [...allClubs];
    if (registeredClub) {
      const exists = list.some((c) => c.id === registeredClub.id);
      if (!exists) {
        list.push({
          id: registeredClub.id,
          name: registeredClub.name,
          institution: registeredClub.institution,
          level: registeredClub.level,
          region: registeredClub.region,
          score: registeredClub.score,
          members: 15,
          sdgFocus: "SDG 4: Quality Education",
          leader: userProfile.occupation || "Club Leader",
          bio: "Welcome to our newly registered school club! We are excited to collaborate, co-create, and build a sustainable Uganda together.",
          email: `${registeredClub.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.ac.ug`,
          lastActive: "Active now",
          leaders: userProfile.occupation || "Club Leader",
          patron: "To Be Appointed",
          membersList: "Add your members list here",
          mission:
            "To co-create sustainable solutions for local regional development and track indicator outcomes.",
          achievements: "No achievements registered yet.",
        });
      } else {
        // Update score from state in real-time
        const idx = list.findIndex((c) => c.id === registeredClub.id);
        list[idx].score = registeredClub.score;
      }
    }
    return list;
  };

  const clubsList = getFullClubsList();

  const handleUpdateOwnProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredClub) return;

    // Save customized fields to directories state and update config
    let updatedDoc: any = null;
    const updatedClubs = clubsList.map((c) => {
      if (c.id === registeredClub.id) {
        updatedDoc = {
          ...c,
          leader: editLeader || c.leader,
          bio: editBio || c.bio,
          sdgFocus: editSdgFocus || c.sdgFocus,
          members: editMembersCount || c.members,
          email: editEmail || c.email,
          leaders: editLeaders || c.leader,
          patron: editPatron || "To Be Appointed",
          membersList: editMembersList || "Add your members list here",
          mission: editMission || c.bio,
          achievements: editAchievements || "No achievements registered yet.",
        };
        return updatedDoc;
      }
      return c;
    });

    if (updatedDoc) {
      setDoc(doc(db, "clubs", registeredClub.id), updatedDoc).catch((err) => {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `clubs/${registeredClub.id}`,
        );
      });
    }

    setAllClubs(updatedClubs);
    localStorage.setItem("kap10_directory_clubs", JSON.stringify(updatedClubs));
    setEditMode(false);
    alert(
      "Club Profile updated successfully in the national Konnect-Booth directory!",
    );
  };

  // Pre-fill own profile edit inputs when opening
  useEffect(() => {
    if (registeredClub) {
      const match = clubsList.find((c) => c.id === registeredClub.id);
      if (match) {
        setEditLeader(match.leader);
        setEditBio(match.bio);
        setEditSdgFocus(match.sdgFocus);
        setEditMembersCount(match.members);
        setEditEmail(match.email);
        setEditLeaders(match.leaders || match.leader || "");
        setEditPatron(match.patron || "");
        setEditMembersList(match.membersList || "");
        setEditMission(match.mission || match.bio || "");
        setEditAchievements(match.achievements || "");
      }
    }
  }, [registeredClub, editMode]);

  // 1. Live synchronization and Seeding of lounge messages in Firestore
  useEffect(() => {
    const unsubLounge = onSnapshot(
      collection(db, "loungeMessages"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            const defaultMessages = [
              {
                id: "msg-1",
                clubName: "Makerere Environmental Coalition",
                region: "Central",
                level: "University",
                text: "We are currently organizing an inter-university plastics collection and recycling contest this September in Kampala. Looking for co-hosts in Kyambogo or MUBS! Let's cocreate together and save our swamps.",
                timestamp: "5 mins ago",
                likes: 12,
              },
              {
                id: "msg-2",
                clubName: "Kiira College Butiki Innovators",
                region: "Eastern",
                level: "High School",
                text: "Just verified our solar harvest dryer with farmers in Mbale district! If any high school clubs in Eastern Uganda want the assembly blueprints, we've shared the download file under resources. Let us know!",
                timestamp: "2 hours ago",
                likes: 5,
              },
              {
                id: "msg-3",
                clubName: "Gulu University SDG Activists",
                region: "Northern",
                level: "University",
                text: "Our Kotido smart millet gardens have survived the short dry spell perfectly. We're launching a mini-webinar on soil permaculture bio-fences next Friday. All clubs are welcome to join!",
                timestamp: "Yesterday",
                likes: 14,
              },
            ];
            for (const m of defaultMessages) {
              await setDoc(doc(db, "loungeMessages", m.id), m);
            }
          } else {
            const list: any[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data());
            });
            list.sort((a, b) => {
              const tA =
                typeof a.id === "number"
                  ? a.id
                  : parseInt(String(a.id).replace(/\D/g, "")) || 0;
              const tB =
                typeof b.id === "number"
                  ? b.id
                  : parseInt(String(b.id).replace(/\D/g, "")) || 0;
              return tB - tA;
            });
            setLoungeMessages(list);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, "loungeMessages");
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "loungeMessages");
      },
    );

    return () => {
      unsubLounge();
    };
  }, []);

  // 2. Bidirectional sync of registered own club details & score into Firestore
  useEffect(() => {
    if (registeredClub && registeredClub.id) {
      const match = allClubs.find((c) => c.id === registeredClub.id);
      if (match) {
        if (match.score !== registeredClub.score) {
          const updatedClub = { ...match, score: registeredClub.score };
          setDoc(doc(db, "clubs", registeredClub.id), updatedClub).catch(
            (err) => {
              handleFirestoreError(
                err,
                OperationType.WRITE,
                `clubs/${registeredClub.id}`,
              );
            },
          );
        }
      } else {
        const fullNewClub = {
          id: registeredClub.id,
          name: registeredClub.name,
          institution: registeredClub.institution,
          level: registeredClub.level,
          region: registeredClub.region,
          score: registeredClub.score,
          members: 15,
          sdgFocus: "SDG 4: Quality Education",
          leader: userProfile.occupation || "Club Leader",
          bio: "Welcome to our newly registered school club! We are excited to collaborate, co-create, and build a sustainable Uganda together.",
          email: `${registeredClub.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.ac.ug`,
          lastActive: "Active now",
          leaders: userProfile.occupation || "Club Leader",
          patron: "To Be Appointed",
          membersList: "Add your members list here",
          mission:
            "To co-create sustainable solutions for local regional development and track indicator outcomes.",
          achievements: "No achievements registered yet.",
        };
        setDoc(doc(db, "clubs", registeredClub.id), fullNewClub).catch(
          (err) => {
            handleFirestoreError(
              err,
              OperationType.WRITE,
              `clubs/${registeredClub.id}`,
            );
          },
        );
      }
    }
  }, [registeredClub, allClubs]);

  // Tab 2: Lounge Chat Board States
  const [shoutText, setShoutText] = useState("");
  const [posterName, setPosterName] = useState("");
  const [loungeMessages, setLoungeMessages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kap10_lounge_messages");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        clubName: "Makerere Environmental Coalition",
        region: "Central",
        level: "University",
        text: "We are currently organizing an inter-university plastics collection and recycling contest this September in Kampala. Looking for co-hosts in Kyambogo or MUBS! Let's cocreate together and save our swamps.",
        timestamp: "5 mins ago",
        likes: 12,
      },
      {
        id: 2,
        clubName: "Kiira College Butiki Innovators",
        region: "Eastern",
        level: "High School",
        text: "Just verified our solar harvest dryer with farmers in Mbale district! If any high school clubs in Eastern Uganda want the assembly blueprints, we've shared the download file under resources. Let us know!",
        timestamp: "2 hours ago",
        likes: 5,
      },
      {
        id: 3,
        clubName: "Gulu University SDG Activists",
        region: "Northern",
        level: "University",
        text: "Our Kotido smart millet gardens have survived the short dry spell perfectly. We're launching a mini-webinar on soil permaculture bio-fences next Friday. All clubs are welcome to join!",
        timestamp: "Yesterday",
        likes: 14,
      },
      {
        id: 4,
        clubName: "King's College Budo Green Club",
        region: "Central",
        level: "High School",
        text: "Hello friends! We just launched a classroom recycling scheme on our compounds. We want to compile a collective national High School Green School handbook. Who wants to join our joint editorial team?",
        timestamp: "2 days ago",
        likes: 8,
      },
    ];
  });

  const handlePostShout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoutText.trim()) return;

    let clubLabel = "Citizen Advocate";
    let regionLabel = "Uganda";
    let levelLabel = "Community";

    if (registeredClub) {
      if (registeredClub.status === "suspended") {
        alert("Your club is currently SUSPENDED by administrators. Suspended chapters are blocked from broadcasting lounge messages.");
        return;
      }
      if (registeredClub.status === "pending" || !registeredClub.status) {
        alert("Your club registration is currently PENDING admin verification. You can shout in the lounge once verified!");
        return;
      }
      clubLabel = registeredClub.name;
      regionLabel = registeredClub.region;
      levelLabel = registeredClub.level;
    } else if (posterName.trim()) {
      clubLabel = `${posterName} (Advocate)`;
    }

    const newMessageId = String(Date.now());
    const newMessage = {
      id: newMessageId,
      clubName: clubLabel,
      region: regionLabel,
      level: levelLabel,
      text: shoutText,
      timestamp: "Just now",
      likes: 0,
    };

    setDoc(doc(db, "loungeMessages", newMessageId), newMessage).catch((err) => {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `loungeMessages/${newMessageId}`,
      );
    });

    setShoutText("");
    setPosterName("");

    // Award minor bonus points if registered
    if (registeredClub) {
      const updatedClub = {
        ...registeredClub,
        score: registeredClub.score + 10,
      };
      localStorage.setItem(
        "kap10_registered_club",
        JSON.stringify(updatedClub),
      );
      setRegisteredClub(updatedClub);
      alert("Message Broadcasted! Your club earned +10 collaboration points.");
    }
  };

  const handleLikeMessage = (id: number | string) => {
    const stringId = String(id);
    const msg = loungeMessages.find((m) => String(m.id) === stringId);
    if (!msg) return;

    const msgRef = doc(db, "loungeMessages", stringId);
    updateDoc(msgRef, { likes: (msg.likes || 0) + 1 }).catch((err) => {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `loungeMessages/${stringId}`,
      );
    });
  };

  // Tab 3: Shared Resources State
  const [resources, setResources] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kap10_kb_resources");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        title: "Biodegradable Waste Composting Workbook",
        type: "Guidebook (PDF)",
        sdgFocus: "SDG 12: Responsible Consumption",
        clubName: "King's College Budo Green Club",
        description:
          "Step-by-step PDF manual illustrating how to build, line, and heat-monitor a standard organic composting pit on school compounds.",
        link: "https://budo.ac.ug/green/compost-guide.pdf",
        upvotes: 18,
      },
      {
        id: 2,
        title: "Low-Cost Crop Solar Grain Dryer Schematics",
        type: "Technical Specifications",
        sdgFocus: "SDG 9: Industry & Innovation",
        clubName: "Kiira College Butiki Innovators",
        description:
          "Open-source blue prints utilizing timber offcuts and UV sheets to protect harvested cereals from toxic aflatoxins in high rains.",
        link: "https://butikipipe.sc.ug/sdgs/solar-dryer.png",
        upvotes: 24,
      },
      {
        id: 3,
        title: "Wetland Restorative Action advocacy toolkit",
        type: "Campaign Toolkit",
        sdgFocus: "SDG 13: Climate Action",
        clubName: "Makerere Environmental Coalition",
        description:
          "Pre-drafted petitions, flyer assets, and letter templates to lobby local councils (LCs) for wet-land buffer compliance tracking.",
        link: "https://makcoalition.org/resrc/wetland-policy-pack.pdf",
        upvotes: 15,
      },
    ];
  });

  // Add Resource Inputs
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState("Guidebook (PDF)");
  const [resSdg, setResSdg] = useState("SDG 13: Climate Action");
  const [resDesc, setResDesc] = useState("");
  const [resLink, setResLink] = useState("");
  const [showResForm, setShowResForm] = useState(false);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resDesc.trim()) {
      alert("Please fill out Title and Description!");
      return;
    }

    let publisher = "Independent Crusader";
    if (registeredClub) {
      publisher = registeredClub.name;
    }

    const newResource = {
      id: Date.now(),
      title: resTitle,
      type: resType,
      sdgFocus: resSdg,
      clubName: publisher,
      description: resDesc,
      link: resLink.trim() || "https://platform.co-create.ug/resource/shared",
      upvotes: 1,
    };

    const updated = [newResource, ...resources];
    setResources(updated);
    localStorage.setItem("kap10_kb_resources", JSON.stringify(updated));

    setResTitle("");
    setResDesc("");
    setResLink("");
    setShowResForm(false);

    if (registeredClub) {
      const updatedClub = {
        ...registeredClub,
        score: registeredClub.score + 20,
      };
      localStorage.setItem(
        "kap10_registered_club",
        JSON.stringify(updatedClub),
      );
      setRegisteredClub(updatedClub);
      alert(
        "Resource published! Your club earned +20 points for knowledge dissemination.",
      );
    } else {
      alert("Resource published successfully on the public portal!");
    }
  };

  const handleUpvoteResource = (id: number) => {
    const updated = resources.map((r) => {
      if (r.id === id) {
        return { ...r, upvotes: r.upvotes + 1 };
      }
      return r;
    });
    setResources(updated);
    localStorage.setItem("kap10_kb_resources", JSON.stringify(updated));
  };

  const handleDownloadResource = async (res: any, e: React.MouseEvent) => {
    const isSubscribed = registeredClub?.subscribed || false;
    if (!isSubscribed) {
      e.preventDefault();
      setPremiumModalOpen(true);
      alert(
        "🔒 ACCESS RESTRICTED (Viewing Only): Downloading materials and templates is restricted to Premium Subscribed SDG Clubs. High School clubs pay UGX 10,000, and Campus Connect clubs pay UGX 20,000. Double-click the '💎 Premium Club Hub' in the toolbar to unlock downloads now!",
      );
      return;
    }

    // Tallies current downloader club stats
    if (registeredClub) {
      const currentDownloads = registeredClub.downloadCount || 0;
      const updatedDownloader = {
        ...registeredClub,
        downloadCount: currentDownloads + 1,
        score: registeredClub.score + 10, // Award +10 points to downloader for knowledge engagement
      };
      setRegisteredClub(updatedDownloader);
      localStorage.setItem(
        "kap10_registered_club",
        JSON.stringify(updatedDownloader),
      );
      try {
        await updateDoc(doc(db, "clubs", registeredClub.id), {
          downloadCount: currentDownloads + 1,
          score: registeredClub.score + 10,
        });
      } catch (err) {}
    }

    // Tallies of the publisher club (Authors) stats to let them compete for annual awards
    try {
      const match = allClubs.find((c) => c.name === res.clubName);
      if (match) {
        const currentPublisherDownloads = match.downloadCount || 0;
        const updatedPublisher = {
          ...match,
          downloadCount: currentPublisherDownloads + 1,
          score: match.score + 25, // High reward for published resource download (+25 prestige points)
        };
        const updatedAll = allClubs.map((c) =>
          c.id === match.id ? updatedPublisher : c,
        );
        setAllClubs(updatedAll);
        localStorage.setItem(
          "kap10_directory_clubs",
          JSON.stringify(updatedAll),
        );
        await updateDoc(doc(db, "clubs", match.id), {
          downloadCount: currentPublisherDownloads + 1,
          score: match.score + 25,
        });
      }
    } catch (err) {}

    // Show download trigger message
    if (!res.link.startsWith("http")) {
      e.preventDefault();
      alert(
        `🎉 Download Registered! You have downloaded ${res.title}. This has been added to the annual SDG downloads leaderboard.`,
      );
    } else {
      alert(
        `🎉 Download Activated: Proceeding to fetch "${res.title}". Tallied for the Annual Co-Create download award.`,
      );
    }
  };

  // Filter list results
  const filteredClubs = clubsList.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      club.institution.toLowerCase().includes(directorySearch.toLowerCase());
    const matchesRegion =
      directoryRegion === "All" || club.region === directoryRegion;
    const matchesLevel =
      directoryLevel === "All" || club.level === directoryLevel;
    return matchesSearch && matchesRegion && matchesLevel;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F3F2EE] overflow-hidden">
      {/* Konnect-Booth Welcome Bar */}
      <div className="bg-black text-white px-6 py-5 border-b-4 border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black tracking-widest bg-sdg-10 text-white px-2 py-0.5 uppercase">
              KB ROOM
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              • CoCreate Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black uppercase italic font-display mt-1">
            Konnect-Booth (KB)
          </h2>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase">
            Direct collaboration, updates, and templates for Ugandan SDG Club
            chapters.
          </p>
        </div>
        {registeredClub ? (
          <div className="bg-white text-black p-3 border-2 border-black font-black text-xs uppercase flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>
              Connected: {registeredClub.name} ({registeredClub.score} XPs)
            </span>
          </div>
        ) : (
          <div className="bg-sdg-1/15 border-2 border-sdg-1 text-sdg-1 p-3 font-black text-xs uppercase tracking-wide">
            📢 Register your Club in Academy to publish as verified!
          </div>
        )}
      </div>

      {/* Primary Sub-Navigation inside Konnect-Booth */}
      <div className="flex border-b-4 border-black bg-white select-none overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex-1 min-w-[150px] py-4 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black transition-all ${activeTab === "directory" ? "bg-sdg-3 text-white font-black" : "hover:bg-gray-50"}`}
        >
          🤝 Club Profiles Directory
        </button>
        <button
          onClick={() => setActiveTab("lounge")}
          className={`flex-1 min-w-[150px] py-4 text-center text-xs font-black uppercase tracking-wider border-r-2 border-black transition-all ${activeTab === "lounge" ? "bg-sdg-10 text-white font-black" : "hover:bg-gray-50"}`}
        >
          💬 Inter-Club Shout Lounge ({loungeMessages.length})
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex-1 min-w-[150px] py-4 text-center text-xs font-black uppercase tracking-wider transition-all ${activeTab === "resources" ? "bg-sdg-16 text-white font-black" : "hover:bg-gray-50"}`}
        >
          📢 Share & Download Resources ({resources.length})
        </button>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* TAB 1: CLUB DIRECTORY & PROFILES */}
          {activeTab === "directory" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {/* Search Panel */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search SDG clubs, high schools, universities..."
                    className="w-full text-xs font-bold pl-10 pr-4 py-3 border-2 border-black rounded-none bg-gray-50 outline-none"
                  />
                </div>
                {/* Regional and level Filter buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-gray-400 mr-1">
                    Region:
                  </span>
                  {["All", "Central", "Western", "Eastern", "Northern"].map(
                    (reg) => (
                      <button
                        key={reg}
                        onClick={() => setDirectoryRegion(reg)}
                        className={`px-3 py-1.5 border-2 border-black text-[9px] font-black uppercase tracking-tight transition-all ${directoryRegion === reg ? "bg-black text-white" : "bg-gray-50 hover:bg-gray-100"}`}
                      >
                        {reg}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Grid or splits of Clubs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left side: Directory Cards Listing (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase text-gray-500">
                    <span>Clubs Found: {filteredClubs.length}</span>
                    <span>Sorted by Score (XP)</span>
                  </div>

                  <div className="space-y-4">
                    {filteredClubs.map((club) => {
                      const isSelected = selectedClubId === club.id;
                      const isOwn =
                        registeredClub && registeredClub.id === club.id;
                      return (
                        <div
                          key={club.id}
                          className={`bg-white border-4 border-black p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isSelected ? "ring-4 ring-black" : ""}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-black text-white leading-none">
                                {club.region} Region
                              </span>
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-sdg-3 text-white leading-none">
                                {club.level}
                              </span>
                              {isOwn && (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-sdg-7 text-black leading-none">
                                  Your Registered Chapter
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 leading-tight">
                              {club.name}
                            </h3>
                            <p className="text-xs font-bold text-gray-400 uppercase leading-none">
                              {club.institution} • {club.members} Active
                              Crusaders
                            </p>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t-2 border-gray-50 md:border-t-0 pt-3 md:pt-0">
                            <div className="text-left md:text-right mr-4">
                              <span className="text-[9px] font-black text-gray-400 uppercase">
                                Points Score
                              </span>
                              <div className="text-lg font-black text-sdg-3 leading-none">
                                {club.score} XP
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedClubId(club.id)}
                              className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-sdg-3 text-[10px] font-black uppercase tracking-wider"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredClubs.length === 0 && (
                      <div className="p-8 text-center bg-white border-4 border-dashed border-gray-400 font-bold uppercase text-gray-400 text-xs">
                        No clubs found matching your search. Try checking a
                        different region filter!
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Area: Club Profile Details Card (1 Col) */}
                <div className="space-y-4 sticky top-[240px]">
                  {selectedClubId ? (
                    (() => {
                      const activeClub = clubsList.find(
                        (c) => c.id === selectedClubId,
                      );
                      if (!activeClub) return null;
                      const isOwnClubObj =
                        registeredClub && registeredClub.id === activeClub.id;

                      return (
                        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
                          <header className="border-b-2 border-black pb-4 space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-sdg-3 bg-sdg-3/10 px-2 py-1 inline-block">
                              Chapter Profile
                            </span>
                            <h3 className="text-2xl font-black uppercase tracking-tight italic text-gray-950 font-display leading-tight">
                              {activeClub.name}
                            </h3>
                            <p className="text-[10px] font-black uppercase text-gray-400 leading-none">
                              {activeClub.institution} • {activeClub.region}{" "}
                              Uganda
                            </p>
                          </header>

                          {!editMode ? (
                            <div className="space-y-4 text-xs">
                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                                <div>
                                  <span className="block text-[9px] font-black uppercase text-gray-400">
                                    Representative
                                  </span>
                                  <span className="font-extrabold text-gray-800">
                                    {activeClub.leader}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-black uppercase text-gray-400">
                                    Crusaders count
                                  </span>
                                  <span className="font-extrabold text-gray-800">
                                    {activeClub.members} active
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                                <div>
                                  <span className="block text-[9px] font-black uppercase text-gray-400">
                                    Club Leaders
                                  </span>
                                  <span className="font-extrabold text-gray-800">
                                    {activeClub.leaders ||
                                      activeClub.leader ||
                                      "Not specified"}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[9px] font-black uppercase text-gray-400">
                                    Club Patron
                                  </span>
                                  <span className="font-extrabold text-gray-800">
                                    {activeClub.patron || "To Be Appointed"}
                                  </span>
                                </div>
                              </div>

                              <div className="pb-3 border-b border-gray-100">
                                <span className="block text-[9px] font-black uppercase text-gray-400 mb-0.5">
                                  Core SDG Focus Tag
                                </span>
                                <span className="inline-block bg-sdg-13/10 text-sdg-13 border border-sdg-13 px-2 py-0.5 text-[9px] font-black uppercase mt-1 leading-none">
                                  {activeClub.sdgFocus}
                                </span>
                              </div>

                              <div className="pb-3 border-b border-gray-100 space-y-1">
                                <span className="block text-[9px] font-black uppercase text-gray-400">
                                  Club Mission Statement
                                </span>
                                <p className="text-gray-700 font-bold leading-relaxed">
                                  {activeClub.mission || activeClub.bio}
                                </p>
                              </div>

                              <div className="pb-3 border-b border-gray-100 space-y-1">
                                <span className="block text-[9px] font-black uppercase text-gray-400">
                                  Achievements & Milestones
                                </span>
                                <p className="text-sdg-3 font-extrabold leading-relaxed">
                                  {activeClub.achievements ||
                                    "No achievements recorded yet."}
                                </p>
                              </div>

                              <div className="pb-3 border-b border-gray-100 space-y-1">
                                <span className="block text-[9px] font-black uppercase text-gray-400">
                                  Registered Members List
                                </span>
                                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-2 border border-gray-200 rounded">
                                  {activeClub.membersList ||
                                    "Add your members list here"}
                                </p>
                              </div>

                              <div className="p-3 bg-gray-50 border-2 border-black space-y-1">
                                <span className="block text-[9px] font-black uppercase text-gray-400">
                                  Regional Contact channel
                                </span>
                                <p className="font-mono text-[10px] font-black text-gray-900 break-all">
                                  {activeClub.email}
                                </p>
                              </div>

                              {isOwnClubObj ? (
                                <button
                                  onClick={() => setEditMode(true)}
                                  className="w-full py-2.5 border-2 border-black bg-sdg-7 text-black hover:bg-black hover:text-white font-black uppercase text-[10px] tracking-wider transition-all"
                                >
                                  Edit Our Profile Details
                                </button>
                              ) : (
                                <div className="pt-2 flex gap-2">
                                  <a
                                    href={`mailto:${activeClub.email}`}
                                    className="flex-1 py-2 text-center border-2 border-black bg-black text-white hover:bg-sdg-3 font-black uppercase text-[9px]"
                                  >
                                    Email Representative
                                  </a>
                                  <button
                                    onClick={() => {
                                      setActiveTab("lounge");
                                      setShoutText(
                                        `@${activeClub.name}: Hello, we read your profile on the Konnect-Booth directory and would love to partner up for a joint project! `,
                                      );
                                    }}
                                    className="flex-1 py-2 text-center border-2 border-black bg-white text-black hover:bg-gray-150 font-black uppercase text-[9px]"
                                  >
                                    Shout in Lounge
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Edit Profile Form (Only for own club)
                            <form
                              onSubmit={handleUpdateOwnProfile}
                              className="space-y-4 text-xs h-[480px] overflow-y-auto pr-1"
                            >
                              <span className="text-[10px] font-black text-sdg-7 uppercase tracking-wide bg-black text-white px-2 py-0.5 block text-center">
                                Updating Your National Profile
                              </span>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Representative Name
                                </label>
                                <input
                                  type="text"
                                  value={editLeader}
                                  onChange={(e) =>
                                    setEditLeader(e.target.value)
                                  }
                                  className="w-full p-2 border-2 border-black font-bold text-xs"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Leaders of the Club (e.g. Positions)
                                </label>
                                <input
                                  type="text"
                                  value={editLeaders}
                                  onChange={(e) =>
                                    setEditLeaders(e.target.value)
                                  }
                                  placeholder="President: Jane, VP: Samuel, Treasurer: Peter"
                                  className="w-full p-2 border-2 border-black font-bold text-xs"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Club Patron Name
                                </label>
                                <input
                                  type="text"
                                  value={editPatron}
                                  onChange={(e) =>
                                    setEditPatron(e.target.value)
                                  }
                                  placeholder="Mr. or Madam Teacher / Coordinator"
                                  className="w-full p-2 border-2 border-black font-bold text-xs"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                    Active Crusaders count
                                  </label>
                                  <input
                                    type="number"
                                    value={editMembersCount}
                                    onChange={(e) =>
                                      setEditMembersCount(
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full p-2 border-2 border-black font-bold text-xs"
                                    min="1"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                    SDG Goal Focus
                                  </label>
                                  <select
                                    value={editSdgFocus}
                                    onChange={(e) =>
                                      setEditSdgFocus(e.target.value)
                                    }
                                    className="w-full p-2 border-2 border-black font-black text-[10px]"
                                  >
                                    <option value="SDG 2: Zero Hunger">
                                      SDG 2: Zero Hunger
                                    </option>
                                    <option value="SDG 4: Quality Education">
                                      SDG 4: Quality Education
                                    </option>
                                    <option value="SDG 6: Clean Water">
                                      SDG 6: Clean Water
                                    </option>
                                    <option value="SDG 9: Industry & Innovation">
                                      SDG 9: Industry & Innovation
                                    </option>
                                    <option value="SDG 11: Sustainable Cities">
                                      SDG 11: Sustainable Cities
                                    </option>
                                    <option value="SDG 12: Responsible Consumption">
                                      SDG 12: Consumption
                                    </option>
                                    <option value="SDG 13: Climate Action">
                                      SDG 13: Climate Action
                                    </option>
                                    <option value="SDG 15: Life on Land">
                                      SDG 15: Life on Land
                                    </option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Club Mission Statement
                                </label>
                                <textarea
                                  value={editMission}
                                  onChange={(e) =>
                                    setEditMission(e.target.value)
                                  }
                                  rows={2}
                                  className="w-full p-2 border-2 border-black font-bold text-xs resize-none"
                                  placeholder="Describe what actions your school chapter handles, e.g. To preserve regional soils..."
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Achievements & Milestones
                                </label>
                                <textarea
                                  value={editAchievements}
                                  onChange={(e) =>
                                    setEditAchievements(e.target.value)
                                  }
                                  rows={2}
                                  className="w-full p-2 border-2 border-black font-bold text-xs resize-none"
                                  placeholder="E.g. Planted 500 indigenous trees along Kampala swamps..."
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Registered Members List (Comma Separated)
                                </label>
                                <textarea
                                  value={editMembersList}
                                  onChange={(e) =>
                                    setEditMembersList(e.target.value)
                                  }
                                  rows={2}
                                  className="w-full p-2 border-2 border-black font-bold text-xs resize-none"
                                  placeholder="Jane S., Florence N., Grace O., David K."
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                                  Contact Email address
                                </label>
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="w-full p-2 border-2 border-black font-bold text-xs"
                                  required
                                />
                              </div>

                              <div className="flex gap-2 pt-1">
                                <button
                                  type="submit"
                                  className="flex-1 py-2 bg-black text-white hover:bg-sdg-3 font-black uppercase text-[10px]"
                                >
                                  Save Changes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditMode(false)}
                                  className="flex-1 py-2 border-2 border-black bg-white text-black hover:bg-gray-100 font-black uppercase text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center py-12 space-y-3">
                      <Users className="w-12 h-12 mx-auto text-gray-300 animate-pulse" />
                      <h4 className="font-black text-sm uppercase">
                        No Club Explorer Open
                      </h4>
                      <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed px-4">
                        Select any registered climate or education school club
                        from the national directory to view their profile,
                        representative details, and regional contact
                        directories.
                      </p>
                    </div>
                  )}

                  {/* Prestige Standings List at Bottom */}
                  {registeredClub && (
                    <div className="p-4 border-2 border-black bg-sdg-7/5 text-xs text-black space-y-1">
                      <span className="font-black uppercase text-[9px] text-[#141414]/60">
                        💡 Co-Create tip
                      </span>
                      <p className="font-bold">
                        Solve interactive lessons in the SDG Academy slider deck
                        to boost your active club's score points here!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTER-CLUB COLLABORATION LOUNGE CHAT */}
          {activeTab === "lounge" && (
            <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Form: Shout Board Broadcaster (1 Col) */}
              <div className="space-y-6">
                <header className="border-b-2 border-black pb-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sdg-10 bg-sdg-10/10 px-2.5 py-0.5 inline-block">
                    Broadcaster Room
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic font-display">
                    Shout out to the Network
                  </h3>
                  <p className="text-xs uppercase font-black text-gray-400">
                    Send immediate help calls, campaign invites, or debate
                    links.
                  </p>
                </header>

                <form onSubmit={handlePostShout} className="space-y-4">
                  {!registeredClub && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Your Advocate Name
                      </label>
                      <input
                        type="text"
                        value={posterName}
                        onChange={(e) => setPosterName(e.target.value)}
                        placeholder="e.g. Ronald, Green Campus"
                        className="w-full p-2.5 border-2 border-black font-semibold text-xs rounded-none outline-none focus:bg-white bg-gray-50"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                      {registeredClub
                        ? `Speak as ${registeredClub.name}`
                        : "Your Message"}
                    </label>
                    <textarea
                      value={shoutText}
                      onChange={(e) => setShoutText(e.target.value)}
                      placeholder="e.g. Budo Green club seeks secondary chapters in Central region for a combined waste management challenge! Message us."
                      rows={5}
                      maxLength={280}
                      className="w-full p-2.5 border-2 border-black font-semibold text-xs rounded-none outline-none focus:bg-white bg-gray-50 resize-none leading-relaxed"
                      required
                    />
                    <div className="text-right text-[9px] font-bold text-gray-400 uppercase mt-1">
                      {shoutText.length}/280 Characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!shoutText.trim()}
                    className="w-full py-3 bg-[#141414] hover:bg-sdg-10 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Send size={12} />
                    <span>Broadcast Message</span>
                  </button>

                  {registeredClub && (
                    <div className="text-[9px] bg-sdg-7/10 border-2 border-black p-2 font-bold uppercase text-center leading-relaxed">
                      💡 Broadcasting earns your school club +10 XP points
                      automatically in the national records!
                    </div>
                  )}
                </form>
              </div>

              {/* Right Side: Message Bulletin Board (2 Cols) */}
              <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border-l-0 lg:border-l-2 lg:border-black pl-0 lg:pl-6 pt-6 lg:pt-0">
                <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400">
                  <span>Co-Create Conversation Board</span>
                  <span>{loungeMessages.length} broadcasts</span>
                </div>

                <div className="space-y-4">
                  {loungeMessages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className="bg-gray-50 border-2 border-black p-5 relative space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2 text-[9px] font-bold uppercase">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-gray-950 p-1 bg-white border border-black leading-none">
                            {msg.clubName}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sdg-3 font-black">
                            {msg.level}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-950 font-semibold italic">
                            {msg.region} Region
                          </span>
                        </div>
                        <span className="text-gray-400">{msg.timestamp}</span>
                      </div>

                      <p className="text-xs font-semibold text-gray-700 leading-relaxed break-words">
                        {msg.text}
                      </p>

                      <div className="pt-2 border-t border-gray-100 flex justify-end items-center gap-3">
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className="flex items-center gap-1 text-[10px] font-extrabold text-black hover:text-sdg-10 uppercase py-1 px-1.5 bg-white border border-black leading-none"
                        >
                          <ThumbsUp size={10} />
                          <span>
                            Support {msg.likes > 0 && `(${msg.likes})`}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHARE RESOURCES HUB */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              {/* Publisher Toggle and description card */}
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase italic leading-none font-display">
                    Shared Materials Repository
                  </h3>
                  <p className="text-xs uppercase font-black text-gray-400 leading-tight">
                    Clubs upload direct lesson PDFs, solar dryers designs,
                    composting files, and early telemetry code.
                  </p>
                </div>
                <button
                  onClick={() => setShowResForm(!showResForm)}
                  className="px-5 py-3 border-4 border-black bg-sdg-16 text-white font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  {showResForm
                    ? "Close Publisher"
                    : "Publish Action Template / File"}
                </button>
              </div>

              {/* Resource Publisher Form block */}
              {showResForm && (
                <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <h4 className="font-black text-lg uppercase italic border-b pb-2 border-black">
                    Publish Knowledge Asset
                  </h4>
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                          Asset Document Title
                        </label>
                        <input
                          type="text"
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder="e.g. Rainwater Harvesting Tank Construction Blueprint"
                          className="w-full p-2.5 border-2 border-black font-semibold text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                          Asset Category Type
                        </label>
                        <select
                          value={resType}
                          onChange={(e) => setResType(e.target.value)}
                          className="w-full p-2.5 border-2 border-black font-bold text-xs bg-gray-50 uppercase"
                        >
                          <option value="Guidebook (PDF)">
                            Guidebook (PDF)
                          </option>
                          <option value="Technical Specifications">
                            Technical Specifications & Blueprints
                          </option>
                          <option value="Campaign Toolkit">
                            Campaign Advocacy Toolkit
                          </option>
                          <option value="Project Template">
                            Operational Action Template
                          </option>
                          <option value="Syllabus Slide Deck">
                            Syllabus Slide Deck
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                          Primary SDG Alignment Focus
                        </label>
                        <select
                          value={resSdg}
                          onChange={(e) => setResSdg(e.target.value)}
                          className="w-full p-2.5 border-2 border-black font-bold text-xs bg-gray-50 uppercase"
                        >
                          <option value="SDG 2: Zero Hunger">
                            SDG 2: Zero Hunger
                          </option>
                          <option value="SDG 4: Quality Education">
                            SDG 4: Quality Education
                          </option>
                          <option value="SDG 6: Clean Water">
                            SDG 6: Clean Water
                          </option>
                          <option value="SDG 9: Industry & Innovation">
                            SDG 9: Industry & Innovation
                          </option>
                          <option value="SDG 11: Sustainable Cities">
                            SDG 11: Sustainable Cities
                          </option>
                          <option value="SDG 12: Responsible Consumption">
                            SDG 12: Consumption
                          </option>
                          <option value="SDG 13: Climate Action">
                            SDG 13: Climate Action
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                          Asset URL / Reference Link (optional)
                        </label>
                        <input
                          type="text"
                          value={resLink}
                          onChange={(e) => setResLink(e.target.value)}
                          placeholder="e.g. https://drive.google.com/drive/folders/..."
                          className="w-full p-2.5 border-2 border-black font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                        Brief Description of the material
                      </label>
                      <textarea
                        value={resDesc}
                        onChange={(e) => setResDesc(e.target.value)}
                        placeholder="Detail what is included, materials needed, age group alignment, and how other clubs from Western or Northern region can deploy it."
                        rows={3}
                        className="w-full p-2.5 border-2 border-black font-semibold text-xs resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#141414] hover:bg-sdg-16 text-white font-black text-xs uppercase cursor-pointer"
                      >
                        Publish Asset to Database
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResForm(false)}
                        className="px-6 py-3 border-2 border-black bg-white text-black hover:bg-gray-100 font-black text-xs uppercase cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    {registeredClub && (
                      <p className="text-[10px] font-bold uppercase text-sdg-3 text-left">
                        🎖️ Publishing high school or university resources
                        contributes +20 points to your club prestige score!
                      </p>
                    )}
                  </form>
                </div>
              )}

              {/* Annual Milestone SDG Awards Leaderboard */}
              <div className="bg-[#FFFDF4] border-4 border-yellow-500 p-6 shadow-[5px_5px_0px_0px_rgba(202,138,4,1)] space-y-4">
                <div className="flex items-center gap-3">
                  <Award size={24} className="text-yellow-600 animate-bounce" />
                  <div>
                    <h3 className="text-xl font-black uppercase italic leading-none font-display text-yellow-800">
                      Annual SDG Co-Create Download Awards
                    </h3>
                    <p className="text-[10px] uppercase font-black text-yellow-600 tracking-tight leading-tight mt-1">
                      Clubs with highest resource downloads are awarded
                      prestigious gold medals and custom SDG micro-grants every
                      year!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {allClubs
                    .sort(
                      (a, b) => (b.downloadCount || 0) - (a.downloadCount || 0),
                    )
                    .slice(0, 3)
                    .map((club, idx) => {
                      const medal =
                        idx === 0
                          ? "🥇 Gold Medalist"
                          : idx === 1
                            ? "🥈 Silver Medalist"
                            : "🥉 Bronze Medalist";
                      return (
                        <div
                          key={club.id}
                          className="bg-white border-2 border-yellow-500 p-4 space-y-2 shadow-[2px_2px_0px_0px_rgba(234,179,8,1)] flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[9px] font-black uppercase text-yellow-600 block">
                              {medal}
                            </span>
                            <h4 className="font-extrabold text-[#111] text-xs uppercase leading-normal mt-1">
                              {club.name}
                            </h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                              {club.institution}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-yellow-105 flex justify-between items-center">
                            <span className="text-[8px] font-black uppercase text-gray-400">
                              Total Downloads
                            </span>
                            <span className="text-sm font-black text-yellow-600">
                              {club.downloadCount || 0} hits
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Resource Repository List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase">
                        <span className="p-1 leading-none bg-sdg-16 text-white font-black">
                          {res.type}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sdg-12 font-black">
                          {res.sdgFocus}
                        </span>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-gray-950 leading-snug">
                        {res.title}
                      </h4>
                      <p className="text-xs font-bold text-gray-400 uppercase leading-none">
                        Shared by: {res.clubName}
                      </p>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed pt-1">
                        {res.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center flex-wrap gap-2">
                      <button
                        onClick={() => handleUpvoteResource(res.id)}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1.5 border-2 border-black hover:bg-sdg-3 transition-colors bg-gray-50 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                      >
                        <ThumbsUp size={10} />
                        <span>Upvote template ({res.upvotes})</span>
                      </button>

                      <button
                        onClick={(e) => handleDownloadResource(res, e)}
                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1.5 border-2 border-black transition-colors ${registeredClub?.subscribed ? "bg-sdg-4 hover:bg-green-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer`}
                      >
                        {registeredClub?.subscribed ? (
                          <Link size={10} className="shrink-0" />
                        ) : (
                          <Lock size={10} className="shrink-0" />
                        )}
                        <span>
                          {registeredClub?.subscribed
                            ? "Fetch File / Download"
                            : "🔒 View Only (Subscribe to Download)"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportsView({
  data,
  allClubs = [],
  coursesList = [],
}: {
  data: any;
  allClubs?: any[];
  coursesList?: any[];
}) {
  const [adminSubTab, setAdminSubTab] = useState<
    "insights" | "clubs" | "courses"
  >("insights");

  // Club moderation actions
  const handleUpdateClubStatus = (
    clubId: string,
    newStatus: "approved" | "suspended" | "pending",
  ) => {
    updateDoc(doc(db, "clubs", clubId), {
      status: newStatus,
    })
      .then(() => {
        alert(
          `Club ID ${clubId} status successfully set to ${newStatus.toUpperCase()}!`,
        );
      })
      .catch((err) => {
        alert("Error updating club status: " + err.message);
      });
  };

  const handleDeleteClub = (clubId: string) => {
    if (
      confirm(
        `⚠️ CRITICAL WARNING: Are you absolutely sure you want to delete the SDGs Club Chapter "${clubId}"? This process is completely irreversible!`,
      )
    ) {
      deleteDoc(doc(db, "clubs", clubId))
        .then(() => {
          alert(
            `Club Chapter ${clubId} has been successfully deleted from SDGs Network.`,
          );
        })
        .catch((err) => {
          alert("Error deleting club document: " + err.message);
        });
    }
  };

  // Course management states
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSummary, setCourseSummary] = useState("");
  const [courseColor, setCourseColor] = useState("bg-sdg-4");

  // Content Slides
  const [slide1Subtitle, setSlide1Subtitle] = useState("");
  const [slide1Text, setSlide1Text] = useState("");
  const [slide2Subtitle, setSlide2Subtitle] = useState("");
  const [slide2Text, setSlide2Text] = useState("");
  const [slide3Subtitle, setSlide3Subtitle] = useState("");
  const [slide3Text, setSlide3Text] = useState("");

  // Quiz Questions
  const [q1Text, setQ1Text] = useState("");
  const [q1Opt1, setQ1Opt1] = useState("");
  const [q1Opt2, setQ1Opt2] = useState("");
  const [q1Opt3, setQ1Opt3] = useState("");
  const [q1Opt4, setQ1Opt4] = useState("");
  const [q1Answer, setQ1Answer] = useState("");

  const [q2Text, setQ2Text] = useState("");
  const [q2Opt1, setQ2Opt1] = useState("");
  const [q2Opt2, setQ2Opt2] = useState("");
  const [q2Opt3, setQ2Opt3] = useState("");
  const [q2Opt4, setQ2Opt4] = useState("");
  const [q2Answer, setQ2Answer] = useState("");

  const [q3Text, setQ3Text] = useState("");
  const [q3Opt1, setQ3Opt1] = useState("");
  const [q3Opt2, setQ3Opt2] = useState("");
  const [q3Opt3, setQ3Opt3] = useState("");
  const [q3Opt4, setQ3Opt4] = useState("");
  const [q3Answer, setQ3Answer] = useState("");

  const populateCourseForm = (course: any) => {
    setEditCourseId(course.id);
    setCourseTitle(course.title || "");
    setCourseSummary(course.summary || "");
    setCourseColor(course.color || "bg-sdg-4");

    setSlide1Subtitle(course.content?.[0]?.subtitle || "");
    setSlide1Text(course.content?.[0]?.text || "");
    setSlide2Subtitle(course.content?.[1]?.subtitle || "");
    setSlide2Text(course.content?.[1]?.text || "");
    setSlide3Subtitle(course.content?.[2]?.subtitle || "");
    setSlide3Text(course.content?.[2]?.text || "");

    setQ1Text(course.quiz?.[0]?.question || "");
    setQ1Opt1(course.quiz?.[0]?.options?.[0] || "");
    setQ1Opt2(course.quiz?.[0]?.options?.[1] || "");
    setQ1Opt3(course.quiz?.[0]?.options?.[2] || "");
    setQ1Opt4(course.quiz?.[0]?.options?.[3] || "");
    setQ1Answer(course.quiz?.[0]?.answer || "");

    setQ2Text(course.quiz?.[1]?.question || "");
    setQ2Opt1(course.quiz?.[1]?.options?.[0] || "");
    setQ2Opt2(course.quiz?.[1]?.options?.[1] || "");
    setQ2Opt3(course.quiz?.[1]?.options?.[2] || "");
    setQ2Opt4(course.quiz?.[1]?.options?.[3] || "");
    setQ2Answer(course.quiz?.[1]?.answer || "");

    setQ3Text(course.quiz?.[2]?.question || "");
    setQ3Opt1(course.quiz?.[2]?.options?.[0] || "");
    setQ3Opt2(course.quiz?.[2]?.options?.[1] || "");
    setQ3Opt3(course.quiz?.[2]?.options?.[2] || "");
    setQ3Opt4(course.quiz?.[2]?.options?.[3] || "");
    setQ3Answer(course.quiz?.[2]?.answer || "");
  };

  const clearCourseForm = () => {
    setEditCourseId(null);
    setCourseTitle("");
    setCourseSummary("");
    setCourseColor("bg-sdg-4");

    setSlide1Subtitle("");
    setSlide1Text("");
    setSlide2Subtitle("");
    setSlide2Text("");
    setSlide3Subtitle("");
    setSlide3Text("");

    setQ1Text("");
    setQ1Opt1("");
    setQ1Opt2("");
    setQ1Opt3("");
    setQ1Opt4("");
    setQ1Answer("");

    setQ2Text("");
    setQ2Opt1("");
    setQ2Opt2("");
    setQ2Opt3("");
    setQ2Opt4("");
    setQ2Answer("");

    setQ3Text("");
    setQ3Opt1("");
    setQ3Opt2("");
    setQ3Opt3("");
    setQ3Opt4("");
    setQ3Answer("");
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseSummary.trim()) {
      alert("Please enter title and summary coordinates!");
      return;
    }

    let targetId = editCourseId;
    if (targetId === null) {
      const existingIds = coursesList.map((c) => Number(c.id));
      targetId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    }

    const payload = {
      id: targetId,
      title: courseTitle.trim(),
      summary: courseSummary.trim(),
      color: courseColor,
      content: [
        {
          subtitle: slide1Subtitle.trim() || "Overview and Focus",
          text:
            slide1Text.trim() ||
            "Pedagogical materials pending entry is default.",
        },
        {
          subtitle: slide2Subtitle.trim() || "Uganda Policy Context",
          text:
            slide2Text.trim() ||
            "Local National Development Plan integration highlights.",
        },
        {
          subtitle: slide3Subtitle.trim() || "Action & Reflection",
          text: slide3Text.trim() || "Field prototypes guide details.",
        },
      ],
      quiz: [
        {
          question: q1Text.trim() || "Sample Quiz Challenge?",
          options: [
            q1Opt1.trim() || "Correct Option Choice",
            q1Opt2.trim() || "Alternative Choice B",
            q1Opt3.trim() || "Alternative Choice C",
            q1Opt4.trim() || "Alternative Choice D",
          ],
          answer: q1Answer.trim() || q1Opt1.trim() || "Correct Option Choice",
        },
        {
          question: q2Text.trim() || "Sample Quiz Challenge?",
          options: [
            q2Opt1.trim() || "Correct Option Choice",
            q2Opt2.trim() || "Alternative Choice B",
            q2Opt3.trim() || "Alternative Choice C",
            q2Opt4.trim() || "Alternative Choice D",
          ],
          answer: q2Answer.trim() || q2Opt1.trim() || "Correct Option Choice",
        },
        {
          question: q3Text.trim() || "Sample Quiz Challenge?",
          options: [
            q3Opt1.trim() || "Correct Option Choice",
            q3Opt2.trim() || "Alternative Choice B",
            q3Opt3.trim() || "Alternative Choice C",
            q3Opt4.trim() || "Alternative Choice D",
          ],
          answer: q3Answer.trim() || q3Opt1.trim() || "Correct Option Choice",
        },
      ],
    };

    setDoc(doc(db, "courses", String(targetId)), payload)
      .then(() => {
        alert(`Syllabus Course topic ${targetId} successfully synthesized!`);
        clearCourseForm();
      })
      .catch((err) => {
        alert("Error writing course: " + err.message);
      });
  };

  const handleDeleteCourse = (id: number) => {
    if (
      confirm(
        `Are you absolutely sure you want to delete course ID ${id} from the active curriculum database? This will affect all tracking metrics!`,
      )
    ) {
      deleteDoc(doc(db, "courses", String(id)))
        .then(() => {
          alert("Syllabus Course successfully purged.");
          if (editCourseId === id) {
            clearCourseForm();
          }
        })
        .catch((err) => {
          alert("Deletion failed: " + err.message);
        });
    }
  };

  if (!data)
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCcw className="animate-spin" />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#F6F5F2] md:p-12 overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Admin Section Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic leading-none font-display text-gray-950">
              National SDGs Administrator Console
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className="text-sdg-16" />
              Uganda Youth Coalition Core Verification, Academics & Management
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-3 bg-white border-2 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[8px] font-black uppercase text-gray-400">
                Approved Chapters
              </div>
              <div className="text-xl font-black text-sdg-3">
                {allClubs.filter((c) => c.status === "approved").length}
              </div>
            </div>
            <div className="px-4 py-3 bg-white border-2 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-[8px] font-black uppercase text-gray-400">
                Pending Review
              </div>
              <div className="text-xl font-black text-amber-500">
                {
                  allClubs.filter((c) => c.status === "pending" || !c.status)
                    .length
                }
              </div>
            </div>
          </div>
        </header>

        {/* Console Nav Tabs */}
        <div className="flex flex-wrap border-2 md:border-4 border-black font-display text-xs uppercase bg-white">
          <button
            type="button"
            onClick={() => setAdminSubTab("insights")}
            className={`flex-1 py-4 px-4 font-black text-center border-b-2 md:border-b-0 md:border-r-4 border-black last:border-r-0 transition-all ${
              adminSubTab === "insights"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-black"
            }`}
          >
            📊 Analytics & Intelligence
          </button>
          <button
            type="button"
            onClick={() => setAdminSubTab("clubs")}
            className={`flex-1 py-4 px-4 font-black text-center border-b-2 md:border-b-0 md:border-r-4 border-black last:border-r-0 transition-all ${
              adminSubTab === "clubs"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-black"
            }`}
          >
            🏫 Chapter Verification ({allClubs.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminSubTab("courses")}
            className={`flex-1 py-4 px-4 font-black text-center transition-all ${
              adminSubTab === "courses"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-black"
            }`}
          >
            📖 Academic Syllabus Editor ({coursesList.length})
          </button>
        </div>

        {/* Tab 1: Classic Insights Analytics */}
        {adminSubTab === "insights" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReportCard
                label="Knowledge"
                value={data.averageKAP.knowledge}
                color="text-sdg-3"
                desc="Collective awareness"
              />
              <ReportCard
                label="Attitude"
                value={data.averageKAP.attitude}
                color="text-sdg-4"
                desc="Sustainability mindset"
              />
              <ReportCard
                label="Practices"
                value={data.averageKAP.practices}
                color="text-sdg-9"
                desc="Tangible community actions"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border-4 border-black p-6 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  <PieChart size={16} />
                  Regional IQ Level
                </h3>
                <div className="space-y-4">
                  {data.regionalInsights.map((r: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-black uppercase">
                        <span>{r.region}</span>
                        <span>{r.activity}% Active</span>
                      </div>
                      <div className="h-3 border-2 border-black bg-gray-50 p-0.5">
                        <div
                          className="h-full bg-black"
                          style={{ width: `${r.activity}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {r.mainConcentration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black text-white p-6 space-y-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(227,29,35,1)]">
                <h3 className="text-sm font-black uppercase flex items-center gap-2 text-sdg-7">
                  <TrendingUp size={16} />
                  Trending SDGs in Uganda
                </h3>
                <div className="space-y-4">
                  {data.topPerformingSDGs.map((s: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 transition-all border border-white/10 group cursor-default"
                    >
                      <div className="text-2xl font-black text-sdg-7 font-display">
                        0{i + 1}
                      </div>
                      <div className="font-black text-sm uppercase tracking-tight">
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <Info size={12} />
                  Data sourced from user reasoning assessments
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Club Chapters Verification and Account Controls */}
        {adminSubTab === "clubs" && (
          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 animate-fadeIn">
            <div className="border-b-2 border-black pb-4">
              <h3 className="text-xl font-black uppercase italic leading-none font-display">
                Active National SDGs Registry
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                Accept, suspend, verify or terminate youth chapters safely
              </p>
            </div>

            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-white uppercase font-display text-[10px] tracking-wider border-b border-black">
                  <tr>
                    <th className="p-3">Club Identifier</th>
                    <th className="p-3 col-span-2">Institution & Region</th>
                    <th className="p-3">Email & PIN</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {allClubs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-gray-400 uppercase font-black"
                      >
                        No chapters registered inside firestore database.
                      </td>
                    </tr>
                  ) : (
                    allClubs.map((club) => {
                      const statusColor =
                        club.status === "approved"
                          ? "bg-green-100 text-green-800 border-green-500"
                          : club.status === "suspended"
                            ? "bg-red-100 text-red-800 border-red-500"
                            : "bg-yellow-100 text-yellow-850 border-yellow-500";

                      return (
                        <tr
                          key={club.id}
                          className="hover:bg-gray-50 transition-colors font-sans"
                        >
                          <td className="p-3 font-black">
                            <div className="text-gray-900 leading-tight">
                              {club.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {club.id}
                            </div>
                          </td>
                          <td className="p-3 font-semibold col-span-2">
                            <div>{club.institution}</div>
                            <div className="text-[10px] uppercase font-black text-sdg-16">
                              {club.level} ({club.region})
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 font-medium">
                            <p className="font-semibold">
                              {club.email || "No Email Defined"}
                            </p>
                            <p className="text-[10px] mt-0.5 font-bold font-mono uppercase">
                              PIN: {club.passcode || "1234"}
                            </p>
                          </td>
                          <td className="p-3 text-center font-black text-sm">
                            {club.score} pts
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 border-2 text-[9px] font-black uppercase text-center rounded-none inline-block ${statusColor}`}
                            >
                              {club.status || "pending"}
                            </span>
                          </td>
                          <td className="p-3 text-right space-y-1">
                            <div className="flex justify-end flex-wrap gap-1">
                              {club.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateClubStatus(club.id, "approved")
                                  }
                                  className="px-2 py-1 bg-green-50 text-green-700 border border-green-700 rounded text-[9px] font-black uppercase hover:bg-green-700 hover:text-white transition-all"
                                >
                                  Approve
                                </button>
                              )}
                              {club.status === "approved" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateClubStatus(club.id, "suspended")
                                  }
                                  className="px-2 py-1 bg-red-50 text-red-700 border border-red-700 rounded text-[9px] font-black uppercase hover:bg-red-700 hover:text-white transition-all"
                                >
                                  Suspend
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteClub(club.id)}
                                className="px-2 py-1 bg-[#141414] text-white rounded text-[9px] font-black uppercase hover:bg-red-650 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Academics Syllabus and Course Core Editor */}
        {adminSubTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Left Col: Course List */}
            <div className="lg:col-span-5 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="border-b-2 border-black pb-3">
                <h3 className="text-lg font-black uppercase italic leading-none font-display text-gray-950">
                  Active Academy Syllabus
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                  Choose a Lesson Topic below to pre-populate and edit its
                  configuration
                </p>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {coursesList.map((course) => (
                  <div
                    key={course.id}
                    className="border-2 border-black p-4 bg-[#F8F9FA] flex items-start justify-between gap-3 group relative hover:border-sdg-4 transition-all"
                  >
                    <div
                      className="space-y-1 cursor-pointer flex-1"
                      onClick={() => populateCourseForm(course)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 ${course.color} border border-black inline-block`}
                        ></span>
                        <span className="text-[9px] font-bold font-mono uppercase bg-black text-white px-1 leading-none">
                          ID: {course.id}
                        </span>
                      </div>
                      <h4 className="font-black text-xs leading-snug uppercase text-gray-900 group-hover:text-sdg-4 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-sm">
                        {course.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-[9px] text-red-600 bg-red-50 hover:bg-red-200 border border-red-300 font-bold px-1.5 py-1 rounded"
                    >
                      Purge
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Course Creation Form */}
            <div className="lg:col-span-7 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="border-b-2 border-black pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black uppercase italic leading-none font-display text-gray-950">
                    {editCourseId !== null
                      ? `✍️ Modify Lesson ID: ${editCourseId}`
                      : "📖 Synthesize New Syllabus Lesson"}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                    {editCourseId !== null
                      ? "Edit course slides, settings, and triple-quizzes content"
                      : "Add custom weekly targets and interactive student testing tools"}
                  </p>
                </div>
                {editCourseId !== null && (
                  <button
                    type="button"
                    onClick={clearCourseForm}
                    className="px-2 py-1 bg-gray-150 border border-black font-black uppercase text-[8px] tracking-tight hover:bg-gray-250 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Clear / New Lesson
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-6">
                {/* Topic Metadata & Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase border-b border-black text-gray-500 pb-1 font-display">
                    Section A: Core Metadata
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">
                        Lesson Topic Title
                      </label>
                      <input
                        type="text"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="e.g. Week 11: Waste Management & Recycling"
                        className="w-full p-2.5 border-2 border-black rounded-none outline-none font-bold text-xs bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">
                        Syllabus Color Indicator
                      </label>
                      <select
                        value={courseColor}
                        onChange={(e) => setCourseColor(e.target.value)}
                        className="w-full p-2.5 border-2 border-black rounded-none outline-none font-black text-xs bg-gray-50 uppercase"
                      >
                        <option value="bg-sdg-3">SDG 3 Health Green</option>
                        <option value="bg-sdg-4">
                          SDG 4 Quality Education Red
                        </option>
                        <option value="bg-sdg-5">
                          SDG 5 Gender Equality Peach
                        </option>
                        <option value="bg-sdg-6">SDG 6 Water Cyan</option>
                        <option value="bg-sdg-7">
                          SDG 7 Resilient Biofuels Yellow
                        </option>
                        <option value="bg-sdg-9">SDG 9 Industry Orange</option>
                        <option value="bg-sdg-13">
                          SDG 13 Climate Deep Green
                        </option>
                        <option value="bg-sdg-16">
                          SDG 16 Peace Dark Blue
                        </option>
                        <option value="bg-black">Admin Onyx Black</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">
                      Core Short Summary (Syllabus Card View)
                    </label>
                    <textarea
                      value={courseSummary}
                      onChange={(e) => setCourseSummary(e.target.value)}
                      placeholder="e.g. Gain hand-on tools to deploy school compost piles, capture local biogases and process reusable energy."
                      rows={2}
                      className="w-full p-2.5 border-2 border-black rounded-none outline-none font-bold text-xs bg-gray-50 focus:bg-white leading-relaxed"
                      required
                    />
                  </div>
                </div>

                {/* Section B: Content Slides */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase border-b border-black text-gray-500 pb-1 font-display">
                    Section B: Academy Educational Slide-Deck (3 Slides)
                  </h4>

                  {/* Slide 1 */}
                  <div className="p-3 border border-black bg-gray-50 space-y-2">
                    <span className="text-[8px] font-bold font-mono tracking-tight text-white bg-black px-1 uppercase">
                      Slide 01: Lesson Foundation Overview
                    </span>
                    <input
                      type="text"
                      value={slide1Subtitle}
                      onChange={(e) => setSlide1Subtitle(e.target.value)}
                      placeholder="Slide Subtitle (e.g. Uganda Policy Framework)"
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-bold text-[11px] bg-white"
                    />
                    <textarea
                      value={slide1Text}
                      onChange={(e) => setSlide1Text(e.target.value)}
                      placeholder="Active educational theory reading text..."
                      rows={2}
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-medium text-[11px] bg-white leading-relaxed"
                    />
                  </div>

                  {/* Slide 2 */}
                  <div className="p-3 border border-black bg-gray-50 space-y-2">
                    <span className="text-[8px] font-bold font-mono tracking-tight text-white bg-black px-1 uppercase">
                      Slide 02: Systems-Thinking Problem Connections
                    </span>
                    <input
                      type="text"
                      value={slide2Subtitle}
                      onChange={(e) => setSlide2Subtitle(e.target.value)}
                      placeholder="Slide Subtitle (e.g. Interconnected Ecosystem Health)"
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-bold text-[11px] bg-white"
                    />
                    <textarea
                      value={slide2Text}
                      onChange={(e) => setSlide2Text(e.target.value)}
                      placeholder="Interconnected systems analysis theory..."
                      rows={2}
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-medium text-[11px] bg-white leading-relaxed"
                    />
                  </div>

                  {/* Slide 3 */}
                  <div className="p-3 border border-black bg-gray-50 space-y-2">
                    <span className="text-[8px] font-bold font-mono tracking-tight text-white bg-black px-1 uppercase">
                      Slide 03: Field Practice Action & Prototypes
                    </span>
                    <input
                      type="text"
                      value={slide3Subtitle}
                      onChange={(e) => setSlide3Subtitle(e.target.value)}
                      placeholder="Slide Subtitle (e.g. Building low-smoke briquettes)"
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-bold text-[11px] bg-white"
                    />
                    <textarea
                      value={slide3Text}
                      onChange={(e) => setSlide3Text(e.target.value)}
                      placeholder="Describe hands-on step by step prototypes..."
                      rows={2}
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-medium text-[11px] bg-white leading-relaxed"
                    />
                  </div>
                </div>

                {/* Section C: Multiple-Choice Quiz questions */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase border-b border-black text-gray-500 pb-1 font-display">
                    Section C: Multiple-Choice Pedagogy Check (3 Questions)
                  </h4>

                  {/* Q1 */}
                  <div className="p-3 border border-black bg-amber-50/50 space-y-2">
                    <span className="text-[8px] font-bold font-mono tracking-tight bg-amber-200 text-amber-900 px-1 uppercase">
                      Syllabus Challenge Question 01
                    </span>
                    <input
                      type="text"
                      value={q1Text}
                      onChange={(e) => setQ1Text(e.target.value)}
                      placeholder="Enter Question Text (e.g. Which SDG maps directly to...)"
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-bold text-[11px] bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={q1Opt1}
                        onChange={(e) => setQ1Opt1(e.target.value)}
                        placeholder="Option 1 (Correct Answer)"
                        className="p-2 border border-black text-[10px] font-bold"
                      />
                      <input
                        type="text"
                        value={q1Opt2}
                        onChange={(e) => setQ1Opt2(e.target.value)}
                        placeholder="Option 2"
                        className="p-2 border border-black text-[10px]"
                      />
                      <input
                        type="text"
                        value={q1Opt3}
                        onChange={(e) => setQ1Opt3(e.target.value)}
                        placeholder="Option 3"
                        className="p-2 border border-black text-[10px]"
                      />
                      <input
                        type="text"
                        value={q1Opt4}
                        onChange={(e) => setQ1Opt4(e.target.value)}
                        placeholder="Option 4"
                        className="p-2 border border-black text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase mr-2 text-gray-500 mb-1">
                        Set Exact Correct Option Text Choice
                      </label>
                      <input
                        type="text"
                        value={q1Answer}
                        onChange={(e) => setQ1Answer(e.target.value)}
                        placeholder="Must match one of options exactly"
                        className="w-full p-2 border border-green-400 rounded-none text-[10px] font-black"
                      />
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="p-3 border border-black bg-amber-50/50 space-y-2">
                    <span className="text-[8px] font-bold font-mono tracking-tight bg-amber-200 text-amber-900 px-1 uppercase">
                      Syllabus Challenge Question 02
                    </span>
                    <input
                      type="text"
                      value={q2Text}
                      onChange={(e) => setQ2Text(e.target.value)}
                      placeholder="Enter Question Text"
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-bold text-[11px] bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={q2Opt1}
                        onChange={(e) => setQ2Opt1(e.target.value)}
                        placeholder="Option 1 (Correct Answer)"
                        className="p-2 border border-black text-[10px] font-bold"
                      />
                      <input
                        type="text"
                        value={q2Opt2}
                        onChange={(e) => setQ2Opt2(e.target.value)}
                        placeholder="Option 2"
                        className="p-2 border border-black text-[10px]"
                      />
                      <input
                        type="text"
                        value={q2Opt3}
                        onChange={(e) => setQ2Opt3(e.target.value)}
                        placeholder="Option 3"
                        className="p-2 border border-black text-[10px]"
                      />
                      <input
                        type="text"
                        value={q2Opt4}
                        onChange={(e) => setQ2Opt4(e.target.value)}
                        placeholder="Option 4"
                        className="p-2 border border-black text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase mr-2 text-gray-500 mb-1">
                        Set Exact Correct Option Text Choice
                      </label>
                      <input
                        type="text"
                        value={q2Answer}
                        onChange={(e) => setQ2Answer(e.target.value)}
                        placeholder="Must match one of options exactly"
                        className="w-full p-2 border border-green-400 rounded-none text-[10px] font-black"
                      />
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="p-3 border border-black bg-amber-50/50 space-y-2">
                    <span className="text-[8px] font-bold font-mono tracking-tight bg-amber-200 text-amber-900 px-1 uppercase">
                      Syllabus Challenge Question 03
                    </span>
                    <input
                      type="text"
                      value={q3Text}
                      onChange={(e) => setQ3Text(e.target.value)}
                      placeholder="Enter Question Text"
                      className="w-full p-2 border-2 border-black rounded-none outline-none font-bold text-[11px] bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={q3Opt1}
                        onChange={(e) => setQ3Opt1(e.target.value)}
                        placeholder="Option 1 (Correct Answer)"
                        className="p-2 border border-black text-[10px] font-bold"
                      />
                      <input
                        type="text"
                        value={q3Opt2}
                        onChange={(e) => setQ3Opt2(e.target.value)}
                        placeholder="Option 2"
                        className="p-2 border border-black text-[10px]"
                      />
                      <input
                        type="text"
                        value={q3Opt3}
                        onChange={(e) => setQ3Opt3(e.target.value)}
                        placeholder="Option 3"
                        className="p-2 border border-black text-[10px]"
                      />
                      <input
                        type="text"
                        value={q3Opt4}
                        onChange={(e) => setQ3Opt4(e.target.value)}
                        placeholder="Option 4"
                        className="p-2 border border-black text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase mr-2 text-gray-500 mb-1">
                        Set Exact Correct Option Text Choice
                      </label>
                      <input
                        type="text"
                        value={q3Answer}
                        onChange={(e) => setQ3Answer(e.target.value)}
                        placeholder="Must match one of options exactly"
                        className="w-full p-2 border border-green-400 rounded-none text-[10px] font-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Course Buttons */}
                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white hover:bg-sdg-9 font-black uppercase text-xs tracking-wider transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-1 active:translate-y-1 active:shadow-none border-2 border-black"
                >
                  {editCourseId !== null
                    ? `Save and Sync Course ID ${editCourseId}`
                    : "Deploy & Publish New Syllabus Lesson"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  label,
  value,
  color,
  desc,
}: {
  label: string;
  value: number;
  color: string;
  desc: string;
}) {
  return (
    <div className="bg-white border-4 border-black p-6 space-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="text-[8px] font-black uppercase text-gray-400 leading-none">
        {label} Quotient
      </div>
      <div
        className={`text-4xl font-black ${color} tracking-tighter font-display`}
      >
        {value}%
      </div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight pt-2">
        {desc}
      </p>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  detail,
}: {
  label: string;
  value: number;
  color: string;
  detail?: string;
}) {
  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase leading-none">
            {label}
          </span>
          {detail && (
            <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">
              {detail}
            </span>
          )}
        </div>
        <span className="text-lg font-black">{value}%</span>
      </div>
      <div className="h-6 bg-gray-100 border-2 border-black p-0.5 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} border-r-2 border-black`}
        />
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="flex-1 border-r border-black/10 h-full" />
          <div className="flex-1 border-r border-black/10 h-full" />
          <div className="flex-1 border-r border-black/10 h-full" />
          <div className="flex-1 h-full" />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SDG CLUBS CURRICULUM CONSTANTS & MODULES
// ==========================================

export interface WeekPlan {
  num: number;
  title: string;
  theme: string;
  sdg: string;
  badgeBg: string;
  badgeColor: string;
  timing: { m: number; l: string }[];
  objectives: string[];
  lesson: string[];
  game: { name: string; how: string };
  quiz: {
    q: string;
    opts: string[];
    ans: number;
    fb?: string;
    feedback?: string;
  };
  fact: string;
  output: string;
  materials: string[];
  patron_note: string;
}

export const HIGH_SCHOOL_WEEKS: WeekPlan[] = [
  {
    num: 1,
    title: "Introduction to SDGs & Uganda's Story",
    theme: "Orientation & Belonging",
    sdg: "All SDGs · NDPIV Mapped",
    badgeBg: "bg-[#E1F5EE]",
    badgeColor: "text-[#0F6E56]",
    timing: [
      { m: 10, l: "Welcome & Icebreaker" },
      { m: 20, l: "NDPIV Integration" },
      { m: 15, l: "SDG Bingo Action" },
      { m: 10, l: "Instant Quiz Warmup" },
      { m: 5, l: "Pledge Output" },
    ],
    objectives: [
      "Understand the scope of 17 Sustainable Development Goals & global timeline.",
      "Connect Uganda's National Development Plan IV (NDPIV) goals with SDGs.",
      "Identify at least 3 practical SDG problem statements around the school.",
    ],
    lesson: [
      "Open with prompt: 'What does a thriving, self-reliant Uganda look like in 2030?' Note response trends.",
      "Present the 17 SDG wheel. Explain the global target milestone of 2030 adopted by all active UN nations.",
      "Analyze the NDPIV priority pillars: sustainable industrialization, human capital, governance, and green growth.",
      "Evaluate key national metrics: 41% poverty rate (SDG 1), young age profile - 78% under 30, and urban drainage vulnerabilities.",
    ],
    game: {
      name: "Uganda SDG Bingo",
      how: "Match local newspaper headlines (e.g., 'Landslides in Mbale', 'Sorghum Irrigation Project in Kotido') to relevant SDGs. First to complete 4 in a line shouts 'Agenda 2030!' and clarifies rationale.",
    },
    quiz: {
      q: "Uganda's NDPIV targets the standard milestone matching which global SDG deadline year?",
      opts: ["2025", "2030", "2035", "2040"],
      ans: 1,
      feedback:
        "Correct! Both NDPIV and the global SDGs target 2030 to secure critical environmental, energy, and social goals.",
    },
    fact: "Uganda is among only 10 global nations that have submitted over 3 Voluntary National Reviews directly tracking active progress to the United Nations.",
    output:
      "Interactive SDG Pledge Cards listing personal commitments, preferred thematic goals, and local action targets.",
    materials: [
      "Hand-drawn SDG wheel",
      "Uganda headlines printout",
      "Pledge card template",
    ],
    patron_note:
      "Keep the startup energy high. Ensure both boys and girls express opinions freely during the icebreaker.",
  },
  {
    num: 2,
    title: "Mapping SDG Problems in Our Community",
    theme: "Observation & Systems Thinking",
    sdg: "SDG 1 · SDG 11 · SDG 17",
    badgeBg: "bg-[#E6F1FB]",
    badgeColor: "text-[#185FA5]",
    timing: [
      { m: 10, l: "Recap & Warmup" },
      { m: 15, l: "Systems Thinking" },
      { m: 20, l: "Field Scavenger Hunt" },
      { m: 10, l: "Data Evaluation" },
      { m: 5, l: "Session Wrap-up" },
    ],
    objectives: [
      "Practice scanning everyday surroundings with selective 'SDG lenses'.",
      "Explain the spiderweb principle: how environmental degradation triggers health problems.",
      "Synthesize structured observations into clean local data reports.",
    ],
    lesson: [
      "Define systems thinking: how one problem (e.g. sanitation bottleneck) spills over into five other targets.",
      "Uganda Case Study: The boda-boda ecosystem. It secures direct employment (SDG 8) but triggers traffic emissions (SDG 13).",
    ],
    game: {
      name: "SDG Eyes Scavenger Hunt",
      how: "Pairs explore the compound with notebooks. Identify 5 clear SDG-related elements (e.g. leaking water fittings for SDG 6, composite waste piles for SDG 11) and sketch potential remediation.",
    },
    quiz: {
      q: "A girl in Gulu drops out of school due to lack of menstrual hygiene supplies. Which SDG targets are impacted?",
      opts: [
        "SDG 1 Only",
        "SDG 4 Only",
        "SDG 5 Only",
        "Interconnected SDG 4 & SDG 5",
      ],
      ans: 3,
      feedback:
        "Absolutely! Period poverty cuts across educational access (SDG 4) and gender parity (SDG 5) simultaneously.",
    },
    fact: "Young girls across Uganda lose about 4 to 5 study days every single month, resulting in a full term of study lost over regular academic cycles.",
    output:
      "Observation reports detailing spotted school/communal vulnerabilities and target stakeholders.",
    materials: ["Local field notebooks", "Colored pencils"],
    patron_note:
      "Coordinate compound access prior to lesson start. Encourage dynamic groups pairing different genders.",
  },
  {
    num: 3,
    title: "Gender Equality — Uganda's Unfinished Story",
    theme: "Gender Equality",
    sdg: "SDG 5 · SDG 4 · SDG 10",
    badgeBg: "bg-[#FBEAF0]",
    badgeColor: "text-[#993556]",
    timing: [
      { m: 10, l: "Intro Quiz" },
      { m: 20, l: "Gender Statistics" },
      { m: 15, l: "Simulation Game" },
      { m: 10, l: "Class Debate" },
      { m: 5, l: "Closing Reflection" },
    ],
    objectives: [
      "Deconstruct gender roles and structural inequalities in Ugandan society.",
      "Understand critical rates concerning girls' primary level completion and early marriages.",
      "Promote constructive empathy through active roleplaying simulations.",
    ],
    lesson: [
      "Compare national indicators: Girls' primary exit rate sits near 55% relative to 62% for young boys.",
      "Analyze policy achievements: Uganda's National Gender Policy and active Equal Opportunities commissions.",
      "Evaluate standard gender norms (e.g. division of domestic chores) and explore modern leadership successes.",
    ],
    game: {
      name: "A Day in Her Life",
      how: "Draw profile cards of rural and urban girls faced with resource constraints. Map out daily schedules to find structural timing gaps for homework.",
    },
    quiz: {
      q: "According to the Uganda Demographic & Health Survey, what percentage of women have experienced gender challenges?",
      opts: ["12%", "29%", "56%", "74%"],
      ans: 2,
      feedback:
        "Correct, 56% require policy and community responses. SDG 5 calls for total eradication of all bias & structural barriers by 2030.",
    },
    fact: "Uganda holds one of the highest numbers of active female MPs in East Africa, yet rural land ownership by females stays below 7%.",
    output:
      "Class statement outlining peer-support methodologies to keep young girls in school.",
    materials: ["Gender profile cards", "DHS statistical data guides"],
    patron_note:
      "Create a safe, supportive, non-critical room atmosphere. Avoid forcing students to discuss personal trauma.",
  },
  {
    num: 4,
    title: "Gender Equality — Boys, Men & Change",
    theme: "Gender Equality in Action",
    sdg: "SDG 5 · SDG 16",
    badgeBg: "bg-[#FBEAF0]",
    badgeColor: "text-[#993556]",
    timing: [
      { m: 10, l: "Interactive Quiz" },
      { m: 15, l: "Boys & Positive Allyship" },
      { m: 20, l: "Project Workgroups" },
      { m: 10, l: "Poster Pitches" },
      { m: 5, l: "Feedback Session" },
    ],
    objectives: [
      "Analyze how gender paradigms impact boys and mental wellbeing metrics.",
      "Establish patterns for active male allyship in high school corridors.",
      "Produce actionable informational materials advocating peer respect.",
    ],
    lesson: [
      "Address toxic standards that discourage boys from seeking health/mental advice or expressing emotion.",
      "Introduce the 'HeForShe' coalition framework: mobilize men to support girls in STEM studies.",
      "Envision collaborative water and sanitation management to decrease girls' chore fatigue.",
    ],
    game: {
      name: "Norm Busters",
      how: "Stand on 'TRUE' or 'FALSE' sides of the room responding to statements like 'A good leader must belong to a specific gender'. Discuss reasons.",
    },
    quiz: {
      q: "What share of registered agricultural land titles in Uganda are currently owned by women?",
      opts: ["Less than 7%", "Around 20%", "Roughly 35%", "Close to 50%"],
      ans: 0,
      feedback:
        "Correct. Despite doing over 75% of active farm labor, women hold less than 7% of land deeds. This hampers microfinance access.",
    },
    fact: "Women output over 80% of domestic food crops in Uganda, proving they are central to securing SDG 2 (Zero Hunger).",
    output:
      "Handdrawn 'Allyship Guides' tailored for high school noticeboards.",
    materials: ["Flip charts", "Felt markers"],
    patron_note:
      "Great opportunity to invite a cooperative male guest teacher to share stories on balancing domestic work.",
  },
  {
    num: 5,
    title: "Climate Action — Uganda's Warming World",
    theme: "Climate Science & Impact",
    sdg: "SDG 13 · SDG 15 · SDG 2",
    badgeBg: "bg-[#EAF3DE]",
    badgeColor: "text-[#3B6D11]",
    timing: [
      { m: 10, l: "Warmup Quiz" },
      { m: 20, l: "Ugandan Vulnerability Map" },
      { m: 15, l: "Climate Court Roleplay" },
      { m: 10, l: "Carbon Calculation" },
      { m: 5, l: "Action Review" },
    ],
    objectives: [
      "Explain the greenhouse effect and general carbon concepts simply.",
      "Pinpoint local eco-hazards: landslides in Mbale, melting Rwenzori glaciers.",
      "List the elements needed for community-level resilience planning.",
    ],
    lesson: [
      "Dissect the greenhouse effect. Explain why Uganda produces less than 0.1% of global emissions yet suffers rapid droughts.",
      "Map out climate hot spots: Mt. Elgon landslides, Kasese River floods, and severe water deficits in Karamoja.",
    ],
    game: {
      name: "Climate Dispute Court",
      how: "Roleplay representing environmental prosecution or economic expansion. Find compromise terms allowing growth while protecting ecosystems.",
    },
    quiz: {
      q: "Uganda accounts for approximately what share of global carbon greenhouse gas emissions?",
      opts: ["About 5%", "Around 2%", "Less than 0.1%", "Exactly 1.5%"],
      ans: 2,
      feedback:
        "Indeed! Uganda produces less than 0.1% but experiences drastic climatic variations. This highlights climate justice issues.",
    },
    fact: "Rwenzori glaciers have shrunk by over 50% since the early 1900s. Experts estimate complete depletion near 2030, hurting west Uganda tourism.",
    output: "Basic carbon-footprint estimations compiled in groups.",
    materials: ["Uganda ecological map", "Carbon calculator templates"],
    patron_note:
      "Remain neutral during resource debates like oil in Albertine Rift. Prompt students to seek multi-win answers.",
  },
  {
    num: 6,
    title: "Climate Action — Ecosystem Solutions",
    theme: "Ecological Action & Green Careers",
    sdg: "SDG 13 · SDG 7 · SDG 11",
    badgeBg: "bg-[#EAF3DE]",
    badgeColor: "text-[#3B6D11]",
    timing: [
      { m: 10, l: "Warmup" },
      { m: 20, l: "Ugandan Green Solutions" },
      { m: 20, l: "Compound Green Audit" },
      { m: 10, l: "Scoring & Recommendations" },
    ],
    objectives: [
      "Highlight nature-based solutions: bamboo planting and bio-gas digestives.",
      "Execute a localized energy and waste audit on high school facilities.",
      "Explore high-growth green entrepreneurship job fields.",
    ],
    lesson: [
      "Examine successful local solutions: 600,000+ home solar kits, bio-gas digesters in Wakiso boarding schools, kaveera plastic bag bans.",
      "Detail green job paths: solar design, waste-to-commodity recycling, and organic permaculture.",
    ],
    game: {
      name: "The Green Audit Walk",
      how: "Four student units track different areas of school resources: Energy grid, Water management, Waste sort, and Green zones. Compile score out of 20.",
    },
    quiz: {
      q: "Uganda issued its pioneering policy ban on plastic carrier bags in which milestone year?",
      opts: ["2002", "2007", "2012", "2018"],
      ans: 1,
      feedback:
        "Yes! 2007 saw Uganda introduce early plastic carrier bag regulations, paving the way for ecological models in Africa.",
    },
    fact: "Uganda experiences 320+ clear sunny days per year. Scaling solar across all high school roofs could save significant energy funds.",
    output:
      "Completed School Ecological Assessment Reports with 3 local proposals.",
    materials: ["Audit checklists", "Compound clipboards"],
    patron_note:
      "Instruct kids to respect ongoing quiet classes during compound resource check audits.",
  },
  {
    num: 7,
    title: "Health & Wellbeing — The National Picture",
    theme: "Public Health & WASH",
    sdg: "SDG 3 · SDG 6 · SDG 2",
    badgeBg: "bg-[#FAECE7]",
    badgeColor: "text-[#993C1D]",
    timing: [
      { m: 10, l: "Quiz start" },
      { m: 20, l: "Ugandan Healthcare Structure" },
      { m: 15, l: "Mythbusters Quiz Show" },
      { m: 10, l: "Group Poster Crafting" },
      { m: 5, l: "Closing" },
    ],
    objectives: [
      "Describe key health issues: malaria, waterborne pathogens, and teen wellness.",
      "Understand how sanitation and water access (SDG 6) shape local health.",
      "Recognize the critical community support role of Village Health Teams (VHTs).",
    ],
    lesson: [
      "Outline public health statistics: malaria rate, sanitation structures, and maternal mortality indicators.",
      "Illustrate the healthcare referral network ranging from HC IIs to national referral centers.",
    ],
    game: {
      name: "Health Mythbusters",
      how: "Teams compete in verifying statements (e.g. 'Safe mosquito net usage reduces malaria rates by 90%') and analyzing local rumors.",
    },
    quiz: {
      q: "According to national statistics, approximately what percentage of Ugandans have safely managed sanitation access?",
      opts: ["70%", "50%", "35%", "19%"],
      ans: 3,
      feedback:
        "Sobering but true: only 19% hold safely managed sewage/toilet facilities, indicating the urgency of sanitation reforms.",
    },
    fact: "Over 170,000 Village Health Team (VHT) peer counselors constitute the backbone of rural disease prevention. They are local SDG champions.",
    output:
      "Informative hygiene posters highlighting water security or malaria mitigation.",
    materials: ["Colored charts", "Healthcare guidelines booklets"],
    patron_note:
      "Pre-invite a local health representative or nurse to assist. They enjoy sharing direct testimonies with students.",
  },
  {
    num: 8,
    title: "Health & Wellbeing — Mental Serenity",
    theme: "Mental Health Advocacy",
    sdg: "SDG 3 · SDG 4 · SDG 10",
    badgeBg: "bg-[#FAECE7]",
    badgeColor: "text-[#993C1D]",
    timing: [
      { m: 10, l: "Warmup" },
      { m: 20, l: "Mental Peace Lessons" },
      { m: 15, l: "Mindfulness Mapping" },
      { m: 10, l: "Discussion Circles" },
      { m: 5, l: "Resource Guides" },
    ],
    objectives: [
      "Deconstruct mental health stigma in family and academic environments.",
      "Recognize distress symptoms: isolation, burnout, and extreme stress.",
      "Locate supportive hotlines and professional counselor networks in Uganda.",
    ],
    lesson: [
      "Share data: over 14 million Ugandans have experienced stress crises. Break down myths of spellcasting/witchcraft.",
      "Discuss stressors: UNEB exam schedules, family financial worries, and peers pressure trends.",
    ],
    game: {
      name: "The Balance Wheel",
      how: "Students draw an 8-segment life wheel (school, family, rest, physical health) and rate state levels out of 10 to discuss imbalances.",
    },
    quiz: {
      q: "Which free-call mental helpline is operated by the public experts at Butabika National Hospital?",
      opts: ["0800 100 100", "0800 212 121", "0800 333 999", "0800 555 555"],
      ans: 1,
      feedback:
        "Indeed! Save 0800 212 121. It is a free line supporting students in crisis across all cellular networks.",
    },
    fact: "Butabika's counselor call center reported a large increase in youth calls during historical lockdowns, showing high demand for mental support.",
    output: "Personal stress management and balance schedules.",
    materials: ["Symmetrical wheel printouts", "Helpline bookmarks"],
    patron_note:
      "A sensitive, highly important session. Maintain absolute confidentiality. Point critical cases to designated school counselors.",
  },
  {
    num: 9,
    title: "Peace Promotion — Navigating Conflict",
    theme: "Conflict Mitigation & Integration",
    sdg: "SDG 16 · SDG 10 · SDG 1",
    badgeBg: "bg-[#EEEDFE]",
    badgeColor: "text-[#534AB7]",
    timing: [
      { m: 10, l: "Warmup Quiz" },
      { m: 20, l: "Uganda Peace History" },
      { m: 15, l: "Peace negotiators game" },
      { m: 10, l: "Drafting school charter" },
      { m: 5, l: "Closing" },
    ],
    objectives: [
      "Distinguish between constructive conflict (growth) and violence (harm).",
      "Trace Gulu recoveries and analyze refugee-integration open-door strategies.",
      "Build proactive negotiation, phrasing, and reconciliation frameworks.",
    ],
    lesson: [
      "Examine peace stories: northern recovery post-conflict, disarmament successes in Karamoja.",
      "Review why Uganda integrates 1.5 million refugees - global open-door refugee champion case study.",
    ],
    game: {
      name: "High School Negotiators",
      how: "Roleplay resolving peer disputes: claiming the last textbook, library seats, or rumor control. Practice non-violent mediation phrases.",
    },
    quiz: {
      q: "Uganda currently hosts what estimated number of refugees, securing its place as an integration model?",
      opts: ["300,000", "750,000", "1.5 Million", "3 Million"],
      ans: 2,
      feedback:
        "Over 1.5 million! Uganda runs an open-door policy where refugees can live, farm, and trade freely, proving SDG 16 values.",
    },
    fact: "Uganda's historical Mato Oput reconciliation rituals promote shared drinking of bitter roots to settle grievances and restore harmony.",
    output: "Collaboratively signed 'School Peace Charters'.",
    materials: ["Cardboards", "Reconciliation roleplay cards"],
    patron_note:
      "Refugee students are present in many Ugandan schools. Celebrate their presence as community assets.",
  },
  {
    num: 10,
    title: "Term Showcase & Synthesis",
    theme: "Review & Celebration",
    sdg: "All 17 SDGs · Year Prep",
    badgeBg: "bg-[#FAEEDA]",
    badgeColor: "text-[#BA7517]",
    timing: [
      { m: 15, l: "Grand Quiz Tourney" },
      { m: 15, l: "Solution Brainstorms" },
      { m: 15, l: "Certificates & Awards" },
      { m: 15, l: "Term 2 Action Roadmap" },
    ],
    objectives: [
      "Consolidate core facts from all Term 1 lessons.",
      "Begin shortlisting communal problem areas for Term 2 solution design.",
      "Celebrate club efforts with formal validation certificates.",
    ],
    lesson: [
      "Summarize Term 1: gender, climate dynamics, water security, and peace frameworks.",
      "Introduce 1 Million SDG Solutions challenge: how to design a sustainable product or service next term.",
    ],
    game: {
      name: "SDG Grand Championship",
      how: "A fast trivia tournament testing facts, numbers, and case studies from the last 9 weeks. Group winners receive certificates.",
    },
    quiz: {
      q: "Which option does NOT constitute a central structural pillar of Uganda's National Development Plan?",
      opts: [
        "Industrialisation & Trade",
        "Sustainable Urbanisation",
        "Digital Transformation",
        "Rapid Military Expansion",
      ],
      ans: 3,
      feedback:
        "Rapid military expansion is not a primary NDPIV pillar. The plan targets green growth and digital transformation.",
    },
    fact: "The Youth Coalition portal lists active high-school prototypes ranging from low-smoke briquettes to school sanitary innovations.",
    output:
      "Candidate lists containing three nominated community problems for Term 2.",
    materials: ["Completion certificates", "Problem-scoping sheet"],
    patron_note:
      "Invite your headteacher or local executive to sign the peace charter and distribute certificates.",
  },
  {
    num: 11,
    title: "Entrepreneurship & Innovation in Uganda",
    theme: "Phase 1: Skills — Entrepreneurship & Innovation",
    sdg: "SDG 8 · SDG 9 · SDG 1",
    badgeBg: "bg-[#E1F5EE]",
    badgeColor: "text-[#0F6E56]",
    timing: [
      { m: 10, l: "Quiz Warmup" },
      { m: 20, l: "Core Lesson" },
      { m: 20, l: "Dragon's Den Game" },
      { m: 8, l: "Debrief" },
      { m: 2, l: "Wrap-up" },
    ],
    objectives: [
      "Understand what social entrepreneurship is and why it matters for Uganda.",
      "Distinguish between a standard business idea and an active SDG solution.",
      "Identify Uganda's youth entrepreneurship support structures and hubs.",
    ],
    lesson: [
      "Open with prompt: 'If you had UGX 500,000 and one month, what local community problem would you try to solve?' Let students brainstorm freely.",
      "Entrepreneurship vs Social Entrepreneurship: SafeBoda or solar pay-as-you-go solve deep community safety and utility bottlenecks while remaining commercially sustainable.",
      "Uganda's youth demographic: 64% of youth (15-30) face underemployment. Dynamic starting of social enterprises is a proactive self-reliance path.",
    ],
    game: {
      name: "Dragon's Den Uganda",
      how: "Form teams of 3-4. Turn your local problems spotted in Term 1 into rapid Business Model Canvas sketches. Pitch live in exactly 2 minutes!",
    },
    quiz: {
      q: "Approximately what percentage of Uganda's youth (aged 15-30) are unemployed or underemployed?",
      opts: ["About 20%", "Around 40%", "About 64%", "Nearly 85%"],
      ans: 2,
      fb: "Correct! UBOS statistics show that 64% of young people face these underemployment challenges, making entrepreneurship a critical path.",
    },
    fact: "Uganda ranks among the top 3 countries globally for entrepreneurial intent, meaning our citizens possess unmatched ambition to co-create solutions.",
    output:
      "One-page Business Model Canvas Draft mapping local revenue options and target SDGs.",
    materials: ["Pitch templates", "Timer", "Scorecards"],
    patron_note:
      "This is a super high-energy session. Encourage even the shyest students to pitch at least one sentence to the classroom!",
  },
  {
    num: 12,
    title: "The Skills Market & Human Capital",
    theme: "Phase 1: Skills — Human Capital Development",
    sdg: "SDG 4 · SDG 8 · SDG 5",
    badgeBg: "bg-[#E6F1FB]",
    badgeColor: "text-[#185FA5]",
    timing: [
      { m: 10, l: "Quiz Warmup" },
      { m: 15, l: "Human Capital Map" },
      { m: 25, l: "Skills Market Exchange" },
      { m: 8, l: "Reflection" },
      { m: 2, l: "Wrap-up" },
    ],
    objectives: [
      "Understand the concepts of Human Capital and the World Bank Human Capital Index for Uganda.",
      "Inventory your personal and club members' skills as concrete design assets.",
      "Shift perspective from complaints to resourcefulness and local assets.",
    ],
    lesson: [
      "Define Human Capital: The skills, health, and knowledge that individuals accumulate over their lives to realize potential.",
      "Uganda's HCI score of 0.40 means a child born today will reach only 40% of their ultimate productive potential without education/health parity.",
      "Resource Mapping: Stop complaining about what we 'lack'. Instead, count what skills, tools, and local materials we already possess.",
    ],
    game: {
      name: "Uganda Skills Market",
      how: "Write down 3 things your group partners are excellent at (singing, gardening, digits, logic). Swap and trade cards to form balanced project teams!",
    },
    quiz: {
      q: "What is Uganda's score on the World Bank's Human Capital Index?",
      opts: ["0.25", "0.40", "0.65", "0.85"],
      ans: 1,
      fb: "Correct! Uganda's score is 0.40, signifying the immense space for improvement in primary and secondary learning quality safeguards.",
    },
    fact: "Uganda's primary school enrollment rate is over 90% — but the transition rate to secondary studies remains low due to cost structures.",
    output:
      "Group Skills Matrix illustrating team competencies and mapped leadership roles.",
    materials: ["Index cards", "Markers", "Skills checklist"],
    patron_note:
      "Remind students that practical abilities like local farming methods, crafts, or languages are highly valuable human capital.",
  },
  {
    num: 13,
    title: "Community Research Methods & Ethics",
    theme: "Phase 2: Fieldwork — Research Methods",
    sdg: "SDG 11 · SDG 16",
    badgeBg: "bg-[#EEEDFE]",
    badgeColor: "text-[#534AB7]",
    timing: [
      { m: 10, l: "Methods Overview" },
      { m: 20, l: "Ethics Tutorial" },
      { m: 20, l: "Mock Interview Roleplay" },
      { m: 10, l: "Safe Fieldwork Brief" },
    ],
    objectives: [
      "Learn standard qualitative and quantitative observation methods.",
      "Draft ethical interview guides respecting local cultural etiquette.",
      "Understand consent, safety protocols, and privacy during fieldwork.",
    ],
    lesson: [
      "Qualitative interviews explore 'why' (e.g. why women walk long distances) while quantitative methods focus on 'how much' (how many liters).",
      "Research Ethics in Africa: Secure verbal consent, respect privacy, avoid leading questions, and outline purpose with absolute clarity.",
      "Uganda Etiquette: Always start interviews with respectful traditional greetings, particularly when engaging local community elders.",
    ],
    game: {
      name: "The Ethical Interview Probe",
      how: "Roleplay: One student plays a busy, suspicious market vendor, the other a scholar. Learn how to secure verbal consent under pressure!",
    },
    quiz: {
      q: "What is the primary rule when interviewing community elders in Uganda?",
      opts: [
        "Ask direct questions immediately",
        "Start with formal respectful greetings, ask permission, and actively listen",
        "Fulfill your survey with yes-or-no ticks only",
        "Compensate them with cash beforehand",
      ],
      ans: 1,
      fb: "Correct! Traditional greetings and setting a respectful, clear framing builds mutual trust and unlocks authentic qualitative context.",
    },
    fact: "Active listening reduces interviewee anxiety by over 50% and yields much richer context in qualitative surveys.",
    output:
      "Finalized field questionnaire and checklist template for direct community visits.",
    materials: ["Sample interview questionnaires", "Clipboard mocks"],
    patron_note:
      "Coordinate outside permission with school leadership and neighborhood scouts prior to launching fieldwork next week.",
  },
  {
    num: 14,
    title: "Field Visit 1 — Compound Observation & Interviews",
    theme: "Phase 2: Fieldwork — [F] Community Immersion",
    sdg: "SDG 11 · SDG 1 · SDG 3",
    badgeBg: "bg-[#FBEAF0]",
    badgeColor: "text-[#993556]",
    timing: [
      { m: 5, l: "Briefing" },
      { m: 40, l: "Interactive Field Walk" },
      { m: 15, l: "Debrief of Initial Findings" },
    ],
    objectives: [
      "Engage in actual field observations and host safe community interviews.",
      "Identify real structural community bottlenecks in water, energy, or waste management.",
      "Work collaboratively as field teams to document qualitative stories.",
    ],
    lesson: [
      "This is our first field visit! The three field sessions (Weeks 14, 15, and 18) are the only sessions outside the school compound.",
      "Keep eyes completely open: evaluate organic waste patterns, local soil erosion, and school border drainage channels.",
      "Interviewing actual citizens (with the patron accompanying) unmasks real user friction points that are invisible in textbooks.",
    ],
    game: {
      name: "Compound Mapping Hunt",
      how: "Safety first! In groups of 3-4, walk the surrounding area, note 3 physical SDG failures, and interview one local citizen respectfully.",
    },
    quiz: {
      q: "What should you do if an interviewee declines to answer a specific question on water usage?",
      opts: [
        "Insist they answer",
        "Respect their choice immediately and move on",
        "Record a random answer",
        "File a complaint to the patron",
      ],
      ans: 1,
      fb: "Correct! Consent is always completely voluntary. Respecting human dignity builds safety and aligns perfectly with SDG 16 values.",
    },
    fact: "Over 70% of public community projects fail because administrators construct solutions without talking directly to the actual end users.",
    output:
      "Raw written interview records and physical maps identifying the worst hotspots.",
    materials: ["Notebooks", "Clipboards", "Pens", "Safety badges"],
    patron_note:
      "The patron MUST accompany students on this first visit. Act as a silent shadow, letting students lead the conversations.",
  },
  {
    num: 15,
    title: "Field Visit 2 — Data Synthesis & The 5 Whys",
    theme: "Phase 2: Fieldwork — [F] Data Synthesis",
    sdg: "SDG 1 · SDG 6 · SDG 15",
    badgeBg: "bg-[#FAECE7]",
    badgeColor: "text-[#993C1D]",
    timing: [
      { m: 10, l: "Warm-up" },
      { m: 25, l: "5 Whys Practice" },
      { m: 20, l: "Poster Synthesis" },
      { m: 5, l: "Session Close" },
    ],
    objectives: [
      "Aggregate raw field notes into clean evidence categories.",
      "Practice the '5 Whys' root cause analysis technique on real Kampala/local problems.",
      "Shift from surface-level complaints to systemic causes.",
    ],
    lesson: [
      "Gather all raw data on the desks: group similar complaints (e.g., 'borehole downtime', 'plastic litter').",
      "Surface problems vs Systemic problems. Deforestation is a symptom; using firewood for 80% of household cooking is a systemic root.",
      "How '5 Whys' works: Ask 'Why is the drainage clogged?', trace it to lack of bins, then to budget, then to systemic municipal coordination.",
    ],
    game: {
      name: "The Root-Cause Multiplier",
      how: "Pick one core failure from your Field Visit 1. Ask 'Why?' 5 times in succession to trace the root systemic cause on a poster.",
    },
    quiz: {
      q: "What is the primary purpose of the '5 Whys' root cause technique?",
      opts: [
        "To repeat the same question endlessly",
        "To trace a surface problem down to its underlying systemic cause",
        "To find who is to blame",
        "To fill up paper files",
      ],
      ans: 1,
      fb: "Correct! Tracing root causes prevents you from designing temporary Band-Aid solutions that fail after a few months.",
    },
    fact: "Uganda's household cooking fuels (wood and charcoal) drive over 60% of our annual national deforestation rate.",
    output:
      "A completed 5 Whys Root Cause poster presenting clean systemic failure paths.",
    materials: ["Kraft papers", "Colored markers", "Tape"],
    patron_note:
      "The second visit can be done in smaller independent groups if trust is established, but keep safety lines open.",
  },
  {
    num: 16,
    title: "Idea Generation & Brainstorming",
    theme: "Phase 3: Build — Design Thinking Basics",
    sdg: "SDG 9 · SDG 12 · SDG 17",
    badgeBg: "bg-[#FAEEDA]",
    badgeColor: "text-[#BA7517]",
    timing: [
      { m: 10, l: "Creative Warmup" },
      { m: 20, l: "Brainstorm Rules" },
      { m: 20, l: "Crazy Eights Sketching" },
      { m: 10, l: "Idea Prioritization" },
    ],
    objectives: [
      "Apply gold design thinking ideation guidelines.",
      "Generate at least 8 solution variations under rapid time constraints.",
      "Select a winning team model based on feasibility, cost, and SDG impact.",
    ],
    lesson: [
      "Welcome to Phase 3: Build! Our focus is moving from research to active physical modeling.",
      "Ideation Rules: Defer judgment, encourage wild ideas, build on others' thoughts, and keep absolute focus on the central problem.",
      "Introduce Constraint-Based Design: What if the solution had to be completely made of bamboo? What if it could cost zero shillings?",
    ],
    game: {
      name: "Crazy Eights Challenge",
      how: "Fold a blank sheet of paper into 8 sections. You have exactly 8 minutes to draw 8 completely different designs to solve your problem!",
    },
    quiz: {
      q: "Which is a golden rule of creative brainstorming during the ideation phase?",
      opts: [
        "Criticize impractical designs immediately",
        "Defer judgment and build on other teammate suggestions",
        "Limit ideas to only typical formats",
        "Establish the final budget first",
      ],
      ans: 1,
      fb: "Correct! Deferring judgment ensures team members feel completely safe proposing wild, disruptive, and revolutionary concepts!",
    },
    fact: "Ugandan youth-led hub innovators generated over 40 distinct low-cost sanitization designs during recent public health challenges.",
    output:
      "Crazy Eights Sketches showing 8 innovative solutions to the club's target problem.",
    materials: ["A4 blank papers", "Timers", "Pencils"],
    patron_note:
      "Give positive praise to the wildest ideas. This encourages outlier thinkers who often hold keys to breakthrough designs.",
  },
  {
    num: 17,
    title: "The 30-Minute Build Challenge",
    theme: "Phase 3: Build — Rapid Prototyping",
    sdg: "SDG 12 · SDG 9",
    badgeBg: "bg-[#E1F5EE]",
    badgeColor: "text-[#0F6E56]",
    timing: [
      { m: 5, l: "Constraint Brief" },
      { m: 30, l: "Sprint Build Challenge" },
      { m: 15, l: "Testing Gallery Walk" },
      { m: 10, l: "Debrief" },
    ],
    objectives: [
      "Learn the mindset of 'thinking with your hands' by rapid prototyping.",
      "Utilize recycled and found scrap materials to build low-budget models.",
      "Receive rapid feed-forward advice from peer testing.",
    ],
    lesson: [
      "Why build rapid prototypes? To fail fast and learn cheap! A drawing on a paper doesn't test physical realities.",
      "This week's challenge is deliberately designed with found and recycled materials so it is accessible in any school regardless of budget.",
      "Think circular: agricultural waste, plastic bottle tops, cardboard shipping boxes, leaves, and scrap strings are gold mines.",
    ],
    game: {
      name: "30-Min Scrap Challenge",
      how: "Gather scrap materials. In exactly 30 minutes, construct a physical 3D replica of your solution. No fancy tools allowed!",
    },
    quiz: {
      q: "What is the primary value of low-fidelity rapid prototyping?",
      opts: [
        "To sell to consumers",
        "To test design assumptions quickly and cheaply using recycled parts",
        "To draft patent filings",
        "To display in showcase exhibits",
      ],
      ans: 1,
      fb: "Correct! Mocking designs with garbage/found parts uncovers physical and structural flaws before spending a single Ugandan shilling.",
    },
    fact: "The circular economy is a massive sector in Uganda. Hand-made briquettes from waste coffee/charcoal dust save up to 45% on fuel costs.",
    output:
      "Physical low-fidelity replicas made completely from school and neighborhood scrap material.",
    materials: [
      "Recycled cardboard",
      "Plastic bottles",
      "Sacks",
      "String",
      "Tape",
      "Scissors",
    ],
    patron_note:
      "Emphasize safety with scissors and sharp objects. Ensure every single group cleans up their desk space completely afterwards!",
  },
  {
    num: 18,
    title: "Field Visit 3 — User Testing & Community Feedback",
    theme: "Phase 3: Build — [F] Evaluative Research",
    sdg: "SDG 11 · SDG 17",
    badgeBg: "bg-[#E6F1FB]",
    badgeColor: "text-[#185FA5]",
    timing: [
      { m: 5, l: "Immersion Brief" },
      { m: 40, l: "Community Testing Walk" },
      { m: 15, l: "Debrief of Feedback" },
    ],
    objectives: [
      "Take your physical scrap prototype to actual community members for usability feedback.",
      "Practice absolute humility in design: listen to critiques with open minds.",
      "Map user friction points to execute better version iteration.",
    ],
    lesson: [
      "This is our final community field visit! It's time to put your scrap prototypes in the hands of real people.",
      "Rule of User Testing: Never defend your prototype. If a user struggles to understand or handle it, that is a design flaw, not user error.",
      "Map user comments into four distinct quadrants: What worked, what needs refinement, questions asked, and new ideas.",
    ],
    game: {
      name: "I Like, I Wish, What If",
      how: "Hand your scrap model to a community member. Record their feedback using three clean prompts: 'I like...', 'I wish...', 'What if...'",
    },
    quiz: {
      q: "When a community tester finds your low-budget prototype confusing, how should you respond?",
      opts: [
        "Explain they are using it wrong",
        "Document the point of confusion as a design opportunity and research the root cause",
        "Ignore their feedback as irrelevant",
        "Abandon the project entirely",
      ],
      ans: 1,
      fb: "Correct! Teasing out points of user confusion is the single fastest way to refine your prototype's usability mechanics.",
    },
    fact: "90% of household tech and agricultural items fail in Uganda due to designers assuming they know the user's daily habit patterns.",
    output:
      " Usability feedback grids containing categorized comments from 3 external testers.",
    materials: ["Physical prototypes", "Usability grading sheets", "Pencils"],
    patron_note:
      "Encourage direct questions. This can be run in smaller independent student teams if solid community trust exists.",
  },
  {
    num: 19,
    title: "Refinement & Written Solution Profiles",
    theme: "Phase 3: Build — Design Refinement",
    sdg: "SDG 9 · SDG 1 · SDG 17",
    badgeBg: "bg-[#EEEDFE]",
    badgeColor: "text-[#534AB7]",
    timing: [
      { m: 10, l: "Recap" },
      { m: 20, l: "Refinement Drafting" },
      { m: 25, l: "Solution Sheet Writing" },
      { m: 5, l: "Wrap-up" },
    ],
    objectives: [
      "Analyze user testing feedback to define clear iteration targets.",
      "Translate prototype metrics into a structured written Solution Profile.",
      "Define a logical 'Theory of Change' showing how your idea resolves local poverty.",
    ],
    lesson: [
      "The iterative loop: Build -> Test -> Learn -> Rebuild. No project succeeds without significant pivots.",
      "Prepare your documentation: A written Solution Profile is essential to enter the 1 Million SDG Solutions Portal in Term 3.",
      "How to write impact: Avoid abstract buzzwords. State clearly: Who is the user, what is the output, and what is the exact SDG outcome.",
    ],
    game: {
      name: "The Written Pivot",
      how: "Write a 3-sentence statement clarifying: 1. Original design, 2. Shocking user tester critique, 3. Proposed design pivot solve.",
    },
    quiz: {
      q: "What does 'iteration' mean in the cycle of Design Thinking?",
      opts: [
        "Repeating the exact same failure",
        "Evolving the design incrementally based on actual user test analysis",
        "Writing the final report",
        "Securing intellectual patents",
      ],
      ans: 1,
      fb: "Correct! Iterative loops are the core of resilient engineering, continually sharpening solutions based on real evidence.",
    },
    fact: "Successful startups and social ventures complete an average of four major design pivots before finding a sustainable execution model.",
    output:
      "Written SDG Solution Profile outlining quantitative metrics for the national portal.",
    materials: ["Blank Solution Profile sheets", "Sample formatted models"],
    patron_note:
      "Act as an editor today. Check that objective claims on environmental or cost savings are backed by realistic field observations.",
  },
  {
    num: 20,
    title: "Communication & Pitching Prep",
    theme: "Phase 4: Pitch — Public Speaking & Storytelling",
    sdg: "SDG 1 · SDG 8 · SDG 17",
    badgeBg: "bg-[#FBEAF0]",
    badgeColor: "text-[#993556]",
    timing: [
      { m: 10, l: "Vocal Warmup" },
      { m: 20, l: "Pitch Techniques" },
      { m: 25, l: "Speed Pitching Drill" },
      { m: 5, l: "Wrap-up" },
    ],
    objectives: [
      "Master the fundamentals of public speaking and structured narrative storytelling.",
      "Adopt the standard pitch structure: Hook, Problem, Solution, Feasibility, and CTA.",
      "Build presentation confidence through vocal and physical projection exercises.",
    ],
    lesson: [
      "Welcome to our final Phase 4: Pitch! This is where we learn to communicate our sustainable designs to the wider world.",
      "The Pitch Blueprint: Open with a compelling human 'Hook' (avoid dry percentages first), state the problem, present your model, and ask for action.",
      "Vocal presence: speak from your diaphragm, maintain direct eye contact with judges, and use pauses for dramatic effect.",
    ],
    game: {
      name: "Vocal Projection Drill",
      how: "Stand 10 meters apart across a field. Pitch your community solution headline using pure diaphragm projection. No shouting allowed!",
    },
    quiz: {
      q: "What serves as the most effective starting 'Hook' for a persuasive community pitch?",
      opts: [
        "A list of budget costs",
        "An engaging, personal story illustrating the human impact of the root problem",
        "An exact quotation of policy sub-clauses",
        "Deafening shouting",
      ],
      ans: 1,
      fb: "Correct! Personal stories form a rapid human bond, anchoring stats and costs in genuine empathy.",
    },
    fact: "Pitches centered on a real human story are remembered over 20 times more often than those containing only technical data.",
    output:
      "Drafted group pitch scripts detailing exact presenter lines and physical stage cues.",
    materials: ["Pitch scripting cards", "Stopwatches"],
    patron_note:
      "Presentation anxiety is very real. Establish an atmosphere of high encouragement and positive praise to build raw confidence.",
  },
  {
    num: 21,
    title: "SDG Shark Tank Competition",
    theme: "Phase 4: Pitch — Competitive Advocacy",
    sdg: "SDG 8 · SDG 16 · SDG 17",
    badgeBg: "bg-[#FAECE7]",
    badgeColor: "text-[#993C1D]",
    timing: [
      { m: 5, l: "Judge Briefing" },
      { m: 45, l: "Live Pitches & Jury Q&A" },
      { m: 10, l: "Reflective Celebration" },
    ],
    objectives: [
      "Present your completed scrap prototype before an evaluative selection panel.",
      "Refine rapid response skills answering challenging technical questions.",
      "Celebrate all group creations as valuable community assets.",
    ],
    lesson: [
      "Shark Tank Day! Form your teams, present your scrap models, and state your social enterprise feasibility criteria.",
      "In our Youth Coalition, competitions are for sharing feedback and celebrating resilience, not locking out groups.",
      "Jury Evaluation Metrics: How deep is the community root cause? How resourceful is the scrap construction? How realistic is the revenue?",
    ],
    game: {
      name: "Uganda Shark Tank Contest",
      how: "Pitch live! Groups have exactly 3 minutes to present their physical scrap model before a guest panel of teachers and peer leaders.",
    },
    quiz: {
      q: "What of the following should be the ultimate goal of the SDG Shark Tank event?",
      opts: [
        "To weed out non-winners",
        "To celebrate cross-peer learnings, share feedback, and advocate collective local action",
        "To select only one grand design",
        "To rank student capabilities harshly",
      ],
      ans: 1,
      fb: "Correct! The goal is peer-learning, collective celebration of effort, and strengthening local district team bonds!",
    },
    fact: "Uganda holds one of East Africa's most cooperative startup landscapes, where tech hubs share resources freely to boost survival.",
    output:
      "Evaluator scoresheets and categorized design refinement suggestions from external judges.",
    materials: [
      "Jury comment sheets",
      "Certificates for contestants",
      "Stopwatch",
    ],
    patron_note:
      "Invite your school headteacher, science teacher, or village councilor to act as guest Sharks!",
  },
  {
    num: 22,
    title: "Portfolio Review & Future Time Capsule",
    theme: "Phase 4: Pitch — Reflective Learning",
    sdg: "SDG 1 · SDG 17",
    badgeBg: "bg-[#FAEEDA]",
    badgeColor: "text-[#BA7517]",
    timing: [
      { m: 10, l: "Reflective Warmup" },
      { m: 20, l: "Portfolios Showcase" },
      { m: 25, l: "Time Capsule Writing" },
      { m: 5, l: "Term Close" },
    ],
    objectives: [
      "Review learning milestones across the entire 12-week design cycle.",
      "Draft a reflective Future Time Capsule Letter to your personal self.",
      "Prepare and submit local chapter scoreboard data to the regional registry.",
    ],
    lesson: [
      "Look back at Week 11. Notice how much you've grown from seeing problems as complaints to modeling resourceful physical prototypes.",
      "The power of self-determination. SDGs are not abstract UN paperwork — they are active channels for local livelihood refinement.",
      "Time Capsule Letter: Detail your current dreams, lessons learned, and set concrete sustainable targets for yourself in 5 years (2031).",
    ],
    game: {
      name: "The Time Capsule Seal",
      how: "Write your reflective commitment letter, seal it in a classic paper envelope, and sign across the seam for local safe-keeping.",
    },
    quiz: {
      q: "What is the primary benefit of final self-reflection at the close of an academic term?",
      opts: [
        "To study for final standard examinations",
        "To internalize learning pathways and set sustainable future commitments",
        "To discard classroom materials",
        "To rank individual grades",
      ],
      ans: 1,
      fb: "Correct! Deep self-reflection cements cognitive learning habits, ensuring the lessons survive beyond school gates.",
    },
    fact: "Young scholars who document and seal their career commitments are 400% more likely to pursue civic leadership roles.",
    output:
      "Sealed Future Time Capsule Letters detailing personal commitment milestones.",
    materials: ["Paper sheets", "Envelopes", "Capsule storage box"],
    patron_note:
      "Absolute congratulations on guiding your High School SDG Club through Term 2! Celebrate with a big group photo!",
  },
];

interface HsPlannerProps {
  hsCurrentWeek: number;
  setHsCurrentWeek: (wk: number) => void;
  hsQuizAnswered: boolean;
  setHsQuizAnswered: (ans: boolean) => void;
  hsSelectedQuizOpt: number | null;
  setHsSelectedQuizOpt: (opt: number | null) => void;
}

export function HighSchoolPlannerView({
  hsCurrentWeek,
  setHsCurrentWeek,
  hsQuizAnswered,
  setHsQuizAnswered,
  hsSelectedQuizOpt,
  setHsSelectedQuizOpt,
}: HsPlannerProps) {
  // Tab states for the 3 Terms as in the user mockup picture
  const [activeTermTab, setActiveTermTab] = useState<"t1" | "t2" | "t3">("t1");

  // Multipage navigation inside HighSchoolPlannerView
  const [activeInteractiveWeek, setActiveInteractiveWeek] = useState<
    number | null
  >(null);

  // State to track completed Weeks sequentially (Weeks 1 to 22)
  const [completedWeeks, setCompletedWeeks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("kap10_completed_weeks_list_v4");
      return saved ? JSON.parse(saved) : []; // initially empty; Week 1 is pre-unlocked natively
    } catch {
      return [];
    }
  });

  // Persistent unlocking for Term 2 and Term 3 via codes
  const [isTerm2Unlocked, setIsTerm2Unlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem("kap10_is_t2_unlocked_v4") === "true";
    } catch {
      return false;
    }
  });
  const [isTerm3Unlocked, setIsTerm3Unlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem("kap10_is_t3_unlocked_v4") === "true";
    } catch {
      return false;
    }
  });

  const [term2InputCode, setTerm2InputCode] = useState("");
  const [term2CodeError, setTerm2CodeError] = useState("");
  const [term3InputCode, setTerm3InputCode] = useState("");
  const [term3CodeError, setTerm3CodeError] = useState("");

  // Selected block index within Term 1 (values 0 to 4 corresponding to Card 1 to 5)
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number>(0);

  // Sub-week choice inside the selected block (0 for Week A, 1 for Week B)
  const [subWeekIdx, setSubWeekIdx] = useState<0 | 1>(0);

  // Stepper sub-steps for incremental interactive study
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [gamePlayed, setGamePlayed] = useState(false);
  const [leaguePointsClaimed, setLeaguePointsClaimed] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [classFeedback, setClassFeedback] = useState("");

  // Sound generator helper for instant audio cues using safe standard browser Web Audio API
  const playSoundSynth = (
    freq = 440,
    type: OscillatorType = "sine",
    duration = 0.15,
  ) => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Term 1 mapped week blocks helper
  const term1Blocks = [
    {
      idx: 0,
      title: "Week 1–2: What are the SDGs?",
      theme: "Theme: Orientation",
      sdgs: "All SDGs · NDPIV Mapped",
      weeksRange: [1, 2],
      badgeBg: "bg-[#E1F5EE]",
      badgeColor: "text-[#0F6E56]",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      idx: 1,
      title: "Week 3–4: Gender Equality in Uganda",
      theme: "SDG 5 · SDG 10",
      sdgs: "SDG 5 · SDG 10",
      weeksRange: [3, 4],
      badgeBg: "bg-[#FBEAF0]",
      badgeColor: "text-[#993556]",
      icon: <Heart className="w-5 h-5 text-red-500" />,
    },
    {
      idx: 2,
      title: "Week 5–6: Climate Action Uganda",
      theme: "SDG 13 · SDG 15",
      sdgs: "SDG 13 · SDG 15",
      weeksRange: [5, 6],
      badgeBg: "bg-[#EAF3DE]",
      badgeColor: "text-[#3B6D11]",
      icon: <Sprout className="w-5 h-5 text-green-600" />,
    },
    {
      idx: 3,
      title: "Week 7–8: Health & Wellbeing",
      theme: "SDG 3 · SDG 6",
      sdgs: "SDG 3 · SDG 6",
      weeksRange: [7, 8],
      badgeBg: "bg-[#FAECE7]",
      badgeColor: "text-[#993C1D]",
      icon: <Heart className="w-5 h-5 text-orange-600" />,
    },
    {
      idx: 4,
      title: "Week 9–10: Peace Promotion",
      theme: "SDG 16 · SDG 17",
      sdgs: "SDG 16 · SDG 17",
      weeksRange: [9, 10],
      badgeBg: "bg-[#EEEDFE]",
      badgeColor: "text-[#534AB7]",
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
    },
  ];

  // Local Storage trackers to persist completed block indices
  const [completedTerm1Blocks, setCompletedTerm1Blocks] = useState<number[]>(
    () => {
      try {
        const saved = localStorage.getItem("kap10_completed_t1_blocks");
        return saved ? JSON.parse(saved) : [0]; // pre-unlocked/done first
      } catch {
        return [0];
      }
    },
  );

  // Term 2 states for the interactive Dragon's Den Pitch simulator
  const [selectedTerm2Block, setSelectedTerm2Block] = useState<number | null>(
    null,
  );
  const [pitchTimeLeft, setPitchTimeLeft] = useState(120);
  const [pitchIsActive, setPitchIsActive] = useState(false);
  const [pitchTimerInst, setPitchTimerInst] = useState<any>(null);
  const [canvasProblem, setCanvasProblem] = useState("");
  const [canvasSolution, setCanvasSolution] = useState("");
  const [canvasSDG, setCanvasSDG] = useState("SDG 8: Decent Work");
  const [canvasPitched, setCanvasPitched] = useState(false);

  // Term 2 Interactive games state logs
  const [skills12, setSkills12] = useState<string[]>([]);
  const [ethics13, setEthics13] = useState<number[]>([1, 1, 1]);
  const [ethicsChecked13, setEthicsChecked13] = useState(false);
  const [hotspots14, setHotspots14] = useState<string[]>([]);
  const [whys15, setWhys15] = useState<string[]>(["", "", "", "", ""]);
  const [whysSaved15, setWhysSaved15] = useState(false);
  const [sketches16, setSketches16] = useState<string[]>(Array(8).fill(""));
  const [materials17, setMaterials17] = useState<{ [key: string]: number }>({
    bamboo: 3,
    cardboard: 4,
    recycledPlastic: 2,
    scrapString: 5,
  });
  const [materialSimReport17, setMaterialSimReport17] = useState("");
  const [likes18, setLikes18] = useState("");
  const [wishes18, setWishes18] = useState("");
  const [whatifs18, setWhatifs18] = useState("");
  const [feedbackSaved18, setFeedbackSaved18] = useState(false);
  const [pivotOrig19, setPivotOrig19] = useState("");
  const [pivotCrit19, setPivotCrit19] = useState("");
  const [pivotSol19, setPivotSol19] = useState("");
  const [vocalActive20, setVocalActive20] = useState(false);
  const [vocalDb20, setVocalDb20] = useState(25);
  const [scores21, setScores21] = useState<{ [key: string]: number }>({
    hook: 7,
    feasibility: 6,
    cost: 8,
    resourcefulness: 7,
  });
  const [scoreCalculated21, setScoreCalculated21] = useState(false);
  const [letter22, setLetter22] = useState("");
  const [letterSealed22, setLetterSealed22] = useState(false);

  // Term 3 states for 1 Million SDG Solutions Portal submission
  const [selectedTerm3Block, setSelectedTerm3Block] = useState<number | null>(
    null,
  );
  const [portalProjName, setPortalProjName] = useState("");
  const [portalLocation, setPortalLocation] = useState("");
  const [portalSubmitted, setPortalSubmitted] = useState(false);
  const [registeredGrantsList, setRegisteredGrantsList] = useState<any[]>([]);

  // Timer effect for Pitch Simulator
  useEffect(() => {
    if (pitchIsActive && pitchTimeLeft > 0) {
      const timer = setInterval(() => {
        setPitchTimeLeft((prev) => {
          if (prev <= 1) {
            setPitchIsActive(false);
            clearInterval(timer);
            playSoundSynth(880, "sawtooth", 0.5); // end buzz
            return 0;
          }
          if (prev % 10 === 0) {
            playSoundSynth(440, "sine", 0.05); // minute alerts
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pitchIsActive, pitchTimeLeft]);

  // Handle setting active week and resetting stepper variables
  const handleSelectBlock = (idx: number) => {
    setSelectedBlockIdx(idx);
    setSubWeekIdx(0);
    const targetHsWeek = idx * 2; // maps block 0 -> week 0, block 1 -> week 2, etc.
    setHsCurrentWeek(targetHsWeek);

    // Reset stepper
    setCurrentSubStep(0);
    setCurrentLessonIndex(0);
    setGamePlayed(false);
    setLeaguePointsClaimed(false);
    setClaimMessage("");
    setClassFeedback("");
    setHsQuizAnswered(false);
    setHsSelectedQuizOpt(null);
    setSelectedTerm2Block(null);
    setSelectedTerm3Block(null);
    playSoundSynth(523.25, "sine", 0.1); // friendly beep
  };

  const handleSubWeekToggle = (choice: 0 | 1) => {
    setSubWeekIdx(choice);
    const targetHsWeek = selectedBlockIdx * 2 + choice;
    setHsCurrentWeek(targetHsWeek);

    // Reset current sub-steppers for fresh incremental progress
    setCurrentSubStep(0);
    setCurrentLessonIndex(0);
    setGamePlayed(false);
    setLeaguePointsClaimed(false);
    setClaimMessage("");
    setClassFeedback("");
    setHsQuizAnswered(false);
    setHsSelectedQuizOpt(null);
    playSoundSynth(659.25, "sine", 0.06);
  };

  const handleClaimPoints = () => {
    setLeaguePointsClaimed(true);
    const activeWkNum =
      activeInteractiveWeek !== null
        ? activeInteractiveWeek
        : hsCurrentWeek + 1;

    // Legacy support for block mapping
    const legacyBlockIdx = Math.floor((activeWkNum - 1) / 2);
    if (!completedTerm1Blocks.includes(legacyBlockIdx)) {
      const nextLegacy = [...completedTerm1Blocks, legacyBlockIdx];
      setCompletedTerm1Blocks(nextLegacy);
      localStorage.setItem(
        "kap10_completed_t1_blocks",
        JSON.stringify(nextLegacy),
      );
    }

    // Modern progressive sequential week support
    const nextCompleted = [...completedWeeks];
    if (!nextCompleted.includes(activeWkNum)) {
      nextCompleted.push(activeWkNum);
      setCompletedWeeks(nextCompleted);
      localStorage.setItem(
        "kap10_completed_weeks_list_v4",
        JSON.stringify(nextCompleted),
      );
    }

    setClaimMessage(
      `🏆 PERFECT WORK! Week ${activeWkNum} finalized. 50 SDG League Points have been logged successfully for your SDGs Club chapter!`,
    );
    playSoundSynth(587.33, "sine", 0.1);
    setTimeout(() => playSoundSynth(880, "sine", 0.25), 110);
  };

  const handleLaunchWeek = (wkNum: number) => {
    setActiveInteractiveWeek(wkNum);
    setHsCurrentWeek(wkNum - 1);

    // Reset stepper progress for a fresh user experience
    setCurrentSubStep(0);
    setCurrentLessonIndex(0);
    setGamePlayed(false);
    setLeaguePointsClaimed(false);
    setClaimMessage("");
    setClassFeedback("");
    setHsQuizAnswered(false);
    setHsSelectedQuizOpt(null);
    playSoundSynth(523.25, "sine", 0.1); // friendly chime
  };

  const isWeekUnlocked = (wkNum: number) => {
    if (wkNum === 1 || wkNum === 11) return true; // Week 1 and Week 11 are pre-unlocked
    return completedWeeks.includes(wkNum - 1);
  };

  const handleOptionClick = (optIdx: number) => {
    if (hsQuizAnswered) return;
    setHsSelectedQuizOpt(optIdx);
    setHsQuizAnswered(true);
  };

  const currentPlan = HIGH_SCHOOL_WEEKS[hsCurrentWeek] || HIGH_SCHOOL_WEEKS[0];

  const subSteps = [
    { name: "Objectives", icon: "🎯" },
    { name: "Lesson Slides", icon: "📚" },
    { name: "Class Game", icon: "🎲" },
    { name: "Quiz Warmup", icon: "⚡" },
    { name: "Output & Seals", icon: "🏆" },
  ];

  const canGoToStep = (index: number) => {
    if (index === 0) return true;
    if (index === 1) return true;
    if (index === 2)
      return currentLessonIndex === currentPlan.lesson.length - 1;
    if (index === 3) return gamePlayed;
    if (index === 4) return hsQuizAnswered;
    return false;
  };

  // Term 1, 2, 3 totals layout as shown in user prompt schema
  return (
    <div className="space-y-8">
      {/* 🌍 Mockup Header Area matching the user's diagram perfectly */}
      <div className="bg-slate-900 border-4 border-black p-6 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sdg-12/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-sdg-12 text-white px-2.5 py-1">
              Uganda District Chapter
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              • Aligned to NDPIV Framework
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none font-display text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
              🌍 SDG Youth Coalition Club Curriculum
            </h1>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mt-1.5">
              Uganda · Aligned with NDPIV & Project-Based Learning · High School
              + University
            </p>
          </div>

          {/* Thematic Category Tag Ribbons */}
          <div className="flex flex-wrap gap-1.5 pt-1 select-none">
            {[
              {
                label: "Gender Equality",
                color: "bg-[#993556]/20 text-[#FF8EAD] border-[#993556]/50",
              },
              {
                label: "Climate Action",
                color: "bg-[#3B6D11]/20 text-[#B4E587] border-[#3B6D11]/50",
              },
              {
                label: "Health & Wellbeing",
                color: "bg-[#993C1D]/20 text-[#FFA082] border-[#993C1D]/50",
              },
              {
                label: "Human Capital Dev",
                color: "bg-[#0F6E56]/20 text-[#6FFDCC] border-[#0F6E56]/50",
              },
              {
                label: "Peace Promotion",
                color: "bg-[#534AB7]/20 text-[#C1BDFC] border-[#534AB7]/50",
              },
              {
                label: "Entrepreneurship",
                color: "bg-[#BA7517]/20 text-[#FFD49B] border-[#BA7517]/50",
              },
            ].map((tag, tIdx) => (
              <span
                key={tIdx}
                className={`text-[10px] font-black uppercase px-3 py-1 border rounded-full ${tag.color}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ⚡ FUN FACT Banner block from Mockup */}
      <div className="bg-[#FFF4E5] border-3 border-orange-200 p-4 text-[#854F0B] font-medium text-xs leading-relaxed flex items-center gap-3 shadow-[3px_3px_0px_0px_rgba(255,244,229,1)]">
        <span className="text-2xl shrink-0">⚡</span>
        <div>
          <strong className="uppercase font-black text-[10px] text-orange-700 block mb-0.5">
            FUN FACT
          </strong>
          Uganda has one of the world's youngest populations — over 78% are
          under 30. That means{" "}
          <span className="underline font-extrabold text-orange-850">YOU</span>{" "}
          are Uganda's biggest SDG asset!
        </div>
      </div>

      {/* 🚀 Beautiful Term selector tabs as columns representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none">
        <button
          onClick={() => {
            setActiveTermTab("t1");
            setSelectedTerm2Block(null);
            setSelectedTerm3Block(null);
            playSoundSynth(440, "sine", 0.08);
          }}
          className={`py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 md:border-b-0 md:border-r-4 border-black transition-all ${
            activeTermTab === "t1"
              ? "bg-emerald-600 text-white font-black"
              : "bg-white text-black hover:bg-gray-50"
          }`}
        >
          📅 Term 1: Learn & Explore
          <span className="block text-[8px] font-bold uppercase tracking-tight opacity-75 mt-0.5">
            Socratic Foundations (Week 1–10)
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTermTab("t2");
            setSelectedTerm2Block(null);
            setSelectedTerm3Block(null);
            playSoundSynth(493.88, "sine", 0.08);
          }}
          className={`py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 md:border-b-0 md:border-r-4 border-black transition-all ${
            activeTermTab === "t2"
              ? "bg-teal-600 text-white font-black"
              : "bg-white text-black hover:bg-gray-50"
          }`}
        >
          🔬 Term 2: Research & Build
          <span className="block text-[8px] font-bold uppercase tracking-tight opacity-75 mt-0.5">
            Design & Community Fieldwork (Week 11–22)
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTermTab("t3");
            setSelectedTerm2Block(null);
            setSelectedTerm3Block(null);
            playSoundSynth(523.25, "sine", 0.08);
          }}
          className={`py-4 text-center text-xs font-black uppercase tracking-wider transition-all ${
            activeTermTab === "t3"
              ? "bg-amber-600 text-white font-black"
              : "bg-white text-black hover:bg-gray-50"
          }`}
        >
          🚀 Term 3: Submit & Celebrate
          <span className="block text-[8px] font-bold uppercase tracking-tight opacity-75 mt-0.5">
            Sustain & Global Launch (Light schedule)
          </span>
        </button>
      </div>

      {/* ==========================================
          TERM 1 ACTIVE LISTING PANEL DESIGN
          ========================================== */}
      {activeTermTab === "t1" && (
        <div className="space-y-6">
          <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5">
              Current Active Term
            </span>
            <h3 className="text-xl font-black uppercase italic tracking-tight font-display mt-2 text-gray-900">
              Term 1 — Socratic foundations & mapping
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase mt-1">
              Select any of the 10 progressive weekly learning modules below to
              launch its dedicated, full-page interactive session runner and
              diagnostics.
            </p>
          </div>

          {activeInteractiveWeek === null ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#EBFDF0] border-2 border-emerald-400 p-3.5 text-[#188B5A] text-xs font-semibold uppercase leading-snug flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(235,253,240,1)]">
                <span>📚</span>
                <span>
                  <strong>PROGRESSIVE ROADMAP PROTOCOL:</strong> Complete the
                  interactive steps for each week sequentially to unlock the
                  subsequent levels.
                  <span className="underline font-bold text-emerald-950">
                    {" "}
                    Once completed, the next Week opens up!
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {HIGH_SCHOOL_WEEKS.slice(0, 10).map((wk, idx) => {
                  const wkNum = wk.num;
                  const isDone = completedWeeks.includes(wkNum);
                  const isUnlocked = isWeekUnlocked(wkNum);

                  let cardBorder = "border-[#E2E8F0] opacity-50";
                  let bgStyle = "bg-slate-50";

                  if (isUnlocked) {
                    if (isDone) {
                      cardBorder =
                        "border-emerald-500 hover:border-emerald-600 hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(29,158,117,0.15)]";
                      bgStyle = "bg-[#F3FDF9]";
                    } else {
                      cardBorder =
                        "border-black hover:border-blue-600 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
                      bgStyle = "bg-white";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isUnlocked) {
                          handleLaunchWeek(wkNum);
                        } else {
                          playSoundSynth(150, "sawtooth", 0.3);
                        }
                      }}
                      className={`border-4 p-4 transition-all flex flex-col justify-between space-y-4 rounded-none min-h-[160px] ${
                        isUnlocked ? "cursor-pointer" : "cursor-not-allowed"
                      } ${cardBorder} ${bgStyle}`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${wk.badgeBg} ${wk.badgeColor}`}
                          >
                            Week {wkNum.toString().padStart(2, "0")}
                          </span>

                          {isDone ? (
                            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-400 px-1 rounded-none leading-none pt-0.5 py-0.5">
                              ✓ COMPLETED
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-400 px-1 rounded-none leading-none pt-0.5 py-0.5 animate-pulse">
                              ● READY
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase text-gray-400 border border-gray-200 bg-white px-1 rounded-none leading-none pt-0.5 py-0.5 flex items-center gap-0.5">
                              🔒 LOCKED
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-black uppercase leading-tight text-gray-950 mt-1">
                            {wk.title}
                          </h4>
                          <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 leading-none">
                            {wk.theme}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                        <span className="text-[7.5px] font-black text-slate-500 uppercase font-mono">
                          {wk.sdg}
                        </span>
                        {isUnlocked && (
                          <span className="text-[8px] font-black text-blue-600 uppercase underline">
                            LAUNCH ➔
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ==========================================
              INTERACTIVE BLOCK SEED LESSON STEPPER
              ========================================== */}
          {activeInteractiveWeek !== null && (
            <div className="border-4 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
              {/* Upper Interactive Block Sub-header to divide Week A and Week B */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-black pb-4 gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#185FA5] bg-[#E6F1FB] px-2 py-0.5 border border-blue-200">
                    Interactive Class Session Runner
                  </span>
                  <h4 className="text-xl font-black uppercase italic tracking-tight font-display mt-1">
                    💡 Study Platform: {term1Blocks[selectedBlockIdx].title}
                  </h4>
                </div>

                {/* Sub Week toggle option */}
                <div className="flex border-2 border-black bg-white select-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    onClick={() => handleSubWeekToggle(0)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase border-r-2 border-black transition-all ${
                      subWeekIdx === 0
                        ? "bg-slate-900 text-white font-black"
                        : "hover:bg-gray-100 bg-white text-black"
                    }`}
                  >
                    📝 Week {term1Blocks[selectedBlockIdx].weeksRange[0]} Lesson
                  </button>
                  <button
                    onClick={() => handleSubWeekToggle(1)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all ${
                      subWeekIdx === 1
                        ? "bg-slate-900 text-white font-black"
                        : "hover:bg-gray-100 bg-white text-black"
                    }`}
                  >
                    📝 Week {term1Blocks[selectedBlockIdx].weeksRange[1]} Lesson
                  </button>
                </div>
              </div>

              {/* Stepper Wizard Progress Indicators (The user's literal request: incremental progress indicator) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-2 border-black bg-gray-50 p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {subSteps.map((s, idx) => {
                  const isActive = currentSubStep === idx;
                  const isCompleted =
                    idx < currentSubStep ||
                    (idx === 2 && gamePlayed) ||
                    (idx === 3 && hsQuizAnswered) ||
                    (idx === 4 && leaguePointsClaimed);
                  const unlocked = canGoToStep(idx);

                  return (
                    <button
                      key={idx}
                      disabled={!unlocked}
                      onClick={() => {
                        setCurrentSubStep(idx);
                        playSoundSynth(349.23 + idx * 50, "sine", 0.05);
                      }}
                      className={`p-2 border-2 text-center text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? "bg-black text-white border-black"
                          : isCompleted
                            ? "bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56] hover:bg-[#d6f0e7]"
                            : unlocked
                              ? "bg-white border-black hover:bg-gray-50 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                              : "bg-gray-100 border-gray-100 text-gray-405 opacity-50 cursor-not-allowed"
                      }`}
                      title={
                        !unlocked
                          ? "Complete the previous milestone to unblock!"
                          : ""
                      }
                    >
                      <span className="text-xs">
                        {unlocked ? s.icon : "🔒"}
                      </span>
                      <span className="truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Stage content split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Left Column Stage (Main Interaction - spans 2) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border-4 border-black p-5 md:p-6 min-h-[290px] flex flex-col justify-between">
                    {/* Step Inner Header */}
                    <div className="border-b-2 border-dashed border-gray-200 pb-3 mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#185FA5]">
                        Active Phase: {subSteps[currentSubStep].name}
                      </span>
                      <span className="text-[9px] font-black text-gray-400 uppercase">
                        WEEK {currentPlan.num} · {currentPlan.theme}
                      </span>
                    </div>

                    {/* STEP 0: OBJECTIVES */}
                    {currentSubStep === 0 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-3 bg-gray-50 border-l-4 border-emerald-600">
                          <p className="text-[11px] font-bold text-gray-650 uppercase leading-relaxed">
                            Welcome Club Members! Today, we study Week{" "}
                            {currentPlan.num}. First, let's explore our central
                            socratic objectives.
                          </p>
                        </div>
                        <div className="space-y-2.5 pt-1">
                          {currentPlan.objectives.map((obj, i) => (
                            <div
                              key={i}
                              className="flex gap-3 items-start text-xs font-semibold text-gray-750"
                            >
                              <span className="text-[10px] font-black text-[#0F6E56] bg-[#E1F5EE] border border-[#5DCAA5] w-5 h-5 flex items-center justify-center rounded-none shrink-0">
                                0{i + 1}
                              </span>
                              <p className="leading-snug pt-0.5">{obj}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 1: LESSON SLIDES WITH STEP CONTROL */}
                    {currentSubStep === 1 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-slate-900 border-2 border-black p-5 text-white space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">
                              LESSON SLIDE DECK
                            </span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">
                              SLIDE {currentLessonIndex + 1} OF{" "}
                              {currentPlan.lesson.length}
                            </span>
                          </div>

                          <p className="text-sm font-black text-yellow-300 leading-relaxed uppercase italic font-display">
                            "{currentPlan.lesson[currentLessonIndex]}"
                          </p>

                          <div className="p-2.5 bg-slate-800 border-l-2 border-[#1D9E75] text-[10px] text-gray-400 font-semibold uppercase leading-snug">
                            💡 Patron Tip: Guide students' classroom discussion
                            regarding local district evidence.
                          </div>
                        </div>

                        {/* Click control to slide deck */}
                        <div className="flex justify-between items-center pt-1.5 select-none">
                          <button
                            disabled={currentLessonIndex === 0}
                            onClick={() => {
                              setCurrentLessonIndex((prev) => prev - 1);
                              playSoundSynth(293.66, "sine", 0.05);
                            }}
                            className={`px-3 py-1 border-2 border-black text-[10px] font-black uppercase transition-all cursor-pointer ${
                              currentLessonIndex === 0
                                ? "opacity-30 cursor-not-allowed bg-gray-50"
                                : "bg-white hover:bg-gray-100"
                            }`}
                          >
                            ← BACK SLIDE
                          </button>
                          <span className="text-[9px] font-black text-gray-400 uppercase">
                            Slide {currentLessonIndex + 1} of{" "}
                            {currentPlan.lesson.length}
                          </span>
                          {currentLessonIndex <
                          currentPlan.lesson.length - 1 ? (
                            <button
                              onClick={() => {
                                setCurrentLessonIndex((prev) => prev + 1);
                                playSoundSynth(329.63, "sine", 0.05);
                              }}
                              className="px-3 py-1 border-2 border-black bg-white hover:bg-slate-950 hover:text-white text-[10px] font-black uppercase transition-all cursor-pointer"
                            >
                              NEXT SLIDE →
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setCurrentSubStep(2);
                                playSoundSynth(523.25, "sine", 0.12);
                              }}
                              className="px-3 py-1 border-2 border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56] text-[10px] font-black uppercase transition-all cursor-pointer"
                            >
                              OPEN GAME 🎲
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: CLASS GAME / SIMULATION CHECKLIST */}
                    {currentSubStep === 2 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-[#EEEDFE]/50 border-2 border-[#AAA2EB] p-4 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-black text-[#534AB7] uppercase text-[11px] tracking-wide">
                            <Sparkles size={14} />
                            Simulation Game: {currentPlan.game.name}
                          </div>
                          <p className="font-semibold text-gray-750 leading-relaxed text-xs">
                            {currentPlan.game.how}
                          </p>
                        </div>

                        {/* Dynamic Game Wrapper for Term 2 Weeks 11-22 */}
                        {currentPlan.num >= 11 && currentPlan.num <= 22 ? (
                          <div className="bg-white border-4 border-black p-4 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-[9px] font-black bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 uppercase block w-max">
                              🎮 LIVE SIMULATION SANDBOX ACTIVATED
                            </span>

                            {/* WEEK 11: Dragon's Den Uganda Speed Pitch & Canvas */}
                            {currentPlan.num === 11 && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-slate-200 p-3 bg-slate-50">
                                  <div className="space-y-2">
                                    <span className="text-[8px] font-black text-gray-400 block uppercase">
                                      1. PROBLEM STATEMENT
                                    </span>
                                    <input
                                      type="text"
                                      placeholder="e.g., Waste plastic piling in Kyebando gutters"
                                      value={canvasProblem}
                                      onChange={(e) =>
                                        setCanvasProblem(e.target.value)
                                      }
                                      className="w-full text-xs font-bold border-2 border-black p-2 bg-white uppercase"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <span className="text-[8px] font-black text-gray-400 block uppercase">
                                      2. PROTOTYPE DESIGN CONCEPT
                                    </span>
                                    <input
                                      type="text"
                                      placeholder="e.g., Recycled plastic fence poles"
                                      value={canvasSolution}
                                      onChange={(e) =>
                                        setCanvasSolution(e.target.value)
                                      }
                                      className="w-full text-xs font-bold border-2 border-black p-2 bg-white uppercase"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 border-2 border-slate-900 bg-slate-900 text-white font-mono">
                                  <div className="text-center sm:text-left">
                                    <span className="text-[8px] font-black text-emerald-400 block uppercase">
                                      SECURED COUNTDOWN
                                    </span>
                                    <h5 className="text-sm font-black text-white">
                                      ELEVATOR BRIEF TRIAL
                                    </h5>
                                  </div>
                                  <div className="text-3xl font-black text-yellow-300 bg-slate-800 px-4 py-1.5 border border-black">
                                    {Math.floor(pitchTimeLeft / 60)}:
                                    {(pitchTimeLeft % 60)
                                      .toString()
                                      .padStart(2, "0")}
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (pitchIsActive) {
                                        setPitchIsActive(false);
                                        playSoundSynth(293, "sawtooth", 0.15);
                                      } else {
                                        setPitchTimeLeft(120);
                                        setPitchIsActive(true);
                                        playSoundSynth(880, "sine", 0.2);
                                      }
                                    }}
                                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 font-sans text-black text-[10px] font-black uppercase tracking-wide border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,1)]"
                                  >
                                    {pitchIsActive
                                      ? "⏸ PAUSE"
                                      : "⚡ START TIMER"}
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    if (!canvasProblem || !canvasSolution) {
                                      alert(
                                        "Please specify the community problem and design concepts first!",
                                      );
                                      return;
                                    }
                                    setGamePlayed(true);
                                    setCanvasPitched(true);
                                    playSoundSynth(523, "sine", 0.1);
                                    setTimeout(
                                      () => playSoundSynth(659, "sine", 0.1),
                                      80,
                                    );
                                    setTimeout(
                                      () => playSoundSynth(880, "sine", 0.25),
                                      160,
                                    );
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase text-center cursor-pointer"
                                >
                                  ✓ LOCK CANVAS & CLAIM GAME VICTORY
                                </button>
                              </div>
                            )}

                            {/* WEEK 12: Uganda Skills Market */}
                            {currentPlan.num === 12 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">
                                  SELECT TEAM ASSETS (UP TO 3 MAX FOR SYNERGY
                                  BOOST):
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {[
                                    {
                                      id: "agro",
                                      label: "Agroforestry Skill",
                                      cat: "SDG 15",
                                    },
                                    {
                                      id: "book",
                                      label: "Bookkeeping Skill",
                                      cat: "SDG 8",
                                    },
                                    {
                                      id: "wash",
                                      label: "WASH Engineering",
                                      cat: "SDG 6",
                                    },
                                    {
                                      id: "vocal",
                                      label: "Public Speaking",
                                      cat: "SDG 16",
                                    },
                                    {
                                      id: "solar",
                                      label: "Solar Assembly",
                                      cat: "SDG 7",
                                    },
                                    {
                                      id: "sewing",
                                      label: "Pads Production",
                                      cat: "SDG 5",
                                    },
                                  ].map((sk) => {
                                    const selected = skills12.includes(
                                      sk.label,
                                    );
                                    return (
                                      <button
                                        key={sk.id}
                                        onClick={() => {
                                          playSoundSynth(
                                            selected ? 300 : 450,
                                            "sine",
                                            0.05,
                                          );
                                          if (selected) {
                                            setSkills12((prev) =>
                                              prev.filter(
                                                (x) => x !== sk.label,
                                              ),
                                            );
                                          } else {
                                            if (skills12.length >= 3) {
                                              alert(
                                                "Maximum of three skills selected for this exercise draft limit!",
                                              );
                                              return;
                                            }
                                            setSkills12((prev) => [
                                              ...prev,
                                              sk.label,
                                            ]);
                                          }
                                        }}
                                        className={`p-2 border-2 text-[9px] font-black uppercase tracking-tight text-left transition-all ${
                                          selected
                                            ? "bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56]"
                                            : "bg-white border-black hover:bg-gray-50 text-black"
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span>{sk.label}</span>
                                          <span className="text-[7px] border bg-white px-1 leading-none pt-0.5">
                                            {sk.cat}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="p-3 bg-slate-50 border-2 border-dashed border-gray-200">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span>TEAM COMPILATION PROGRESS:</span>
                                    <span className="text-emerald-700">
                                      {skills12.length}/3 ASSETS SELECTED
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 h-2 mt-1 rounded-none overflow-hidden">
                                    <div
                                      className="bg-emerald-600 h-2 transition-all"
                                      style={{
                                        width: `${(skills12.length / 3) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <button
                                  disabled={skills12.length === 0}
                                  onClick={() => {
                                    setGamePlayed(true);
                                    playSoundSynth(659, "sine", 0.15);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  ✓ REGISTER SKILLS TEAM EXCHAGE (+50 PTS)
                                </button>
                              </div>
                            )}

                            {/* WEEK 13: The Ethical Interview Probe */}
                            {currentPlan.num === 13 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                                  ETHICAL FIELDWORK PROTOCOLS SETUP:
                                </span>
                                {[
                                  {
                                    q: "How should you greet a rural subcounty elder?",
                                    opts: [
                                      "Ask direct survey questions instantly",
                                      "Observe appropriate traditional layout, introduce self, request permission",
                                    ],
                                    ans: 1,
                                  },
                                  {
                                    q: "What constitutes correct ethical consent?",
                                    opts: [
                                      "Assuming agreements automatically",
                                      "Explaining objective clearly and securing oral/written agreement beforehand",
                                    ],
                                    ans: 1,
                                  },
                                  {
                                    q: "Washing, water, or energy questionnaires are best filled with:",
                                    opts: [
                                      "Making up approximate quantities",
                                      "Respectful dialogs recording exact qualitative statements",
                                    ],
                                    ans: 1,
                                  },
                                ].map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="border-2 border-gray-150 p-2.5 bg-slate-50 text-[10px] space-y-1"
                                  >
                                    <p className="font-extrabold uppercase text-gray-700">
                                      Protocol {idx + 1}: {item.q}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {item.opts.map((opt, oIdx) => (
                                        <button
                                          key={oIdx}
                                          onClick={() => {
                                            playSoundSynth(440, "sine", 0.05);
                                            setEthics13((prev) => {
                                              const next = [...prev];
                                              next[idx] = oIdx;
                                              return next;
                                            });
                                          }}
                                          className={`p-2 font-black uppercase text-left text-[8.5px] border transition-all ${
                                            ethics13[idx] === oIdx
                                              ? "bg-[#E6F1FB] border-blue-500 text-blue-800"
                                              : "bg-white border-gray-300 text-gray-400 hover:bg-gray-50"
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    setGamePlayed(true);
                                    setEthicsChecked13(true);
                                    playSoundSynth(659, "sine", 0.15);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer"
                                >
                                  ✓ SECURE ETHICAL VERIFICATION SEAL
                                </button>
                                {ethicsChecked13 && (
                                  <div className="p-2.5 bg-emerald-50 border border-[#1D9E75] text-[9.5px] font-extrabold text-[#0D6D55] uppercase text-center">
                                    ★ ETHICS SCORE: 100% PERFECTLY ALIGNED!
                                    CITIZEN SAFEGUARDS VERIFIED SENSITIVE.
                                  </div>
                                )}
                              </div>
                            )}

                            {/* WEEK 14: Compound Mapping Hunt */}
                            {currentPlan.num === 14 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  CLICK DIRECTLY ON HOTSPOTS TO MAP LOCAL
                                  CLUSTER FAILURES:
                                </span>
                                <div className="relative bg-slate-900 border-4 border-black p-4 min-h-[140px] flex items-center justify-center text-center">
                                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1D9E75_1px,transparent_1px)] [background-size:16px_16px]" />
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full z-10">
                                    {[
                                      {
                                        id: "drain",
                                        label: "Clogged border drainage",
                                        state: "Downtime risk",
                                      },
                                      {
                                        id: "trash",
                                        label: "Market plastic dump heap",
                                        state: "Chemical leaching",
                                      },
                                      {
                                        id: "hill",
                                        label: "Deforest hill soil slide",
                                        state: "Erosion risk",
                                      },
                                    ].map((hs) => {
                                      const activated = hotspots14.includes(
                                        hs.id,
                                      );
                                      return (
                                        <button
                                          key={hs.id}
                                          onClick={() => {
                                            playSoundSynth(
                                              activated ? 300 : 500,
                                              "sine",
                                              0.05,
                                            );
                                            if (activated) {
                                              setHotspots14((prev) =>
                                                prev.filter((x) => x !== hs.id),
                                              );
                                            } else {
                                              setHotspots14((prev) => [
                                                ...prev,
                                                hs.id,
                                              ]);
                                            }
                                          }}
                                          className={`p-3 border-2 font-mono text-[9px] uppercase tracking-tight font-bold transition-all ${
                                            activated
                                              ? "bg-[#FBEAF0] border-red-500 text-red-700"
                                              : "bg-slate-800 border-gray-600 text-gray-300 hover:bg-slate-750"
                                          }`}
                                        >
                                          <div className="font-extrabold">
                                            {hs.label}
                                          </div>
                                          <div className="text-[7.5px] opacity-75">
                                            {activated
                                              ? "⚠️ PINNED MAPPED"
                                              : "○ SCAN SPOT"}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase bg-slate-50 p-2 border">
                                  <span>
                                    HOTSPOTS SCANNED: {hotspots14.length}/3
                                  </span>
                                  {hotspots14.length === 3 ? (
                                    <span className="text-[#0F6E56]">
                                      ✓ ALL TARGET HOTSPOTS LOCKED
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      WAITING FOR MAPPING...
                                    </span>
                                  )}
                                </div>
                                <button
                                  disabled={hotspots14.length < 3}
                                  onClick={() => {
                                    setGamePlayed(true);
                                    playSoundSynth(659, "sine", 0.2);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-[#1D9E75] text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                                >
                                  ✓ REGISTER COMPLETED CONFLICT MAP
                                </button>
                              </div>
                            )}

                            {/* WEEK 15: The Root-Cause Multiplier */}
                            {currentPlan.num === 15 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  THE 5 WHYS ROOT CAUSE SEQUENTIAL PIPELINE:
                                </span>
                                <div className="space-y-2">
                                  {[
                                    {
                                      label: "1st Why (Surface Symptom):",
                                      placeholder:
                                        "The school border channel floods every rainy session.",
                                    },
                                    {
                                      label: "2nd Why (First connection):",
                                      placeholder:
                                        "Because plastic water bottles and kaveera clog the metal grid.",
                                    },
                                    {
                                      label: "3rd Why (Systemic pattern):",
                                      placeholder:
                                        "Because students do not have waste disposal bins nearby.",
                                    },
                                    {
                                      label: "4th Why (Procurement cause):",
                                      placeholder:
                                        "Because the local council has not allocated bins budget.",
                                    },
                                    {
                                      label: "5th Why (Root Cause):",
                                      placeholder:
                                        "Because community circular recycling models are uninitiated.",
                                    },
                                  ].map((why, i) => (
                                    <div
                                      key={i}
                                      className="flex gap-2.5 items-center bg-gray-50 p-1.5 border border-gray-200"
                                    >
                                      <span className="text-[9px] font-mono font-black text-gray-400 shrink-0 w-max">
                                        #{i + 1}
                                      </span>
                                      <div className="space-y-0.5 w-full">
                                        <span className="text-[8px] font-black text-gray-700 block uppercase">
                                          {why.label}
                                        </span>
                                        <input
                                          type="text"
                                          placeholder={why.placeholder}
                                          value={whys15[i]}
                                          disabled={whysSaved15}
                                          onChange={(e) => {
                                            const next = [...whys15];
                                            next[i] = e.target.value;
                                            setWhys15(next);
                                          }}
                                          className="w-full text-[10px] font-semibold border-2 border-black p-1 bg-white uppercase"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  disabled={whys15.some((x) => !x)}
                                  onClick={() => {
                                    setGamePlayed(true);
                                    setWhysSaved15(true);
                                    playSoundSynth(659, "sine", 0.15);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  ✓ SAVE SYSTEMIC ROOT-CAUSE CASCADE (+60 PTS)
                                </button>
                              </div>
                            )}

                            {/* WEEK 16: Crazy Eights Sketch Pad */}
                            {currentPlan.num === 16 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  CRAZY EIGHTS: RAPID-DRAFT 8 UNIQUE VARIATIONS
                                  OF YOUR DESIGN:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="border-2 border-dashed border-gray-300 p-2 bg-slate-50 space-y-1"
                                    >
                                      <span className="text-[8px] font-black text-gray-400 block uppercase">
                                        VARIANT #0{i + 1}
                                      </span>
                                      <textarea
                                        placeholder="e.g. Bamboo frame..."
                                        value={sketches16[i]}
                                        onChange={(e) => {
                                          const next = [...sketches16];
                                          next[i] = e.target.value;
                                          setSketches16(next);
                                        }}
                                        className="w-full h-11 text-[9px] font-semibold border border-black p-1 uppercase resize-none bg-white font-mono"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase bg-gray-50 border p-2">
                                  <span>DRAFT PROGRESS COMPLETED:</span>
                                  <span>
                                    {sketches16.filter((x) => x).length}/8
                                    SKETCHES FILLED
                                  </span>
                                </div>
                                <button
                                  disabled={
                                    sketches16.filter((x) => x).length < 4
                                  }
                                  onClick={() => {
                                    setGamePlayed(true);
                                    playSoundSynth(659, "sine", 0.15);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                                >
                                  ✓ FINALIZE CREATIVE SOLUTION SKETCHES
                                </button>
                                <p className="text-[8px] text-gray-400 text-center normal-case font-semibold">
                                  Fill at least 4 divisions to enable selection.
                                </p>
                              </div>
                            )}

                            {/* WEEK 17: 30-Min Scrap Challenge */}
                            {currentPlan.num === 17 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  RESOURCE COMPOSITION FOR LOW-FIDELITY DESIGN
                                  SPRINT:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border-2 border-gray-200">
                                  {[
                                    {
                                      id: "bamboo",
                                      label: "Bamboo cane stakes (Flexibility)",
                                      max: 10,
                                    },
                                    {
                                      id: "cardboard",
                                      label: "Found clean shipping cardboard",
                                      max: 10,
                                    },
                                    {
                                      id: "recycledPlastic",
                                      label:
                                        "Washed water bottles (Waterproof)",
                                      max: 10,
                                    },
                                    {
                                      id: "scrapString",
                                      label: "Discarded gunny sack strings",
                                      max: 10,
                                    },
                                  ].map((res) => (
                                    <div key={res.id} className="space-y-1">
                                      <div className="flex justify-between text-[9px] font-black uppercase text-gray-700">
                                        <span>{res.label}</span>
                                        <span className="font-mono">
                                          {materials17[res.id]} Unit
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max={res.max}
                                        value={materials17[res.id]}
                                        onChange={(e) => {
                                          playSoundSynth(
                                            300 + parseInt(e.target.value) * 30,
                                            "sine",
                                            0.04,
                                          );
                                          setMaterials17((prev) => ({
                                            ...prev,
                                            [res.id]: parseInt(e.target.value),
                                          }));
                                        }}
                                        className="w-full accent-black h-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    const total = Object.values(
                                      materials17,
                                    ).reduce((a, b) => a + b, 0);
                                    let rating = "DURABLE ACCESSIBLE MODEL";
                                    if (
                                      materials17.bamboo > 5 &&
                                      materials17.recycledPlastic > 5
                                    ) {
                                      rating =
                                        "AMPHIBIOUS RESILIENT BLUEPRINT - Outstanding protection against central rains and weather leaching!";
                                    } else if (materials17.cardboard > 7) {
                                      rating =
                                        "TEMPORARY MOCKUP DECK - Excellent low-cost testing, but highly vulnerable to damp erosion. Perfect for classroom review!";
                                    } else if (total < 10) {
                                      rating =
                                        "INSUFFICIENT MATERIAL MASS - Prototype feels too flimsy. Secure more scrap parts to strengthen model integrity!";
                                    }
                                    setMaterialSimReport17(rating);
                                    setGamePlayed(true);
                                    playSoundSynth(523, "sine", 0.1);
                                    setTimeout(
                                      () => playSoundSynth(659, "sine", 0.15),
                                      100,
                                    );
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer"
                                >
                                  🧪 LAUNCH MECHANICAL DURABILITY SIMULATION
                                </button>
                                {materialSimReport17 && (
                                  <div className="p-3 bg-slate-900 border-2 border-yellow-300 font-mono text-[9.5px] text-yellow-300 uppercase leading-relaxed">
                                    <strong>
                                      [SIMULATOR SYSTEM ASSESSMENT REPORT]:
                                    </strong>
                                    <p className="mt-1 text-white font-semibold">
                                      {materialSimReport17}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* WEEK 18: I Like, I Wish, What If */}
                            {currentPlan.num === 18 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  USER INTERVIEW FEEDBACK COLLECTION MATRIX:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="border-2 border-[#1D9E75] p-3 bg-emerald-50/50 space-y-1.5">
                                    <span className="text-[10px] font-black text-emerald-800 block uppercase">
                                      1. I LIKE... (Worked well)
                                    </span>
                                    <textarea
                                      placeholder="e.g. Tester loved that the handles are sourced from bamboo cane..."
                                      value={likes18}
                                      onChange={(e) =>
                                        setLikes18(e.target.value)
                                      }
                                      className="w-full h-20 text-[9.5px] font-semibold border-2 border-black p-1.5 bg-white uppercase resize-none"
                                    />
                                  </div>
                                  <div className="border-2 border-blue-400 p-3 bg-blue-50/20 space-y-1.5">
                                    <span className="text-[10px] font-black text-blue-800 block uppercase">
                                      2. I WISH... (Refinements)
                                    </span>
                                    <textarea
                                      placeholder="e.g. Tester wished the water filtration mesh was tighter..."
                                      value={wishes18}
                                      onChange={(e) =>
                                        setWishes18(e.target.value)
                                      }
                                      className="w-full h-20 text-[9.5px] font-semibold border-2 border-black p-1.5 bg-white uppercase resize-none"
                                    />
                                  </div>
                                  <div className="border-2 border-[#BA7517] p-3 bg-amber-50/40 space-y-1.5">
                                    <span className="text-[10px] font-black text-[#8A5612] block uppercase">
                                      3. WHAT IF... (Wild extensions)
                                    </span>
                                    <textarea
                                      placeholder="e.g. What if there was a solar tracking LED indicator attached..."
                                      value={whatifs18}
                                      onChange={(e) =>
                                        setWhatifs18(e.target.value)
                                      }
                                      className="w-full h-20 text-[9.5px] font-semibold border-2 border-black p-1.5 bg-white uppercase resize-none"
                                    />
                                  </div>
                                </div>
                                <button
                                  disabled={!likes18 || !wishes18 || !whatifs18}
                                  onClick={() => {
                                    setGamePlayed(true);
                                    setFeedbackSaved18(true);
                                    playSoundSynth(659, "sine", 0.15);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  ✓ LOG COMMUNITY EVALUATIVE SPRINT GRID (+100
                                  PTS)
                                </button>
                              </div>
                            )}

                            {/* WEEK 19: The Written Pivot */}
                            {currentPlan.num === 19 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  THE WRITTEN DESIGN PIVOT STATEMENT
                                  CONSTRUCTOR:
                                </span>
                                <div className="space-y-2 border-2 border-[#534AB7] p-3 bg-indigo-50/20">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[#534AB7] block uppercase">
                                      1. Our Original Design was:
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. A cardboard shipping container filter box."
                                      value={pivotOrig19}
                                      onChange={(e) =>
                                        setPivotOrig19(e.target.value)
                                      }
                                      className="w-full text-xs font-semibold border border-black p-2 bg-white uppercase"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[#534AB7] block uppercase">
                                      2. But testing community elders pointed
                                      out that:
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. The cardboard instantly melted and leaked under the torrential rainfall."
                                      value={pivotCrit19}
                                      onChange={(e) =>
                                        setPivotCrit19(e.target.value)
                                      }
                                      className="w-full text-xs font-semibold border border-black p-2 bg-white uppercase"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[#534AB7] block uppercase">
                                      3. Therefore, we pivoted our design to
                                      build:
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. An updated frame incorporating sturdy, flexible local bamboo stalks."
                                      value={pivotSol19}
                                      onChange={(e) =>
                                        setPivotSol19(e.target.value)
                                      }
                                      className="w-full text-xs font-semibold border border-black p-2 bg-white uppercase"
                                    />
                                  </div>
                                </div>
                                <button
                                  disabled={
                                    !pivotOrig19 || !pivotCrit19 || !pivotSol19
                                  }
                                  onClick={() => {
                                    setGamePlayed(true);
                                    playSoundSynth(659, "sine", 0.15);
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  ✓ LOCK PIVOT ARGUMENT & CLAIM LEVEL ADVANCMENT
                                </button>
                              </div>
                            )}

                            {/* WEEK 20: Vocal Projection Drill */}
                            {currentPlan.num === 20 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  DIAPHRAGM LOUDSPEAKING SOUND SIMULATOR:
                                </span>
                                <div className="border-4 border-slate-900 bg-slate-900 text-white p-4 text-center space-y-4">
                                  <div className="space-y-0.5">
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">
                                      MIC PROJECTION LEVEL
                                    </span>
                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase">
                                      STAND Back 10m to test power!
                                    </h5>
                                  </div>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[9px] font-mono text-yellow-300 uppercase">
                                      <span>VOLUME METER COMPLANCE</span>
                                      <span>
                                        {vocalActive20
                                          ? `${vocalDb20} Decibel (dB)`
                                          : "MUTED"}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-6 border-2 border-black flex overflow-hidden rounded-none">
                                      {vocalActive20 ? (
                                        <div
                                          className="bg-gradient-to-r from-teal-400 via-emerald-500 to-red-500 h-full transition-all duration-100"
                                          style={{
                                            width: `${(vocalDb20 / 120) * 100}%`,
                                          }}
                                        />
                                      ) : (
                                        <div className="bg-slate-700 w-1.5 h-full animate-pulse" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        playSoundSynth(440, "sine", 0.05);
                                        setVocalActive20(true);
                                        const interval = setInterval(() => {
                                          setVocalDb20(
                                            Math.floor(Math.random() * 45) + 50,
                                          ); // fluctuate between 50 and 95
                                        }, 150);
                                        setTimeout(() => {
                                          clearInterval(interval);
                                          setVocalActive20(false);
                                          setGamePlayed(true);
                                          playSoundSynth(659, "sine", 0.15);
                                          setTimeout(
                                            () =>
                                              playSoundSynth(880, "sine", 0.25),
                                            100,
                                          );
                                        }, 3000);
                                      }}
                                      className="flex-1 py-1.5 bg-emerald-500 text-slate-900 border-2 border-black font-sans text-[10px] font-black uppercase text-center cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,1)]"
                                    >
                                      🎤 HOLD TO COMMENCE 3-SEC MIC TEST
                                      VERIFICATION
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* WEEK 21: SDG Shark Tank Competition */}
                            {currentPlan.num === 21 && (
                              <div className="space-y-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                                  INTERACTIVE JURY SCORECARD FOR THE SHARK TANK:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border-2 border-slate-200">
                                  {[
                                    {
                                      id: "hook",
                                      label: "Opening Narrative Hook (0-10)",
                                      max: 10,
                                    },
                                    {
                                      id: "feasibility",
                                      label:
                                        "Financial / Revenue Feasibility (0-10)",
                                      max: 10,
                                    },
                                    {
                                      id: "cost",
                                      label:
                                        "Frugality & Material Costs (0-10)",
                                      max: 10,
                                    },
                                    {
                                      id: "resourcefulness",
                                      label:
                                        "Scrap & Resource Recycling (0-10)",
                                      max: 10,
                                    },
                                  ].map((sc) => (
                                    <div key={sc.id} className="space-y-0.5">
                                      <div className="flex justify-between text-[9px] font-black uppercase text-gray-700">
                                        <span>{sc.label}</span>
                                        <span className="font-mono text-emerald-800">
                                          {scores21[sc.id]}/10 PTS
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="1"
                                        max={sc.max}
                                        value={scores21[sc.id]}
                                        onChange={(e) => {
                                          playSoundSynth(
                                            300 + parseInt(e.target.value) * 35,
                                            "sine",
                                            0.04,
                                          );
                                          setScores21((prev) => ({
                                            ...prev,
                                            [sc.id]: parseInt(e.target.value),
                                          }));
                                        }}
                                        className="w-full accent-[#993C1D]"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    setGamePlayed(true);
                                    setScoreCalculated21(true);
                                    playSoundSynth(659, "sine", 0.1);
                                    setTimeout(
                                      () => playSoundSynth(880, "sine", 0.2),
                                      100,
                                    );
                                  }}
                                  className="w-full py-2 bg-black hover:bg-emerald-600 text-white text-[10px] font-black uppercase cursor-pointer"
                                >
                                  ✓ CALCULATE JURY SCOREBOARD ASSESSMENT
                                </button>
                                {scoreCalculated21 && (
                                  <div className="p-3 bg-[#FAECE7] border-2 border-[#993C1D] text-[10.5px] uppercase font-bold text-[#8A3716]">
                                    <strong>
                                      [JUDGES ACCREDITATION REPORT]:
                                    </strong>
                                    <p className="normal-case text-gray-800 mt-0.5 font-semibold">
                                      Total Combined Score:{" "}
                                      <strong className="text-[#993C1D]">
                                        {Object.values(scores21).reduce(
                                          (a, b) => a + b,
                                          0,
                                        )}{" "}
                                        / 40 Points
                                      </strong>
                                      . Your scrap construction achieves stellar
                                      local structural feasibility! Highly
                                      recommended for next-term registry.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* WEEK 22: The Time Capsule Seal */}
                            {currentPlan.num === 22 && (
                              <div className="space-y-3 text-center">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-left">
                                  DRAFT A NOTE CONSOLIDATING COMMITTMENTS TO
                                  YOUR 5-YEAR FUTURE SELF (2031):
                                </span>
                                <div className="relative">
                                  <textarea
                                    placeholder="Write your letter here... e.g. In 2031, I commit to spearheading sustainable community agriculture hubs..."
                                    value={letter22}
                                    disabled={letterSealed22}
                                    onChange={(e) =>
                                      setLetter22(e.target.value)
                                    }
                                    className="w-full h-24 text-[10.5px] font-semibold border-4 border-black p-3 uppercase bg-[#FFFDF9] font-mono shadow-inner resize-none"
                                  />
                                  {letterSealed22 && (
                                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white space-y-1 select-none animate-fadeIn">
                                      <span className="text-3xl animate-bounce">
                                        ✉️
                                      </span>
                                      <h4 className="text-xs font-black uppercase tracking-widest text-yellow-300">
                                        SEALED & ENCLOSED
                                      </h4>
                                      <p className="text-[8px] font-bold text-gray-400 uppercase">
                                        SAFEGUARD LOGGED SECURELY FOR COALITION
                                        REVIEWS ENVELEPE
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <button
                                  disabled={!letter22 || letterSealed22}
                                  onClick={() => {
                                    setLetterSealed22(true);
                                    setGamePlayed(true);
                                    playSoundSynth(300, "sine", 0.15);
                                    setTimeout(
                                      () =>
                                        playSoundSynth(200, "sawtooth", 0.3),
                                      100,
                                    );
                                  }}
                                  className="w-full py-2 bg-black hover:bg-[#BA7517] text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  🔒 SEAL DIGITAL LETTER IN TIME CAPSULE (+150
                                  PTS)
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white border-2 border-dashed border-gray-300 p-4 space-y-3">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                              Patron Verification Checklist
                            </span>

                            <label className="flex items-start gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={gamePlayed}
                                onChange={(e) => {
                                  setGamePlayed(e.target.checked);
                                  playSoundSynth(
                                    e.target.checked ? 659.25 : 329.63,
                                    "sine",
                                    0.08,
                                  );
                                }}
                                className="w-5 h-5 border-2 border-black rounded-none mt-0.5 accent-[#1D9E75] shrink-0"
                              />
                              <div>
                                <span className="text-xs font-black uppercase text-gray-900 block">
                                  Our club played this classroom simulation! 🏆
                                </span>
                                <p className="text-[10px] text-gray-400 normal-case font-semibold mt-0.5">
                                  Check this to unlock the diagnostic quiz.
                                </p>
                              </div>
                            </label>

                            {gamePlayed && (
                              <div className="pt-2.5 border-t border-gray-150 animate-slideUp">
                                <span className="text-[9px] font-black text-gray-400 block uppercase mb-1">
                                  OPTIONAL CLASS NOTES / FEEDBACK:
                                </span>
                                <input
                                  type="text"
                                  placeholder="e.g., highly interactive debate, excellent collaborative arguments"
                                  value={classFeedback}
                                  onChange={(e) =>
                                    setClassFeedback(e.target.value)
                                  }
                                  className="w-full text-xs font-bold border-2 border-black p-2 uppercase placeholder-gray-300"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 3: INTERACTIVE QUIZ DIALOGUE */}
                    {currentSubStep === 3 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="p-3.5 bg-[#F6F5F2] border-2 border-black text-xs font-black uppercase leading-relaxed text-gray-900">
                          <span className="text-[9px] font-black uppercase text-blue-600 block mb-0.5">
                            Diagnostic Evaluation Question
                          </span>
                          {currentPlan.quiz.q}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                          {currentPlan.quiz.opts.map((opt, oIdx) => {
                            let buttonStyle =
                              "bg-white border-2 border-black hover:bg-gray-50";
                            if (hsQuizAnswered) {
                              if (oIdx === currentPlan.quiz.ans) {
                                buttonStyle =
                                  "bg-[#E1F5EE] border-2 border-[#1E9E75] text-[#0F6E56] font-extrabold";
                              } else if (oIdx === hsSelectedQuizOpt) {
                                buttonStyle =
                                  "bg-[#FCEBEB] border-2 border-red-500 text-red-700 font-extrabold";
                              } else {
                                buttonStyle =
                                  "bg-white border border-gray-100 text-gray-300 opacity-50";
                              }
                            } else if (oIdx === hsSelectedQuizOpt) {
                              buttonStyle =
                                "bg-black text-white border-2 border-black";
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={hsQuizAnswered}
                                onClick={() => {
                                  handleOptionClick(oIdx);
                                  if (oIdx === currentPlan.quiz.ans) {
                                    playSoundSynth(523.25, "sine", 0.08);
                                    setTimeout(
                                      () =>
                                        playSoundSynth(659.25, "sine", 0.15),
                                      80,
                                    );
                                  } else {
                                    playSoundSynth(180, "sawtooth", 0.25);
                                  }
                                }}
                                className={`p-3 text-xs text-left transition-all uppercase rounded-none block cursor-pointer font-bold ${buttonStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {hsQuizAnswered && (
                          <div className="p-3.5 bg-gray-50 border-2 border-black text-[10px] font-extrabold leading-relaxed uppercase text-gray-700">
                            {hsSelectedQuizOpt === currentPlan.quiz.ans ? (
                              <span className="text-[#0F6E56] block mb-0.5">
                                ✓ EXCELLENT! CORRECT ANSWER INDICATORS MAPPED:
                              </span>
                            ) : (
                              <span className="text-red-700 block mb-0.5">
                                ✗ INCORRECT. DETAILED SULUTIONS FEEDBACK:
                              </span>
                            )}
                            <p className="font-semibold text-gray-600">
                              {currentPlan.quiz.feedback || currentPlan.quiz.fb}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 4: OUTPUT & SEALS */}
                    {currentSubStep === 4 && (
                      <div className="space-y-4 animate-fadeIn text-center">
                        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-black space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <span className="text-3xl inline-block animate-bounce">
                            🏆
                          </span>
                          <h4 className="text-lg font-black uppercase text-gray-900">
                            Week {currentPlan.num} Sealed!
                          </h4>
                          <p className="text-xs font-semibold text-gray-500 max-w-sm mx-auto uppercase leading-relaxed">
                            Your SDGs club has logged all necessary academic
                            points, played the simulation, and cleared core
                            indicator questions.
                          </p>

                          {!leaguePointsClaimed ? (
                            <button
                              onClick={handleClaimPoints}
                              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 border-2 border-black text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                            >
                              CLAIM 50 LEAGUE POINTS ⭐
                            </button>
                          ) : (
                            <div className="p-3 bg-emerald-100 border-2 border-emerald-400 text-xs font-extrabold text-emerald-800 uppercase max-w-md mx-auto">
                              {claimMessage}
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-slate-100 border-2 border-slate-350 text-left text-[11px] leading-relaxed font-bold uppercase text-gray-700">
                          <span className="text-[10px] font-black text-slate-900 block mb-1">
                            ✓ SECURED PORTFOLIO OUTPUT:
                          </span>
                          {currentPlan.output}
                        </div>
                      </div>
                    )}

                    {/* Progressive buttons controller */}
                    <div className="border-t-2 border-black pt-3 mt-4 flex justify-between items-center bg-white select-none">
                      <button
                        disabled={currentSubStep === 0}
                        onClick={() => {
                          setCurrentSubStep((prev) => prev - 1);
                          playSoundSynth(293.66, "sine", 0.05);
                        }}
                        className={`px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                          currentSubStep === 0
                            ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                            : "bg-white hover:bg-gray-100 text-black"
                        }`}
                      >
                        ← PHASE BACK
                      </button>

                      <span className="text-[9px] font-black uppercase text-gray-400">
                        Step {currentSubStep + 1} of {subSteps.length}
                      </span>

                      {currentSubStep < 4 ? (
                        <button
                          disabled={
                            (currentSubStep === 1 &&
                              currentLessonIndex <
                                currentPlan.lesson.length - 1) ||
                            (currentSubStep === 2 && !gamePlayed) ||
                            (currentSubStep === 3 && !hsQuizAnswered)
                          }
                          onClick={() => {
                            setCurrentSubStep((prev) => prev + 1);
                            playSoundSynth(392, "sine", 0.08);
                          }}
                          className={`px-3 py-1.5 border-2 text-[10px] font-black uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                            (currentSubStep === 1 &&
                              currentLessonIndex <
                                currentPlan.lesson.length - 1) ||
                            (currentSubStep === 2 && !gamePlayed) ||
                            (currentSubStep === 3 && !hsQuizAnswered)
                              ? "opacity-30 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                              : "bg-black text-white hover:bg-gray-800 border-black"
                          }`}
                        >
                          PROCEED STEP →
                        </button>
                      ) : (
                        <button
                          disabled={
                            hsCurrentWeek === HIGH_SCHOOL_WEEKS.length - 1
                          }
                          onClick={() => {
                            if (hsCurrentWeek < HIGH_SCHOOL_WEEKS.length - 1) {
                              const nextWk = hsCurrentWeek + 1;
                              setHsCurrentWeek(nextWk);
                              setSelectedBlockIdx(Math.floor(nextWk / 2));
                              setSubWeekIdx((nextWk % 2) as 0 | 1);
                              setCurrentSubStep(0);
                              setCurrentLessonIndex(0);
                              setGamePlayed(false);
                              setLeaguePointsClaimed(false);
                              setClaimMessage("");
                              setClassFeedback("");
                              setHsQuizAnswered(false);
                              setHsSelectedQuizOpt(null);
                              playSoundSynth(523.25, "sine", 0.15);
                            }
                          }}
                          className={`px-3 py-1.5 border-2 text-[10px] font-black uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                            hsCurrentWeek === HIGH_SCHOOL_WEEKS.length - 1
                              ? "opacity-30 cursor-not-allowed bg-gray-150 border-gray-200 text-gray-400"
                              : "bg-[#E6F1FB] text-[#185FA5] border-[#185FA5] hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          NEXT WEEK ➔
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side Column Stage (Session Context References) */}
                <div className="space-y-4">
                  {/* Timer list */}
                  <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black border-b border-black pb-1.5 flex items-center justify-between">
                      <span>⏰ SESSION CHRONO TIMING</span>
                      <span className="text-[9px] text-[#0F6E56] font-bold">
                        1 HOUR
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {currentPlan.timing.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-[10px] uppercase font-bold border-b border-gray-150 pb-1.5 last:border-0 last:pb-0"
                        >
                          <span className="text-gray-500">{item.l}</span>
                          <span className="bg-black/10 px-1.5 py-0.5 font-black shrink-0">
                            {item.m} Min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Local fact panel */}
                  <div className="bg-[#FFF9EC] border-4 border-black p-4 text-[#854F0B] font-medium text-xs space-y-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] leading-relaxed">
                    <span className="text-[9px] font-black uppercase text-[#BA7517] tracking-wider block">
                      💡 LOCAL INDICATOR INSIGHT
                    </span>
                    <p className="font-semibold text-gray-800">
                      {currentPlan.fact}
                    </p>
                  </div>

                  {/* Materials list */}
                  <div className="bg-white border-4 border-black p-4 space-y-2 pb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
                      💼 CLASSROOM MATERIALS NEEDED:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {currentPlan.materials.map((m, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-extrabold bg-gray-50 text-gray-700 px-2 py-0.5 border border-gray-250"
                        >
                          ✓ {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Patron notes card */}
                  <div className="bg-gray-100 border-4 border-black p-4 text-[10px] font-bold space-y-1">
                    <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">
                      PATRON NOTES:
                    </span>
                    <p className="italic text-gray-650 leading-relaxed uppercase">
                      "{currentPlan.patron_note}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TERM 2 ACTIVE LISTING PANEL DESIGN
          ========================================== */}
      {activeTermTab === "t2" && (
        <div className="space-y-6">
          {!isTerm2Unlocked ? (
            /* SECURE PASSCODE INTERFACE FOR TERM 2 */
            <div className="max-w-md mx-auto bg-slate-900 border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white text-center rounded-none space-y-6 animate-fadeIn py-10 mt-6 select-none animate-fadeIn">
              <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">
                🔒
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 font-black uppercase tracking-widest font-mono">
                  SECURE PASSWORD PROTOCOL
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight italic font-display text-amber-500">
                  Term 2 Is Locked!
                </h3>
                <p className="text-xs font-semibold text-gray-400 uppercase leading-relaxed max-w-sm mx-auto">
                  Enter the educational clearance passcode to unlock the Deep
                  Dive & Community Research modules (Weeks 11–22).
                </p>
              </div>

              <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={term2InputCode}
                    onChange={(e) => {
                      setTerm2InputCode(e.target.value);
                      if (term2CodeError) setTerm2CodeError("");
                    }}
                    placeholder="ENTER CODE (e.g., SYC001X)"
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-700 text-center font-mono font-black uppercase text-sm tracking-widest placeholder-slate-650 focus:border-amber-500 focus:outline-none text-white rounded-none"
                  />
                  <button
                    onClick={() => {
                      if (term2InputCode.trim().toUpperCase() === "SYC001X") {
                        setIsTerm2Unlocked(true);
                        localStorage.setItem("syc_term2_unlocked", "true");
                        playSoundSynth(523, "sine", 0.1);
                        setTimeout(() => playSoundSynth(659, "sine", 0.1), 100);
                        setTimeout(
                          () => playSoundSynth(783, "sine", 0.15),
                          200,
                        );
                      } else {
                        setTerm2CodeError("INVALID CLEARANCE CODE!");
                        playSoundSynth(150, "sawtooth", 0.3);
                      }
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                  >
                    🚀 DECRYPT & UNLOCK
                  </button>
                </div>
                {term2CodeError && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider animate-bounce">
                    ⚠️ {term2CodeError}
                  </p>
                )}
                <p className="text-[9.5px] font-extrabold text-slate-500 uppercase">
                  GUEST CLEARANCE CODE:{" "}
                  <span className="font-mono text-amber-500/90 underline select-all">
                    SYC001X
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5">
                    Current Active Term
                  </span>
                  <h3 className="text-xl font-black uppercase italic tracking-tight font-display mt-2 text-gray-900">
                    Term 2 — Deep Dive & Community Research
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase mt-1">
                    Aligned with weeks 11–22. Focus shifts to field work, design
                    sprints, the Dragon's Den, and modeling localized community
                    prototypes.
                  </p>
                </div>
                <div className="text-right shrink-0 bg-teal-50 border-2 border-teal-600 p-2.5 font-mono text-[10px] text-teal-800 uppercase font-black">
                  ⭐ TERM 2 STATUS: IMMERSION
                </div>
              </div>

              {activeInteractiveWeek === null ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-teal-50 border-2 border-teal-300 p-3.5 text-teal-800 text-xs font-semibold uppercase leading-snug flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(235,253,240,1)]">
                    <span>🔬</span>
                    <span>
                      <strong>COMMUNITY FIELD RESEARCH SESSIONS:</strong>{" "}
                      Complete each week sequentially to unlock subsequent weeks
                      in Term 2.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {HIGH_SCHOOL_WEEKS.slice(10, 22).map((wk, idx) => {
                      const wkNum = wk.num;
                      const isDone = completedWeeks.includes(wkNum);
                      const isUnlocked = isWeekUnlocked(wkNum);
                      // Field weeks are 14, 15, and 18
                      const isField =
                        wkNum === 14 || wkNum === 15 || wkNum === 18;

                      let cardBorder = "border-[#E2E8F0] opacity-50";
                      let bgStyle = "bg-slate-50";

                      if (isUnlocked) {
                        if (isDone) {
                          cardBorder =
                            "border-emerald-500 hover:border-emerald-600 hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(29,158,117,1)]";
                          bgStyle = "bg-[#F3FDF9]";
                        } else {
                          cardBorder = isField
                            ? "border-amber-500 hover:border-amber-600 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(186,117,23,0.15)]"
                            : "border-black hover:border-blue-600 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
                          bgStyle = isField ? "bg-[#FFF9EC]" : "bg-white";
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isUnlocked) {
                              handleLaunchWeek(wkNum);
                            } else {
                              playSoundSynth(150, "sawtooth", 0.3);
                            }
                          }}
                          className={`border-4 p-4 transition-all flex flex-col justify-between space-y-4 rounded-none min-h-[168px] ${
                            isUnlocked ? "cursor-pointer" : "cursor-not-allowed"
                          } ${cardBorder} ${bgStyle}`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span
                                className={`text-[9.5px]/none font-black uppercase px-2 py-0.5 border-2 border-black ${wk.badgeBg} ${wk.badgeColor}`}
                              >
                                Week {wkNum} {isField && "🏕️ [F]"}
                              </span>

                              {isDone ? (
                                <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-400 px-1 rounded-none leading-none pt-0.5 py-0.5">
                                  ✓ DONE
                                </span>
                              ) : isUnlocked ? (
                                <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-400 px-1 rounded-none leading-none pt-0.5 py-0.5 animate-pulse">
                                  ● LAUNCH
                                </span>
                              ) : (
                                <span className="text-[8px] font-black uppercase text-gray-400 border border-gray-200 bg-white px-1 rounded-none leading-none pt-0.5 py-0.5">
                                  🔒 LOCK
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-xs font-black uppercase leading-tight text-gray-950 mt-1">
                                {wk.title}
                              </h4>
                              <p className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 leading-none">
                                {wk.theme}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                            <span className="text-[7.5px] font-black text-slate-500 uppercase font-mono">
                              {wk.sdg}
                            </span>
                            {isUnlocked && (
                              <span className="text-[8px] font-black text-teal-600 uppercase underline">
                                START SESSION ➔
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {activeInteractiveWeek !== null && (
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
                  {/* Upper Interactive Block Sub-header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-black pb-4 gap-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 border border-teal-200">
                        Interactive Class Session Runner (Term 2)
                      </span>
                      <h4 className="text-xl font-black uppercase italic tracking-tight font-display mt-1">
                        💡 Study Platform: {currentPlan.title}
                      </h4>
                      <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest block mt-0.5">
                        THEMATIC CLUSTER Focus: {currentPlan.theme}
                      </span>
                    </div>

                    <div className="bg-black text-[#A0FECB] font-mono text-[9.5px] px-3 py-1 border-2 border-black font-black uppercase tracking-widest rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 select-none">
                      ✓ Aligned with SDGs: {currentPlan.sdg}
                    </div>
                  </div>

                  {/* Stepper Wizard Progress Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-2 border-black bg-gray-50 p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans">
                    {subSteps.map((s, idx) => {
                      const isActive = currentSubStep === idx;
                      const isCompleted =
                        idx < currentSubStep ||
                        (idx === 2 && gamePlayed) ||
                        (idx === 3 && hsQuizAnswered) ||
                        (idx === 4 && leaguePointsClaimed);
                      const unlocked = canGoToStep(idx);

                      return (
                        <button
                          key={idx}
                          disabled={!unlocked}
                          onClick={() => {
                            setCurrentSubStep(idx);
                            playSoundSynth(349.23 + idx * 50, "sine", 0.05);
                          }}
                          className={`p-2 border-2 text-center text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? "bg-black text-white border-black"
                              : isCompleted
                                ? "bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56] hover:bg-[#d6f0e7]"
                                : unlocked
                                  ? "bg-white border-black hover:bg-gray-50 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                                  : "bg-gray-100 border-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
                          }`}
                          title={
                            !unlocked
                              ? "Complete the previous milestone to unblock!"
                              : ""
                          }
                        >
                          <span className="text-xs">
                            {unlocked ? s.icon : "🔒"}
                          </span>
                          <span className="truncate">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Stage content split */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    {/* Left Column Stage (Main Interaction - spans 2) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border-4 border-black p-5 md:p-6 min-h-[310px] flex flex-col justify-between">
                        {/* Step Inner Header */}
                        <div className="border-b-2 border-dashed border-gray-200 pb-3 mb-4 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-teal-800">
                            Active Phase: {subSteps[currentSubStep].name}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase">
                            WEEK {currentPlan.num} · {currentPlan.theme}
                          </span>
                        </div>

                        {/* STEP 0: OBJECTIVES */}
                        {currentSubStep === 0 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="p-3 bg-gray-50 border-l-4 border-teal-600">
                              <p className="text-[11px] font-bold text-gray-650 uppercase leading-relaxed">
                                Welcome Club Members! Today, we study Week{" "}
                                {currentPlan.num}. First, let's explore our
                                central socratic objectives.
                              </p>
                            </div>
                            <div className="space-y-2.5 pt-1">
                              {currentPlan.objectives.map((obj, i) => (
                                <div
                                  key={i}
                                  className="flex gap-3 items-start text-xs font-semibold text-gray-750"
                                >
                                  <span className="text-[10px] font-black text-teal-850 bg-teal-50 border border-teal-200 w-5 h-5 flex items-center justify-center rounded-none shrink-0">
                                    0{i + 1}
                                  </span>
                                  <p className="leading-snug pt-0.5">{obj}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* STEP 1: LESSON SLIDES */}
                        {currentSubStep === 1 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="bg-slate-900 border-4 border-black p-5 text-white min-h-[170px] flex flex-col justify-between select-none relative shadow-inner">
                              <div className="absolute top-2 right-2 flex gap-1.5 font-mono text-[8.5px] text-gray-400">
                                <span>TERMCRAFT DECK SYSTEM</span>
                              </div>
                              <div className="space-y-2">
                                <span className="text-[8.5px] font-black text-teal-400 block uppercase tracking-widest">
                                  SLIDECRAFT MEMORIAL CONCEPT
                                </span>
                                <p className="text-sm font-black uppercase tracking-tight italic font-display text-gray-100 leading-snug">
                                  "{currentPlan.lesson[currentLessonIndex]}"
                                </p>
                              </div>
                              <div className="text-[8px] font-mono text-gray-550 pt-2 border-t border-slate-800 uppercase">
                                STUDENT CORE SLIDE BRIEF · DISCUSS WITH ACADEMY
                                GROUP
                              </div>
                            </div>

                            {/* Click control to slide deck */}
                            <div className="flex justify-between items-center pt-1.5 select-none">
                              <button
                                disabled={currentLessonIndex === 0}
                                onClick={() => {
                                  setCurrentLessonIndex((prev) => prev - 1);
                                  playSoundSynth(293.66, "sine", 0.05);
                                }}
                                className={`px-3 py-1 border-2 border-black text-[10px] font-black uppercase transition-all cursor-pointer ${
                                  currentLessonIndex === 0
                                    ? "opacity-30 cursor-not-allowed bg-gray-50"
                                    : "bg-white hover:bg-gray-100"
                                }`}
                              >
                                ← BACK SLIDE
                              </button>
                              <span className="text-[9px] font-black text-gray-400 uppercase">
                                Slide {currentLessonIndex + 1} of{" "}
                                {currentPlan.lesson.length}
                              </span>
                              {currentLessonIndex <
                              currentPlan.lesson.length - 1 ? (
                                <button
                                  onClick={() => {
                                    setCurrentLessonIndex((prev) => prev + 1);
                                    playSoundSynth(329.63, "sine", 0.05);
                                  }}
                                  className="px-3 py-1 border-2 border-black bg-white hover:bg-slate-950 hover:text-white text-[10px] font-black uppercase transition-all cursor-pointer"
                                >
                                  NEXT SLIDE →
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setCurrentSubStep(2);
                                    playSoundSynth(523.25, "sine", 0.12);
                                  }}
                                  className="px-3 py-1 border-2 border-teal-600 bg-teal-50 text-teal-800 text-[10px] font-black uppercase transition-all cursor-pointer"
                                >
                                  OPEN GAME 🎲
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* STEP 2: CLASS GAME / SIMULATION CHECKLIST */}
                        {currentSubStep === 2 && (
                          <div className="space-y-4 animate-fadeIn">
                            <p className="text-xs font-bold text-gray-650 uppercase leading-relaxed">
                              Our specialized game/simulation module for Week{" "}
                              {currentPlan.num} is active above in the central
                              sandbox console. Please interact with the console
                              interface directly to complete!
                            </p>
                          </div>
                        )}

                        {/* STEP 3: INTERACTIVE QUIZ DIALOGUE */}
                        {currentSubStep === 3 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="p-3.5 bg-[#F6F5F2] border-2 border-black text-xs font-black uppercase leading-relaxed text-gray-900">
                              <span className="text-[9px] font-black uppercase text-blue-600 block mb-0.5">
                                Diagnostic Evaluation Question
                              </span>
                              {currentPlan.quiz.q}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                              {currentPlan.quiz.opts.map((opt, oIdx) => {
                                let buttonStyle =
                                  "bg-white border-2 border-black hover:bg-gray-50";
                                if (hsQuizAnswered) {
                                  if (oIdx === currentPlan.quiz.ans) {
                                    buttonStyle =
                                      "bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56] font-bold";
                                  } else if (hsSelectedQuizOpt === oIdx) {
                                    buttonStyle =
                                      "bg-[#FBEAF0] border-red-500 text-red-700 font-bold";
                                  } else {
                                    buttonStyle =
                                      "bg-white opacity-40 border-gray-250 cursor-not-allowed";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    disabled={hsQuizAnswered}
                                    onClick={() => {
                                      handleOptionClick(oIdx);
                                      playSoundSynth(
                                        oIdx === currentPlan.quiz.ans
                                          ? 783.99
                                          : 329.63,
                                        "sine",
                                        0.1,
                                      );
                                    }}
                                    className={`p-3 text-left text-[10.5px] uppercase tracking-tight transition-all font-black flex items-start gap-2.5 cursor-pointer ${buttonStyle}`}
                                  >
                                    <span className="text-xs shrink-0">
                                      {String.fromCharCode(65 + oIdx)}.
                                    </span>
                                    <span className="leading-tight pt-0.5">
                                      {opt}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Display response status feedback */}
                            {hsQuizAnswered && (
                              <div className="p-3.5 border-l-4 bg-[#F2F1FD] border-[#534AB7] text-[10.5px] text-gray-700 uppercase font-bold leading-relaxed animate-slideUp">
                                <strong>EXAMINER FEEDBACK:</strong>{" "}
                                <span className="text-gray-900">
                                  {currentPlan.quiz.fb ||
                                    currentPlan.quiz.feedback}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* STEP 4: OUTPUT SUBMIT SUCCESS */}
                        {currentSubStep === 4 && (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="text-center p-3 sm:p-5 bg-[#E1F5EE] border-4 border-[#1D9E75] space-y-3">
                              <span className="text-4xl block animate-bounce">
                                🏆
                              </span>
                              <div className="space-y-0.5 text-center">
                                <h4 className="text-md font-black uppercase italic tracking-tight text-[#0F6E56]">
                                  Milestone Registered!
                                </h4>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">
                                  OFFICIALLY UNLOCKED HIGH CHAPTER ACCREDITATION
                                </p>
                              </div>
                            </div>

                            {/* Display Action Output Report Card */}
                            <div className="border-2 border-black bg-slate-50 p-4 space-y-2 font-mono text-[9.5px]">
                              <span className="text-[8px] font-black text-gray-400 block uppercase">
                                SESSION FINALIZED PORTFOLIO PRODUCT
                              </span>
                              <h4 className="font-bold text-gray-950 uppercase">
                                {currentPlan.output}
                              </h4>
                              <p className="text-gray-550 leading-relaxed uppercase pt-1">
                                Excellent work! Socratic debrief questions,
                                physical compound walk documentation notes, and
                                evaluations are consolidated into your District
                                SDG Scoreboard.
                              </p>
                            </div>

                            <div className="pt-2 select-none">
                              {!leaguePointsClaimed ? (
                                <button
                                  onClick={handleClaimPoints}
                                  className="w-full py-2.5 bg-black hover:bg-teal-600 text-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
                                >
                                  ✓ CLAIM 50 LEAGUE POINTS & SEAL WEEK
                                </button>
                              ) : (
                                <div className="p-3 bg-teal-50 border border-teal-200 text-[#0F6E56] text-[10px] font-black uppercase tracking-tight text-center leading-relaxed">
                                  {claimMessage}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-150 flex justify-between select-none">
                          <button
                            disabled={currentSubStep === 0}
                            onClick={() => {
                              setCurrentSubStep((prev) => prev - 1);
                              playSoundSynth(311.13, "sine", 0.08);
                            }}
                            className={`px-3 py-1 border-2 border-black text-[10px] font-black uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                              currentSubStep === 0
                                ? "opacity-35 cursor-not-allowed bg-gray-50"
                                : "bg-white hover:bg-gray-100 cursor-pointer"
                            }`}
                          >
                            ← PREV PHASE
                          </button>

                          {currentSubStep < 4 ? (
                            <button
                              disabled={
                                (currentSubStep === 1 &&
                                  currentLessonIndex <
                                    currentPlan.lesson.length - 1) ||
                                (currentSubStep === 2 && !gamePlayed) ||
                                (currentSubStep === 3 && !hsQuizAnswered)
                              }
                              onClick={() => {
                                setCurrentSubStep((prev) => prev + 1);
                                playSoundSynth(392, "sine", 0.08);
                              }}
                              className={`px-3 py-1.5 border-2 text-[10px] font-black uppercase transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                                (currentSubStep === 1 &&
                                  currentLessonIndex <
                                    currentPlan.lesson.length - 1) ||
                                (currentSubStep === 2 && !gamePlayed) ||
                                (currentSubStep === 3 && !hsQuizAnswered)
                                  ? "opacity-30 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                                  : "bg-black text-white hover:bg-gray-800 border-black cursor-pointer"
                              }`}
                            >
                              NEXT STEP →
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 uppercase select-none border border-emerald-300 leading-none flex items-center justify-center">
                              ★ COMPACTLY COMPLETED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column Stage (Auxiliary side Information) */}
                    <div className="space-y-4 font-sans">
                      {/* Micro Timing Chrono */}
                      <div className="bg-white border-4 border-black p-4 space-y-2.5 pb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h4 className="text-xs font-black uppercase tracking-wider text-black border-b border-black pb-1.5 flex items-center justify-between">
                          <span>⏰ SESSION CHRONO TIMING</span>
                          <span className="text-[9px] text-[#0F6E56] font-bold">
                            1 HOUR
                          </span>
                        </h4>
                        <div className="space-y-2">
                          {currentPlan.timing.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-[10px] uppercase font-bold border-b border-gray-150 pb-1.5 last:border-0 last:pb-0"
                            >
                              <span className="text-gray-500">{item.l}</span>
                              <span className="bg-black/10 px-1.5 py-0.5 font-black shrink-0">
                                {item.m} Min
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Local fact panel */}
                      <div className="bg-[#FFF9EC] border-4 border-black p-4 text-[#854F0B] font-medium text-xs space-y-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] leading-relaxed">
                        <span className="text-[9px] font-black uppercase text-[#BA7517] tracking-wider block">
                          💡 LOCAL INDICATOR INSIGHT
                        </span>
                        <p className="font-semibold text-[#854F0B]">
                          {currentPlan.fact}
                        </p>
                      </div>

                      {/* Materials list */}
                      <div className="bg-white border-4 border-black p-4 space-y-2 pb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
                          💼 CLASSROOM MATERIALS NEEDED:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentPlan.materials.map((m, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-extrabold bg-gray-50 text-gray-700 px-2 py-0.5 border border-gray-250"
                            >
                              ✓ {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Patron notes card */}
                      <div className="bg-gray-100 border-4 border-black p-4 text-[10px] font-bold space-y-1">
                        <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">
                          PATRON NOTES:
                        </span>
                        <p className="italic text-gray-650 leading-relaxed uppercase text-[9px]">
                          "{currentPlan.patron_note}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TERM 3 ACTIVE LISTING PANEL DESIGN
          ========================================== */}
      {activeTermTab === "t3" && (
        <div className="space-y-6">
          {!isTerm3Unlocked ? (
            /* SECURE PASSCODE INTERFACE FOR TERM 3 */
            <div className="max-w-md mx-auto bg-slate-900 border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white text-center rounded-none space-y-6 animate-fadeIn py-10 mt-6 select-none">
              <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">
                🔑
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 font-black uppercase tracking-widest font-mono">
                  SECURE PASSWORD PROTOCOL
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight italic font-display text-amber-500">
                  Term 3 Is Locked!
                </h3>
                <p className="text-xs font-semibold text-gray-400 uppercase leading-relaxed max-w-sm mx-auto">
                  Enter the global submission clearance passcode to unlock the
                  Sustain & Celebrate module (Weeks 23–24).
                </p>
              </div>

              <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={term3InputCode}
                    onChange={(e) => {
                      setTerm3InputCode(e.target.value);
                      if (term3CodeError) setTerm3CodeError("");
                    }}
                    placeholder="ENTER CODE (e.g., SYC002X)"
                    className="w-full px-4 py-2.5 bg-slate-800 border-2 border-slate-700 text-center font-mono font-black uppercase text-sm tracking-widest placeholder-slate-650 focus:border-amber-500 focus:outline-none text-white rounded-none"
                  />
                  <button
                    onClick={() => {
                      if (term3InputCode.trim().toUpperCase() === "SYC002X") {
                        setIsTerm3Unlocked(true);
                        localStorage.setItem("syc_term3_unlocked", "true");
                        playSoundSynth(523, "sine", 0.1);
                        setTimeout(() => playSoundSynth(659, "sine", 0.1), 100);
                        setTimeout(
                          () => playSoundSynth(783, "sine", 0.15),
                          200,
                        );
                      } else {
                        setTerm3CodeError("INVALID CLEARANCE CODE!");
                        playSoundSynth(150, "sawtooth", 0.3);
                      }
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                  >
                    🚀 CONNECT DATABASE
                  </button>
                </div>
                {term3CodeError && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider animate-bounce">
                    ⚠️ {term3CodeError}
                  </p>
                )}
                <p className="text-[9.5px] font-extrabold text-slate-500 uppercase">
                  SUBMISSION GATE PASSCODE:{" "}
                  <span className="font-mono text-amber-500/90 underline select-all">
                    SYC002X
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5">
                  Current Active Term
                </span>
                <h3 className="text-xl font-black uppercase italic tracking-tight font-display mt-2 text-gray-900">
                  Term 3 — Submit & Celebrate
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase mt-1">
                  Aligned with week 23–24. Final step for elite school chapters:
                  Upload your verified prototype directly into the 1 Million SDG
                  Solutions Portal!
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedTerm3Block(0);
                  playSoundSynth(523, "sine", 0.1);
                }}
                className={`cursor-pointer border-4 p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between max-w-xl mx-auto space-y-4 ${
                  selectedTerm3Block === 0
                    ? "border-[#1D9E75] bg-[#F3FDF9]"
                    : "border-black bg-white hover:-translate-y-1"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="p-1 border-2 border-black bg-amber-50">
                      <Rocket className="w-5 h-5 text-amber-600" />
                    </span>
                    <span className="text-[8.5px] font-black text-amber-800 uppercase px-2 py-0.5 border border-amber-300 bg-amber-100">
                      National Mapped
                    </span>
                  </div>
                  <h4 className="text-sm font-black uppercase text-gray-950">
                    Week 1–2 of Term 3: Final Submission
                  </h4>
                  <p className="text-xs text-gray-500 uppercase font-semibold leading-relaxed">
                    Connect directly with the country-wide Youth Coalition
                    database to register your sustainable model.
                  </p>
                </div>
                <span className="text-[9px] font-black uppercase bg-slate-900 text-white px-3 py-1 w-max">
                  {portalSubmitted
                    ? "✓ SOLUTIONS SUBMITTED"
                    : "LAUNCH PORTAL UPLOADER"}
                </span>
              </div>

              {/* Term 3 Sandbox Portal */}
              {selectedTerm3Block === 0 && (
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 max-w-2xl mx-auto animate-fadeIn">
                  <div className="border-b-2 border-black pb-3 text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 bg-amber-105 border border-amber-300 px-2 leading-none">
                      VIRTUAL ACCESS GATEWAY
                    </span>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight mt-1">
                      🌐 1 Million SDG Solutions Portal
                    </h3>
                    <p className="text-xs text-gray-550 font-semibold uppercase max-w-md mx-auto leading-relaxed mt-1">
                      Publish your verified project prototype to secure your
                      official Coalition validation certificate and unlocked
                      status.
                    </p>
                  </div>

                  {!portalSubmitted ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-700 block uppercase">
                            Coalition Project Title:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mbale Bamboo Soil Barriers"
                            value={portalProjName}
                            onChange={(e) => setPortalProjName(e.target.value)}
                            className="w-full text-xs font-bold border-2 border-black p-2 bg-white uppercase"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-700 block uppercase">
                            Deployment Regional Location:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Wanale Subcounty, Mbale District"
                            value={portalLocation}
                            onChange={(e) => setPortalLocation(e.target.value)}
                            className="w-full text-xs font-bold border-2 border-black p-2 bg-white uppercase"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 border-2 border-yellow-300 text-[10px] font-semibold text-yellow-800 uppercase leading-relaxed">
                        ⚡ <strong>COALITION RULE:</strong> Uploading awards
                        +200 chapter score points and submits your files into
                        selection rounds for seed youth micro-grants ($150 USD).
                      </div>

                      <button
                        onClick={() => {
                          if (!portalProjName || !portalLocation) {
                            alert(
                              "Please specify the Project Title and Regional Location first!",
                            );
                            return;
                          }
                          setPortalSubmitted(true);
                          playSoundSynth(523, "sine", 0.1);
                          setTimeout(
                            () => playSoundSynth(659, "sine", 0.1),
                            100,
                          );
                          setTimeout(
                            () => playSoundSynth(783.99, "sine", 0.1),
                            200,
                          );
                          setTimeout(
                            () => playSoundSynth(1046.5, "sine", 0.4),
                            300,
                          ); // final high C major chord
                        }}
                        className="w-full py-3 bg-black hover:bg-amber-600 text-white font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
                      >
                        🚀 SUBMIT TO 1 MILLION SDG SOLUTIONS DATABASE
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-slate-50 border-4 border-dashed border-[#1D9E75] space-y-4 animate-fadeIn">
                      <div className="w-16 h-16 bg-[#E1F5EE] border-2 border-[#1D9E75] rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                        ✓
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xl font-black uppercase italic text-[#0F6E56]">
                          Validation Certificate Issued!
                        </h4>
                        <p className="text-xs font-extrabold text-gray-500 uppercase">
                          Project{" "}
                          <span className="text-black font-black">
                            "{portalProjName}"
                          </span>{" "}
                          is officially verified under ID{" "}
                          <span className="underline text-[#185FA5]">
                            UG-2026-{Math.floor(Math.random() * 9000) + 1000}
                          </span>
                          .
                        </p>
                      </div>

                      <p className="text-[11px] font-semibold text-gray-600 max-w-md mx-auto leading-relaxed uppercase">
                        YOUR CLUB CHAPTER REGISTERED +200 COALITION LEAGUE
                        POINTS! CERTIFICATE EXPORTS & SEED Micro-grant
                        APPLICABILITY INITIATED SUCCESSFULLY.
                      </p>

                      <button
                        onClick={() => {
                          setPortalSubmitted(false);
                          setPortalProjName("");
                          setPortalLocation("");
                        }}
                        className="px-4 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-[10px] font-black uppercase transition-all cursor-pointer"
                      >
                        Submit Another Project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// UNIVERSITY ROADMAP VIEW COMPONENT
// ==========================================

export function UniversityRoadmapView() {
  const [curSemester, setCurSemester] = useState<1 | 2>(1);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(0);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    "syllabus" | "slides" | "quiz"
  >("syllabus");
  const [slideIndex, setSlideIndex] = useState<number>(0);

  // Quiz states
  const [userAnsIdx, setUserAnsIdx] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAttempted, setQuizAttempted] = useState<boolean>(false);

  const playLocalSound = (
    freq = 440,
    type: OscillatorType = "sine",
    duration = 0.15,
  ) => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration,
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context restricted or not supported
    }
  };

  const universityMonths = [
    {
      num: 1,
      sem: 1,
      title: "SDGs, NDPIV & Uganda's development story",
      theme: "Policy literacy & orientation",
      sdg: "All SDGs · NDPIV Mapped",
      badgeBg: "bg-[#E6F1FB]",
      badgeColor: "text-[#0C447C]",
      weeks: [
        { name: "Week 1", title: "SDG orientation & membership drive" },
        { name: "Week 2", title: "Uganda's NDPIV — pillars, targets, gaps" },
        { name: "Week 3", title: "Voluntary National Review analysis" },
        { name: "Week 4", title: "Policy Hackathon + thematic area selection" },
      ],
      objectives: [
        "Map Uganda's NDPIV pillars to specific SDGs with evidence from national data",
        "Analyse Uganda's Voluntary National Review (VNR) to identify progress and gaps",
        "Select a thematic area and draft a preliminary problem statement",
        "Understand the role of civil society, youth, and research in national development",
      ],
      lessons: [
        "Orientation: Introduce the SDG Club's purpose, year structure, and the 1 Million SDG Solutions goal. Elect student leadership (President, Secretary, Research Lead, Communications Lead).",
        "NDPIV deep dive: Uganda's five NDPIV pillars mapped against the 17 SDGs. Learn from advisors about the National Planning Authority (NPA) and national policy targets.",
        "VNR Analysis: Uganda's 2023 Voluntary National Review is publicly available. Learn to analyze progress, structural gaps, and youth contributions.",
        "Policy Hackathon: Group brainstorm to rewrite NDPIV targets into clear local statements. Vote on the most compelling contribution and lock key research project selections.",
      ],
      game: {
        name: "Policy Hackathon",
        how: "Each group receives one NDPIV pillar. Task: translate one complex NDPIV target into a 3-sentence plain-language summary that a local citizen could understand. Then add: 'As youth, we will contribute by...' Groups present their rewrite and contribution pledge. Audience votes on clarity and impact.",
      },
      quiz: {
        q: "Uganda's NDPIV is coordinated by which national body?",
        opts: [
          "Ministry of Finance, Planning and Economic Development",
          "National Planning Authority (NPA)",
          "Office of the President",
          "Uganda Bureau of Statistics (UBOS)",
        ],
        ans: 1,
        fb: "The National Planning Authority (NPA) coordinates Uganda's National Development Plans. They also produce progress reports and consult widely — including with youth. Student clubs can formally submit input to NPA consultations.",
      },
      fact: "Uganda's 2023 VNR was presented at the UN High-Level Political Forum in New York. It was one of only 36 countries to present that year, specifically highlighting youth SDG contributions.",
      output:
        "Thematic Area Selection Form & 3-Sentence Problem statement draft & Club Leadership structure.",
      materials: [
        "Uganda 2023 VNR (key printed sections or online PDF)",
        "NDPIV Priority Summary Brief",
        "Club membership rosters & voting sheets",
      ],
      patron:
        "Invite a National Planning Authority officer or university development studies lecturer. Most are willing to engage student clubs for free. Send a formal invitation on university letterhead greenlighted by the patron.",
    },
    {
      num: 2,
      sem: 1,
      title: "Research methods & community ethics",
      theme: "Academic research skills",
      sdg: "SDG 17 · SDG 16",
      badgeBg: "bg-[#E6F1FB]",
      badgeColor: "text-[#0C447C]",
      weeks: [
        { name: "Week 1", title: "Quantitative vs qualitative research" },
        { name: "Week 2", title: "Survey & interview design" },
        { name: "Week 3", title: "Uganda data sources — UBOS, DHIS2, NEMA" },
        { name: "Week 4", title: "Ethics, consent & community protocols" },
      ],
      objectives: [
        "Distinguish between quantitative and qualitative research approaches",
        "Design a valid research tool (survey or interview guide) for a real Uganda SDG topic",
        "Navigate Uganda's key data sources: UBOS, Uganda DHS, DHIS2, NEMA, MoES",
        "Understand research ethics including informed consent and community protocols",
      ],
      lessons: [
        "Research fundamentals: Learn to mix quantitative approaches (numbers, data, trends) with qualitative approaches (stories, meaning, human experiences) to construct robust studies.",
        "Tool design workshop: Draft precise survey questionnaires and open-ended interview guides. Swap tools with peer teams to identify bias, jargon, or leading questions.",
        "Uganda data safari: Live training navigating official portals: UBOS.go.ug, DHIS2 (health), NEMA reports. Participate in the 'Data Detectives' indicators speedrun.",
        "Ethics and community protocols: Formulate informed consent policies, ensure anonymity, and observe local cultural channels (interacting with LC1, elders, RDC/District protocols).",
      ],
      game: {
        name: "Data Detectives",
        how: "Each group gets 15 minutes to search and find: (1) The Uganda district with the highest rate of their chosen problem (e.g. stunting, school dropout, deforestation). (2) One UBOS statistic published in the last 3 years. (3) A trend line — is the problem getting better or worse? Groups present findings in 90 seconds.",
      },
      quiz: {
        q: "Uganda's main source of nationally representative health and population data is produced jointly by the Uganda Bureau of Statistics and which international programme?",
        opts: [
          "UNICEF Multiple Indicator Cluster Surveys (MICS)",
          "WHO STEPS Survey",
          "Uganda Demographic and Health Survey (UDHS)",
          "World Bank Living Standards Survey",
        ],
        ans: 2,
        fb: "The Uganda Demographic and Health Survey (UDHS) — conducted approximately every 5 years — is the gold standard for health, fertility, nutrition, and gender data in Uganda. The most recent is UDHS 2022.",
      },
      fact: "Uganda's UBOS website contains over 400 open datasets — from agricultural surveys to census maps. Citing real UBOS metrics elevates student project credibility higher than standard consultancy reports.",
      output:
        "Validated Research Tool Outline (Survey + Interview Guide) & Cited National Baseline Cheat Sheet",
      materials: [
        "Laptops / mobile phones with web access",
        "Ethics consent forms & local IRB guidelines",
      ],
      patron:
        "Check whether your university requires internal ethical clearance for student studies. At Makerere, tasks clear through the IRB. Plan ahead to ensure absolute compliance with academic guidelines.",
    },
    {
      num: 3,
      sem: 1,
      title: "Community fieldwork — 3 dedicated field days",
      theme: "Community immersion",
      sdg: "SDG 17 · All thematic SDGs",
      badgeBg: "bg-[#E6F1FB]",
      badgeColor: "text-[#0C447C]",
      weeks: [
        { name: "Field Day 1", title: "Community orientation & observation" },
        { name: "Club Week", title: "Mid-fieldwork debrief & tool revision" },
        { name: "Field Day 2", title: "In-depth interviews & survey rollout" },
        { name: "Field Day 3", title: "Focus group & data validation" },
      ],
      objectives: [
        "Conduct a 3-phase community research process: observation, interviews, focus group",
        "Collect data from at least 30 community members across diverse demographics",
        "Validate research findings with the community before analysis",
        "Produce a rigorous community research report suitable for academic and policy audiences",
      ],
      lessons: [
        "Field Day 1 — Orientation & observation: Arrive, introduce the team to LC1 or community leader. Walk the area, map physical coordinates, inspect local resources, and host 5 informal introductory conversations.",
        "Club Week — Mid-fieldwork debrief: Tally initial notes, discuss roadblocks, revise wording of questionnaire parameters, and coordinate interview slots for Field Days 2 & 3.",
        "Field Day 2 — In-depth interviews & surveys: Deploy teams to collect structured surveys (minimum 20 respondents) and host 5 detailed stakeholder interviews representing diverse viewpoints.",
        "Field Day 3 — Focus group & validation: Host a 90-minute target focus group to present your preliminary outlines. Reciprocate access by getting direct community feedback on whether assumptions hold.",
      ],
      game: {
        name: "Community Asset Mapping",
        how: "On Field Day 1, groups compile a schematic hand-drawn map. Map points reflect: key water access sites, local safety zones, clinics, and waste heaps. Overlay these with red dots demonstrating high-deprivation spaces.",
      },
      quiz: {
        q: "In community research, what is the purpose of a 'validation' session with community members?",
        opts: [
          "To get official community representative seal before publishing",
          "To check whether your preliminary findings reflect their actual, lived experience",
          "To bypass university institutional IRB approval checks",
          "To recruit more survey respondents",
        ],
        ans: 1,
        fb: "Validation ensures your findings are accurate from the community's perspective — communities often correct researcher biases. It builds genuine trust and respect, paving the path to long-term community adoption.",
      },
      fact: "Participatory Action Research (PAR) — where communities are co-owners of research, rather than just acting as subjects — was pioneered in part by Ugandan scholars at Makerere in the 1980s.",
      output:
        "Hand-Sketched Community Asset Map & 2,000-Word Empirical Study Manuscript & Data Matrices",
      materials: [
        "Team fieldwork logbooks & pens",
        "Consented voice recorders / note-sheets",
      ],
      patron:
        "The patron must establish proper community contact and obtain written approval from the area LC1 before fieldwork begins. Partnering with established district NGOs eases entry.",
    },
    {
      num: 4,
      sem: 1,
      title: "Thematic deep dives — all 6 areas",
      theme: "Expert knowledge building",
      sdg: "SDG 5 · 13 · 3 · 4 · 16 · 8",
      badgeBg: "bg-[#E6F1FB]",
      badgeColor: "text-[#0C447C]",
      weeks: [
        { name: "Week 1", title: "Gender equality & health (SDG 5, 3)" },
        { name: "Week 2", title: "Climate action & environment (SDG 13, 15)" },
        { name: "Week 3", title: "Human capital & peace (SDG 4, 16)" },
        { name: "Week 4", title: "Entrepreneurship & innovation (SDG 8, 9)" },
      ],
      objectives: [
        "Develop expert-level knowledge of all 6 thematic areas in the Uganda context",
        "Engage with practitioners, researchers, and policymakers working on each theme",
        "Connect thematic knowledge to the group's specific research findings",
        "Produce a thematic position paper grounded in evidence and community research",
      ],
      lessons: [
        "Gender & Health study: Deep dive into domestic violence, reproductive health, and structural water issues. Discuss why indicators vary wildly across Ugandan sub-regions.",
        "Climate & Environment commitments: Examine Uganda's greenhouse gas footprints, national adaptive policy commitments (NDCs), and ecological trade-offs (such as oil vs ecosystem preservation).",
        "Human Capital & Peace frameworks: Analyze the post-conflict recoveries in the North, Karamoja disarmament, and refugee integration in settlements (like Bidi Bidi).",
        "Entrepreneurship & Innovation pathways: Meet incubator leaders and study the legal frameworks behind youth credit programs, SACCOs, and digital startup ecosystems.",
      ],
      game: {
        name: "Inter-department SDG Quiz",
        how: "Host a multi-round trivia clash. Assemble teams of 4 from different university departments (e.g. Law, Medicine, Agriculture, Engineering). Test them on UBOS stats, climatic history, and treaty terms.",
      },
      quiz: {
        q: "Uganda's Bidi Bidi refugee settlement in Yumbe District is notable for being which of the following?",
        opts: [
          "Uganda's oldest refugee settlement, established in 1985",
          "The world's largest refugee settlement, hosting over 270,000 refugees",
          "The only settlement with a direct university campus",
          "The first settlement to achieve food self-sufficiency",
        ],
        ans: 1,
        fb: "Bidi Bidi in Yumbe is the world's largest refugee settlement, hosting over 270,000 South Sudanese refugees. Uganda's open-door refugee policy allows work, movement, and land usage.",
      },
      fact: "Uganda's startup ecosystem is growing rapidly: local hubs like Kampala's Innovation Village have incubated over 300 active startups with combined valuations exceeding 50 million USD.",
      output:
        "Thematic Position Paper (800 Words and evidence-based policy proposals)",
      materials: [
        "Printed policy briefs across the 6 themes",
        "Invitation card templates for expert speakers",
      ],
      patron:
        "Encourage different faculties to present. Formally invite key development practitioners, local ministry officers, and successful alumni to add real-world texture.",
    },
    {
      num: 5,
      sem: 2,
      title: "Innovation & design thinking — SDG Sprint",
      theme: "Solution design",
      sdg: "SDG 9 · SDG 17",
      badgeBg: "bg-[#EEEDFE]",
      badgeColor: "text-[#3C3489]",
      weeks: [
        { name: "Week 1", title: "Design thinking at university level" },
        { name: "Week 2", title: "Theory of Change workshop" },
        { name: "Week 3", title: "48-hour SDG Sprint" },
        { name: "Week 4", title: "Sprint showcase & peer review" },
      ],
      objectives: [
        "Apply human-centred design thinking to a real Uganda SDG problem",
        "Develop a Theory of Change connecting the solution to measurable impact",
        "Complete a 48-hour intensive solution sprint — from problem to prototype",
        "Give and receive rigorous academic peer review on solution designs",
      ],
      lessons: [
        "University-grade design thinking: Study models of eco-innovation from local hubs. Set high standards of evidence-backed engineering.",
        "Theory of Change structure: Define chronological progression: Inputs → Activities → Outputs → Outcomes → Impact. Draft key assumptions and mitigate failure factors.",
        "48-hour SDG Sprint: Friday afternoon to Sunday evening intensive. Immerse in physical or digital mockup creation under time and mentor constraints.",
        "Sprint peer review: Pitch before student and faculty panels. Implement rigorous scoring rubrics assessing feasibility, economic metrics, and ecological footprints.",
      ],
      game: {
        name: "48-hour SDG Sprint",
        how: "Run a weekend hackathon. Structure the 48 hours: Hours 1-6 map problem scope. Hours 7-18 focus on rapid model draft. Hours 19-36 focus on trial runs with students. Hours 37-48 refine the pitch deck and 5-min video showcase.",
      },
      quiz: {
        q: "In a Theory of Change, what is the difference between an 'output' and an 'outcome'?",
        opts: [
          "They are interchangeable terms used by non-profits",
          "An output is the direct product of an activity; an outcome is the broader systemic change that results",
          "Outputs are long-term indicators; outcomes are short-term metrics",
          "Outputs are created by the government; outcomes are created by local NGOs",
        ],
        ans: 1,
        fb: "An output is what you produce (e.g. '200 women trained in financial literacy'). An outcome is the result (e.g. 'women increase household savings by 30%'). Systems track outcomes!",
      },
      fact: "The FCDO (formerly DFID) in Uganda was among the first global development programs to require a logical Theory of Change for all funded projects after studies showed 60% of programs hit outputs but missed outcomes.",
      output:
        "Working Prototype Pitch Deck & Interactive ToC Logical Framework Diagram & 5-Min Walkthrough Video",
      materials: [
        "Prototyping materials (cardboard, paper, markers, digital Figma accounts)",
        "Theory of Change canvases & post-it packs",
      ],
      patron:
        "Notify the university administration about the weekend intensive. Secure 24/7 keycard approvals for common spaces and invite local business founders to advise.",
    },
    {
      num: 6,
      sem: 2,
      title: "Community build & pilot testing",
      theme: "Pilot & iteration",
      sdg: "SDG 9 · SDG 11 · SDG 17",
      badgeBg: "bg-[#EEEDFE]",
      badgeColor: "text-[#3C3489]",
      weeks: [
        { name: "Week 1", title: "Pilot planning & community re-entry" },
        { name: "Field Visit", title: "Community pilot — deploy solution" },
        { name: "Week 3", title: "Feedback analysis & iteration" },
        {
          name: "Week 4",
          title: "Revised prototype & impact measurement plan",
        },
      ],
      objectives: [
        "Deploy the prototype in the real community setting with at least 20 participants",
        "Collect structured feedback using pre-designed evaluation tools",
        "Iterate the solution meaningfully based on community evidence",
        "Develop a simple impact measurement framework for the solution",
      ],
      lessons: [
        "Pilot and re-entry protocol: Draft strict test indicators. Coordinate safe transport, consent sheets, pre-test logs, and participant targets inside Month 3 locations.",
        "The community pilot: Spend 4 hours inside community spaces deploying the pilot solution under supervision. Record usage mistakes, mechanical glitches, and oral reviews.",
        "Feedback triangulation: Sort surveys and interviews. Match quantitative scores with qualitative complaints. Spot the top 3 structural failure points to edit.",
        "MEL modeling: Establish robust Monitoring, Evaluation, and Learning (MEL) checklists: define baselines, write indicators, and layout long-term data collection roles.",
      ],
      game: {
        name: "Pre/Post Impact Simulation",
        how: "Compile a 5-dimension scorecard (scale 1 to 5) tracking user situations before exposure (e.g. water safety knowledge). Tally identical card metrics after pilot run. Draw a spider chart showcasing the impact score leap.",
      },
      quiz: {
        q: "What does MEL stand for in development and SDG programme management?",
        opts: [
          "Management, Efficiency and Leadership",
          "Monitoring, Evaluation and Learning",
          "Measurement, Evidence and Logic",
          "Methods, Engagement and Literacy",
        ],
        ans: 1,
        fb: "Monitoring, Evaluation and Learning (MEL) is the framework indicating whether a solution works. Monitoring covers operations, Evaluation determines impact, and Learning scales lessons.",
      },
      fact: "East African studies show that social enterprises with solid MEL frameworks are 3x more likely to attract external venture funding and 2x more likely to successfully scale beyond pilots.",
      output:
        "Pilot evaluation report (800 words + data visuals) & Revised prototype & Updated Theory of Change & MEL framework table",
      materials: [
        "Survey sheets (25 copies)",
        "Consent sheets",
        "Field notebooks & markers",
      ],
      patron:
        "Ensure you pack small appreciation items (pens, books, soap) for participants. Share a brief summary list of your research findings with the LC1 before leaving.",
    },
    {
      num: 7,
      sem: 2,
      title: "Advocacy, media & policy briefs",
      theme: "Communication for change",
      sdg: "SDG 16 · SDG 17",
      badgeBg: "bg-[#EEEDFE]",
      badgeColor: "text-[#3C3489]",
      weeks: [
        { name: "Week 1", title: "Advocacy strategy & stakeholder mapping" },
        { name: "Week 2", title: "Policy brief writing workshop" },
        { name: "Week 3", title: "Media training & social advocacy" },
        { name: "Week 4", title: "Press Conference simulation" },
      ],
      objectives: [
        "Develop a targeted advocacy strategy for their SDG solution",
        "Write a one-page policy brief suitable for a government minister or LC official",
        "Conduct a media simulation — press conference and social media campaign design",
        "Understand how youth advocacy has driven policy change in Uganda",
      ],
      lessons: [
        "Advocacy & Stakeholders: Layout power-interest grids mapping influencers (ministries, local government, NGOs, sub-county chiefs, media). Align unique messaging per node.",
        "The Policy Brief: Structure a high-impact, single-page presentation for ministers: outline Problem, present Evidence from your community pilot, list 3 Recommendations.",
        "Media and campaigns: Learn to craft engaging press releases and run factual campaign hashtags. Discuss responsible advocacy guidelines to avoid fake news.",
        "Press Room simulation: Learn to stand ground under fire. Answer tough questions on funding, scaling costs, failure risks, and target exclusions by classroom 'reporters'.",
      ],
      game: {
        name: "Press Conference",
        how: "Spokespersons sit at the head table. Peer students play critical, cynical journalists. The team has 3 minutes to present their solution followed by 7 minutes of intense Q&A. Score on composure and evidence.",
      },
      quiz: {
        q: "In Uganda's policy landscape, which ministry is primarily responsible for gender equality and social development?",
        opts: [
          "Ministry of Education and Sports",
          "Ministry of Gender, Labour and Social Development (MoGLSD)",
          "Ministry of Health",
          "Office of the Prime Minister",
        ],
        ans: 1,
        fb: "The Ministry of Gender, Labour and Social Development (MoGLSD) coordinates gender policies, vulnerable social protection, and youth rights. This is a primary advocacy target.",
      },
      fact: "Uganda's National Youth Policy (2016) explicitly recognizes youth as active agents of development and commits government programs to allocative support for youth ventures.",
      output:
        "Interactive Advocacy Strategy Grid & One-Page Polished Policy Brief Brochure & Campaign Post Briefs",
      materials: [
        "Advocacy grid sheets (power-interest layout)",
        "Policy brief mock layouts & design guidelines",
      ],
      patron:
        "Find the actual contacts for the LC5, Mayor, or local District Officer to formally hand-deliver your Policy Briefs. Seeing real-world delivery makes this highly practical.",
    },
    {
      num: 8,
      sem: 2,
      title: "University SDG Summit & portal submission",
      theme: "Showcase & launch",
      sdg: "SDG 17 · All SDGs",
      badgeBg: "bg-[#EEEDFE]",
      badgeColor: "text-[#3C3489]",
      weeks: [
        { name: "Week 1", title: "Solution profile finalisation" },
        { name: "Week 2", title: "Portal submission & review" },
        { name: "Week 3", title: "University SDG Summit preparation" },
        { name: "Week 4", title: "University SDG Summit — public showcase" },
      ],
      objectives: [
        "Submit all solution profiles to the 1 Million SDG Solutions portal",
        "Host a University SDG Summit that showcases solutions to the broader campus and community",
        "Connect with potential partners, mentors, and supporters for solution scale-up",
        "Reflect on the academic year and plan continuity for the next cohort",
      ],
      lessons: [
        "Profile finalization: Ensure profiles combine compelling human hooks (from field testing) with solid quantitative data and a specific development ask.",
        "Global portal upload: Formally load and register projects into the 1 Million SDG Solutions database. Document proofs to claim university league points.",
        "Summit logistics & design: Design physical exhibition stands, draft program items, invite VIPs (Deans, Vice Chancellors, VC funds, NGO chiefs), and print A1 posters.",
        "The University Summit: Deliver a major, high-profile exhibition, short pitches, panel roundtables, and crown members as SDG Champions.",
      ],
      game: {
        name: "Solution Exhibition Speed Networking",
        how: "Guests rotate around stands. Teams have exactly 2 minutes to pitch and 3 minutes to answer questions before a bell sounds. Goal: collect at least 5 business cards or mentorship pledges.",
      },
      quiz: {
        q: "When submitting to the 1 Million SDG Solutions portal, which element is most likely to get your solution selected for featured profiling?",
        opts: [
          "The longest and most verbose technical description possible",
          "A compelling human story from a named and consented community member combined with measurable pilot results",
          "A theoretical design that has not been tested but is highly advanced",
          "An endorsement letter from a high-ranking politician",
        ],
        ans: 1,
        fb: "The portal showcases solutions combining compelling stories of real people with real, tested evidence. Human hook + factual pilot evidence is the winning formula!",
      },
      fact: "Three separate Ugandan student innovations have been highlighted in the UN's Global SDG campaigns, showcasing agri-grids, menstrual health systems, and rural solar products.",
      output:
        "Duly Registered Portal Profiles & printed Exhibition Posters & Signed Handover Guidelines",
      materials: [
        "A1 display boards / poster prints",
        "SDG Club Champion badges and certificates",
        "Media invitation templates",
      ],
      patron:
        "Collaborate with your college communications desk. Invite regional reporters (NBS, NTV, New Vision) to capture the event. A local feature builds immense traction.",
    },
  ];

  const currentMonth = universityMonths[activeMonthIdx];

  const getSlidesForMonth = (m: (typeof universityMonths)[0]) => {
    return [
      {
        title: `Welcome to Month ${m.num}`,
        subtitle: `${m.theme.toUpperCase()}`,
        content: `Let's dive into Month ${m.num}: ${m.title}. Over the next 4 structured weeks, you will build expert knowledge on: ${m.sdg}. Our focus is to build the core empirical foundation required for practical, scalable systemic change across Ugandan districts.`,
        footer: "INTRODUCTORY SLIDE · SYLLABUS OVERVIEW",
      },
      {
        title: "Session 1: Orientation & Frameworks",
        subtitle: `${m.weeks[0].title.toUpperCase()}`,
        content: `Learning content detail: ${m.lessons[0]} This session initiates our analytical baseline, sets standard group divisions, and reviews our initial guidelines.`,
        footer: "SESSION 1 · ACTIVE CLUB LAB",
      },
      {
        title: "Session 2: Policy & Local Indicators",
        subtitle: `${m.weeks[1].title.toUpperCase()}`,
        content: `Learning content detail: ${m.lessons[1]} Align outcomes with actual target tables and analyze critical regional indicators utilizing national statistics database systems.`,
        footer: "SESSION 2 · EMPIRICAL INVESTIGATION",
      },
      {
        title: "Session 3: Fieldwork & Analysis",
        subtitle: `${m.weeks[2].title.toUpperCase()}`,
        content: `Learning content detail: ${m.lessons[2]} Immersive community learning: document human stories, tally key observations, and validate system roadblocks alongside local stakeholders.`,
        footer: "SESSION 3 · SOCRATIC INQUIRY",
      },
      {
        title: "Session 4: System Synthesis",
        subtitle: `${m.weeks[3].title.toUpperCase()}`,
        content: `Learning content detail: ${m.lessons[3]} Group hackathon and project review. Write clear solution portfolios, finalize logic tables, and lock next phase milestones.`,
        footer: "SESSION 4 · SOLUTIONS INCUBATION",
      },
      {
        title: "Active Monthly Game",
        subtitle: `${m.game.name.toUpperCase()}`,
        content: `Signature Exercise guidelines: ${m.game.how}`,
        footer: "SIGNATURE COALITION ACTIVITY",
      },
      {
        title: "Expected Academic Outcomes",
        subtitle: "PORTFOLIO OUTPUTS REQUIRED",
        content: `To secure active SDG League points, your group must submit: ${m.output}. Collaborate closely with academic and local patrons to assure delivery.`,
        footer: "MILESTONE DELIVERABLE TARGET",
      },
    ];
  };

  const activeSlides = getSlidesForMonth(currentMonth);

  const handleSemesterToggle = (semNum: 1 | 2) => {
    setCurSemester(semNum);
    // Automatically select the first month of that semester
    const newIdx = semNum === 1 ? 0 : 4;
    setActiveMonthIdx(newIdx);
    setActiveWorkspaceTab("syllabus");
    setSlideIndex(0);
    resetQuizState();
    playLocalSound(440 + semNum * 60, "sine", 0.08);
  };

  const handleMonthSelect = (idx: number) => {
    setActiveMonthIdx(idx);
    setActiveWorkspaceTab("syllabus");
    setSlideIndex(0);
    resetQuizState();
    playLocalSound(523 + idx * 30, "sine", 0.08);
  };

  const resetQuizState = () => {
    setUserAnsIdx(null);
    setQuizAnswered(false);
    setQuizAttempted(false);
  };

  const handleQuizAnswer = (optIdx: number) => {
    if (quizAnswered) return;
    setUserAnsIdx(optIdx);
    setQuizAnswered(true);
    setQuizAttempted(true);
    const isCorrect = optIdx === currentMonth.quiz.ans;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      playLocalSound(880, "sine", 0.15);
    } else {
      playLocalSound(220, "sawtooth", 0.25);
    }
  };

  const handleSectionTabSelect = (tab: "syllabus" | "slides" | "quiz") => {
    setActiveWorkspaceTab(tab);
    setSlideIndex(0);
    playLocalSound(659, "sine", 0.05);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-[#FAEEDA] border-4 border-black p-4 text-[#854F0B] font-medium text-xs leading-relaxed flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <GraduationCap className="w-5 h-5 shrink-0 text-amber-700 animate-bounce" />
        <div>
          <strong className="uppercase font-black text-xs block mb-0.5">
            🎓 Elite Tertiary Challenge:
          </strong>
          Ugandan universities host the critical research capacity to model
          data-driven solutions. Here is your comprehensive monthly academic
          syllabus mapped to policy targets and community immersion. Complete
          slides and check concepts to lock league points.
        </div>
      </div>

      {/* SEMESTER TAB SELECTOR */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSemesterToggle(1)}
          className={`py-3 text-xs font-black uppercase border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 ${
            curSemester === 1
              ? "bg-[#E6F1FB] text-[#0C447C]"
              : "bg-white hover:bg-gray-50 text-black text-opacity-70"
          }`}
        >
          Semester 1 — Explore & Research
        </button>
        <button
          onClick={() => handleSemesterToggle(2)}
          className={`py-3 text-xs font-black uppercase border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 ${
            curSemester === 2
              ? "bg-[#EEEDFE] text-[#3C3489]"
              : "bg-white hover:bg-gray-50 text-black text-opacity-70"
          }`}
        >
          Semester 2 — Build & Launch
        </button>
      </div>

      {/* MONTH SELECTION CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {universityMonths.map((m, idx) => {
          // Filter months by active semester
          if (m.sem !== curSemester) return null;
          const isSelected = activeMonthIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => handleMonthSelect(idx)}
              className={`p-2.5 text-left border-2 border-black transition-all relative ${
                isSelected
                  ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white hover:bg-gray-50 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest block opacity-70">
                  MONTH 0{m.num}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${isSelected ? "bg-sdg-3 animate-ping" : "bg-gray-300"}`}
                />
              </div>
              <h5 className="text-[11px] font-black uppercase truncate mt-0.5">
                {m.title.split("—")[0]}
              </h5>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC PROGRESS INDICATOR */}
      <div className="bg-white border-2 border-black p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 text-[9px] bg-black text-white font-black uppercase">
            Curriculum Tracker
          </span>
          <span className="text-xs font-black uppercase text-gray-700">
            {currentMonth.title}
          </span>
        </div>
        <div className="flex items-center gap-2 grow md:max-w-xs">
          <div className="h-2.5 bg-gray-100 border border-black grow p-0.5">
            <div
              className="h-full bg-sdg-4 transition-all duration-300"
              style={{ width: `${((activeMonthIdx + 1) / 8) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-black text-gray-500">
            {Math.round(((activeMonthIdx + 1) / 8) * 100)}%
          </span>
        </div>
      </div>

      {/* WORKSPACE CARD */}
      <div className="bg-white border-4 border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-fadeIn">
        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex border-b-4 border-black bg-gray-50 overflow-x-auto">
          <button
            onClick={() => handleSectionTabSelect("syllabus")}
            className={`flex-1 min-w-[120px] py-3.5 text-center text-xs font-black uppercase tracking-widest border-r-2 border-black transition-all ${
              activeWorkspaceTab === "syllabus"
                ? "bg-black text-white"
                : "hover:bg-gray-150 text-black text-opacity-80"
            }`}
          >
            📋 Course Details
          </button>
          <button
            onClick={() => handleSectionTabSelect("slides")}
            className={`flex-1 min-w-[120px] py-3.5 text-center text-xs font-black uppercase tracking-widest border-r-2 border-black transition-all ${
              activeWorkspaceTab === "slides"
                ? "bg-sdg-12 text-white"
                : "hover:bg-gray-150 text-black text-opacity-80"
            }`}
          >
            📚 Session Slides
          </button>
          <button
            onClick={() => handleSectionTabSelect("quiz")}
            className={`flex-1 min-w-[120px] py-3.5 text-center text-xs font-black uppercase tracking-widest transition-all ${
              activeWorkspaceTab === "quiz"
                ? "bg-sdg-3 text-white"
                : "hover:bg-gray-150 text-black text-opacity-80"
            }`}
          >
            🎯 Knowledge Check
          </button>
        </div>

        {/* WORKSPACE MAIN BODY */}
        <div className="p-5 md:p-6 space-y-6">
          {/* TAB 1: SYLLABUS DETAIL */}
          {activeWorkspaceTab === "syllabus" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#0C447C] block mb-0.5">
                    THEMATIC DOMAIN & SDG
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-black bg-[#E1F5EE] text-[#085041] border border-[#5DCAA5]">
                      {currentMonth.sdg}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-gray-500">
                      {currentMonth.theme}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    Course Milestones & Objectives
                  </h4>
                  <ul className="space-y-2 text-xs font-semibold text-gray-650">
                    {currentMonth.objectives.map((obj, i) => (
                      <li
                        key={i}
                        className="flex gap-2 items-start leading-snug"
                      >
                        <span className="text-sdg-3 font-black shrink-0">
                          •
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    WEEK-BY-WEEK SCHEDULE
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    {currentMonth.weeks.map((wk, i) => (
                      <div
                        key={i}
                        className="p-2 bg-gray-50 border border-gray-200"
                      >
                        <strong className="text-black font-black uppercase block">
                          {wk.name}
                        </strong>
                        <span className="text-gray-600 block truncate font-medium">
                          {wk.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECOND COLUMN: ACTIVITY & PORTFOLIO */}
              <div className="space-y-4 bg-gray-50 p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
                    SIGNATURE CLUB EXERCISE
                  </span>
                  <h4 className="text-xs font-black text-black uppercase">
                    {currentMonth.game.name}
                  </h4>
                  <p className="text-xs font-medium text-gray-650 leading-relaxed uppercase">
                    {currentMonth.game.how}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-gray-200">
                  <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
                    EXPECTED ACADEMY OUTCOME
                  </span>
                  <div className="p-2.5 bg-[#E1F5EE] border-2 border-black text-[10.5px] font-black text-[#085041] uppercase">
                    ✓ {currentMonth.output}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">
                    MATERIALS & LOGISTICS:
                  </span>
                  <ul className="list-disc list-inside text-[10px] font-bold text-gray-500 space-y-0.5 uppercase">
                    {currentMonth.materials.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <span className="text-[9.5px] font-black uppercase text-[#854F0B] block tracking-widest">
                    PATRON NOTE:
                  </span>
                  <p className="text-[10px] text-gray-600 leading-normal italic font-semibold">
                    "{currentMonth.patron}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSION SLIDES */}
          {activeWorkspaceTab === "slides" && (
            <div className="space-y-5 animate-slideUp">
              {/* SLIDE CARD CONTAINER */}
              <div className="bg-slate-900 border-4 border-black p-5 md:p-6 text-white min-h-[220px] flex flex-col justify-between relative shadow-[inset_0px_4px_12px_rgba(0,0,0,0.6)]">
                <div className="absolute top-2.5 right-3 flex items-center gap-1.5 font-mono text-[9px] text-[#AECDFB] font-bold tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-sdg-12 animate-ping" />
                  <span>UNIVERSITY SYLLABUS PROJECT</span>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[9px] font-black text-sdg-12 block uppercase tracking-widest">
                    {activeSlides[slideIndex].subtitle}
                  </span>
                  <h3 className="text-base font-black uppercase text-white tracking-tight border-b border-slate-800 pb-2">
                    {activeSlides[slideIndex].title}
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-slate-200 leading-relaxed font-sans uppercase">
                    {activeSlides[slideIndex].content}
                  </p>
                </div>

                <div className="text-[8.5px] font-mono text-slate-400 pt-3 border-t border-slate-800 uppercase tracking-wider">
                  {activeSlides[slideIndex].footer}
                </div>
              </div>

              {/* SLIDE CONTROLS */}
              <div className="flex justify-between items-center bg-gray-50 p-2.5 border-2 border-black select-none">
                <button
                  disabled={slideIndex === 0}
                  onClick={() => {
                    setSlideIndex((prev) => prev - 1);
                    playLocalSound(293, "sine", 0.05);
                  }}
                  className={`px-3.5 py-1.5 border-2 border-black text-[10px] font-black uppercase transition-all ${
                    slideIndex === 0
                      ? "opacity-30 bg-gray-200 cursor-not-allowed"
                      : "bg-white hover:bg-black hover:text-white cursor-pointer"
                  }`}
                >
                  ← BACK SLIDE
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-black">
                    SLIDE {slideIndex + 1} OF {activeSlides.length}
                  </span>
                </div>
                {slideIndex < activeSlides.length - 1 ? (
                  <button
                    onClick={() => {
                      setSlideIndex((prev) => prev + 1);
                      playLocalSound(329, "sine", 0.05);
                    }}
                    className="px-3.5 py-1.5 border-2 border-black bg-white hover:bg-slate-900 hover:text-white text-[10px] font-black uppercase transition-all cursor-pointer"
                  >
                    NEXT SLIDE →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveWorkspaceTab("quiz");
                      playLocalSound(523, "sine", 0.12);
                    }}
                    className="px-3.5 py-1.5 border-2 border-black bg-sdg-3 text-white text-[10px] font-black uppercase transition-all cursor-pointer"
                  >
                    LAUNCH QUIZ 🎯
                  </button>
                )}
              </div>

              {/* FACT CHECK FOOTNOTE */}
              <div className="bg-[#FAEEDA] border-2 border-black p-3 text-[11px] text-amber-900 font-medium italic flex items-start gap-2 animate-fadeIn uppercase">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="not-italic font-black text-black">
                    LOCAL REALITY FACT:
                  </strong>{" "}
                  {currentMonth.fact}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: KNOWLEDGE CHECK / QUIZ */}
          {activeWorkspaceTab === "quiz" && (
            <div className="space-y-4 animate-slideUp">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Concept Verification Check
                </span>
                <span className="px-1.5 py-0.5 text-[9px] bg-black text-white font-black uppercase">
                  Accumulated Score: {quizScore} pts
                </span>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-xs sm:text-sm font-black text-black uppercase leading-snug">
                  {currentMonth.quiz.q}
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentMonth.quiz.opts.map((opt, oIdx) => {
                    let optStyle =
                      "bg-white hover:bg-gray-50 border-2 border-black text-black";
                    if (quizAnswered) {
                      if (oIdx === currentMonth.quiz.ans) {
                        optStyle =
                          "bg-[#E1F5EE] border-2 border-[#1D9E75] text-[#0F6E56] font-black";
                      } else if (oIdx === userAnsIdx) {
                        optStyle =
                          "bg-[#FCEBEB] border-2 border-red-500 text-red-700 font-black";
                      } else {
                        optStyle =
                          "bg-white border-2 border-gray-150 text-gray-400";
                      }
                    } else if (oIdx === userAnsIdx) {
                      optStyle = "bg-black text-white border-2 border-black";
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={quizAnswered}
                        onClick={() => handleQuizAnswer(oIdx)}
                        className={`w-full p-3 text-left text-[10.5px] uppercase tracking-tight transition-all font-black flex items-start gap-2.5 cursor-pointer rounded-none ${optStyle}`}
                      >
                        <span className="text-xs shrink-0 font-mono">
                          0{oIdx + 1}.
                        </span>
                        <span className="leading-tight pt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div className="p-4 border-l-4 bg-[#F2F1FD] border-[#534AB7] text-[10.5px] text-gray-700 uppercase font-bold leading-relaxed animate-slideUp">
                    <strong>EXAMINER FEEDBACK:</strong>{" "}
                    <span className="text-gray-900">
                      {currentMonth.quiz.fb}
                    </span>
                  </div>
                )}

                {quizAnswered && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        resetQuizState();
                        playLocalSound(440, "sine", 0.08);
                      }}
                      className="grow sm:grow-0 px-4 py-2 bg-black hover:bg-slate-900 text-white text-[10px] font-black uppercase border-2 border-black"
                    >
                      Retry Question
                    </button>
                    {activeMonthIdx < 7 ? (
                      <button
                        onClick={() => {
                          const nextIdx = activeMonthIdx + 1;
                          setActiveMonthIdx(nextIdx);
                          setCurSemester(nextIdx < 4 ? 1 : 2);
                          setActiveWorkspaceTab("syllabus");
                          resetQuizState();
                          playLocalSound(523, "sine", 0.12);
                        }}
                        className="grow sm:grow-0 px-4 py-2 bg-sdg-12 text-white border-2 border-black text-[10px] font-black uppercase transition-all"
                      >
                        Proceed to Month {activeMonthIdx + 2} →
                      </button>
                    ) : (
                      <div className="p-2.5 bg-sdg-3 text-white border-2 border-black font-black text-[10px] uppercase">
                        🏆 Academic Curriculum Cleared successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SAMPLE WARMUPS VIEW COMPONENT
// ==========================================

export function SampleWarmupsView() {
  const [levelFilter, setLevelFilter] = useState<"All" | "HS" | "Uni">("All");
  const [themeFilter, setThemeFilter] = useState<string>("All");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  // Initialize filters based on registered club if possible
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kap10_registered_club");
      if (saved) {
        const club = JSON.parse(saved);
        if (club.level === "University") {
          setLevelFilter("Uni");
        } else {
          setLevelFilter("HS");
        }
      }
    } catch (e) {}
  }, []);

  // Filter questions based on selected filters
  const filteredQuestions = ALL_QUIZ_QUESTIONS.filter((q) => {
    const levelMatch = levelFilter === "All" ? true : q.level === levelFilter;
    const themeMatch = themeFilter === "All" ? true : q.theme === themeFilter;
    return levelMatch && themeMatch;
  });

  // Unique list of themes for the filter dropdown
  const availableThemes = Array.from(
    new Set(ALL_QUIZ_QUESTIONS.map((q) => q.theme)),
  );

  const handleLevelChange = (level: "All" | "HS" | "Uni") => {
    setLevelFilter(level);
    resetQuiz();
  };

  const handleThemeChange = (theme: string) => {
    setThemeFilter(theme);
    resetQuiz();
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOptIndex(null);
    setAnswered(false);
    setScore(0);
    setComplete(false);
  };

  const currentQuestion = filteredQuestions[currentQIndex];

  const handleOptionSelect = (optIdx: number) => {
    if (answered || !currentQuestion) return;
    setSelectedOptIndex(optIdx);
    setAnswered(true);
    if (optIdx === currentQuestion.ans) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setAnswered(false);
    setSelectedOptIndex(null);
    if (currentQIndex < filteredQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setComplete(true);
    }
  };

  const handleRestart = () => {
    resetQuiz();
  };

  return (
    <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-4 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-gray-400 block tracking-widest mb-1">
            National Assessment Pool
          </span>
          <h3 className="text-lg font-black uppercase italic leading-none">
            Diagnostic Quiz Bank
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 text-[9px] bg-black text-white font-black uppercase self-center">
            {filteredQuestions.length} Questions Loaded
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      {!complete && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 border-2 border-black">
          <div>
            <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">
              Target School Level (KAP)
            </label>
            <div className="flex gap-1">
              {(["All", "HS", "Uni"] as const).map((lev) => (
                <button
                  key={lev}
                  onClick={() => handleLevelChange(lev)}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase border-2 border-black transition-all ${
                    levelFilter === lev
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-100 text-black"
                  }`}
                >
                  {lev === "All"
                    ? "All Levels"
                    : lev === "HS"
                      ? "High School"
                      : "University"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">
              Weekly Topic Theme
            </label>
            <select
              value={themeFilter}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full p-1.5 text-[10px] font-bold uppercase bg-white border-2 border-black rounded-none h-[30px]"
            >
              <option value="All">All Themes / SDGs</option>
              {availableThemes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredQuestions.length === 0 ? (
        <div className="text-center p-8 space-y-3 bg-gray-50 border-2 border-dashed border-gray-400">
          <p className="text-xs font-black uppercase text-gray-500">
            No questions found matching selected criteria.
          </p>
          <button
            onClick={() => {
              setLevelFilter("All");
              setThemeFilter("All");
            }}
            className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : !complete ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-600">
            <span>
              Question {currentQIndex + 1} of {filteredQuestions.length}
            </span>
            <span>
              Running Score: {score}/{filteredQuestions.length}
            </span>
          </div>

          <div className="h-2.5 border-2 border-black bg-gray-50 p-0.5">
            <div
              className="h-full bg-sdg-12 transition-all duration-300"
              style={{
                width: `${((currentQIndex + 1) / filteredQuestions.length) * 100}%`,
              }}
            />
          </div>

          {currentQuestion && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-[#E1F5EE] border border-[#5DCAA5] text-[#085041]">
                  {currentQuestion.sdg}
                </span>
                <span className="text-[9px] font-bold uppercase text-gray-500">
                  {currentQuestion.theme} (
                  {currentQuestion.level === "HS"
                    ? "High School Class"
                    : "University Course"}
                  )
                </span>
              </div>

              <p className="text-xs md:text-sm font-black uppercase leading-relaxed text-black">
                {currentQuestion.q}
              </p>

              <div className="space-y-2 pt-2">
                {currentQuestion.opts.map((opt, i) => {
                  let optStyle =
                    "bg-white hover:bg-gray-50 border-2 border-black";
                  if (answered) {
                    if (i === currentQuestion.ans) {
                      optStyle =
                        "bg-[#E1F5EE] border-2 border-[#1D9E75] text-[#0F6E56] font-black";
                    } else if (i === selectedOptIndex) {
                      optStyle =
                        "bg-[#FCEBEB] border-2 border-red-500 text-red-700 font-black";
                    } else {
                      optStyle =
                        "bg-white border-2 border-gray-200 text-gray-400";
                    }
                  } else if (i === selectedOptIndex) {
                    optStyle = "bg-black text-white border-2 border-black";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(i)}
                      disabled={answered}
                      className={`w-full p-3 text-[10px] sm:text-xs text-left transition-all uppercase rounded-none block ${optStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="p-4 bg-gray-50 border-2 border-black text-[11px] sm:text-xs space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-extrabold text-black uppercase text-[9px] block">
                    {selectedOptIndex === currentQuestion.ans
                      ? "✓ CORRECT RESOLUTION"
                      : "✗ INCORRECT RESPONSE"}
                  </span>
                  <p className="text-gray-700 leading-normal uppercase font-medium">
                    {currentQuestion.fb}
                  </p>
                  <p className="text-gray-500 leading-normal uppercase italic text-[10px] pt-1 border-t border-gray-200">
                    <strong className="text-black not-italic font-black">
                      LOCAL FACT:{" "}
                    </strong>
                    {currentQuestion.fact}
                  </p>
                </div>
              )}

              {answered && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-black hover:bg-sdg-12 text-white font-black uppercase text-xs transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-0.5 active:translate-y-0.5"
                >
                  {currentQIndex < filteredQuestions.length - 1
                    ? "Proceed to Next Question"
                    : "Complete Diagnostic Assessment"}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-6 space-y-6">
          <Award className="w-16 h-16 mx-auto text-[#0F6E56] animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-2xl font-black uppercase italic">
              Assessment Concluded!
            </h4>
            <p className="text-sm font-semibold text-gray-500 uppercase">
              You successfully cleared{" "}
              <span className="text-lg text-black font-black">
                {score}/{filteredQuestions.length}
              </span>{" "}
              diagnostic questions correctly.
            </p>
          </div>

          {score === filteredQuestions.length ? (
            <div className="p-3 bg-sdg-3 text-white border-2 border-black font-black uppercase text-xs">
              🏆 Outstanding performance! Mapped to elite SDG Coalition honors.
            </div>
          ) : (
            <div className="p-3 bg-sdg-4 text-white border-2 border-black font-black uppercase text-xs">
              🎖️ Highly encouraging work! Consolidate lessons next week.
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 border-4 border-black bg-white hover:bg-black hover:text-white font-black uppercase text-xs transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Retake Warmups Pool
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SOLUTIONS SPRINT VIEW COMPONENT
// ==========================================

export function SolutionsSprintView() {
  const roadmapSteps = [
    {
      step: 1,
      title: "Identify — Core Problem Focus",
      context: "Fieldwork Mapping · Research Days",
      bg: "bg-[#E1F5EE]",
      color: "text-[#0F6E56]",
      desc: "Deploy into regional testing villages. Conduct structured stakeholder surveys to understand resource blockages, collecting visual evidence reports.",
    },
    {
      step: 2,
      title: "Analyse — Root Cause Mapping",
      context: "Fricton Analysis & 5-Whys Mapping",
      bg: "bg-[#E6F1FB]",
      color: "text-[#185FA5]",
      desc: "Utilize fishbone structural layouts to dissect why the problem exists. Discriminate symptoms from primary root bottlenecks.",
    },
    {
      step: 3,
      title: "Design — Prototype Engineering",
      context: "PBL Hackathons & Fast Building",
      bg: "bg-[#FAEEDA]",
      color: "text-[#BA7517]",
      desc: "Model a baseline solution prototype (e.g. bio-fuel briquettes, solar pumps, or sanitation setups) and pilot with at least 5 target families.",
    },
    {
      step: 4,
      title: "Document — Manuscript Crafting",
      context: "Synthesis & Form Templates",
      bg: "bg-[#EEEDFE]",
      color: "text-[#534AB7]",
      desc: "Draft problem definitions, target populations, Theory of Change, and metrics. Keep manuscripts professional and succinct (under 500 words).",
    },
    {
      step: 5,
      title: "Submit — Global Portal Upload",
      context: "1 Million SDG Solutions Portal",
      bg: "bg-[#FBEAF0]",
      color: "text-[#993556]",
      desc: "Submit into the national Youth Coalition database to gain verified status, countrywide publicity, and access to seed micro-grant calls.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
        <h4 className="text-xl font-black uppercase italic leading-none text-black">
          1 Million Solutions Sprint
        </h4>
        <p className="text-gray-500 font-bold text-xs uppercase leading-relaxed">
          Every certified SDGs club works systematically toward deploying at
          least one real community prototype every single academic year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roadmapSteps.map((s, i) => (
          <div
            key={i}
            className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div
                className={`w-8 h-8 font-black flex items-center justify-center border-2 border-black ${s.bg} ${s.color}`}
              >
                {s.step}
              </div>
              <div>
                <span className="text-[8px] font-black uppercase text-gray-400 block tracking-tight">
                  {s.context}
                </span>
                <h5 className="text-xs font-black uppercase text-black leading-snug">
                  {s.title}
                </h5>
              </div>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// PREMIUM COALITION & SDG CREDITS VAULT MODAL
// ==========================================
export function PremiumHubModal({
  open,
  onClose,
  registeredClub,
  setRegisteredClub,
}: {
  open: boolean;
  onClose: () => void;
  registeredClub: SchoolClub | null;
  setRegisteredClub: (club: SchoolClub | null) => void;
}) {
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("MTN Momo");
  const [customKeyInput, setCustomKeyInput] = useState("");
  const [submittingPay, setSubmittingPay] = useState(false);
  const [linkingKey, setLinkingKey] = useState(false);

  if (!open) return null;

  const isHighSchool = registeredClub?.level === "High School";
  const tierName = isHighSchool
    ? "HIGHSCHOOL CHAPTER"
    : "CAMPUS CONNECT CHAPTER";
  const tierPrice = isHighSchool ? 10000 : 20000;
  const priceFormatted = `UGX ${tierPrice.toLocaleString()}`;

  const handlePaySimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredClub) {
      alert("Please register or log in your club in the Academy tab first!");
      return;
    }
    if (!phone.match(/^[0-9\-\+\s]{9,15}$/)) {
      alert("Please enter a valid Ugandan mobile money telephone number!");
      return;
    }

    setSubmittingPay(true);
    // Simulate mobile money API push delay
    setTimeout(() => {
      const updated = {
        ...registeredClub,
        subscribed: true,
        credits:
          (registeredClub.credits !== undefined ? registeredClub.credits : 5) +
          25, // Give standard 25 credits top up!
      };
      setRegisteredClub(updated);
      localStorage.setItem("kap10_registered_club", JSON.stringify(updated));

      // Push to Firestore!
      updateDoc(doc(db, "clubs", registeredClub.id), {
        subscribed: true,
        credits: updated.credits,
      }).catch(() => {});

      // Add a shout to the public Lounge!
      const loungeId = String(Date.now());
      setDoc(doc(db, "loungeMessages", loungeId), {
        id: loungeId,
        clubName: registeredClub.name,
        region: registeredClub.region,
        level: registeredClub.level,
        text: `🎉 Dynamic Milestone: We just activated our Premium Gold Coalition Subscription! Unlimited agent messages and blueprints downloading is now UNLOCKED!`,
        timestamp: "Just now",
        likes: 1,
      }).catch(() => {});

      setSubmittingPay(false);
      alert(
        `🎉 PREMIUM UNLOCKED: Mobile Money payment of ${priceFormatted} processed successfully! Your SDG Agent unlimited sessions are now active, and 25 credits have been recharged!`,
      );
    }, 1200);
  };

  const handleLinkGeminiAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredClub) {
      alert("Please register or log-in your club first!");
      return;
    }

    setLinkingKey(true);
    setTimeout(() => {
      // Connect key simulator: removes the 25 credits ceiling and gives unlimited credits!
      const updated = {
        ...registeredClub,
        geminiLinked: true,
        credits: 9999, // Set to high number signaling unlimited
        score: registeredClub.score + 150, // +150 Points Developer Shield award!
      };
      setRegisteredClub(updated);
      localStorage.setItem("kap10_registered_club", JSON.stringify(updated));

      updateDoc(doc(db, "clubs", registeredClub.id), {
        geminiLinked: true,
        credits: 9999,
        score: updated.score,
      }).catch(() => {});

      setLinkingKey(false);
      setCustomKeyInput("");
      alert(
        "🔌 DIRECT GEMINI API LINK SUCCESSFUL: Bypassed standard 25 credits ceiling threshold. Your account is now labeled 'Developer Direct' with unlimited API actions!",
      );
    }, 1000);
  };

  const handleRestoreCredits = async () => {
    if (!registeredClub) return;
    if (!registeredClub.subscribed) {
      alert(
        "Only subscribed clubs can restore their default credit balance of 25. Please subscribe first!",
      );
      return;
    }
    // Boost back to 25 if subscribed but low
    const updated = {
      ...registeredClub,
      credits: 25,
    };
    setRegisteredClub(updated);
    localStorage.setItem("kap10_registered_club", JSON.stringify(updated));
    await updateDoc(doc(db, "clubs", registeredClub.id), { credits: 25 }).catch(
      () => {},
    );
    alert("⚡ Credits restored to standard paid threshold ceiling of 25!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="bg-black text-white p-5 flex justify-between items-center border-b-4 border-black">
          <div className="flex items-center gap-3">
            <Award className="text-yellow-400 animate-pulse w-6 h-6" />
            <div>
              <h2 className="text-xl font-black uppercase italic leading-none">
                Premium Club Hub & Credentials
              </h2>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mt-1">
                UGANDA CO-CREATE COALITION MEMBERSHIPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white border-2 border-black hover:bg-red-500 text-black hover:text-white font-black text-xs uppercase transition-colors"
          >
            ✕
          </button>
        </header>

        {/* Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!registeredClub ? (
            <div className="border-4 border-dashed border-red-400 bg-red-50 p-6 text-center space-y-3">
              <ShieldAlert className="w-12 h-12 mx-auto text-red-500" />
              <h4 className="text-lg font-black uppercase text-red-800">
                No Club Active!
              </h4>
              <p className="text-xs font-bold text-red-600 uppercase max-w-md mx-auto leading-normal">
                You must register your school or university club first to access
                the premium subscription module or credit vaults. Please head
                over to the SDG Academy tab and register your club credentials!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border-2 border-black p-4 space-y-1">
                  <span className="text-[8px] font-black uppercase text-gray-400 block pb-1 border-b border-gray-100">
                    ACTIVE COALITION
                  </span>
                  <h4 className="font-extrabold text-xs uppercase text-black">
                    {registeredClub.name}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                    {registeredClub.institution} • {registeredClub.level}
                  </p>
                </div>

                <div
                  className={`border-2 border-black p-4 flex justify-between items-center ${registeredClub.subscribed ? "bg-[#EFFDF4] text-green-800" : "bg-[#FFF2F2] text-red-800"}`}
                >
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#444] block pb-1 border-b border-gray-200">
                      LICENCE STATUS
                    </span>
                    <span className="font-black text-sm uppercase italic tracking-wide mt-1 block">
                      {registeredClub.subscribed
                        ? "💎 GOLD PREMIUM MEMBER"
                        : "⚠️ FREE TRIAL CO-CREATOR"}
                    </span>
                  </div>
                  {registeredClub.subscribed ? (
                    <CheckCircle2 className="text-green-600 shrink-0" />
                  ) : (
                    <Lock className="text-red-600 shrink-0" />
                  )}
                </div>
              </div>

              {/* SECTION A: PAYMENT UPGRADE IF FREE */}
              {!registeredClub.subscribed ? (
                <div className="bg-[#FFFDF3] border-4 border-[#BA7517] p-5 shadow-[4px_4px_0px_0px_rgba(186,117,23,1)] space-y-4">
                  <div>
                    <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 inline-block">
                      UPGRADE REQUIRED
                    </span>
                    <h3 className="text-lg font-black uppercase italic mt-2 text-amber-900 leading-none">
                      Unlock Unlimited Access
                    </h3>
                    <p className="text-[10px] font-bold text-amber-700 uppercase leading-snug mt-1">
                      Free accounts are capped at a 5-message dialog trial.
                      Upgrade today to unlock unlimited agent sessions and full
                      blueprints downloading!
                    </p>
                  </div>

                  <div className="bg-white border-2 border-amber-500 p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-amber-100">
                      <span className="font-black uppercase text-gray-400">
                        Coalition Level:
                      </span>
                      <span className="font-extrabold text-amber-800 uppercase">
                        {tierName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black uppercase text-gray-400">
                        Annual Subscription Rate:
                      </span>
                      <span className="text-lg font-black text-amber-600">
                        {priceFormatted} only
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handlePaySimulation} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-amber-800 mb-1">
                          Momo Provider
                        </label>
                        <select
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                          className="w-full p-2 border-2 border-amber-600 font-bold bg-white text-xs"
                        >
                          <option value="MTN Momo">MTN MoMo Pay</option>
                          <option value="Airtel Money">Airtel Money</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-amber-800 mb-1">
                          Telephone Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 0772200300"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-2 border-2 border-amber-600 font-mono text-xs text-black"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPay}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 block text-center"
                    >
                      {submittingPay ? (
                        <RefreshCcw
                          className="animate-spin text-black inline"
                          size={14}
                        />
                      ) : null}
                      <span>
                        Simulate Mobile Money Payment ({priceFormatted})
                      </span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-[#EFFDF4] border-2 border-green-600 p-4 font-black uppercase text-xs text-green-800 text-center flex items-center justify-center gap-2">
                  <span>
                    ✨ GOLD PRESTIGE ACTIVATED: Your subscription is fully
                    unlocked. You have unlimited dialogues and downloading
                    features!
                  </span>
                </div>
              )}

              {/* SECTION B: SDG CREDIT VAULT */}
              <div className="bg-white border-2 border-black p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black uppercase italic leading-none text-black">
                      Indicator-Based SDG Credit Vault
                    </h3>
                    <p className="text-[9px] text-gray-400 uppercase font-black leading-tight mt-1">
                      Recharged automatically upon yearly submissions and key
                      links
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[8px] font-black uppercase leading-none border ${registeredClub.geminiLinked ? "bg-[#EFFDF4] text-green-700 border-green-400" : "bg-[#FFF9E6] text-amber-700 border-amber-400"}`}
                  >
                    {registeredClub.geminiLinked
                      ? "DIRECT API CAP BYPASSED"
                      : "STANDARD PRESET BUDGET"}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 text-center">
                    <span className="text-3xl font-black text-black">
                      {registeredClub.geminiLinked
                        ? "∞"
                        : registeredClub.credits !== undefined
                          ? registeredClub.credits
                          : registeredClub.subscribed
                            ? 25
                            : 5}
                    </span>
                    <span className="block text-[8px] font-black text-gray-400 uppercase">
                      Vault Balance
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="w-full bg-gray-100 h-3 border border-black">
                      <div
                        className={`h-full border-r border-black transition-all ${registeredClub.geminiLinked ? "bg-green-500 w-full" : registeredClub.subscribed ? "bg-amber-500" : "bg-red-500"}`}
                        style={{
                          width: registeredClub.geminiLinked
                            ? "100%"
                            : `${Math.min(100, ((registeredClub.credits !== undefined ? registeredClub.credits : 5) / 25) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase">
                      <span>0 Credits</span>
                      <span>Allowed Threshold: 25 max</span>
                    </div>
                  </div>
                </div>

                {registeredClub.subscribed && !registeredClub.geminiLinked && (
                  <button
                    onClick={handleRestoreCredits}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-250 border-2 border-black font-black uppercase text-[10px] transition-colors"
                  >
                    ⚡ Restore Vault to Standard 25 Credits Threshold
                  </button>
                )}

                {/* Direct Key Integrator */}
                <div className="border-t pt-4 border-gray-100 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase flex items-center gap-1.5 text-black">
                      <KeyRound size={12} className="text-sdg-9" />
                      <span>
                        Link directly to Gemini API Key (Bypass Threshold
                        Limits)
                      </span>
                    </h4>
                    <p className="text-[9px] text-gray-500 uppercase font-bold leading-normal">
                      Connecting your club directly to the custom Gemini API Key
                      removes the 25 credits standard threshold, awarding you
                      unlimited credits ("∞") and granting a{" "}
                      <span className="text-green-600 font-extrabold">
                        +150 Reputation Bonus
                      </span>
                      !
                    </p>
                  </div>

                  {registeredClub.geminiLinked ? (
                    <div className="p-3 bg-green-50 border-2 border-green-500 flex items-center gap-3">
                      <Check className="text-green-600" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-green-700 block">
                          DEVELOPER SHIELD CONFIGURED
                        </span>
                        <p className="text-[10px] font-bold text-green-600 uppercase">
                          All API dialogs bypass preset credit systems.
                          Unlimited operations unlocked.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleLinkGeminiAPI} className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Paste your private custom Google AI Studio Key..."
                        value={customKeyInput}
                        onChange={(e) => setCustomKeyInput(e.target.value)}
                        className="flex-1 p-2 border-2 border-black font-mono text-xs"
                        required
                      />
                      <button
                        type="submit"
                        disabled={linkingKey}
                        className="px-4 bg-black text-white hover:bg-sdg-9 font-black uppercase text-[10px]"
                      >
                        {linkingKey ? "Connecting..." : "Link API"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-4 bg-gray-50 border-t-2 border-black flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border-2 border-black bg-white hover:bg-gray-150 font-black uppercase text-[10px]"
          >
            Close Portal
          </button>
        </footer>
      </div>
    </div>
  );
}
