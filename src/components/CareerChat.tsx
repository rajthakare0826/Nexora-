import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  AlertCircle, 
  Database, 
  Trash2, 
  HelpCircle,
  Download,
  Copy,
  Check,
  Cpu,
  Zap,
  Brain,
  Compass,
  Code2,
  FileText,
  UserCheck,
  Lightbulb,
  LogIn,
  RotateCcw
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreErrors";
import { ChatMessage, UserProfile } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { logActivity } from "../lib/activityLogger";

interface CareerChatProps {
  user: FirebaseUser | null;
  onOpenAuth?: () => void;
}

// Available Gemini models as requested
export type ChatModel = "gemini-3.1-flash-lite" | "gemini-3.5-flash" | "gemini-3.1-pro-preview";

export interface ModelOption {
  id: ChatModel;
  name: string;
  tagline: string;
  icon: typeof Zap;
  badge: string;
  color: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    tagline: "Ultra-fast response for rapid Q&A and definitions",
    icon: Zap,
    badge: "Fast",
    color: "emerald"
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tagline: "Balanced reasoning for general career counseling and roadmaps",
    icon: Cpu,
    badge: "General",
    color: "blue"
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    tagline: "Deep cognitive reasoning for complex system design & code audits",
    icon: Brain,
    badge: "Complex",
    color: "purple"
  }
];

// Chatbot role personas with custom system instruction triggers
export type ChatRole = "career_coach" | "tech_interviewer" | "resume_specialist" | "behavioral_coach" | "concept_explainer";

