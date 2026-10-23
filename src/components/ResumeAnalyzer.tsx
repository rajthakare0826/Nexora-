import { useState, useEffect, ChangeEvent } from "react";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  XCircle, 
  Database, 
  History, 
  RefreshCw,
  Download,
  Clipboard,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  AlertTriangle,
  GraduationCap,
  Layers,
  ArrowRight,
  Copy,
  BookOpen,
  Award,
  Code2,
  FolderGit2,
  Lightbulb
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ResumeAnalysis } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import ResumeBuilder from "./ResumeBuilder";
import { logActivity } from "../lib/activityLogger";
import { jsPDF } from "jspdf";

export interface ResumeSequenceInfo {
  id: "fresher" | "experienced" | "switcher";
  name: string;
  badge: string;
  tagline: string;
  description: string;
  idealFor: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    keyTip: string;
    iconName?: string;
  }>;
  markdownTemplate: string;
}

export const RESUME_SEQUENCES: ResumeSequenceInfo[] = [
  {
    id: "fresher",
    name: "Fresher",
    badge: "Recommended for Freshers & Grads",
    tagline: "Student / College Graduate (0-2 Yrs Experience)",
    description: "Tailored specifically for candidates with limited or no full-time corporate history. Structures Education, Technical Skills, and Hands-on Academic/Capstone Projects before work history, allowing ATS algorithms and hiring managers to immediately verify technical depth and potential.",
    idealFor: "Final year students, recent college graduates, bootcamp completers, and junior developers.",
    steps: [
      {
        step: 1,
        title: "Contact Information & Social Links",
        description: "Full Name, Location (City, State), Professional Email, Phone, LinkedIn, and active GitHub / Portfolio links.",
        keyTip: "Make GitHub and LinkedIn links live. Avoid physical street addresses or photos for US/Global ATS standard compliance."
      },
      {
        step: 2,
        title: "Career Objective / Fresher Summary",
        description: "2-3 concise lines detailing your degree, core tech stack, passion for the target role, and eagerness to contribute.",
        keyTip: "Tailor this to the target role (e.g. 'Aspiring Full Stack Engineer skilled in React & Node.js seeking to build scalable web apps')."
      },
      {
        step: 3,
        title: "Education & Academic Performance",
        description: "Degree, Major, College/University, Graduation Year (or expected), CGPA / Percentage, and relevant coursework.",
        keyTip: "Highlight high GPA (if > 7.5/10 or > 3.2/4.0) and coursework like Data Structures, DBMS, Cloud Computing, AI/ML."
      },
      {
        step: 4,
        title: "Technical Skills & Competencies",
        description: "Grouped by Category: Programming Languages, Web Frameworks, Cloud & Databases, Developer Tools, Core Concepts.",
        keyTip: "Group skills cleanly (e.g. Languages: TypeScript, Python; Tools: Docker, Git, VS Code; DB: PostgreSQL, MongoDB)."
      },
      {
        step: 5,
        title: "Academic & Capstone Projects (Key Anchor)",
        description: "2-3 major projects with Title, Tech Stack, Live Demo / GitHub link, and 2-3 bullet points emphasizing outcomes.",
        keyTip: "Use the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Example: Built e-commerce engine reducing load time by 35%."
      },
      {
        step: 6,
        title: "Internships / Industrial Training",
        description: "Internship role, organization, dates, key responsibilities, tools utilized, and quantifiable impact.",
        keyTip: "Include freelance projects, university lab research, or summer internships."
      },
      {
        step: 7,
        title: "Certifications & Verified Courses",
        description: "AWS Certified Cloud Practitioner, Google Cloud, Meta React Developer, LeetCode Problem Solver badges.",
        keyTip: "Include credential IDs or issue dates."
      },
      {
        step: 8,
        title: "Extracurriculars, Hackathons & Achievements",
        description: "Hackathon rankings (Smart India Hackathon, MLH), Coding contest ratings (Codeforces, LeetCode 300+ problems), Tech club leadership.",
        keyTip: "Demonstrates problem-solving mindset, teamwork, and proactive initiative outside the classroom."
      }
    ],
    markdownTemplate: `# ALEX RIVERA
City, State • alex.rivera@email.com • +1 (555) 019-2834
LinkedIn: linkedin.com/in/alexrivera • GitHub: github.com/alexrivera • Portfolio: alexrivera.dev

---

### CAREER OBJECTIVE
Enthusiastic and results-driven Computer Science graduate with strong foundations in React, TypeScript, Node.js, and Cloud architectures. Seeking an entry-level Software Engineer / Frontend Developer role to design scalable web applications, collaborate with cross-functional teams, and contribute to cutting-edge software solutions.

---

### EDUCATION
**Bachelor of Science in Computer Science** | Tech State University  
*Graduation: May 2025 • GPA: 3.8 / 4.0 (Dean's Honor List)*  
- **Relevant Coursework:** Data Structures & Algorithms, Database Management Systems, Distributed Systems, Web Application Security, Artificial Intelligence & Machine Learning.

---

### TECHNICAL SKILLS
- **Programming Languages:** JavaScript (ES6+), TypeScript, Python, Java, SQL, HTML5, CSS3/Tailwind
- **Frameworks & Libraries:** React.js, Next.js, Node.js, Express.js, Redux Toolkit, Tailwind CSS
- **Databases & Cloud:** PostgreSQL, MongoDB, Firebase Firestore, AWS (S3, Lambda Basics), Supabase
- **Developer Tools & Practices:** Git, GitHub Actions, Docker (Basics), Vite, REST APIs, Jest, Agile/Scrum

---

### ACADEMIC & CAPSTONE PROJECTS
**CloudTask - Collaborative Task Management Platform** | *React, TypeScript, Node.js, MongoDB, Socket.io*  
*GitHub: github.com/alexrivera/cloudtask • Live Demo: cloudtask-app.dev*
- Developed a full-stack real-time collaboration app enabling multi-user workspace management with live updates.
- Implemented JWT authentication and role-based access control (RBAC), reducing unauthorized request attempts to 0%.
- Optimized MongoDB indexing and client-side caching, boosting page load speeds by 42%.

**AI Document Summarizer & Query Engine** | *Python, FastAPI, LangChain, React, Tailwind*  
*GitHub: github.com/alexrivera/ai-doc-query*
- Built an intelligent document ingestion pipeline capable of parsing PDF/DOCX files and generating summaries.
- Integrated vector embeddings via ChromaDB, achieving sub-200ms semantic retrieval across 500+ page datasets.
- Deployed RESTful API backend on Docker with 99.8% uptime during university symposium demonstration.

---

### INTERNSHIPS & INDUSTRIAL TRAINING
**Software Engineering Intern** | Apex Digital Labs  
*June 2024 – August 2024 • Remote*
- Collaborated with senior engineers to migrate legacy UI components to React 18 and Tailwind CSS.
- Automated API test suites using Jest and React Testing Library, increasing unit test coverage from 62% to 88%.
- Participated in bi-weekly agile sprints, code reviews, and cross-team architectural discussions.

---

### CERTIFICATIONS
- **AWS Certified Cloud Practitioner** – Amazon Web Services (2024)
- **Meta Front-End Developer Professional Certificate** – Coursera (2024)
- **Problem Solving (Intermediate) Certificate** – HackerRank (2024)

---

### ACHIEVEMENTS & EXTRACURRICULARS
- **Top 5 Finalist** out of 120+ teams at University Hackathon 2024 for building an automated campus navigation PWA.
- **Solved 350+ algorithmic challenges** on LeetCode across Data Structures, Dynamic Programming, and Graph algorithms.
- **Technical Lead**, University Google Developer Student Club (GDSC) — organized 6 technical workshops for 200+ students.
`
  },
  {
    id: "experienced",
    name: "Experienced",
    badge: "For Mid/Senior Level",
    tagline: "Industry Professionals (3+ Yrs Experience)",
    description: "Prioritizes professional career accomplishments, quantified business impact, and seniority before education.",
    idealFor: "Mid-level engineers, senior developers, and experienced specialists.",
    steps: [
      { step: 1, title: "Header & Contact Details", description: "Name, Location, Email, Phone, LinkedIn, Portfolio/GitHub.", keyTip: "Concise and modern." },
      { step: 2, title: "Executive Professional Summary", description: "3-4 lines highlighting years of experience, core domains, and major leadership wins.", keyTip: "Focus on business value delivered." },
      { step: 3, title: "Professional Work Experience", description: "Reverse-chronological employment history with quantified bullet points (metrics, revenue, latency).", keyTip: "Use strong action verbs." },
      { step: 4, title: "Key Projects & Architecture Highlights", description: "High-impact enterprise or open-source initiatives.", keyTip: "Highlight architectural decisions." },
      { step: 5, title: "Technical Skills & Tooling", description: "Core competencies, frameworks, systems, and management tools.", keyTip: "Group by competency." },
      { step: 6, title: "Education & Certifications", description: "Degrees, executive education, and industry certifications.", keyTip: "Place below work experience." }
    ],
    markdownTemplate: `# JANE DOE
San Francisco, CA • jane.doe@email.com • +1 (555) 234-5678 • linkedin.com/in/janedoe • github.com/janedoe

---

### EXECUTIVE SUMMARY
Results-driven Senior Full Stack Software Engineer with 6+ years of experience architecting high-throughput distributed systems, microservices, and modern web applications in fintech and SaaS domains. Proven track record in mentoring junior developers and driving 35%+ performance enhancements.

---

### PROFESSIONAL EXPERIENCE
**Senior Software Engineer** | Nexus Cloud Systems (2022 – Present)
- Led frontend re-architecture for flagship analytics product using Next.js and TypeScript, reducing TTI by 45%.
- Designed event-driven Kafka pipelines handling 10M+ daily events with 99.99% availability.
- Mentored a pod of 6 engineers and standardized CI/CD pipelines with GitHub Actions.

**Software Engineer** | Apex Interactive (2019 – 2022)
- Built scalable REST and GraphQL APIs serving 2M+ active monthly users using Node.js and PostgreSQL.
- Implemented Redis caching layers, cutting average database query latency from 180ms to 24ms.

---

### TECHNICAL SKILLS
- **Languages:** TypeScript, JavaScript, Python, Go, SQL
- **Frameworks:** React, Next.js, Node.js, Express, NestJS
- **Infrastructure:** Docker, Kubernetes, AWS (ECS, S3, RDS), Terraform

---

### EDUCATION
**B.S. in Computer Science** | University of California, Berkeley (2019)
`
  },
  {
    id: "switcher",
    name: "Career Switcher",
    badge: "For Domain Transitioners",
    tagline: "Transitioning to Tech / New Domain",
    description: "Emphasizes transferable leadership & analytical skills, recent technical upskilling, and relevant portfolio projects.",
    idealFor: "Professionals moving into tech from other industries or shifting tech domains.",
    steps: [
      { step: 1, title: "Contact Information", description: "Clear contact details, LinkedIn, GitHub, and Project Portfolio.", keyTip: "Ensure LinkedIn reflects transition." },
      { step: 2, title: "Career Transition Summary", description: "Narrative bridging previous domain expertise with new technical capabilities.", keyTip: "Highlight the unique intersection of skills." },
      { step: 3, title: "Core Technical & Transferable Skills", description: "New tech stack competencies paired with analytical and project management abilities.", keyTip: "List relevant tools first." },
      { step: 4, title: "Portfolio Projects & Capstones", description: "Demonstrating hands-on ability to solve real problems with the new skill set.", keyTip: "Include live demos." },
      { step: 5, title: "Technical Certifications & Training", description: "Bootcamps, verified certificates, and specialized coursework.", keyTip: "Shows dedication to craft." },
      { step: 6, title: "Previous Professional History", description: "Highlighting transferable wins, leadership, and operational accomplishments.", keyTip: "Frame through problem-solving lens." }
    ],
    markdownTemplate: `# MORGAN REID
Austin, TX • morgan.reid@email.com • +1 (555) 987-6543 • linkedin.com/in/morganreid • github.com/morganreid

---

### PROFESSIONAL SUMMARY
Dynamic professional transitioning from Financial Analysis to Full-Stack Web Development, combining 4+ years of data-driven problem solving and stakeholder management with full-stack engineering skills in React, TypeScript, Node.js, and SQL. 

---

### TECHNICAL SKILLS & COMPETENCIES
- **Technical Skills:** JavaScript, TypeScript, React.js, Node.js, Express.js, PostgreSQL, Git, Tailwind CSS
- **Transferable Competencies:** Statistical Analysis, Financial Modeling, Agile Project Management, Stakeholder Communication

---

### FEATURED SOFTWARE PROJECTS
**FinTrack - Personal Wealth Analytics Dashboard** | *React, TypeScript, Chart.js, Express, PostgreSQL*
- Engineered end-to-end budget visualization app processing 1,000+ transaction lines with real-time portfolio forecasting.
- Implemented responsive dark UI and secure OAuth login with JWT session validation.

---

### TECHNICAL UPSKILLING & CERTIFICATIONS
- **Full Stack Web Development Immersion Certificate** (2024)
- **Meta Front-End Professional Certificate** (2024)

---

### PREVIOUS PROFESSIONAL EXPERIENCE
**Senior Financial Analyst** | Global Horizon Capital (2020 – 2024)
- Automated data reporting workflows via Python scripts, saving 15 analyst hours weekly.
`
  }
];

