import { useState, ChangeEvent } from "react";
import { 
  Sparkles, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  GraduationCap, 
  Briefcase, 
  ArrowRight, 
  Code2, 
  FolderGit2, 
  Award, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  Layers, 
  ShieldCheck, 
  Zap, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Flame,
  Lightbulb,
  FileCheck
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GeneratedResume, ResumeBuilderFormData } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { logActivity } from "../lib/activityLogger";
import { jsPDF } from "jspdf";

interface ResumeBuilderProps {
  user: FirebaseUser | null;
  onSendToAnalyzer: (text: string, role: string, sequence: "fresher" | "experienced" | "switcher") => void;
}

const INITIAL_FORM: ResumeBuilderFormData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  targetRole: "Software Engineer",
  sequence: "fresher",
  templateStyle: "modern",
  careerObjective: "",
  degree: "",
  institution: "",
  gradYear: "2025",
  gpa: "",
  coursework: "",
  skillsLanguages: "",
  skillsFrameworks: "",
  skillsDatabases: "",
  skillsTools: "",
  project1Title: "",
  project1Stack: "",
  project1Desc: "",
  project1Link: "",
  project2Title: "",
  project2Stack: "",
  project2Desc: "",
  project2Link: "",
  experienceRole: "",
  experienceCompany: "",
  experienceDuration: "",
  experienceDesc: "",
  certifications: "",
  achievements: "",
  customInstructions: "Emphasize high-impact action verbs and quantitative metrics (Google XYZ formula)."
};