export interface RoleOption {
  id: ChatRole;
  title: string;
  shortTitle: string;
  desc: string;
  icon: typeof Compass;
  starterQuestions: { label: string; text: string }[];
  welcomeMessage: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "career_coach",
    title: "Career Coach & HR Advisor",
    shortTitle: "Career Coach",
    desc: "Holistic career transitions, roadmaps, certifications, and salary negotiation.",
    icon: Compass,
    welcomeMessage: "### Welcome to your Senior Career Coach! 🧭\n\nI am your **Executive IT & AI Career Strategist**. I specialize in crafting personalized transition roadmaps, advising on industry certifications, and helping you navigate market demand.\n\n**How I can guide you:**\n- Step-by-step career path roadmaps with timelines\n- Industry certifications (AWS, GCP, CompTIA, CKA)\n- Portfolio project architecture blueprints\n- Salary benchmarking & offer negotiation tactics\n\n*Choose a prompt below or ask any career dilemma to begin!*",
    starterQuestions: [
      { label: "AI Engineer Pivot", text: "How do I transition from Web Development to an AI Engineer role in 2026? What skills and certifications are most valued?" },
      { label: "Portfolio Architecture", text: "Propose 2 impressive, production-grade full-stack projects that stand out to FAANG recruiters." },
      { label: "Salary Strategy", text: "How do I negotiate a competitive compensation package when moving from a service agency to a product company?" },
      { label: "Free Resources", text: "What are the absolute best free courses and learning roadmaps for mastering Cloud Architecture?" }
    ]
  },
  {
    id: "tech_interviewer",
    title: "Technical Interviewer & Mentor",
    shortTitle: "Tech Interviewer",
    desc: "Rigorous coding, Big-O complexity, system design, and algorithmic reviews.",
    icon: Code2,
    welcomeMessage: "### Technical Interview Bar Raiser Ready 💻\n\nI am your **Staff Software Engineer & Technical Interviewer**. I evaluate code quality, algorithmic efficiency, scalability patterns, and data structures under realistic IT company standards.\n\n**What we can drill:**\n- Algorithmic problem solving and Big-O Time/Space complexity audits\n- System design architectures (caching, sharding, message queues)\n- Edge cases, memory optimization, and clean code refactoring\n- Mock coding drills and live technical review\n\n*Drop a code snippet, system design topic, or algorithm to start!*",
    starterQuestions: [
      { label: "System Design: Rate Limiter", text: "Walk me through how to design a distributed API Rate Limiter handling 100,000 QPS. What algorithms and storage should I use?" },
      { label: "Big-O & Data Structures", text: "When should I prefer an LSM-tree based database over a B+ Tree, and what are the read/write trade-offs?" },
      { label: "Algorithm Drill", text: "Give me a medium-difficulty graph problem and guide me through identifying edge cases before writing code." },
      { label: "Code Review", text: "Here is a function handling asynchronous batch tasks. Audit it for race conditions, bottlenecks, and error handling." }
    ]
  },
  {
    id: "resume_specialist",
    title: "Resume & ATS Optimization Lead",
    shortTitle: "ATS Specialist",
    desc: "Google X-Y-Z bullet rewrites, metric quantification, and keyword scoring.",
    icon: FileText,
    welcomeMessage: "### Resume & ATS Optimization Suite 📄\n\nI am your **Executive Technical Recruiter & ATS Architect**. I audit resume bullet points, ensure high-impact keyword density, and transform passive job descriptions into metric-driven accomplishments.\n\n**My core focus:**\n- Rewriting bullets using the Google formula: *\"Accomplished [X] measured by [Y] by doing [Z]\"*\n- Uncovering missing high-frequency tech keywords for your target role\n- Quantifying engineering impact (latency, throughput, revenue, scale)\n- Side-by-side Before vs. After bullet improvements\n\n*Paste a resume bullet or your project description for an instant audit!*",
    starterQuestions: [
      { label: "Bullet Rewrite", text: "Rewrite this bullet point to sound like a Senior Engineer: 'Worked on React frontend, fixed UI bugs, and built user authentication.'" },
      { label: "ATS Keyword Scan", text: "What are the top 15 non-negotiable ATS keywords required for a Cloud DevOps Engineer resume in 2026?" },
      { label: "Metric Quantification", text: "How can I quantify my impact if my team did not measure official analytics or dollar revenue numbers?" },
      { label: "Resume Summary", text: "Draft a high-impact 3-line professional summary for a self-taught developer breaking into Junior Full-Stack engineering." }
    ]
  },
  {
    id: "behavioral_coach",
    title: "Executive HR & Behavioral Coach",
    shortTitle: "Behavioral HR",
    desc: "STAR method drills, culture-fit leadership principles, and EQ coaching.",
    icon: UserCheck,
    welcomeMessage: "### Executive HR & Behavioral Coaching Studio 👔\n\nI am your **HR Director & Leadership Development Coach**. I coach candidates to excel in behavioral rounds, managerial interviews, and leadership principle evaluations.\n\n**What we'll master:**\n- The **STAR Method** (Situation, Task, Action, Result) with structured headers\n- Conflict resolution narratives with engineering leads or product managers\n- Framing past failures and lessons learned positively\n- Executive presence, concise communication, and empathy\n\n*Pick a behavioral question to formulate your high-impact story!*",
    starterQuestions: [
      { label: "Conflict with Lead", text: "How should I structure a STAR answer for: 'Tell me about a time you strongly disagreed with a senior engineer or architect'?" },
      { label: "Handling Failure", text: "How do I answer: 'Tell me about your biggest professional failure' without raising major red flags?" },
      { label: "Tight Deadlines", text: "Help me craft a STAR response for: 'Describe a project where requirements changed right before the deadline.'" },
      { label: "Why Nexora / Company", text: "How do I authentically answer 'Why do you want to join our company?' without sounding like generic flattery?" }
    ]
  },
  {
    id: "concept_explainer",
    title: "Tech Concept Demystifier",
    shortTitle: "Concept Explainer",
    desc: "Crystal-clear real-world analogies, mental models, and zero jargon.",
    icon: Lightbulb,
    welcomeMessage: "### Tech Concept Demystifier ⚡\n\nI am your **Computer Science & Cloud Educator**. I break down the most complex, intimidating software and AI architectures into intuitive, memorable mental models and real-world analogies.\n\n**Ask me about:**\n- LLM Transformers, Attention Mechanisms & Vector Embeddings\n- Distributed consensus (Raft, Paxos, CAP Theorem)\n- Kubernetes, Docker, and Container Orchestration\n- Microservices, Event-Driven Architectures, and OAuth2\n\n*Name any confusing tech topic and I'll explain it simply!*",
    starterQuestions: [
      { label: "Explain Transformers", text: "Explain how Transformer neural networks and self-attention work using a simple real-world analogy." },
      { label: "Kubernetes Analogy", text: "Explain Docker containers vs Kubernetes pods and services as if I were running a restaurant kitchen." },
      { label: "Vector Databases", text: "What is a Vector Database and cosine similarity, and why is it needed for AI search?" },
      { label: "CAP Theorem", text: "Demystify the CAP theorem and explain why distributed systems have to choose between Consistency and Availability." }
    ]
  }
];

