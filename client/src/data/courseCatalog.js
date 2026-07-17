// Static reference catalog of subjects/topics across sectors. Each topic gets a Goose-generated
// tutorial reading, a quiz, and — for programming-related sectors — a coding assessment too.

export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// isProgramming: whether topics in this sector should offer a coding assessment.
// defaultLanguage: the language to use for coding assessments in this sector.
export const CATALOG = {
  "Engineering — CSE / IT": {
    isProgramming: true,
    defaultLanguage: "c",
    topics: [
      "Data Structures", "Algorithms", "Operating Systems", "Computer Networks",
      "Database Management Systems", "Object-Oriented Programming", "Computer Architecture",
      "Theory of Computation", "Software Engineering", "Compiler Design",
    ],
  },
  "Engineering — ECE": {
    isProgramming: false,
    topics: [
      "Digital Electronics", "Analog Electronics", "Signals and Systems",
      "Electromagnetic Theory", "Communication Systems", "Microprocessors",
      "Control Systems", "VLSI Design",
    ],
  },
  "Engineering — EEE": {
    isProgramming: false,
    topics: [
      "Circuit Theory", "Electrical Machines", "Power Systems", "Control Systems",
      "Power Electronics", "Electromagnetic Fields", "Digital Signal Processing",
    ],
  },
  "Engineering — Mechanical": {
    isProgramming: false,
    topics: [
      "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Machine Design",
      "Manufacturing Processes", "Heat Transfer", "Engineering Mechanics", "Kinematics of Machinery",
    ],
  },
  "Engineering — Civil": {
    isProgramming: false,
    topics: [
      "Structural Analysis", "Concrete Technology", "Fluid Mechanics", "Geotechnical Engineering",
      "Surveying", "Transportation Engineering", "Environmental Engineering", "Construction Management",
    ],
  },
  "Medical — MBBS": {
    isProgramming: false,
    topics: [
      "Human Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology",
      "Microbiology", "Forensic Medicine", "Community Medicine", "Internal Medicine", "Surgery",
    ],
  },
  "Programming Languages": {
    isProgramming: true,
    perTopicLanguage: true, // each topic name IS the language
    topics: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift"],
  },
  "Domains — Web & App Development": {
    isProgramming: true,
    defaultLanguage: "javascript",
    topics: [
      "HTML & CSS", "React", "Node.js & Express", "REST APIs", "Android Development",
      "iOS Development", "Flutter", "Full Stack Development",
    ],
  },
  "Domains — AI & Data": {
    isProgramming: true,
    defaultLanguage: "python",
    topics: [
      "Machine Learning", "Deep Learning", "Neural Networks", "Natural Language Processing",
      "Data Analytics", "Data Visualization", "SQL for Data Analysis", "Statistics for Data Science",
    ],
  },
};

export const SECTORS = Object.keys(CATALOG);

export function languageForTopic(sector, topic) {
  const s = CATALOG[sector];
  if (!s?.isProgramming) return null;
  if (s.perTopicLanguage) return topic.toLowerCase().replace("++", "pp").replace(/\s.*/, "");
  return s.defaultLanguage || "javascript";
}