const SAMPLE_PROFILES: Record<string, Partial<ResumeBuilderFormData>> = {
  fresher_cs: {
    fullName: "Aarav Sharma",
    email: "aarav.sharma@email.com",
    phone: "+1 (555) 349-8120",
    location: "San Jose, CA",
    linkedin: "linkedin.com/in/aaravsharma",
    github: "github.com/aaravsharma",
    portfolio: "aaravsharma.dev",
    targetRole: "Junior Full Stack Developer",
    sequence: "fresher",
    templateStyle: "modern",
    careerObjective: "Passionate Computer Science graduate skilled in modern React, TypeScript, Node.js, and cloud backends. Eager to contribute to building scalable high-performance web applications in a fast-paced development team.",
    degree: "Bachelor of Science in Computer Science",
    institution: "Tech State University",
    gradYear: "2025",
    gpa: "3.85 / 4.0 (Dean's Honor List)",
    coursework: "Data Structures & Algorithms, DBMS, Operating Systems, Web Application Security, Cloud Computing, Distributed Systems",
    skillsLanguages: "TypeScript, JavaScript (ES6+), Python, Java, SQL, HTML5/CSS3",
    skillsFrameworks: "React.js, Next.js, Node.js, Express.js, Tailwind CSS, Redux Toolkit",
    skillsDatabases: "PostgreSQL, MongoDB, Firebase Firestore, Redis, Supabase",
    skillsTools: "Git, GitHub Actions, Docker, Vite, Postman, Jest, Linux, REST APIs",
    project1Title: "CollabSync - Real-Time Collaborative Workspace",
    project1Stack: "React, TypeScript, Node.js, Socket.io, MongoDB",
    project1Desc: "Engineered multi-tenant team kanban board with real-time cursor sync, WebSocket broadcasts, and role-based permissions. Reduced sync latency by 45%.",
    project1Link: "github.com/aaravsharma/collabsync",
    project2Title: "AI DocuQuery - Intelligent Document Search Engine",
    project2Stack: "Python, FastAPI, LangChain, ChromaDB, React",
    project2Desc: "Developed semantic document ingestion tool with vector search embeddings, achieving sub-180ms query lookups across 1,000+ technical PDF documents.",
    project2Link: "github.com/aaravsharma/ai-docuquery",
    experienceRole: "Software Engineering Intern",
    experienceCompany: "Apex Cloud Labs",
    experienceDuration: "Jun 2024 – Aug 2024 (3 Mos)",
    experienceDesc: "Contributed to front-end component migration to React 18, wrote 40+ unit tests with Jest raising code coverage to 86%, and optimized REST API payload serialization.",
    certifications: "AWS Certified Cloud Practitioner (2024), Meta Front-End Professional Certificate",
    achievements: "Winner (1st Place / 85 Teams) at University Hackathon 2024, Solved 380+ LeetCode problems (Knight 1850+ rating)",
    customInstructions: "Highlight project impact and clean modern tech stack keywords for entry-level tech screening."
  },
  data_analyst: {
    fullName: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+1 (555) 782-9014",
    location: "Austin, TX",
    linkedin: "linkedin.com/in/priyapatel",
    github: "github.com/priyapatel",
    portfolio: "priyapatel-analytics.io",
    targetRole: "Associate Data Analyst / BI Developer",
    sequence: "fresher",
    templateStyle: "classic",
    careerObjective: "Detail-oriented graduate with strong statistical analysis, SQL querying, Python data modeling, and Tableau visualization skills seeking to drive actionable business intelligence.",
    degree: "B.S. in Information Systems & Analytics",
    institution: "University of Texas",
    gradYear: "2025",
    gpa: "3.78 / 4.0",
    coursework: "Applied Statistics, Business Intelligence, Big Data Analytics, SQL Database Design, Predictive Modeling",
    skillsLanguages: "Python (Pandas, NumPy, Scikit-Learn), SQL (PostgreSQL, MySQL), R",
    skillsFrameworks: "Tableau, Power BI, Streamlit, Matplotlib, Seaborn",
    skillsDatabases: "PostgreSQL, Snowflake, Google BigQuery, Excel (VBA/Advanced)",
    skillsTools: "Jupyter Notebooks, Git, Airflow (Basics), dbt (Basics), ETL Pipelines",
    project1Title: "E-Commerce Customer Churn Prediction Engine",
    project1Stack: "Python, Scikit-Learn, Pandas, Streamlit, PostgreSQL",
    project1Desc: "Analyzed 50,000+ consumer records, trained Random Forest classification model with 89% precision, and generated automated executive churn reports.",
    project1Link: "github.com/priyapatel/churn-prediction",
    project2Title: "Global Supply Chain Real-Time Analytics Dashboard",
    project2Stack: "SQL, Power BI, DAX, Python ETL",
    project2Desc: "Constructed comprehensive KPI dashboards tracking freight transit times, supplier bottlenecks, and inventory stockouts across 12 distribution hubs.",
    project2Link: "github.com/priyapatel/supplychain-bi",
    experienceRole: "Data Analytics Intern",
    experienceCompany: "Horizon Retail Logistics",
    experienceDuration: "Jan 2024 – May 2024",
    experienceDesc: "Automated daily SQL reporting workflows saving 12 manual team hours per week and audited data pipelines for accuracy.",
    certifications: "Google Data Analytics Professional Certificate, Tableau Desktop Specialist",
    achievements: "Published research paper on predictive logistics modeling in University Student Journal (2024)",
    customInstructions: "Focus on quantifiable business metrics, ROI improvements, and clean data modeling techniques."
  }
};