interface ResumeAnalyzerProps {
  user: FirebaseUser | null;
}

export default function ResumeAnalyzer({ user }: ResumeAnalyzerProps) {
  const [activeMainTab, setActiveMainTab] = useState<"builder" | "evaluator" | "sequences">("builder");
  const [selectedSequence, setSelectedSequence] = useState<"fresher" | "experienced" | "switcher">("fresher");
  const [guideSequenceTab, setGuideSequenceTab] = useState<"fresher" | "experienced" | "switcher">("fresher");
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<ResumeAnalysis[]>([]);
  const [inputMode, setInputMode] = useState<"upload" | "text">("upload");
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [templateLoadedToast, setTemplateLoadedToast] = useState(false);

  const handleBuilderSendToAnalyzer = (text: string, role: string, seq: "fresher" | "experienced" | "switcher") => {
    setResumeText(text);
    if (role) setTargetRole(role);
    setSelectedSequence(seq);
    setInputMode("text");
    setActiveMainTab("evaluator");
  };

  useEffect(() => {
    if (user) {
      loadPastAnalyses();
    }
  }, [user]);

  const loadPastAnalyses = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "resume_analyses"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const list: ResumeAnalysis[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ResumeAnalysis);
      });
      setPastAnalyses(list);
    } catch (e) {
      console.error("Failed loading past analyses", e);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 8 * 1024 * 1024) {
        setError("File size exceeds 8MB limit. Please upload a smaller file or copy-paste text.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleLoadTemplate = (seqId: "fresher" | "experienced" | "switcher") => {
    const seq = RESUME_SEQUENCES.find(s => s.id === seqId);
    if (!seq) return;
    setResumeText(seq.markdownTemplate);
    setInputMode("text");
    setSelectedSequence(seqId);
    if (seqId === "fresher" && !targetRole) {
      setTargetRole("Junior Software Engineer / Frontend Developer");
    }
    setActiveMainTab("evaluator");
    setTemplateLoadedToast(true);
    setTimeout(() => setTemplateLoadedToast(false), 3000);
  };

  const handleCopyTemplate = (seqId: "fresher" | "experienced" | "switcher") => {
    const seq = RESUME_SEQUENCES.find(s => s.id === seqId);
    if (!seq) return;
    navigator.clipboard.writeText(seq.markdownTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      setError("Please specify your Target Role to ensure correct ATS keyword evaluation.");
      return;
    }

    if (inputMode === "upload" && !file) {
      setError("Please select a resume file (PDF, DOCX, TXT) first.");
      return;
    }

    if (inputMode === "text" && !resumeText.trim()) {
      setError("Please copy and paste your resume text in the field below.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fileBase64 = "";
      let mimeType = "";
      let fileName = "";

      if (inputMode === "upload" && file) {
        fileName = file.name;
        // Handle common DOCX MIME type or fallback
        if (file.name.endsWith(".docx")) {
          mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else {
          mimeType = file.type || "application/pdf";
        }
        // Convert file to base64
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            // Strip off data metadata prefix
            const raw = result.split(",")[1];
            resolve(raw);
          };
          reader.onerror = (e) => reject(e);
        });

        await logActivity({
          activity: "Resume Uploaded",
          details: `Uploaded resume file '${file.name}' (${(file.size / 1024 / 1024).toFixed(2)} MB) for target role: ${targetRole} [Sequence: ${selectedSequence}]`,
          status: "Success"
        });
      }

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: inputMode === "text" ? resumeText : "",
          fileBase64,
          fileName,
          mimeType,
          targetRole,
          sequence: selectedSequence
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server failed to analyze the resume.");
      }

      const result: ResumeAnalysis = await response.json();
      setAnalysis(result);

      await logActivity({
        activity: "Resume Analyzed",
        details: `ATS Score: ${result.atsScore}% - target: ${targetRole} [Sequence: ${selectedSequence}]. Feedback and sequence analysis completed.`,
        status: "Success"
      });

      // Save to Firebase under logged-in user, otherwise cache locally
      if (user) {
        const docPayload = {
          userId: user.uid,
          timestamp: Date.now(),
          targetRole,
          fileName: fileName || "Pasted Text Resume",
          sequence: selectedSequence,
          sequenceFeedback: result.sequenceFeedback || "",
          atsScore: result.atsScore,
          summary: result.summary,
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || [],
          improvements: result.improvements || [],
          missingKeywords: result.missingKeywords || [],
          recommendedRoles: result.recommendedRoles || [],
          extractedText: result.extractedText || "",
          sectionAnalysis: result.sectionAnalysis || { contact: "", experience: "", skills: "", education: "" },
          suggestedFormatting: result.suggestedFormatting || ""
        };
        await addDoc(collection(db, "users", user.uid, "resume_analyses"), docPayload);
        loadPastAnalyses();
      } else {
        localStorage.setItem("careerpilot_latest_analysis", JSON.stringify(result));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during ATS scoring.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Add document title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("ATS Resume Analysis Report", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Target: ${analysis.targetRole} | Sequence: ${analysis.sequence === "fresher" ? "Fresher Sequence" : (analysis.sequence || selectedSequence)}`, 20, 26);

    // Score banner
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(20, 32, 170, 24, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`Overall ATS Score: ${analysis.atsScore} / 100`, 26, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700
    const summaryLines = doc.splitTextToSize(analysis.summary, 155);
    doc.text(summaryLines, 26, 48);

    let currentY = 68;

    const checkPageBoundary = (heightNeeded: number) => {
      if (currentY + heightNeeded > 275) {
        doc.addPage();
        currentY = 20;
      }
    };

    // Strengths
    checkPageBoundary(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Key Strengths", 20, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    analysis.strengths.forEach((str) => {
      checkPageBoundary(12);
      const bulletLines = doc.splitTextToSize(`• ${str}`, 165);
      doc.text(bulletLines, 20, currentY);
      currentY += bulletLines.length * 5;
    });

    // Weaknesses
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      currentY += 4;
      checkPageBoundary(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("2. Weaknesses Identified", 20, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      analysis.weaknesses.forEach((weak) => {
        checkPageBoundary(12);
        const bulletLines = doc.splitTextToSize(`• ${weak}`, 165);
        doc.text(bulletLines, 20, currentY);
        currentY += bulletLines.length * 5;
      });
    }

    // Sequence Feedback
    if (analysis.sequenceFeedback) {
      currentY += 4;
      checkPageBoundary(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`3. Resume Sequence Evaluation (${analysis.sequence === "fresher" ? "Fresher Sequence" : "Sequence"} Order)`, 20, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const seqLines = doc.splitTextToSize(analysis.sequenceFeedback, 165);
      doc.text(seqLines, 20, currentY);
      currentY += seqLines.length * 5;
    }

    // Recommended IT and AI Job Roles
    if (analysis.recommendedRoles && analysis.recommendedRoles.length > 0) {
      currentY += 4;
      checkPageBoundary(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("4. Recommended IT & AI Job Roles", 20, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const rolesStr = analysis.recommendedRoles.join(", ");
      const roleLines = doc.splitTextToSize(rolesStr, 165);
      doc.text(roleLines, 20, currentY);
      currentY += roleLines.length * 5;
    }

    // Missing Keywords
    if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
      currentY += 4;
      checkPageBoundary(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("5. Critical Missing Keywords", 20, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const keywordsText = analysis.missingKeywords.join(", ");
      const kwLines = doc.splitTextToSize(keywordsText, 165);
      doc.text(kwLines, 20, currentY);
      currentY += kwLines.length * 5;
    }

    // Section Evaluation
    currentY += 4;
    checkPageBoundary(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("6. Section-by-Section Evaluation", 20, currentY);
    currentY += 6;

    const evalSections = [
      { title: "Contact Details", text: analysis.sectionAnalysis?.contact },
      { title: "Professional Experience / Projects", text: analysis.sectionAnalysis?.experience },
      { title: "Technical Skills", text: analysis.sectionAnalysis?.skills },
      { title: "Education & Training", text: analysis.sectionAnalysis?.education }
    ];

    evalSections.forEach((sec) => {
      if (sec.text) {
        checkPageBoundary(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(sec.title, 20, currentY);
        currentY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const textLines = doc.splitTextToSize(sec.text, 165);
        doc.text(textLines, 20, currentY);
        currentY += textLines.length * 5 + 3;
      }
    });

    // Formatting guidance
    if (analysis.suggestedFormatting) {
      currentY += 2;
      checkPageBoundary(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("7. Suggestions Formatting & Layout", 20, currentY);
      currentY += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const formattingLines = doc.splitTextToSize(analysis.suggestedFormatting, 165);
      doc.text(formattingLines, 20, currentY);
      currentY += formattingLines.length * 5;
    }

    // Save report
    doc.save(`ATS_Report_${analysis.targetRole.replace(/\s+/g, "_")}.pdf`);
  };

  const copyExtractedText = () => {
    if (!analysis?.extractedText) return;
    navigator.clipboard.writeText(analysis.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeGuideSequence = RESUME_SEQUENCES.find(s => s.id === guideSequenceTab) || RESUME_SEQUENCES[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      
      {/* Toast Notification */}
      {templateLoadedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-white font-bold">Fresher Resume Sequence Loaded!</div>
            <div className="text-indigo-200 text-[11px] mt-0.5">Template loaded into text area. You can now edit or scan your profile.</div>
          </div>
        </div>
      )}

      {/* Intro Header & Top View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">
              {activeMainTab === "builder" ? "AI Resume Maker & Generator" : "ATS Resume Evaluator & Sequences"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Fresher Sequence Included
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            {activeMainTab === "builder" 
              ? "Build an ATS-optimized resume from scratch or sample presets with AI-powered XYZ bullet point generation."
              : "Scan your resume for ATS compatibility, discover section ordering sequences (Fresher, Experienced, Switcher), and generate recruiter-approved formats."
            }
          </p>
        </div>

        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveMainTab("builder")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === "builder"
                ? "bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            AI Resume Maker
          </button>
          <button
            onClick={() => setActiveMainTab("evaluator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === "evaluator"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            ATS Evaluator
          </button>
          <button
            onClick={() => setActiveMainTab("sequences")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === "sequences"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Sequences & Guides
          </button>
        </div>
      </div>

      {/* VIEW 0: AI RESUME MAKER / GENERATOR */}
      {activeMainTab === "builder" && (
        <ResumeBuilder user={user} onSendToAnalyzer={handleBuilderSendToAnalyzer} />
      )}

      {/* VIEW 1: ATS EVALUATOR */}
      {activeMainTab === "evaluator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Configuration Column */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Evaluation Setup
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setGuideSequenceTab("fresher");
                    setActiveMainTab("sequences");
                  }}
                  className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3 h-3" />
                  Fresher Sequence Guide
                </button>
              </div>

              {/* Target Role Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-medium">Target Role / Career Objective</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Junior Frontend Engineer, Data Analyst"
                  className="px-3.5 py-2 rounded-xl text-sm glass-input"
                />
              </div>

              {/* Resume Sequence Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Resume Sequence Profile
                  </label>
                  <span className="text-[10px] text-slate-400">Order & criteria</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedSequence("fresher")}
                    className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                      selectedSequence === "fresher"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>Fresher</span>
                    <span className="text-[8px] opacity-80 font-normal">0-2 Yrs / Grads</span>
                    {selectedSequence === "fresher" && (
                      <span className="absolute -top-1.5 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSequence("experienced")}
                    className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      selectedSequence === "experienced"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span>Experienced</span>
                    <span className="text-[8px] opacity-80 font-normal">3+ Yrs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSequence("switcher")}
                    className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      selectedSequence === "switcher"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    <span>Switcher</span>
                    <span className="text-[8px] opacity-80 font-normal">Transition</span>
                  </button>
                </div>

                {selectedSequence === "fresher" && (
                  <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-300 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Fresher Sequence Active:</strong> Education, technical skills, and academic capstones will be emphasized. ATS will not penalize for lack of corporate tenure.
                    </div>
                  </div>
                )}
              </div>

              {/* Input Mode Selector */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300 font-medium">Resume Submission</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInputMode("upload")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        inputMode === "upload" ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        inputMode === "text" ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                      }`}
                    >
                      Pasted Text
                    </button>
                  </div>
                </div>

                {inputMode === "upload" ? (
                  <div className="border border-dashed border-white/10 rounded-xl p-5 text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all relative">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-300 font-medium block">
                      {file ? file.name : "Select or drag file"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">PDF, DOCX, or TXT up to 8MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">Markdown or Plain Text</span>
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate(selectedSequence)}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Load {selectedSequence === "fresher" ? "Fresher" : "Sequence"} Template
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your contact, education, technical skills, projects, and bio lines..."
                      className="px-3.5 py-2 rounded-xl text-xs glass-input font-mono resize-none"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running ATS Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan My Profile ({selectedSequence === "fresher" ? "Fresher Sequence" : selectedSequence})
                  </>
                )}
              </button>
            </div>

            {/* Past Analyses (Firebase Auth) */}
            {user && pastAnalyses.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl border border-white/5">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-3.5 h-3.5" />
                  Past Audits (Cloud)
                </h4>
                <div className="flex flex-col gap-2.5">
                  {pastAnalyses.map((hist, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAnalysis(hist)}
                      className="flex items-center justify-between text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      <div className="truncate max-w-[150px]">
                        <div className="text-xs font-bold text-white truncate">{hist.targetRole}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                          <span>{hist.fileName}</span>
                          {hist.sequence === "fresher" && (
                            <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">Fresher</span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-blue-400">
                        Score: {hist.atsScore}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit Results Dashboard Column */}
          <div className="lg:col-span-2">
            {analysis ? (
              <div className="flex flex-col gap-6">
                {/* Core Score Banner */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0 ${getScoreColor(analysis.atsScore)}`}>
                      <span className="text-2xl font-display font-black font-mono leading-none">{analysis.atsScore}</span>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">ATS Score</span>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                        <div className="inline-block px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/25 text-[10px] font-bold uppercase tracking-wider">
                          Analysis Completed
                        </div>
                        <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {analysis.sequence === "fresher" ? "Fresher Sequence" : (analysis.sequence || selectedSequence)}
                        </div>
                      </div>
                      <h2 className="font-display font-bold text-xl text-white mt-2">
                        Review for: {analysis.targetRole}
                      </h2>
                      <div className="text-slate-300 text-xs mt-1.5 leading-relaxed font-sans">
                        <MarkdownRenderer content={analysis.summary} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={downloadPDF}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 self-stretch md:self-auto justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>
                </div>

                {/* Sequence Alignment Feedback Card */}
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Sequence Alignment & Section Flow: {analysis.sequence === "fresher" ? "Fresher Sequence" : "Selected Sequence"}
                    </h4>
                    <button
                      onClick={() => {
                        setGuideSequenceTab(analysis.sequence || "fresher");
                        setActiveMainTab("sequences");
                      }}
                      className="text-[10px] font-bold text-indigo-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      View Sequence Structure
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {analysis.sequenceFeedback ? (
                    <div className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                      <MarkdownRenderer content={analysis.sequenceFeedback} />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      The resume has been evaluated using the <strong>Fresher Sequence</strong>, ensuring high prioritization for academic projects, technical skill categories, and coursework credentials.
                    </p>
                  )}

                  {/* Visual 8-step sequence checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-emerald-500/15 text-[10px]">
                    {[
                      { num: "1", label: "Contact Info" },
                      { num: "2", label: "Objective" },
                      { num: "3", label: "Education" },
                      { num: "4", label: "Technical Skills" },
                      { num: "5", label: "Academic Projects" },
                      { num: "6", label: "Internships" },
                      { num: "7", label: "Certifications" },
                      { num: "8", label: "Achievements" }
                    ].map((step, sIdx) => (
                      <div key={sIdx} className="p-2 rounded-lg bg-black/30 border border-emerald-500/10 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[9px] shrink-0">
                          {step.num}
                        </span>
                        <span className="text-slate-300 font-medium truncate">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collapsible Extracted Resume Plain Text Section */}
                {analysis.extractedText && (
                  <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowExtractedText(!showExtractedText)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Extracted Resume Plain Text
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-normal">
                          {showExtractedText ? "Hide Text" : "Show Text"}
                        </span>
                        {showExtractedText ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </button>
                    {showExtractedText && (
                      <div className="p-5 border-t border-white/5 bg-slate-950/40 relative">
                        <button
                          type="button"
                          onClick={copyExtractedText}
                          className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3 h-3" />
                              Copy Text
                            </>
                          )}
                        </button>
                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-8">
                          {analysis.extractedText}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommended suitable IT and AI roles */}
                <div className="glass-panel p-5 rounded-2xl border border-blue-500/15 bg-blue-950/5">
                  <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5 mb-2.5">
                    <Briefcase className="w-4 h-4 text-blue-400 animate-pulse" />
                    Recommended Suitable IT & AI Job Roles
                  </h4>
                  <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
                    Based on your educational background, skills catalog, and experience mapping, we suggest targeting these tech sectors:
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {analysis.recommendedRoles && analysis.recommendedRoles.length > 0 ? (
                      analysis.recommendedRoles.map((role, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1.5 hover:bg-blue-500/15 transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {role}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No specific IT/AI career roles recommended yet. Specify target role.</span>
                    )}
                  </div>
                </div>

                {/* Strengths / Weaknesses / Improvements Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Key Strengths */}
                  <div className="glass-panel p-5 rounded-2xl border border-emerald-500/10 bg-emerald-950/5">
                    <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      Key Strengths
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {analysis.strengths && analysis.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-grow text-slate-300 font-sans">
                            <MarkdownRenderer content={str} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas of Weakness */}
                  <div className="glass-panel p-5 rounded-2xl border border-rose-500/10 bg-rose-950/5">
                    <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      Detected Weaknesses
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                        analysis.weaknesses.map((weak, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-rose-500/60 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow text-slate-300 font-sans">
                              <MarkdownRenderer content={weak} />
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-400 italic">No major structural or keyword weaknesses detected!</li>
                      )}
                    </ul>
                  </div>

                  {/* Actionable Improvements */}
                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/10 bg-amber-950/5">
                    <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-3">
                      <XCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      Required Improvements
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {analysis.improvements && analysis.improvements.map((imp, i) => (
                        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-grow text-slate-300 font-sans">
                            <MarkdownRenderer content={imp} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Missing High Value Keywords */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-3.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Missing ATS Keywords (Highly Recommended to Add)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                      analysis.missingKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No major keywords missing. Well done!</span>
                    )}
                  </div>
                </div>

                {/* Section-by-Section Critique */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Section-by-Section Evaluation
                  </h4>
                  <div className="space-y-3">
                    {[
                      { title: "Contact details", text: analysis.sectionAnalysis?.contact },
                      { title: "Professional experience / Projects", text: analysis.sectionAnalysis?.experience },
                      { title: "Technical/Professional skills", text: analysis.sectionAnalysis?.skills },
                      { title: "Education & training", text: analysis.sectionAnalysis?.education }
                    ].map((sec, idx) => (
                      <div key={idx} className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                        <div className="text-xs font-bold text-indigo-300">{sec.title}</div>
                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                          <MarkdownRenderer content={sec.text || "No critique available."} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions Formatting block */}
                {analysis.suggestedFormatting && (
                  <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-500/10 text-xs">
                    <div className="font-bold text-white mb-1.5 flex items-center gap-1">
                      <Database className="w-4 h-4 text-indigo-400" />
                      Formatting & Layout Recommendations:
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      <MarkdownRenderer content={analysis.suggestedFormatting} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
                  <GraduationCap className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-200">Ready to evaluate your resume</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                  Select your sequence (<strong>Fresher</strong> is pre-selected for students and 0-2 yrs candidates), specify target role, and scan your profile.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleLoadTemplate("fresher")}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Fresher Template
                  </button>
                  <button
                    onClick={() => {
                      setGuideSequenceTab("fresher");
                      setActiveMainTab("sequences");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Explore Sequences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RESUME SEQUENCES & RECRUITER GUIDES (FOCUSING ON FRESHER SEQUENCE) */}
      {activeMainTab === "sequences" && (
        <div className="space-y-8 animate-fade-in text-left">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
                <GraduationCap className="w-4 h-4" />
                Resume Architecture Masterclass
              </div>
              <h2 className="text-xl lg:text-2xl font-display font-black text-white">
                Industry-Standard Resume Sequences
              </h2>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
                Resume sequences dictate the chronological and psychological order in which hiring managers and ATS engines parse your qualifications. Discover the exact 8-step sequence for freshers and entry-level talent.
              </p>
            </div>

            <div className="flex gap-2.5 shrink-0">
              <button
                onClick={() => handleLoadTemplate(guideSequenceTab)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Use {activeGuideSequence.name} Template in Evaluator
              </button>
            </div>
          </div>

          {/* Sequence Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESUME_SEQUENCES.map((seq) => {
              const isSelected = guideSequenceTab === seq.id;
              return (
                <button
                  key={seq.id}
                  onClick={() => setGuideSequenceTab(seq.id)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-4 ${
                    isSelected
                      ? seq.id === "fresher"
                        ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                        : "bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                      : "bg-[#050a15]/30 border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        seq.id === "fresher"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                      }`}>
                        {seq.badge}
                      </span>
                      {seq.id === "fresher" && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      {seq.id === "fresher" ? <GraduationCap className="w-5 h-5 text-emerald-400" /> : <Briefcase className="w-5 h-5 text-indigo-400" />}
                      Sequence: {seq.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">{seq.tagline}</div>
                    <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                      {seq.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold pt-3 border-t border-white/5">
                    <span className="text-slate-400">{seq.steps.length} Ordered Sections</span>
                    <span className={isSelected ? "text-emerald-400 flex items-center gap-1" : "text-slate-500"}>
                      {isSelected ? "Active View" : "Click to view"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Sequence Deep Dive Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: 8-Step Visual Sequence Flow (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                      {guideSequenceTab === "fresher" ? (
                        <GraduationCap className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Layers className="w-5 h-5 text-indigo-400" />
                      )}
                      The {activeGuideSequence.name} Sequence Order
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Follow this exact sequence from top-to-bottom for optimal recruiter readability & ATS compliance.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                    {activeGuideSequence.steps.length} Steps
                  </span>
                </div>

                {/* Steps Timeline */}
                <div className="space-y-4">
                  {activeGuideSequence.steps.map((st) => (
                    <div
                      key={st.step}
                      className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/70 transition-all flex items-start gap-4 relative overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-display font-black text-emerald-400 text-sm shrink-0">
                        {st.step}
                      </div>
                      <div className="flex-grow space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs">{st.title}</h4>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Step {st.step}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {st.description}
                        </p>
                        <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-300/90 leading-relaxed flex items-start gap-1.5 mt-2">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Pro Recruiter Tip:</strong> {st.keyTip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Why Fresher Sequence Works Callout */}
                {guideSequenceTab === "fresher" && (
                  <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/15 space-y-3">
                    <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Why Freshers Must Use This Specific Sequence
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Recruiters spend an average of <strong>6 seconds</strong> reviewing a resume. When you lack 5+ years of full-time employment, placing an empty "Work Experience" section at the top results in immediate rejection.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The <strong>Fresher Sequence</strong> places your <strong>Degree & Academic Scores</strong> and <strong>Technical Skills & Capstone Projects</strong> in the top 50% of the first page. This demonstrates actionable proof of coding ability, problem-solving, and continuous learning.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Copyable Ready-to-use Template (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      {activeGuideSequence.name} Markdown Template
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Pre-formatted in standard ATS-compliant markdown.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyTemplate(guideSequenceTab)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold flex items-center gap-1 transition-all border border-white/10 cursor-pointer"
                    >
                      {copiedTemplate ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleLoadTemplate(guideSequenceTab)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Use in ATS Scanner
                    </button>
                    <button
                      onClick={() => setActiveMainTab("builder")}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      Build with AI Maker
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="text-[11px] text-slate-300 font-mono bg-slate-950/80 p-4 rounded-2xl border border-white/5 max-h-[520px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
                    {activeGuideSequence.markdownTemplate}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ATS Formatting Checklist:
                  </div>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside leading-relaxed">
                    <li>Single column layout without complex tables or textboxes</li>
                    <li>Clean section headers (ALL CAPS or Markdown H3)</li>
                    <li>Bullet points with action verbs and quantifiable results</li>
                    <li>Standard fonts (Helvetica, Arial, Calibri, or Roboto)</li>
                    <li>Standard date formats (e.g. Month Year – Month Year)</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