export default function CareerChat({ user, onOpenAuth }: CareerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Model & Role selections
  const [selectedModel, setSelectedModel] = useState<ChatModel>("gemini-3.5-flash");
  const [selectedRole, setSelectedRole] = useState<ChatRole>("career_coach");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // User Profile
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.displayName || "",
    currentRole: "",
    targetRole: "",
    experienceYears: "",
    skills: [],
    education: ""
  });

  // Current active role definition
  const currentRoleConfig = ROLE_OPTIONS.find(r => r.id === selectedRole) || ROLE_OPTIONS[0];

  // Auto-scroll to bottom of thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load User personalization profile
  const loadProfile = async () => {
    if (!user) {
      const saved = localStorage.getItem("nexora_user_profile");
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {
          console.error("Local storage profile load error", e);
        }
      }
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid, "profile", "custom");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (e) {
      console.warn("Could not load user profile:", e);
    }
  };

  // Set role welcome message
  const setInitialRoleWelcome = (roleId: ChatRole) => {
    const roleDef = ROLE_OPTIONS.find(r => r.id === roleId) || ROLE_OPTIONS[0];
    const welcome: ChatMessage = {
      id: "welcome-" + roleId,
      role: "assistant",
      content: roleDef.welcomeMessage,
      timestamp: Date.now(),
      botRole: roleId,
      modelUsed: selectedModel
    };
    setMessages([welcome]);
  };

  // Load messages from Firestore or localStorage
  useEffect(() => {
    loadProfile();
    if (user) {
      loadCloudChatHistory();
    } else {
      const saved = localStorage.getItem(`nexora_guest_chat_${selectedRole}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          console.error("Local storage load error", e);
        }
      }
      setInitialRoleWelcome(selectedRole);
    }
  }, [user, selectedRole]);

  const loadCloudChatHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const q = query(
        collection(db, "users", user.uid, "chats"),
        orderBy("timestamp", "asc")
      );
      const snapshot = await getDocs(q);
      const fetched: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
      });

      // Filter by selected role or show all
      const roleFiltered = fetched.filter(m => !m.botRole || m.botRole === selectedRole);
      if (roleFiltered.length > 0) {
        setMessages(roleFiltered);
      } else {
        setInitialRoleWelcome(selectedRole);
      }
    } catch (err: unknown) {
      console.error("Error loading chat history:", err);
      try {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/chats`);
      } catch {
        setError("Unable to sync cloud chat history. Operating in local mode.");
      }
      setInitialRoleWelcome(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  // Handle switching role
  const handleRoleChange = (newRole: ChatRole) => {
    if (newRole === selectedRole) return;
    setSelectedRole(newRole);
  };

  // Clear History
  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your conversation history for this role?")) {
      if (user) {
        try {
          const q = query(collection(db, "users", user.uid, "chats"));
          const snapshot = await getDocs(q);
          const deletePromises = snapshot.docs
            .filter(d => {
              const data = d.data();
              return !data.botRole || data.botRole === selectedRole;
            })
            .map(d => deleteDoc(doc(db, "users", user.uid, "chats", d.id)));
          await Promise.all(deletePromises);
        } catch (e) {
          console.error("Firestore clear failed", e);
        }
      }
      localStorage.removeItem(`nexora_guest_chat_${selectedRole}`);
      setInitialRoleWelcome(selectedRole);
    }
  };

  // Export Chat to Markdown
  const handleExportChat = () => {
    const formatted = messages.map(m => {
      const author = m.role === "assistant" ? `AI (${m.botRole || selectedRole})` : "Candidate";
      const time = new Date(m.timestamp).toLocaleTimeString();
      return `### ${author} [${time}]\n\n${m.content}\n\n---\n`;
    }).join("\n");

    const header = `# Nexora AI Career Counseling Transcript\n**Role**: ${currentRoleConfig.title}\n**Model**: ${selectedModel}\n**Date**: ${new Date().toLocaleDateString()}\n\n---\n\n`;
    const fullText = header + formatted;

    const blob = new Blob([fullText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexora-chat-${selectedRole}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send Message to Multi-Turn Backend
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      botRole: selectedRole
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInputValue("");
    setLoading(true);

    // Telemetry log
    await logActivity({
      activity: "AI Chat",
      details: `[${currentRoleConfig.shortTitle}] ${text.length > 80 ? text.substring(0, 80) + "..." : text}`,
      status: "Success"
    });

    // Save user message immediately
    if (user) {
      try {
        await addDoc(collection(db, "users", user.uid, "chats"), {
          role: userMsg.role,
          content: userMsg.content,
          timestamp: userMsg.timestamp,
          botRole: selectedRole
        });
      } catch (e) {
        console.warn("Firestore save user msg error:", e);
      }
    } else {
      localStorage.setItem(`nexora_guest_chat_${selectedRole}`, JSON.stringify(currentHistory));
    }

    try {
      // Send chat history preserving multi-turn continuity
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          role: selectedRole,
          messages: currentHistory.map(m => ({ role: m.role, content: m.content })),
          userProfile: {
            fullName: profile.fullName || "Candidate",
            education: profile.education || "Not specified",
            skills: profile.skills || [],
            targetRole: profile.targetRole || "Not specified",
            experienceYears: profile.experienceYears || "Not specified"
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to communicate with Nexora AI chat service.");
      }

      const reply = await response.json();

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: reply.content,
        timestamp: Date.now(),
        modelUsed: reply.modelUsed || selectedModel,
        botRole: selectedRole
      };

      const updatedHistory = [...currentHistory, aiMsg];
      setMessages(updatedHistory);

      // Save AI reply to Firestore or localStorage
      if (user) {
        try {
          await addDoc(collection(db, "users", user.uid, "chats"), {
            role: aiMsg.role,
            content: aiMsg.content,
            timestamp: aiMsg.timestamp,
            modelUsed: aiMsg.modelUsed,
            botRole: selectedRole
          });
        } catch (e) {
          console.warn("Firestore save ai msg error:", e);
        }
      } else {
        localStorage.setItem(`nexora_guest_chat_${selectedRole}`, JSON.stringify(updatedHistory));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate response. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-90px)] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-20 w-64 h-64 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-3">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <currentRoleConfig.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-white tracking-tight">
                {currentRoleConfig.title}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Multi-Turn Gemini
              </span>
            </div>
            <p className="text-slate-400 text-xs font-mono flex items-center gap-2 mt-0.5">
              {user ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                  Firestore Sync Active ({user.email})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Local Guest Mode
                  {onOpenAuth && (
                    <button
                      onClick={onOpenAuth}
                      className="ml-2 text-indigo-400 hover:text-indigo-300 underline font-sans flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      Sign in with Google to sync
                    </button>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {messages.length > 1 && (
            <>
              <button
                onClick={handleExportChat}
                title="Export Transcript"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleClearHistory}
                title="Clear Conversation"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Model & Role Selection Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
        {/* Role Selector Pills */}
        <div className="lg:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Role:</span>
          {ROLE_OPTIONS.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/30 font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-blue-400"}`} />
                {r.shortTitle}
              </button>
            );
          })}
        </div>

        {/* Model Selector Pills */}
        <div className="lg:col-span-5 flex items-center justify-start lg:justify-end gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Model:</span>
          {MODEL_OPTIONS.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                title={m.tagline}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30 font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? "text-white" : "text-indigo-400"}`} />
                <span className="font-medium">{m.badge}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  {m.id === "gemini-3.1-pro-preview" ? "3.1 Pro" : m.id === "gemini-3.1-flash-lite" ? "3.1 Lite" : "3.5 Flash"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Sandbox Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#030712]/80 border border-white/5 rounded-2xl p-3 sm:p-4 overflow-hidden relative shadow-2xl backdrop-blur-xl">
        
        {/* Messages Scrollable Thread */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3 scrollbar-thin"
        >
          {messages.map((msg) => {
            const isAI = msg.role === "assistant";
            const roleInfo = ROLE_OPTIONS.find(r => r.id === (msg.botRole || selectedRole));
            
            return (
              <div
                key={msg.id}
                className={`flex ${isAI ? "justify-start" : "justify-end"} items-start gap-3 group`}
              >
                {/* AI Avatar */}
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md flex-shrink-0 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                {/* Message Content Bubble */}
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                    isAI
                      ? "bg-slate-900/90 border border-white/10 text-slate-100 shadow-lg"
                      : "bg-blue-600 text-white shadow-md font-normal"
                  }`}
                >
                  {/* Bubble Metadata Header */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/5 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      {isAI ? (
                        <>
                          <span className="text-blue-400 font-bold">{roleInfo?.shortTitle || "Nexora AI"}</span>
                          {msg.modelUsed && (
                            <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] text-slate-300">
                              {msg.modelUsed.replace("gemini-", "")}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-blue-100 font-semibold">{user?.displayName || "Candidate"}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isAI && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy message"
                          className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity cursor-pointer p-0.5"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Text */}
                  {isAI ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-white text-[13px] leading-relaxed">
                      {msg.content}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 font-bold flex-shrink-0 flex items-center justify-center text-xs border border-white/10">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Animation Bubble */}
          {loading && (
            <div className="flex justify-start items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold animate-pulse shadow-md">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/90 rounded-2xl px-5 py-4 border border-white/10 flex items-center gap-3 shadow-lg">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  Synthesizing insights using {selectedModel}...
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between gap-2 max-w-xl mx-auto shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs underline hover:text-red-300 cursor-pointer font-mono"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Starter Prompts for Active Role */}
        {messages.length <= 1 && (
          <div className="mb-3 pt-2 border-t border-white/5">
            <p className="text-slate-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              Recommended {currentRoleConfig.shortTitle} Inquiries:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentRoleConfig.starterQuestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.text)}
                  className="text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-blue-500/30 transition-all text-xs text-slate-300 hover:text-white cursor-pointer group"
                >
                  <div className="text-blue-400 font-bold mb-0.5 flex items-center gap-1 text-[11px] group-hover:text-blue-300">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    {prompt.label}
                  </div>
                  <div className="truncate text-slate-400 text-[11px] font-sans">{prompt.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Textarea & Send Control */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative mt-auto"
        >
          <input
            type="text"
            value={inputValue}
            disabled={loading}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${currentRoleConfig.shortTitle} with ${selectedModel === "gemini-3.1-pro-preview" ? "Gemini 3.1 Pro" : selectedModel === "gemini-3.1-flash-lite" ? "Gemini 3.1 Lite" : "Gemini 3.5 Flash"}...`}
            className="w-full pl-4 pr-12 py-3.5 rounded-xl text-xs sm:text-sm bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            title="Send inquiry"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