export default function ResumeBuilder({ user, onSendToAnalyzer }: ResumeBuilderProps) {
  const [formData, setFormData] = useState<ResumeBuilderFormData>(INITIAL_FORM);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"preview" | "markdown" | "tips">("preview");
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleInputChange = (field: keyof ResumeBuilderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadSample = (sampleKey: string) => {
    if (SAMPLE_PROFILES[sampleKey]) {
      setFormData(prev => ({ ...prev, ...SAMPLE_PROFILES[sampleKey] }));
    }
  };

  const handleClearForm = () => {
    setFormData(INITIAL_FORM);
    setGeneratedResume(null);
  };

  const handleGenerateResume = async () => {
    if (!formData.fullName.trim()) {
      setError("Please provide at least your Full Name to generate a resume.");
      setActiveStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          sequence: formData.sequence,
          targetRole: formData.targetRole,
          templateStyle: formData.templateStyle
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate resume with AI.");
      }

      const result: GeneratedResume = await response.json();
      result.timestamp = Date.now();
      setGeneratedResume(result);

      await logActivity({
        activity: "Resume Generated",
        details: `Generated AI Resume for '${formData.fullName}' (Target: ${formData.targetRole}) using ${formData.sequence.toUpperCase()} sequence.`,
        status: "Success"
      });

      // Save to Firebase if user is logged in
      if (user) {
        try {
          await addDoc(collection(db, "users", user.uid, "generated_resumes"), {
            ...result,
            userId: user.uid
          });
        } catch (fbErr) {
          console.warn("Could not save generated resume to Firestore:", fbErr);
        }
      } else {
        localStorage.setItem("careerpilot_last_generated_resume", JSON.stringify(result));
      }

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during resume generation.");
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!generatedResume?.markdownResume) return;
    navigator.clipboard.writeText(generatedResume.markdownResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdownFile = () => {
    if (!generatedResume?.markdownResume) return;
    const blob = new Blob([generatedResume.markdownResume], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(generatedResume.fullName || "Resume").replace(/\s+/g, "_")}_Resume.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDFResume = () => {
    if (!generatedResume) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = formData.templateStyle === "classic" 
      ? [15, 23, 42] 
      : [30, 58, 138]; // Deep slate or Navy blue

    let currentY = 18;

    // Header - Full Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const nameText = (generatedResume.fullName || formData.fullName).toUpperCase();
    doc.text(nameText, 105, currentY, { align: "center" });
    currentY += 6;

    // Contact details line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const contactParts = [
      formData.location,
      formData.email,
      formData.phone,
      formData.linkedin ? `LinkedIn: ${formData.linkedin.replace(/^https?:\/\//, "")}` : "",
      formData.github ? `GitHub: ${formData.github.replace(/^https?:\/\//, "")}` : "",
      formData.portfolio ? `Portfolio: ${formData.portfolio.replace(/^https?:\/\//, "")}` : ""
    ].filter(Boolean);

    const contactLine = contactParts.join(" • ");
    const contactWrapped = doc.splitTextToSize(contactLine, 175);
    doc.text(contactWrapped, 105, currentY, { align: "center" });
    currentY += contactWrapped.length * 4.5 + 2;

    // Horizontal separator
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.line(18, currentY, 192, currentY);
    currentY += 5;

    const checkPageBreak = (height: number) => {
      if (currentY + height > 275) {
        doc.addPage();
        currentY = 18;
      }
    };

    const addSectionHeader = (title: string) => {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(title.toUpperCase(), 18, currentY);
      currentY += 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(18, currentY, 192, currentY);
      currentY += 4.5;
    };

    // If structured data is available from the model
    const data = generatedResume.structuredData;

    if (data) {
      // 1. Objective / Summary
      if (data.summary) {
        addSectionHeader(formData.sequence === "fresher" ? "Career Objective" : "Professional Summary");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const summaryLines = doc.splitTextToSize(data.summary, 174);
        doc.text(summaryLines, 18, currentY);
        currentY += summaryLines.length * 4.5 + 3;
      }

      // 2. Education (First for Fresher sequence)
      if (formData.sequence === "fresher" && data.education && data.education.length > 0) {
        addSectionHeader("Education");
        data.education.forEach(edu => {
          checkPageBreak(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(`${edu.degree} | ${edu.institution}`, 18, currentY);
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(edu.year || "", 192, currentY, { align: "right" });
          currentY += 4.5;

          if (edu.gpa || edu.coursework) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const extra = [edu.gpa ? `GPA: ${edu.gpa}` : "", edu.coursework ? `Coursework: ${edu.coursework}` : ""].filter(Boolean).join(" • ");
            const extraLines = doc.splitTextToSize(extra, 174);
            doc.text(extraLines, 18, currentY);
            currentY += extraLines.length * 4 + 2;
          }
        });
      }

      // 3. Technical Skills
      if (data.skills) {
        addSectionHeader("Technical Skills");
        doc.setFontSize(9);
        const categories = [
          { label: "Programming Languages", list: data.skills.languages },
          { label: "Frameworks & Libraries", list: data.skills.frameworks },
          { label: "Databases & Cloud", list: data.skills.databasesCloud },
          { label: "Developer Tools", list: data.skills.developerTools },
          { label: "Core Competencies", list: data.skills.coreCompetencies }
        ];

        categories.forEach(cat => {
          if (cat.list && cat.list.length > 0) {
            checkPageBreak(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(`• ${cat.label}: `, 18, currentY);
            const labelWidth = doc.getTextWidth(`• ${cat.label}: `);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            const itemsText = cat.list.join(", ");
            const itemsLines = doc.splitTextToSize(itemsText, 174 - labelWidth);
            doc.text(itemsLines, 18 + labelWidth, currentY);
            currentY += itemsLines.length * 4.2 + 1;
          }
        });
        currentY += 2;
      }

      // 4. Academic & Capstone Projects
      if (data.projects && data.projects.length > 0) {
        addSectionHeader(formData.sequence === "fresher" ? "Academic & Capstone Projects" : "Key Engineering Projects");
        data.projects.forEach(proj => {
          checkPageBreak(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(proj.title, 18, currentY);
          
          if (proj.techStack) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8.5);
            doc.setTextColor(79, 70, 229); // Indigo
            const titleWidth = doc.getTextWidth(proj.title);
            doc.text(` [${proj.techStack}]`, 18 + titleWidth + 2, currentY);
          }

          if (proj.link) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            doc.text(proj.link.replace(/^https?:\/\//, ""), 192, currentY, { align: "right" });
          }
          currentY += 4.5;

          if (proj.bulletPoints) {
            proj.bulletPoints.forEach(bp => {
              checkPageBreak(8);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.setTextColor(51, 65, 85);
              const bpLines = doc.splitTextToSize(`• ${bp}`, 170);
              doc.text(bpLines, 22, currentY);
              currentY += bpLines.length * 4.2;
            });
          }
          currentY += 2.5;
        });
      }

      // 5. Experience / Internships
      if (data.experience && data.experience.length > 0) {
        addSectionHeader(formData.sequence === "fresher" ? "Internships & Practical Training" : "Professional Work Experience");
        data.experience.forEach(exp => {
          checkPageBreak(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(`${exp.role} - ${exp.company}`, 18, currentY);

          if (exp.duration) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(exp.duration, 192, currentY, { align: "right" });
          }
          currentY += 4.5;

          if (exp.bulletPoints) {
            exp.bulletPoints.forEach(bp => {
              checkPageBreak(8);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.setTextColor(51, 65, 85);
              const bpLines = doc.splitTextToSize(`• ${bp}`, 170);
              doc.text(bpLines, 22, currentY);
              currentY += bpLines.length * 4.2;
            });
          }
          currentY += 2.5;
        });
      }

      // Education (if experienced sequence)
      if (formData.sequence !== "fresher" && data.education && data.education.length > 0) {
        addSectionHeader("Education");
        data.education.forEach(edu => {
          checkPageBreak(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(`${edu.degree} | ${edu.institution}`, 18, currentY);
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(edu.year || "", 192, currentY, { align: "right" });
          currentY += 4.5;
        });
      }

      // 6. Certifications
      if (data.certifications && data.certifications.length > 0) {
        addSectionHeader("Certifications & Verified Credentials");
        data.certifications.forEach(cert => {
          checkPageBreak(7);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          const certText = `• ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}${cert.year ? ` - ${cert.year}` : ""}`;
          const certLines = doc.splitTextToSize(certText, 174);
          doc.text(certLines, 18, currentY);
          currentY += certLines.length * 4.2;
        });
        currentY += 2;
      }

      // 7. Achievements
      if (data.achievements && data.achievements.length > 0) {
        addSectionHeader("Achievements, Contests & Leadership");
        data.achievements.forEach(ach => {
          checkPageBreak(7);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          const achLines = doc.splitTextToSize(`• ${ach}`, 174);
          doc.text(achLines, 18, currentY);
          currentY += achLines.length * 4.2;
        });
      }

    } else {
      // Fallback to rendering markdown text directly
      const rawLines = generatedResume.markdownResume.split("\n");
      rawLines.forEach(line => {
        if (!line.trim()) {
          currentY += 2.5;
          return;
        }
        checkPageBreak(7);
        if (line.startsWith("# ")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(line.replace("# ", ""), 105, currentY, { align: "center" });
          currentY += 6;
        } else if (line.startsWith("### ")) {
          addSectionHeader(line.replace("### ", ""));
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          const textLines = doc.splitTextToSize(line, 174);
          doc.text(textLines, 18, currentY);
          currentY += textLines.length * 4.2;
        }
      });
    }

    doc.save(`${(formData.fullName || "Resume").replace(/\s+/g, "_")}_ATS_Resume.pdf`);
  };

  const handleSendToATSScan = () => {
    if (!generatedResume) return;
    onSendToAnalyzer(
      generatedResume.markdownResume,
      formData.targetRole || "Software Engineer",
      formData.sequence
    );
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-white font-bold">Resume Generated Successfully!</div>
            <div className="text-indigo-200 text-[11px] mt-0.5">Your ATS-optimized resume is ready to preview, download, and test.</div>
          </div>
        </div>
      )}

      {/* Hero Header & Quick Preset Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Resume Maker & ATS Architect
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Fresher Sequence Powered
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">
            Build Your ATS-Ready Resume
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Fill your details or use our 1-click sample profiles. Gemini converts your notes into high-impact Google XYZ bullet points formatted perfectly for recruiter screening.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-col gap-2 shrink-0 self-stretch md:self-auto">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">1-Click Sample Drafts:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleLoadSample("fresher_cs")}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Fresher CS Grad
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample("data_analyst")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Data / BI Analyst
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-medium transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Steps (Left) & Live Generator/Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Builder (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col gap-5">
            
            {/* Step Navigation Pill */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {activeStep}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {activeStep === 1 && "Personal & Social Details"}
                  {activeStep === 2 && "Role & Career Objective"}
                  {activeStep === 3 && "Education & Coursework"}
                  {activeStep === 4 && "Technical Skills"}
                  {activeStep === 5 && "Academic & Capstone Projects"}
                  {activeStep === 6 && "Experience & Internships"}
                  {activeStep === 7 && "Certifications & Achievements"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Step {activeStep} of 7</span>
            </div>

            {/* Step 1: Personal Details */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="alex.rivera@email.com"
                      className="px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Location (City, State / Country)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-300">LinkedIn</label>
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className="px-2.5 py-2 rounded-xl text-[11px] glass-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-300">GitHub</label>
                    <input
                      type="text"
                      value={formData.github}
                      onChange={(e) => handleInputChange("github", e.target.value)}
                      placeholder="github.com/..."
                      className="px-2.5 py-2 rounded-xl text-[11px] glass-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-300">Portfolio</label>
                    <input
                      type="text"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange("portfolio", e.target.value)}
                      placeholder="yourdomain.dev"
                      className="px-2.5 py-2 rounded-xl text-[11px] glass-input"
                    />
                  </div>
                </div>

                {/* Sequence & Style Options */}
                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Target Sequence Profile
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
                    {(["fresher", "experienced", "switcher"] as const).map(seq => (
                      <button
                        key={seq}
                        type="button"
                        onClick={() => handleInputChange("sequence", seq)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          formData.sequence === seq ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {seq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Target Role & Objective */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Target Role *</label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => handleInputChange("targetRole", e.target.value)}
                    placeholder="e.g. Junior Full Stack Developer, React Engineer"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Career Objective / Summary Notes</label>
                    <span className="text-[10px] text-slate-500">AI will polish this</span>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.careerObjective}
                    onChange={(e) => handleInputChange("careerObjective", e.target.value)}
                    placeholder="Describe your degree, key technologies, and passion for the target role..."
                    className="px-3 py-2 rounded-xl text-xs glass-input resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pro Tip:</strong> For freshers, keep the objective focused on specific tech stacks and how you plan to contribute immediately to engineering goals.
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Education & Academic Performance */}
            {activeStep === 3 && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Degree & Major *</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => handleInputChange("degree", e.target.value)}
                    placeholder="e.g. B.S. in Computer Science & Engineering"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">University / College *</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange("institution", e.target.value)}
                    placeholder="e.g. California State University"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300">Graduation Year</label>
                    <input
                      type="text"
                      value={formData.gradYear}
                      onChange={(e) => handleInputChange("gradYear", e.target.value)}
                      placeholder="e.g. 2025 or Expected May 2026"
                      className="px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-300">GPA / Percentage</label>
                    <input
                      type="text"
                      value={formData.gpa}
                      onChange={(e) => handleInputChange("gpa", e.target.value)}
                      placeholder="e.g. 3.8 / 4.0 or 8.5 CGPA"
                      className="px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Relevant Coursework</label>
                  <input
                    type="text"
                    value={formData.coursework}
                    onChange={(e) => handleInputChange("coursework", e.target.value)}
                    placeholder="Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Technical Skills */}
            {activeStep === 4 && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Programming Languages</label>
                  <input
                    type="text"
                    value={formData.skillsLanguages}
                    onChange={(e) => handleInputChange("skillsLanguages", e.target.value)}
                    placeholder="TypeScript, JavaScript, Python, Java, C++, SQL"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Web Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={formData.skillsFrameworks}
                    onChange={(e) => handleInputChange("skillsFrameworks", e.target.value)}
                    placeholder="React.js, Next.js, Node.js, Express.js, Tailwind CSS, Redux"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Databases & Cloud</label>
                  <input
                    type="text"
                    value={formData.skillsDatabases}
                    onChange={(e) => handleInputChange("skillsDatabases", e.target.value)}
                    placeholder="PostgreSQL, MongoDB, Firebase, AWS S3/Lambda, Supabase"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Developer Tools & Practices</label>
                  <input
                    type="text"
                    value={formData.skillsTools}
                    onChange={(e) => handleInputChange("skillsTools", e.target.value)}
                    placeholder="Git, GitHub Actions, Docker, Vite, Postman, Jest, REST APIs, Agile"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Academic & Capstone Projects */}
            {activeStep === 5 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Project 1 */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Project 1 (Anchor Project)</span>
                    <span className="text-[10px] text-slate-500">Major Capstone</span>
                  </div>
                  <input
                    type="text"
                    value={formData.project1Title}
                    onChange={(e) => handleInputChange("project1Title", e.target.value)}
                    placeholder="Project Title (e.g. CloudTask Collaborative Manager)"
                    className="px-3 py-1.5 rounded-xl text-xs glass-input font-medium"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.project1Stack}
                      onChange={(e) => handleInputChange("project1Stack", e.target.value)}
                      placeholder="Tech Stack (React, Node, Mongo)"
                      className="px-2.5 py-1.5 rounded-xl text-[11px] glass-input"
                    />
                    <input
                      type="text"
                      value={formData.project1Link}
                      onChange={(e) => handleInputChange("project1Link", e.target.value)}
                      placeholder="GitHub / Live Demo URL"
                      className="px-2.5 py-1.5 rounded-xl text-[11px] glass-input"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={formData.project1Desc}
                    onChange={(e) => handleInputChange("project1Desc", e.target.value)}
                    placeholder="Key features and results (e.g. Built real-time kanban with WebSockets, reduced latency by 35%)"
                    className="px-3 py-1.5 rounded-xl text-xs glass-input resize-none"
                  />
                </div>

                {/* Project 2 */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Project 2</span>
                    <span className="text-[10px] text-slate-500">Secondary Project</span>
                  </div>
                  <input
                    type="text"
                    value={formData.project2Title}
                    onChange={(e) => handleInputChange("project2Title", e.target.value)}
                    placeholder="Project Title (e.g. AI DocuQuery Engine)"
                    className="px-3 py-1.5 rounded-xl text-xs glass-input font-medium"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.project2Stack}
                      onChange={(e) => handleInputChange("project2Stack", e.target.value)}
                      placeholder="Tech Stack (Python, FastAPI, VectorDB)"
                      className="px-2.5 py-1.5 rounded-xl text-[11px] glass-input"
                    />
                    <input
                      type="text"
                      value={formData.project2Link}
                      onChange={(e) => handleInputChange("project2Link", e.target.value)}
                      placeholder="GitHub / Live URL"
                      className="px-2.5 py-1.5 rounded-xl text-[11px] glass-input"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={formData.project2Desc}
                    onChange={(e) => handleInputChange("project2Desc", e.target.value)}
                    placeholder="Key features and results (e.g. Integrated ChromaDB semantic search with sub-200ms speed)"
                    className="px-3 py-1.5 rounded-xl text-xs glass-input resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Experience & Internships */}
            {activeStep === 6 && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Internship / Freelance / Work Experience</label>
                  <span className="text-[10px] text-slate-500">Optional for Freshers</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">Job / Internship Role</label>
                    <input
                      type="text"
                      value={formData.experienceRole}
                      onChange={(e) => handleInputChange("experienceRole", e.target.value)}
                      placeholder="e.g. Software Engineering Intern"
                      className="px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.experienceCompany}
                      onChange={(e) => handleInputChange("experienceCompany", e.target.value)}
                      placeholder="e.g. Apex Digital Labs"
                      className="px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">Duration & Timeline</label>
                  <input
                    type="text"
                    value={formData.experienceDuration}
                    onChange={(e) => handleInputChange("experienceDuration", e.target.value)}
                    placeholder="e.g. June 2024 – August 2024 (3 Months)"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">Key Contributions & Results</label>
                  <textarea
                    rows={3}
                    value={formData.experienceDesc}
                    onChange={(e) => handleInputChange("experienceDesc", e.target.value)}
                    placeholder="Describe tasks: Migrated UI to React 18, wrote Jest unit tests, participated in agile sprints..."
                    className="px-3 py-2 rounded-xl text-xs glass-input resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 7: Certifications & Achievements */}
            {activeStep === 7 && (
              <div className="flex flex-col gap-3.5 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Certifications & Verified Courses</label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange("certifications", e.target.value)}
                    placeholder="AWS Certified Cloud Practitioner, Meta React Certificate, HackerRank Problem Solving"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-300">Hackathons, Contests & Leadership</label>
                  <textarea
                    rows={2}
                    value={formData.achievements}
                    onChange={(e) => handleInputChange("achievements", e.target.value)}
                    placeholder="Top 5 Finalist at University Hackathon (120+ teams), Solved 350+ LeetCode problems, GDSC Tech Lead"
                    className="px-3 py-2 rounded-xl text-xs glass-input resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                  <label className="text-xs font-medium text-slate-300">Special Instructions to AI Architect</label>
                  <input
                    type="text"
                    value={formData.customInstructions}
                    onChange={(e) => handleInputChange("customInstructions", e.target.value)}
                    placeholder="e.g. Emphasize backend APIs and microservices terminology"
                    className="px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                <span>{error}</span>
              </div>
            )}

            {/* Step Control Buttons & Generate Action */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {activeStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep(prev => Math.min(7, prev + 1))}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next Step
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleGenerateResume}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/15 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Generating Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate ATS Resume
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Live Rendered Resume Output & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {generatedResume ? (
            <div className="flex flex-col gap-5 animate-fade-in">
              
              {/* Header Action Bar */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center justify-center">
                    <span className="text-emerald-400 font-mono font-bold text-xs leading-none">{generatedResume.atsScoreEstimate}%</span>
                    <span className="text-[8px] text-slate-400 uppercase font-semibold">ATS</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">{generatedResume.fullName}</h3>
                    <div className="text-[11px] text-slate-400">Target: {generatedResume.targetRole} • <span className="text-emerald-400 font-bold capitalize">{generatedResume.sequence} Sequence</span></div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={downloadPDFResume}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>

                  <button
                    onClick={downloadMarkdownFile}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all border border-white/5 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    .MD File
                  </button>

                  <button
                    onClick={copyMarkdown}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all border border-white/5 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>

                  <button
                    onClick={handleSendToATSScan}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Scan in ATS Evaluator
                  </button>
                </div>
              </div>

              {/* View Switcher: Rendered Document / Raw Markdown / ATS Highlights */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/10 shrink-0 w-fit">
                <button
                  onClick={() => setActiveViewTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeViewTab === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Resume Preview
                </button>
                <button
                  onClick={() => setActiveViewTab("markdown")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeViewTab === "markdown" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Markdown Code
                </button>
                <button
                  onClick={() => setActiveViewTab("tips")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeViewTab === "tips" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  ATS Optimization Highlights
                </button>
              </div>

              {/* Tab 1: Live Rendered Resume Sheet */}
              {activeViewTab === "preview" && (
                <div className="p-8 rounded-3xl bg-slate-950/90 border border-white/10 shadow-2xl overflow-y-auto max-h-[750px] font-sans text-slate-200">
                  <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    
                    {/* Header */}
                    <div className="text-center border-b border-white/10 pb-5">
                      <h1 className="text-2xl font-bold font-display tracking-tight text-white uppercase">
                        {generatedResume.fullName}
                      </h1>
                      <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        <span>{formData.location}</span>
                        <span>•</span>
                        <span className="text-indigo-400">{formData.email}</span>
                        <span>•</span>
                        <span>{formData.phone}</span>
                        {formData.linkedin && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">{formData.linkedin}</span>
                          </>
                        )}
                        {formData.github && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300">{formData.github}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Markdown Body Rendered with High Readability */}
                    <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed font-sans">
                      <MarkdownRenderer content={generatedResume.markdownResume} />
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 2: Raw Markdown Source */}
              {activeViewTab === "markdown" && (
                <div className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Plain text / Markdown ATS formatted</span>
                    <button
                      onClick={copyMarkdown}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy to Clipboard"}
                    </button>
                  </div>
                  <textarea
                    rows={22}
                    value={generatedResume.markdownResume}
                    onChange={(e) => setGeneratedResume({ ...generatedResume, markdownResume: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-slate-300 resize-none focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}

              {/* Tab 3: ATS Score Highlights & Recruiter Tips */}
              {activeViewTab === "tips" && (
                <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-5">
                  <div>
                    <h4 className="font-display font-bold text-sm text-emerald-300 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ATS Parsing Highlights & Strengths
                    </h4>
                    <div className="flex flex-col gap-2">
                      {generatedResume.atsHighlights?.map((hl, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-slate-300 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    <h4 className="font-display font-bold text-sm text-indigo-300 flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-indigo-400" />
                      Senior Recruiter Pro Tips
                    </h4>
                    <div className="flex flex-col gap-2">
                      {generatedResume.proTips?.map((tip, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-slate-300 flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Empty State / Prompting State */
            <div className="glass-panel p-10 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[480px]">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Your AI-Generated Resume Will Appear Here</h3>
                <p className="text-slate-400 text-xs max-w-sm mt-1 leading-relaxed">
                  Fill in your details on the left, or click one of the <strong>1-Click Sample Drafts</strong> at the top, then hit <strong>"Generate ATS Resume"</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-4 text-left">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Fresher Sequence
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Education & projects prioritized</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    XYZ Bullet Points
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Quantified impact & action verbs</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    PDF & MD Export
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">100% ATS-scannable clean layout</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLoadSample("fresher_cs")}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Fresher Draft & Try
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
