export interface QuizQuestion {
  id: number;
  theme: string;
  level: "HS" | "Uni";
  sdg: string;
  q: string;
  opts: string[];
  ans: number;
  fb: string;
  fact: string;
}

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    theme: "Gender Equality",
    level: "HS",
    sdg: "SDG 5",
    q: "What percentage of Uganda's registered land is owned by women?",
    opts: ["Less than 7%", "About 20%", "Around 35%", "Over 45%"],
    ans: 0,
    fb: "Less than 7% — despite women producing 80% of Uganda's food and making up over 50% of the population. Land ownership is central to SDG 5 and is one of the most persistent barriers to women's economic empowerment in Uganda.",
    fact: "Women in Uganda walk an average of 6km per day to collect water and firewood — time that could be spent on education, business, or rest. SDG 6 and SDG 5 are deeply connected."
  },
  {
    id: 2,
    theme: "Gender Equality",
    level: "HS",
    sdg: "SDG 5",
    q: "According to Uganda's Demographic and Health Survey, approximately what percentage of women aged 15–49 have experienced physical or sexual violence?",
    opts: ["12%", "29%", "56%", "74%"],
    ans: 2,
    fb: "56% — more than half of Ugandan women have experienced violence. The Domestic Violence Act (2010) criminalises GBV, but enforcement gaps remain. SDG 5 calls for elimination of all forms of violence against women by 2030.",
    fact: "Uganda's Equal Opportunities Commission receives over 2,000 gender discrimination complaints per year — but less than 30% result in any formal action. Legal frameworks exist; implementation is the gap."
  },
  {
    id: 3,
    theme: "Gender Equality",
    level: "HS",
    sdg: "SDG 5",
    q: "Girls in Uganda miss approximately how many school days per month due to menstruation-related challenges?",
    opts: ["1–2 days", "4–5 days", "7–8 days", "10+ days"],
    ans: 1,
    fb: "4–5 days per month — nearly an entire term of learning lost per year. Menstrual Health Management (MHM) is now a policy priority in Uganda's Ministry of Education, requiring schools to provide WASH facilities for girls.",
    fact: "Uganda ranked 69th out of 146 countries on the Global Gender Gap Index 2023 — ahead of many African peers, largely due to high female parliamentary representation (34%). But economic parity remains far off."
  },
  {
    id: 4,
    theme: "Gender Equality",
    level: "Uni",
    sdg: "SDG 5",
    q: "Uganda's Domestic Violence Act was passed in which year, making it one of East Africa's first comprehensive GBV laws?",
    opts: ["1995", "2003", "2010", "2016"],
    ans: 2,
    fb: "2010 — Uganda's Domestic Violence Act criminalised physical, sexual, emotional, and economic abuse within intimate relationships. However, cultural norms, limited legal aid, and underfunded implementation have slowed its impact.",
    fact: "Only 27% of Ugandan women who experience GBV report it to any authority — formal or informal. The most common reason: fear of not being believed (Uganda DHS 2022). Changing this requires both law reform and community norm change — SDG 16 and SDG 5 together."
  },
  {
    id: 5,
    theme: "Gender Equality",
    level: "Uni",
    sdg: "SDG 5",
    q: "What percentage of Uganda's Members of Parliament are women, and how does this compare to the global average?",
    opts: ["15% — below global average of 26%", "34% — above global average of 26%", "50% — at gender parity", "22% — slightly below global average"],
    ans: 1,
    fb: "Uganda's parliament is 34% women — above the global average of 26% — largely due to reserved seats for women, youth, workers, and persons with disabilities under Article 78 of the Constitution. However, fewer than 15% of district-level decision-making positions are held by women.",
    fact: "Article 33 of Uganda's Constitution guarantees women equal rights with men and prohibits laws or customs that undermine women's dignity. Yet customary law around inheritance and bride price continues to conflict with these protections in practice."
  },
  {
    id: 6,
    theme: "Gender Equality",
    level: "Uni",
    sdg: "SDG 5",
    q: "Uganda's National Gender Policy is coordinated by which ministry?",
    opts: ["Ministry of Education and Sports", "Ministry of Health", "Ministry of Gender, Labour and Social Development", "Office of the Prime Minister"],
    ans: 2,
    fb: "The Ministry of Gender, Labour and Social Development (MoGLSD) leads Uganda's gender equality policy, including the National Gender Policy, the Uganda Gender Equality Seal, and coordination of GBV response services.",
    fact: "Uganda's National Action Plan on UN Security Council Resolution 1325 (Women, Peace and Security) commits Uganda to increasing women's participation in peace processes — relevant given Uganda's history of conflict in the north and its role hosting 1.5 million refugees."
  },
  {
    id: 7,
    theme: "Climate Action",
    level: "HS",
    sdg: "SDG 13",
    q: "Uganda contributes approximately what share of global greenhouse gas emissions?",
    opts: ["About 5%", "Around 2%", "Less than 0.1%", "About 1%"],
    ans: 2,
    fb: "Less than 0.1% — yet Uganda is among the most climate-vulnerable countries in the world. This injustice is central to the global climate debate: those who did least to cause climate change suffer most from its effects.",
    fact: "The Rwenzori Mountains — called the Mountains of the Moon — once had 43 glaciers. Today fewer than 3 remain and scientists predict they will be ice-free by 2030, threatening fresh water for millions in western Uganda."
  },
  {
    id: 8,
    theme: "Climate Action",
    level: "HS",
    sdg: "SDG 13",
    q: "The 2010 Mt Elgon landslides in eastern Uganda, triggered by unusually heavy rainfall, killed approximately how many people?",
    opts: ["Around 50", "About 100", "Over 300", "More than 1,000"],
    ans: 2,
    fb: "Over 300 people were killed in the Bududa landslides of 2010 — one of Uganda's worst natural disasters. Deforestation on Mt Elgon's slopes removed root systems that would have stabilised the hillside. SDG 13 and SDG 15 (Life on Land) are directly linked here.",
    fact: "Uganda's rainy seasons have become increasingly unpredictable since 2000. Farmers in Busoga report that planting calendars their grandparents used no longer work — the rains arrive 3–6 weeks later and end earlier than expected."
  },
  {
    id: 9,
    theme: "Climate Action",
    level: "HS",
    sdg: "SDG 15",
    q: "Uganda implemented a ban on plastic bags (kaveera) in which year, making it one of Africa's first countries to act?",
    opts: ["2002", "2007", "2012", "2018"],
    ans: 1,
    fb: "2007 — Uganda's plastic bag ban predates many developed countries. Yet enforcement remains inconsistent, particularly in rural areas and at markets. SDG 12 (Responsible Consumption) and SDG 14 (Life Below Water) both depend on plastic reduction.",
    fact: "Uganda receives an average of 320 sunny days per year — more than Germany, which generates 10% of its electricity from solar. Uganda's solar energy potential remains largely untapped, with only 17% of the population connected to the national grid."
  },
  {
    id: 10,
    theme: "Climate Action",
    level: "Uni",
    sdg: "SDG 13",
    q: "Uganda's Nationally Determined Contribution (NDC) to the Paris Agreement commits to reducing greenhouse gas emissions by approximately what percentage by 2030?",
    opts: ["5%", "12%", "22%", "35%"],
    ans: 2,
    fb: "22% reduction by 3030, conditional on international climate finance support. Uganda's NDC also commits to increasing forest cover to 18% of land area. However, Uganda currently receives less than 1% of global climate adaptation funding despite being highly vulnerable.",
    fact: "The EACOP (East Africa Crude Oil Pipeline) project will transport oil from Uganda's Albertine Rift to Tanzania's coast — a 1,443km pipeline. It has sparked significant debate about balancing Uganda's development revenue needs against climate commitments and ecosystem protection."
  },
  {
    id: 11,
    theme: "Climate Action",
    level: "Uni",
    sdg: "SDG 15",
    q: "According to NEMA, Uganda lost approximately what percentage of its forest cover between 1990 and 2015?",
    opts: ["15%", "30%", "63%", "80%"],
    ans: 2,
    fb: "63% forest loss in 25 years — one of the fastest deforestation rates in Africa. Drivers include charcoal production (80% of Ugandan households cook with charcoal or firewood), agricultural expansion, and timber harvesting. The National Forestry Authority (NFA) manages 506 Central Forest Reserves.",
    fact: "Uganda's tea industry — centred in Kanungu, Kabale, and Kapchorwa — is increasingly threatened by climate change. Tea requires specific temperature and rainfall patterns. Farmers report that quality has declined as temperatures rise — a direct SDG 2 and SDG 13 intersection."
  },
  {
    id: 12,
    theme: "Climate Action",
    level: "Uni",
    sdg: "SDG 7",
    q: "What percentage of Uganda's population has access to electricity, and what is the government's target by 2030?",
    opts: ["17% current; 60% target", "40% current; 80% target", "55% current; 100% target", "10% current; 40% target"],
    ans: 0,
    fb: "Only 17% of Ugandans have access to electricity — one of the lowest rates in Africa. Uganda's Electricity Regulatory Authority (ERA) targets 60% access by 2030. Rural electrification is led by the Rural Electrification Agency (REA), with significant support from solar mini-grids.",
    fact: "Uganda's Karuma Hydropower Dam (600MW) and Isimba Dam (183MW) more than doubled Uganda's electricity generation capacity. But generation outpacing distribution means power remains unaffordable or inaccessible for most Ugandans — a market access and infrastructure challenge."
  },
  {
    id: 13,
    theme: "Health & Wellbeing",
    level: "HS",
    sdg: "SDG 3",
    q: "What is Uganda's toll-free mental health support line operated by Butabika National Referral Hospital?",
    opts: ["0800 100 100", "0800 212 212", "0800 333 999", "0414 256 000"],
    ans: 1,
    fb: "0800 212 121 — free to call from any network in Uganda. During COVID-19 lockdowns, calls to this line increased by 300%. Butabika has just 550 mental health beds for Uganda's 47 million people — a ratio of 1 bed per 85,000 people.",
    fact: "14% of Ugandans live with a mental health condition — but less than 1% access any form of treatment. The primary barriers are stigma (mental illness attributed to witchcraft or spiritual failure), cost, and distance from services."
  },
  {
    id: 14,
    theme: "Health & Wellbeing",
    level: "HS",
    sdg: "SDG 3",
    q: "What is Uganda's doctor-to-patient ratio, compared to the WHO recommendation?",
    opts: ["1:1,000 — meeting WHO standard", "1:5,000 — slightly below standard", "1:25,000 — 25 times worse than WHO recommends", "1:50,000 — 50 times worse"],
    ans: 2,
    fb: "1:25,000 — 25 times worse than the WHO recommendation of 1 doctor per 1,000 people. Uganda's Village Health Teams (VHTs) — over 170,000 trained community health workers — fill this gap and are among Uganda's most important SDG assets.",
    fact: "Uganda's maternal mortality rate has fallen from 438 deaths per 100,000 live births in 2011 to 189 in 2022 — a dramatic improvement. But Uganda still loses over 5,000 mothers per year, most from preventable causes including haemorrhage and infection."
  },
  {
    id: 15,
    theme: "Health & Wellbeing",
    level: "HS",
    sdg: "SDG 3",
    q: "Approximately how many malaria cases does Uganda record each year, making it the country's leading cause of death?",
    opts: ["500,000", "2 million", "8 million", "16 million"],
    ans: 3,
    fb: "16 million malaria cases per year — Uganda has one of the highest malaria burdens in the world. Malaria accounts for 30–50% of outpatient visits and up to 20% of child deaths. Insecticide-treated nets and indoor spraying have reduced mortality but elimination remains far off.",
    fact: "Uganda's teen pregnancy rate is one of East Africa's highest: 25% of girls aged 15–19 have begun childbearing. Teen pregnancy is both a health crisis (SDG 3) and an education crisis (SDG 4) — girls who give birth before 18 are 6x less likely to complete secondary school."
  },
  {
    id: 16,
    theme: "Health & Wellbeing",
    level: "Uni",
    sdg: "SDG 3",
    q: "What percentage of Ugandans have access to safely managed sanitation, according to UBOS 2023?",
    opts: ["About 65%", "Around 45%", "Approximately 35%", "Only about 19%"],
    ans: 3,
    fb: "Only 19% — more than 4 in 5 Ugandans lack safely managed sanitation. This drives diarrhoea, cholera, typhoid, and child stunting. Uganda's WASH (Water, Sanitation and Hygiene) challenge simultaneously affects SDG 3, SDG 6, and SDG 4 (children miss school due to illness).",
    fact: "Open defecation is practiced by approximately 9% of Uganda's population — down from 25% in 2000, but still affecting over 4 million people. The highest rates are in Karamoja and some parts of West Nile. Community-Led Total Sanitation (CLTS) programmes have driven much of the improvement."
  },
  {
    id: 17,
    theme: "Health & Wellbeing",
    level: "Uni",
    sdg: "SDG 3",
    q: "Uganda has 1.4 million people living with HIV. Among youth aged 15–24, which group has the highest new infection rate?",
    opts: ["Young men in urban areas", "Young women aged 15–24, who are 3x more likely to be infected than young men", "Boys in secondary school", "Young men working as boda-boda riders"],
    ans: 1,
    fb: "Young women 15–24 are 3x more likely to be newly infected with HIV than young men of the same age. Gender inequality is an HIV driver — young women have less power to negotiate safe sex, are more vulnerable to transactional relationships, and often fear accessing services.",
    fact: "Uganda's HIV success story is remarkable: prevalence fell from 18% in 1992 to 5.4% in 2022 through a combination of behaviour change, treatment access, and prevention programmes. But new infections are rising again among youth — requiring renewed focus on SDG 3 and SDG 5 together."
  },
  {
    id: 18,
    theme: "Health & Wellbeing",
    level: "Uni",
    sdg: "SDG 2",
    q: "What percentage of Ugandan children under 5 are stunted (chronically malnourished), according to the Uganda DHS 2022?",
    opts: ["10%", "18%", "29%", "42%"],
    ans: 2,
    fb: "29% — nearly 1 in 3 Ugandan children under 5 are stunted. Stunting causes permanent cognitive and physical impairment, reducing lifetime productivity. It is concentrated in Karamoja (55%), Bukwo, and other food-insecure districts. SDG 2 (Zero Hunger) cannot be achieved without addressing stunting.",
    fact: "Uganda is food secure at a national level — it is one of Africa's largest food exporters. Yet 1.6 million Ugandans face acute food insecurity, mostly in the north and east. The paradox of food exports coexisting with child malnutrition is a distribution, poverty, and equity failure — core SDG 10 territory."
  },
  {
    id: 19,
    theme: "Human Capital Dev",
    level: "HS",
    sdg: "SDG 4",
    q: "Uganda's Human Capital Index (World Bank) score of 0.40 means a child born today in Uganda will reach approximately what percentage of their productive potential?",
    opts: ["80%", "60%", "40%", "20%"],
    ans: 2,
    fb: "40% — Uganda's HCI score of 0.40 means children reach less than half their potential due to gaps in education quality, health, and nutrition. Compare with Singapore at 0.88. Improving this is the combined mission of SDG 3 and SDG 4.",
    fact: "Uganda's primary school net enrolment rate is over 90% — one of the highest in Africa. But learning quality is the crisis: a 2022 UWEZO assessment found that 60% of P3 children cannot read a P2-level story in any language."
  },
  {
    id: 20,
    theme: "Human Capital Dev",
    level: "HS",
    sdg: "SDG 4",
    q: "What percentage of Ugandan students complete secondary school?",
    opts: ["28%", "45%", "60%", "72%"],
    ans: 0,
    fb: "Only 28% — Uganda's secondary completion rate is among the lowest in East Africa. Barriers include school fees, distance, early marriage (for girls), and child labour. The Universal Secondary Education (USE) policy reduced fees but quality and retention remain challenges.",
    fact: "Uganda produces 40,000 university graduates per year but the formal economy has space for only 9,000 new jobs. This is not a graduate failure — it is a structural mismatch that makes self-employment, entrepreneurship, and TVET pathways essential."
  },
  {
    id: 21,
    theme: "Human Capital Dev",
    level: "HS",
    sdg: "SDG 8",
    q: "What percentage of Uganda's youth aged 15–30 are unemployed or underemployed?",
    opts: ["About 20%", "Around 40%", "About 64%", "Nearly 85%"],
    ans: 2,
    fb: "64% — nearly two-thirds of Ugandan youth lack decent work. Uganda's economy creates approximately 400,000 new jobs per year but 800,000 young people enter the labour market annually. The gap of 400,000 is filled by informal work, migration, and — ideally — entrepreneurship.",
    fact: "Uganda ranks among the top 3 countries globally for entrepreneurial intent. Ugandans are among the most likely people in the world to start a business. The challenge is access to capital (less than 3% of youth have accessed formal credit) and market access — not ambition."
  },
  {
    id: 22,
    theme: "Human Capital Dev",
    level: "Uni",
    sdg: "SDG 4",
    q: "What percentage of Uganda's university students are enrolled in STEM fields?",
    opts: ["19%", "35%", "50%", "65%"],
    ans: 0,
    fb: "Only 19% of Ugandan university students study STEM — far below what Uganda's industrialisation ambitions require. Uganda's NDPIV explicitly targets increasing STEM enrolment to support the manufacturing, agro-processing, and digital economy sectors.",
    fact: "Makerere University was ranked Africa's best university in 1970 and attracted students from across the continent. Decades of underfunding reduced its standing. Recent investment in research infrastructure and PhD programmes is rebuilding its regional leadership — a direct NDPIV human capital priority."
  },
  {
    id: 23,
    theme: "Human Capital Dev",
    level: "Uni",
    sdg: "SDG 8",
    q: "Uganda's 'Skilling Uganda' programme targets training how many youth per year in technical and vocational skills?",
    opts: ["50,000", "150,000", "300,000", "500,000"],
    ans: 1,
    fb: "150,000 youth per year — though current BTVET (Business, Technical and Vocational Education and Training) institutions enrol far fewer. Only 4% of Ugandan youth are currently in TVET, despite 70% of needed jobs being technical. Closing this gap is one of Uganda's most urgent human capital challenges.",
    fact: "A TVET graduate in Uganda earns on average 40% more than a secondary school leaver and is twice as likely to be formally employed. Yet TVET carries a social stigma — it is seen as a path for students who 'failed' academics. Changing this perception is as important as building more institutions."
  },
  {
    id: 24,
    theme: "Human Capital Dev",
    level: "Uni",
    sdg: "SDG 4",
    q: "Uganda's UWEZO 2022 assessment of learning outcomes found that approximately what percentage of Primary 3 children could NOT read a Primary 2 level story?",
    opts: ["20%", "40%", "60%", "80%"],
    ans: 2,
    fb: "60% — a learning crisis hidden behind high enrolment figures. Uganda has successfully enrolled children in school (90%+ primary net enrolment) but not ensured they are learning. This quality gap is the defining human capital challenge of Uganda's next decade.",
    fact: "The highest learning outcomes in Uganda are in Central Region private schools. The lowest are in Karamoja and some parts of West Nile — a direct reflection of teacher deployment gaps, poverty, and conflict legacy. SDG 4 is not just about access; it is about equity of learning outcomes."
  },
  {
    id: 25,
    theme: "Peace Promotion",
    level: "HS",
    sdg: "SDG 16",
    q: "Uganda hosts approximately how many refugees, making it one of the world's largest refugee-hosting countries?",
    opts: ["300,000", "750,000", "1.5 million", "3 million"],
    ans: 2,
    fb: "1.5 million refugees — the third largest refugee population in the world. Uganda's open-door policy allows refugees to work, move freely, and own land. This progressive approach is internationally recognised as a model of peaceful coexistence and directly advances SDG 10 and SDG 16.",
    fact: "Uganda's Bidi Bidi refugee settlement in Yumbe District is the world's largest, hosting over 270,000 South Sudanese refugees. Unlike traditional camps, Bidi Bidi integrates refugees into host communities — sharing land, schools, and health facilities. Tensions exist, but so does cooperation."
  },
  {
    id: 26,
    theme: "Peace Promotion",
    level: "HS",
    sdg: "SDG 16",
    q: "The LRA (Lord's Resistance Army) conflict in northern Uganda lasted approximately how long and displaced how many people?",
    opts: ["5 years, 500,000 displaced", "20 years (1986–2006), about 1 million displaced", "10 years, 1 million displaced", "30 years, 5 million displaced"],
    ans: 1,
    fb: "20 years (1986–2006), approximately 2 million people displaced, and an estimated 30,000 children abducted as child soldiers. The Acholi, Langi, and Iteso regions bear the deepest scars. Recovery has been remarkable but trauma, land disputes, and underinvestment persist.",
    fact: "Uganda's traditional Acholi reconciliation ceremony 'Mato Oput' — drinking bitter root together — was used after the LRA conflict to restore relationships between former child soldiers and victims' families. Traditional justice mechanisms often heal what formal courts cannot reach."
  },
  {
    id: 27,
    theme: "Peace Promotion",
    level: "HS",
    sdg: "SDG 16",
    q: "Which Ugandan institution provides community-level justice and dispute resolution, making courts accessible to ordinary citizens?",
    opts: ["High Court of Uganda", "Chief Magistrates Courts", "Local Council Courts (LC1–LC3)", "Uganda Human Rights Commission"],
    ans: 2,
    fb: "Local Council Courts (LC1–LC3) handle land disputes, family matters, and minor civil cases at community level — making justice accessible without lawyers or long travel. They are the most widely used justice mechanism in Uganda and a critical pillar of SDG 16.",
    fact: "Uganda's JLOS (Justice, Law and Order Sector) is a coordination mechanism linking 17 institutions — from Uganda Police to the Judiciary to prisons — under a shared strategy. Uganda is one of few African countries to have this level of sector-wide justice planning, and it has improved case clearance rates significantly."
  },
  {
    id: 28,
    theme: "Peace Promotion",
    level: "Uni",
    sdg: "SDG 16",
    q: "Uganda's National Transitional Justice Policy, developed after the LRA conflict, focuses primarily on which mechanisms?",
    opts: ["Only criminal prosecutions at the ICC", "Formal truth-telling, reparations, amnesty, and traditional justice mechanisms", "Military tribunals for LRA commanders", "Economic compensation only, without formal acknowledgement of harm"],
    ans: 1,
    fb: "Uganda's Transitional Justice Policy combines truth-telling (acknowledging what happened), reparations (compensating victims), amnesty (for lower-level perpetrators who come forward), and traditional justice mechanisms like Mato Oput. This hybrid approach recognises that international criminal justice alone cannot heal communities.",
    fact: "The Amnesty Act (2000) granted amnesty to over 26,000 former LRA combatants who renounced rebellion — the largest amnesty programme in African history. Critics argued it denied justice to victims; supporters argued it ended the conflict faster. The debate between peace and justice remains one of transitional justice's central tensions."
  },
  {
    id: 29,
    theme: "Peace Promotion",
    level: "Uni",
    sdg: "SDG 16",
    q: "Karamoja, Uganda's most conflict-affected and food-insecure region, has seen significant improvement since a government disarmament programme began in which decade?",
    opts: ["1990s", "2000s", "2010s", "2020s"],
    ans: 1,
    fb: "The 2000s — Uganda's UPDF-led disarmament programme from approximately 2005–2011 significantly reduced cattle rustling and inter-clan violence in Karamoja. However, arms from South Sudan continue to flow in, and poverty-driven conflict persists. Development without disarmament, and disarmament without development, both fail.",
    fact: "Karamoja has Uganda's worst indicators across almost every SDG: highest malnutrition (55% child stunting), lowest school completion, highest poverty rates, and most limited infrastructure. It is a case study in how conflict, climate vulnerability, and marginalisation compound each other — and why integrated SDG approaches are essential."
  },
  {
    id: 30,
    theme: "Peace Promotion",
    level: "Uni",
    sdg: "SDG 16",
    q: "Uganda is a signatory to the UN Security Council Resolution 1325 on Women, Peace and Security. What does this resolution primarily require?",
    opts: ["That women make up 50% of all military forces", "That women are protected from violence during conflict and meaningfully included in peace processes", "That all peace negotiations be led by women", "That countries with active conflicts receive additional UN funding"],
    ans: 1,
    fb: "UNSCR 1325 (2000) requires that women are protected from conflict-related violence AND that they are meaningfully included in peace negotiations, post-conflict reconstruction, and security sector reform. Uganda's National Action Plan on 1325 commits to these goals — but implementation monitoring is weak.",
    fact: "Women were central to Uganda's northern peace negotiations in Juba (2006–2008). Female civil society representatives, though not at the main table, influenced the agenda on accountability and reparations. Their exclusion from formal negotiations and inclusion in civil society processes is a pattern repeated across Africa's peace processes."
  },
  {
    id: 31,
    theme: "Entrepreneurship",
    level: "HS",
    sdg: "SDG 8",
    q: "Uganda ranks among the top countries globally for which entrepreneurship indicator?",
    opts: ["Highest number of tech unicorns", "Top 3 for entrepreneurial intent (most likely to start a business)", "Largest venture capital market in Africa", "Most social enterprises per capita"],
    ans: 1,
    fb: "Uganda is in the top 3 globally for entrepreneurial intent — Ugandans are among the most likely people in the world to want to start a business. The challenge is converting intent into sustainable enterprise through access to finance, market linkages, and business skills.",
    fact: "Uganda's informal economy employs over 80% of the workforce. Informal businesses — from market traders to mobile repair shops — are the real backbone of Uganda's SDG 8 progress. Formalising even 20% of informal businesses could dramatically increase government tax revenue and worker protections."
  },
  {
    id: 32,
    theme: "Entrepreneurship",
    level: "HS",
    sdg: "SDG 9",
    q: "Kampala's Innovation Village has incubated over how many startups since its founding in 2012?",
    opts: ["50", "150", "300", "500"],
    ans: 2,
    fb: "Over 300 startups — with combined valuations exceeding USD 50 million. Sectors include agri-tech, fintech, health-tech, and education-tech. Several directly address SDGs: from platforms connecting smallholder farmers to markets (SDG 2) to digital health tools for rural clinics (SDG 3).",
    fact: "Uganda's mobile money ecosystem — led by MTN Mobile Money and Airtel Money — processes over UGX 100 trillion per year. Mobile money has become the primary financial tool for millions of unbanked Ugandans, making it a powerful infrastructure for SDG 1 (no poverty) and SDG 8 (economic growth)."
  },
  {
    id: 33,
    theme: "Entrepreneurship",
    level: "HS",
    sdg: "SDG 8",
    q: "The Uganda Youth Enterprise Programme (UYEP) provides which type of support to young entrepreneurs?",
    opts: ["Only business training, no financial support", "Vocational skills training and startup grants", "University scholarships only", "Import/export licences for youth-owned businesses"],
    ans: 1,
    fb: "UYEP provides vocational skills training AND startup grants — combining capability building with access to capital. It is coordinated by the Ministry of Gender, Labour and Social Development and has supported tens of thousands of young entrepreneurs across Uganda.",
    fact: "SafeBoda — Uganda's most well-known startup — began as a simple idea to make boda-boda rides safer through helmets and driver vetting. It grew into a multi-service tech platform and raised over USD 1.1 million in investment. It is proof that solving a community safety problem (SDG 3) can become a commercially viable business (SDG 8)."
  },
  {
    id: 34,
    theme: "Entrepreneurship",
    level: "Uni",
    sdg: "SDG 9",
    q: "What is the primary mandate of the Uganda Development Bank (UDB) in relation to entrepreneurship?",
    opts: ["To provide short-term consumer loans to individuals", "To fund infrastructure projects only", "To provide long-term development finance to productive sectors including SMEs and youth enterprises", "To manage Uganda's foreign exchange reserves"],
    ans: 2,
    fb: "UDB provides long-term development finance — lower-interest loans for projects that generate economic value and employment. It is one of few Ugandan institutions that will lend to youth-led enterprises and social businesses. The UDB Agriculture Credit Facility has supported thousands of agri-SMEs.",
    fact: "Less than 3% of Ugandan youth have ever accessed formal credit. The main barriers are: lack of collateral (youth rarely own land), no credit history, and bank minimum loan sizes that exceed what small enterprises need. Mobile credit products (MTN, Airtel, Jumo) are filling this gap — Uganda's fintech sector is one of East Africa's fastest growing."
  },
  {
    id: 35,
    theme: "Entrepreneurship",
    level: "Uni",
    sdg: "SDG 8",
    q: "Uganda's National Social Security Fund (NSSF) Hello Innovator competition has awarded innovation prizes since 2015. What is distinctive about this programme?",
    opts: ["It only accepts solutions from registered companies", "It is open only to students at Makerere University", "It accepts solutions from any Ugandan, including informal innovators, and has disbursed hundreds of millions of shillings", "It only funds technology-based solutions"],
    ans: 2,
    fb: "NSSF Hello Innovator accepts solutions from any Ugandan — formal or informal, student or professional — and has disbursed hundreds of millions of shillings to winning innovators. It is one of Uganda's most accessible innovation funding programmes and has supported solutions across agriculture, health, education, and manufacturing.",
    fact: "Uganda's Fenix International (now owned by ENGIE) provides solar home systems to off-grid households on a pay-as-you-go basis — customers pay daily instalments via mobile money, like airtime. This micro-payment model has connected over 600,000 Ugandan homes to solar power and is a landmark example of SDG 7 and SDG 9 intersecting with commercial viability."
  },
  {
    id: 36,
    theme: "Entrepreneurship",
    level: "Uni",
    sdg: "SDG 17",
    q: "In Uganda's startup ecosystem, what does 'impact investing' mean and how does it differ from traditional investing?",
    opts: ["It means investing only in charitable organisations with no expectation of return", "It means investing in businesses that generate both social/environmental impact and financial return", "It is a government grant programme for social enterprises", "It refers to investments made specifically by foreign donors"],
    ans: 1,
    fb: "Impact investing targets both financial return AND measurable social/environmental impact. In Uganda, organisations like Norfund (Norwegian development finance), Lundin Foundation, and Acumen have funded impact enterprises in energy, agriculture, and health. The global impact investing market exceeds USD 1 trillion — and Uganda is increasingly attractive to impact investors.",
    fact: "Uganda's agri-tech sector is attracting significant impact investment. Platforms like Ensibuuko (rural SACCO management software) and Tugende (asset financing for boda-boda riders) have raised millions in impact investment while generating measurable SDG outcomes — proving that Uganda's development challenges are investable opportunities."
  },
  {
    id: 37,
    theme: "Gender Equality",
    level: "HS",
    sdg: "SDG 5",
    q: "What does the term 'gender norm' mean in the context of gender equality?",
    opts: ["A law passed by parliament about gender roles", "An unwritten social rule about how boys and girls are expected to behave", "A school subject about gender education", "A government policy requiring equal pay"],
    ans: 1,
    fb: "Gender norms are unwritten social expectations — 'boys don't cry', 'girls should cook', 'a woman's place is in the home'. They are enforced not by law but by social pressure, and they are the root cause of much gender inequality. Changing norms requires community dialogue, role models, and time.",
    fact: "Research in Uganda shows that men who share domestic work are 60% more likely to have higher-earning wives — challenging the idea that gender equality is 'bad for men'. Equal partnerships create economic benefits for entire families."
  },
  {
    id: 38,
    theme: "Climate Action",
    level: "HS",
    sdg: "SDG 13",
    q: "What is the primary driver of deforestation in Uganda, affecting millions of households?",
    opts: ["Commercial logging by foreign companies", "Charcoal and firewood production for cooking by households", "Urban construction and road building", "Coffee and tea plantation expansion"],
    ans: 1,
    fb: "80% of Ugandan households cook using charcoal or firewood — making household energy the primary driver of deforestation. MAAIF's biogas programme and NGO-led clean cookstove distribution are working to shift this, but scale remains limited. SDG 7 (clean energy) is the most direct solution to SDG 15 (life on land) in Uganda.",
    fact: "Uganda's National Forestry Authority (NFA) manages 506 Central Forest Reserves covering about 1 million hectares. But encroachment, illegal logging, and charcoal burning erode these reserves every year. Community forests managed by local groups have shown better conservation outcomes than state-managed reserves in several districts."
  },
  {
    id: 39,
    theme: "Health & Wellbeing",
    level: "HS",
    sdg: "SDG 3",
    q: "Uganda's Village Health Teams (VHTs) are community health workers trained to extend health services at village level. Approximately how many VHTs have been trained across Uganda?",
    opts: ["10,000", "50,050", "170,000", "500,000"],
    ans: 2,
    fb: "Over 170,000 VHTs — one of Africa's largest community health worker programmes. VHTs conduct home visits, refer sick children, distribute nets and ORS, and track disease outbreaks. They are Uganda's most cost-effective public health intervention and a primary driver of SDG 3 progress.",
    fact: "VHTs in Uganda are mostly women, mostly unpaid, and mostly working 20+ hours per month for their communities. Debates about stipends, recognition, and burnout are ongoing. Their work has been described as 'invisible labour' that subsidises Uganda's underfunded health system."
  },
  {
    id: 40,
    theme: "Peace Promotion",
    level: "HS",
    sdg: "SDG 16",
    q: "What does SDG 16 primarily focus on?",
    opts: ["Military strength and national security", "Peace, justice, and strong institutions — including access to justice and inclusive governance", "Trade and economic partnerships", "Environmental protection treaties"],
    ans: 1,
    fb: "SDG 16 covers Peace, Justice and Strong Institutions — including targets on reducing violence, ending abuse, ensuring access to justice for all, and building accountable, inclusive governance at all levels. It is often called the 'enabling SDG' because progress on SDG 16 accelerates every other goal.",
    fact: "Countries with strong rule of law score 40% higher on SDG progress overall (UN 2023). In Uganda, strengthening LC courts, reducing police brutality, fighting corruption, and improving public service delivery are all SDG 16 actions with SDG-wide impact."
  },
  {
    id: 41,
    theme: "Human Capital Dev",
    level: "HS",
    sdg: "SDG 4",
    q: "What is TVET and why is it important for Uganda's development?",
    opts: ["Technical and Vocational Education and Training — it builds practical skills for technical jobs", "Teacher Volunteer Exchange Training — a programme for retired teachers", "Traditional Values and Ethics Training — a religious education programme", "Technology, Values and Entrepreneurship Training — a university module"],
    ans: 0,
    fb: "Technical and Vocational Education and Training (TVET) builds plumbers, electricians, welders, tailors, mechanics, and other skilled workers that Uganda's industrialisation agenda requires. Only 4% of Ugandan youth are in TVET — far below the 70%+ of jobs that are technical. Changing this perception is one of Uganda's most important human capital challenges.",
    fact: "Germany's 'dual system' TVET — where students alternate between school and workplace apprenticeships — is considered the gold standard globally. Uganda's BTVET reform is modelled partly on this approach. German development agencies (GIZ) are active partners in Uganda's TVET expansion."
  },
  {
    id: 42,
    theme: "Entrepreneurship",
    level: "HS",
    sdg: "SDG 8",
    q: "What is the difference between a business and a social enterprise?",
    opts: ["A social enterprise is a charity that never makes money", "A social enterprise solves a community problem while also being financially sustainable", "A business is illegal while a social enterprise is approved by government", "There is no difference — all businesses are social enterprises"],
    ans: 1,
    fb: "A social enterprise addresses a community or social problem and is financially sustainable — it generates revenue rather than depending entirely on donations. Examples in Uganda: SafeBoda (safer transport), Fenix International (affordable solar), Ensibuuko (rural finance management). All solve real problems AND earn money.",
    fact: "B Corporation certification — a global standard for businesses that balance profit and purpose — is now held by 3 Ugandan companies. The B Corp movement is growing across East Africa as investors increasingly demand evidence of social and environmental responsibility alongside financial returns."
  },
  {
    id: 43,
    theme: "Gender Equality",
    level: "Uni",
    sdg: "SDG 5",
    q: "What is the 'gender pay gap' in Uganda's formal sector and what drives it?",
    opts: ["There is no significant gap — Uganda's constitution guarantees equal pay", "Women earn approximately 40% less than men in formal employment, driven by occupational segregation, unpaid care work, and discrimination", "Women earn more than men in Uganda's formal sector", "The gap is only 5% and is closing rapidly"],
    ans: 1,
    fb: "A 40% gender pay gap in Uganda's formal sector — driven by occupational segregation (women concentrated in lower-paid sectors), unpaid care and domestic work that limits women's working hours, discrimination in promotion and hiring, and lower ownership of productive assets including land and capital.",
    fact: "Uganda's National Equal Opportunities Commission (EOC) investigates gender discrimination complaints in employment, education, and public services. Since 2007, the EOC has handled over 15,000 cases — but limited enforcement powers and resources mean many cases are resolved through mediation rather than binding decisions."
  },
  {
    id: 45,
    theme: "Climate Action",
    level: "Uni",
    sdg: "SDG 13",
    q: "What is Uganda's main climate adaptation challenge in the agricultural sector, where 70% of the population works?",
    opts: ["Excess rainfall causing permanent flooding of farmland", "Changing rainfall patterns and prolonged droughts that disrupt traditional planting calendars, causing food insecurity", "Lack of modern farming equipment", "Soil being too fertile, causing crop diseases"],
    ans: 1,
    fb: "Changing rainfall patterns are the defining agricultural climate challenge. Farmers across Uganda — especially in Karamoja, Acholi, and eastern regions — report that traditional planting calendars (which guided centuries of farming) no longer work. Late rains, early ends to rainy seasons, and extreme weather events are costing Uganda billions annually in crop losses.",
    fact: "Uganda's National Adaptation Plan (NAP) for agriculture promotes climate-smart agriculture practices including drought-resistant seeds, water harvesting, and agroforestry. Partners including FAO, CGIAR, and GIZ support these programmes. But reaching the 3.8 million smallholder farming households remains the core challenge."
  },
  {
    id: 45,
    theme: "Human Capital Dev",
    level: "Uni",
    sdg: "SDG",
    q: "What is Uganda's National Social Protection Policy designed to do, and which population does it primarily target?",
    opts: ["Provide university scholarships to top students", "Provide cash transfers, school feeding, and livelihood support to the extreme poor, elderly, and vulnerable — targeting 3 million households", "Offer tax relief to middle-class families", "Fund pension schemes for government employees only"],
    ans: 1,
    fb: "Uganda's Social Protection Policy targets extreme poor households, including through the Social Assistance Grants for Empowerment (SAGE) programme which provides monthly cash transfers to the elderly poor. Uganda's social protection coverage is one of the lowest in Africa — only 6% of the population — leaving the majority of the poor without safety nets.",
    fact: "Research in Uganda's SAGE programme shows that every UGX 1 of cash transfer generates UGX 2.50 in local economic activity — as recipients spend on food, school fees, and local goods. Cash transfers are not charity; they are economic stimulus with a pro-poor multiplier effect."
  }
];
