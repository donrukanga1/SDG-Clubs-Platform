export interface CourseTopic {
  id: number;
  title: string;
  summary: string;
  color: string;
  content: { subtitle: string; text: string }[];
  quiz: { question: string; options: string[]; answer: string }[];
}

export const DEFAULT_CURRICULUM: CourseTopic[] = [
  { 
    id: 1,
    title: "SDG Introduction & Problem Mapping (Weeks 1-2)", 
    summary: "Explore the 17 global Sustainable Development Goals and connect them with Uganda's National Development Plan IV (NDPIV) and local problem-mapping.", 
    color: "bg-sdg-4",
    content: [
      { subtitle: "The 2030 Global Milestone", text: "The Sustainable Development Goals (SDGs) are 17 interconnected goals. Uganda is a leading global voice in tracking progress and submitting Voluntary National Reviews, syncing these targets with NDPIV." },
      { subtitle: "Systems Thinking Integration", text: "Systems thinking teaches how local issues (like lack of handwashing facilities or open trash pits) spill over into school attendance metrics (SDG 4) and community healthcare costs (SDG 3)." },
      { subtitle: "Project-Based Compound Walk", text: "Under Project-Based Learning (PBL), student volunteers walk through the campus and surrounding neighborhoods to map real-world environmental and structural problem points." }
    ],
    quiz: [
      {
        question: "Which national development framework in Uganda integrates the global SDGs directly into domestic and school club systems?",
        options: ["National Development Plan IV (NDPIV)", "Pre-Independence Charter", "Kampala Drainage Act", "The 1997 Sports Regulation"],
        answer: "National Development Plan IV (NDPIV)"
      },
      {
        question: "What is the primary tenet of 'systems thinking' under the SDG framework?",
        options: ["Analyzing key targets in total isolation", "Recognizing how challenges and solutions are highly interconnected", "Decreasing candidate attendance to lower school fuel bills", "Expecting international delegates to coordinate village garbage collection"],
        answer: "Recognizing how challenges and solutions are highly interconnected"
      },
      {
        question: "Walking through a community to physically map vulnerabilities is a core step of which educational format?",
        options: ["Rotational Lectures", "Project-Based Learning (PBL)", "Standard Flashcard Memorization", "General Assembly Readings"],
        answer: "Project-Based Learning (PBL)"
      }
    ]
  },
  { 
    id: 2,
    title: "Gender Equality & Female Retention (Weeks 3-4)", 
    summary: "Deconstruct systemic gender barriers, solve girls' school dropout ratios, and activate positive male allyship networks.", 
    color: "bg-sdg-5",
    content: [
      { subtitle: "The Parity Paradigm", text: "Sustainable Development Goal 5 aims to build equal rights. Resolving core vulnerabilities like period poverty or inadequate water basins keeps candidate class female enrollments stable." },
      { subtitle: "Uganda's Gender Policy Framework", text: "Uganda has pioneered gender representation in government. However, secondary domestic labor distributions still heavily restrict the home study hours available to rural girls." },
      { subtitle: "Male Allyship & Safe Corridors", text: "Fostered by school patrons, active male allyship campaigns and school statement pledges eliminate stigma, promote mutual dignity, and safeguard healthy completion statistics." }
    ],
    quiz: [
      {
        question: "What direct hygiene bottleneck commonly increases secondary school dropout risk for young girls in rural districts?",
        options: ["Suboptimal rainfall in western highlands", "Period poverty and lack of proper menstrual hygiene supplies", "Excessive numbers of adult female mentors on campus", "Fluctuating cocoa prices in regional markets"],
        answer: "Period poverty and lack of proper menstrual hygiene supplies"
      },
      {
        question: "Which SDG is exclusively focused on gender equality and female empowerment?",
        options: ["SDG 1", "SDG 3", "SDG 5", "SDG 10"],
         answer: "SDG 5"
      },
      {
        question: "What is the critical objective of activating male allyship in high school corridors?",
        options: ["Fostering mutual peer respect and stabilizing girls' school completion", "Replacing certified school counselors", "Transferring agricultural chores to girls", "Creating competitive exam rankings"],
        answer: "Fostering mutual peer respect and stabilizing girls' school completion"
      }
    ]
  },
  { 
    id: 3,
    title: "Climate Action & Adaptation (Weeks 5-6)", 
    summary: "Understand severe local climate changes from Mt. Elgon mudslides to Karamoja droughts, and deploy native eco-shields.", 
    color: "bg-sdg-13",
    content: [
      { subtitle: "Uganda's Environmental Reality", text: "Climate action under SDG 13 counters severe real-world occurrences in Uganda—including deadly mudslides on the Elgon slopes and long dry periods in the Karamoja cattle belt." },
      { subtitle: "Nature-Based Solutions (NbS)", text: "NbS utilizes local ecological pathways—such as planting deep-rooting vetiver grass and quick-growing mountain bamboo to anchor soil and prevent river overflow." },
      { subtitle: "Eco-Energy Transition", text: "Student-led actions target biofuel options like low-smoke solar dryers or school organic bio-gas systems to drop reliance on local forest fuel wood." }
    ],
    quiz: [
      {
        question: "Which mountain range slopes present high vulnerability to mudslides monitored by community gauges?",
        options: ["Mt. Elgon and Rwenzori slopes", "Lake Victoria sand dunes", "Kampala central low hills", "Moroto dry rocky ridges"],
        answer: "Mt. Elgon and Rwenzori slopes"
      },
      {
        question: "What quick-growing, deep-rooting vegetation is planted by youth to shield riverbanks from sudden flash floods?",
        options: ["Eucalyptus trees", "Resilient Bamboo and vetiver grass", "Sugarcane columns", "Commercial tea plants"],
        answer: "Resilient Bamboo and vetiver grass"
      },
      {
        question: "What prototype reduces school cooking fuel bills and protects forests from firewood harvesting?",
        options: ["High-smoke kerosene stoves", "Biogas digesters utilizing organic school waste", "Imported coal blocks", "Standard diesel-powered generators"],
        answer: "Biogas digesters utilizing organic school waste"
      }
    ]
  },
  { 
    id: 4,
    title: "WASH & Student Health (Weeks 7-8)", 
    summary: "Perfect water sanitation, construct filtration units (WASH), and promote mental well-being and stress resilience.", 
    color: "bg-sdg-3",
    content: [
      { subtitle: "WASH in School Communities", text: "Water, Sanitation, and Hygiene (WASH) metrics under SDG 6 directly control health security, shielding boarding institutions from high-risk gastrointestinal outbreaks." },
      { subtitle: "Eco-Filtration Tech", text: "Low-tech filters built with pebbles, coarse river sand, and activated charcoal (from scorched school wood scrap) purify water, rendering it drinkable for remote sections." },
      { subtitle: "Mental & Peer Well-Being", text: "Goal 3 values emotional wellness alongside physical health. Encouraging positive peer listening circles and anti-bullying pledges shields student mental balance." }
    ],
    quiz: [
      {
        question: "What standard acronym represents school-level water, sanitation, and hygiene initiatives?",
        options: ["WASH", "STEM", "LEAD", "CARE"],
        answer: "WASH"
      },
      {
        question: "How do active student chapters build low-cost gravity filters to clarify suspect water?",
        options: ["Using nested layers of gravel, charcoal, and fine river sand", "Adding domestic industrial bleach and soap", "By passing oil currents through boiling liquid", "Using heavy copper plates and batteries"],
        answer: "Using nested layers of gravel, charcoal, and fine river sand"
      },
      {
        question: "What activity directly protects emotional wellness and managing exam stress in high schools?",
        options: ["Suppressing all stress indicators in silence", "Constructing peer listening networks and solidarity groups", "Increasing exam durations without intervals", "Limiting communication among students"],
        answer: "Constructing peer listening networks and solidarity groups"
      }
    ]
  },
  { 
    id: 5,
    title: "Peace, Mediation & Global Showcase (Weeks 9-10)", 
    summary: "Adopt constructive conflict-resolution techniques, form SDG 17 partnerships, and showcase physical club prototypes.", 
    color: "bg-sdg-16",
    content: [
      { subtitle: "Mediation and Campus Peace", text: "Goal 16 guides student leaders to serve as proactive, non-violent mediators, de-escalating standard high school disputes and building peer treaties." },
      { subtitle: "Strategic Civic Alliances", text: "SDG 17 focuses on localized partnerships—bridging school groups with adjacent town councils, health workers, and environmental officials." },
      { subtitle: "Solutions Synthesis Showcase", text: "At term end, clubs present physical, hands-on outputs (like low-smoke briquettes, organic composting piles, or peace charters) to inspire surrounding parishes." }
    ],
    quiz: [
      {
        question: "Which SDG focuses on peace, local justice, and active independent student mediation councils?",
        options: ["SDG 1", "SDG 9", "SDG 16", "SDG 17"],
        answer: "SDG 16"
      },
      {
        question: "Which action maps directly to SDG 17 (Partnerships for the Goals) inside school clubs?",
        options: ["Fostering alliances with community committees and local environment officers", "Isolating the club from all external contacts", "Replacing the national standard syllabus", "Refusing to document project outcomes"],
        answer: "Fostering alliances with community committees and local environment officers"
      },
      {
        question: "What serves as the final milestone of the 10-week SDG Club curriculum sequence?",
        options: ["A showcase of functional solutions and community prototypes", "Deleting raw performance tracking records", "Conducting a purely passive lecture with no visual artifact", "Completing an unrelated commercial examination"],
        answer: "A showcase of functional solutions and community prototypes"
      }
    ]
  }
];
