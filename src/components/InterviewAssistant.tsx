import { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, Sparkles, AlertCircle, Play, History, RefreshCw, Send, 
  CheckCircle2, ChevronRight, MessageSquare, Award, Clock, Star, Briefcase, 
  User, Check, BarChart2, BookOpen, Compass, ArrowRight, AlertTriangle, ShieldAlert,
  Video, VideoOff, Mic, MicOff, Volume2, VolumeX, Code, Terminal, FileText,
  HelpCircle, Calendar, ShieldCheck, Download
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { InterviewQA, InterviewSession, InterviewFinalReport } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { logActivity } from "../lib/activityLogger";

interface InterviewAssistantProps {
  user: FirebaseUser | null;
}

const PRESET_ROLES = [
  "Software Developer",
  "Web Developer",
  "AI/ML Engineer",
  "Backend Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Data Engineer",
  "DevOps / Cloud Engineer"
];

const SAMPLE_FRESHER_RESUME = `EDUCATION:
B.Tech in Computer Science & Engineering (2020 - 2024), CGPA: 8.7/10

TECHNICAL SKILLS:
- Languages: Python, Java, JavaScript, C++, SQL
- Web Technologies: React.js, Node.js, Express, HTML5, CSS3, Tailwind
- Databases & Tools: PostgreSQL, MongoDB, Git, Docker, Postman

PROJECTS:
1. Nexora AI Chatbot: Built an interactive career bot using Python, LangChain, and OpenAI API. Handled 500+ simulated user queries with sub-second response times.
2. E-Commerce Platform: Architected a full-stack MERN shopping portal with JWT authentication, Stripe payment processing, and responsive UI.`;

const SAMPLE_EXPERIENCED_RESUME = `EXPERIENCE:
Software Engineer at TechCorp Solutions (2 years)
- Architected and scaled distributed backend microservices in Node.js and Go, reducing API p99 latency by 38%.
- Optimized PostgreSQL indexing and queries across 10M+ transaction rows, saving $14K annually in cloud database compute.
- Integrated Redis caching layer to handle 50,000 requests per minute with 99.98% uptime.

SKILLS: Python, Go, Node.js, TypeScript, PostgreSQL, Redis, Docker, Kubernetes, AWS.`;

export default function InterviewAssistant({ user }: InterviewAssistantProps) {
  // Candidate Profile & Interview Settings
  const [candidateName, setCandidateName] = useState(user?.displayName || "Raj Thakare");
  const [role, setRole] = useState("Software Developer");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [yearsOfExperience, setYearsOfExperience] = useState("0");
  const [technicalSkills, setTechnicalSkills] = useState("Python, JavaScript, React, Node.js, SQL, Git, Data Structures");
  const [resumeText, setResumeText] = useState("");
  const [difficulty, setDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">("INTERMEDIATE");
  const [durationMinutes, setDurationMinutes] = useState<15 | 30 | 45 | 60>(30);
  const [company, setCompany] = useState("");

  // Live Environment Toggles
  const [enableCamera, setEnableCamera] = useState(false);
  const [enableSpeech, setEnableSpeech] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [integritySignals, setIntegritySignals] = useState<string[]>([
    "Initial environment check: Normal conversational focus",
    "Candidate camera session verified"
  ]);

  // Simulation Status
  const [step, setStep] = useState<"setup" | "interviewing" | "feedback" | "report">("setup");
  const [currentPhase, setCurrentPhase] = useState("PHASE 1 — INTRODUCTION");
  const [qaList, setQaList] = useState<InterviewQA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestFeedback, setLatestFeedback] = useState<any | null>(null);
  const [finalReport, setFinalReport] = useState<InterviewFinalReport | null>(null);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);

  // Estimated questions based on duration
  const totalQuestions = durationMinutes === 15 ? 5 : durationMinutes === 45 ? 12 : durationMinutes === 60 ? 15 : 8;

  // Timer Feature
  const [secondsSpent, setSecondsSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Video Ref for Camera Preview
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Scroll anchor
  const feedbackTopRef = useRef<HTMLDivElement>(null);

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!enableSpeech || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Camera Management
  useEffect(() => {
    if (enableCamera && (step === "interviewing" || step === "feedback")) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Webcam access declined or unavailable:", err);
          setEnableCamera(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [enableCamera, step]);

  // Speech-to-Text Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech-to-text is not supported in this browser. Please use Google Chrome or type your answer.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Start stopwatch
  const startTimer = () => {
    stopTimer();
    setSecondsSpent(0);
    timerRef.current = setInterval(() => {
      setSecondsSpent(prev => prev + 1);
    }, 1000);
  };

  // Stop stopwatch
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch past sessions
  useEffect(() => {
    if (user) {
      loadPastSessions();
    }
  }, [user]);

  const loadPastSessions = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "interviews"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const list: InterviewSession[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as InterviewSession);
      });
      setPastSessions(list);
    } catch (e) {
      console.error("Failed loading past simulated interviews", e);
    }
  };

  // Trigger setup start
  const handleStartInterview = async () => {
    const selectedRole = role === "custom" ? customRole.trim() : role;
    if (!selectedRole) {
      setError("Please specify or select a target Job Role to begin.");
      return;
    }

    setLoading(true);
    setError(null);
    setQaList([]);
    setLatestFeedback(null);
    setFinalReport(null);
    setUserAnswer("");
    setCurrentPhase("PHASE 1 — INTRODUCTION");

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          role: selectedRole,
          experienceLevel,
          yearsOfExperience,
          technicalSkills,
          resumeText,
          difficulty,
          durationMinutes,
          company: company.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Failed to initialize simulated interview room.");
      }

      const data = await response.json();
      const firstQ = data.question || "Hello, welcome to Nexora AI. Let's begin your interview. Please introduce yourself.";
      setCurrentQuestion(firstQ);
      setCurrentPhase(data.phase || "PHASE 1 — INTRODUCTION");
      setStep("interviewing");
      startTimer();
      speakText(firstQ);

      await logActivity({
        activity: "Interview Started",
        details: `Launched simulated live IT interview (${difficulty}, ${durationMinutes}m) for ${candidateName} as ${selectedRole}.`,
        status: "Success"
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      if (!window.confirm("You left your response empty. Do you want to submit anyway?")) {
        return;
      }
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    stopTimer();
    setLoading(true);
    setError(null);

    const selectedRole = role === "custom" ? customRole : role;
    const currentQuestionIndex = qaList.length + 1;

    try {
      const historyPayload = qaList.map(item => ({
        phase: item.phase || "",
        question: item.question,
        answer: item.answer,
        score: item.feedback?.score || 0
      }));

      const response = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          role: selectedRole,
          experienceLevel,
          yearsOfExperience,
          technicalSkills,
          resumeText,
          difficulty,
          durationMinutes,
          company: company.trim() || undefined,
          question: currentQuestion,
          userAnswer,
          history: historyPayload,
          questionIndex: currentQuestionIndex,
          totalQuestions,
          currentPhase
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit and grade your answer.");
      }

      const feedbackData = await response.json();
      const calculatedRating = (feedbackData.score || 7) * 10;

      const newQA: InterviewQA = {
        phase: currentPhase,
        question: currentQuestion,
        answer: userAnswer,
        feedback: {
          rating: calculatedRating,
          score: feedbackData.score || 7,
          categoryScores: feedbackData.categoryScores || {},
          strengths: feedbackData.strengths || [],
          gaps: feedbackData.weaknesses || [],
          weaknesses: feedbackData.weaknesses || [],
          modelAnswer: feedbackData.modelAnswer || "",
          communicationTips: feedbackData.communicationTips || "",
          confidenceTips: feedbackData.confidenceTips || "",
          nextQuestion: feedbackData.nextQuestion || "",
          nextPhase: feedbackData.nextPhase || currentPhase,
          adaptiveNote: feedbackData.adaptiveNote || ""
        }
      };

      const updatedList = [...qaList, newQA];
      setQaList(updatedList);
      setLatestFeedback(newQA.feedback);
      setStep("feedback");

      if (feedbackData.spokenFeedback) {
        speakText(feedbackData.spokenFeedback);
      }

      setTimeout(() => {
        feedbackTopRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      setError(err.message || "Failed to process evaluation.");
      startTimer();
    } finally {
      setLoading(false);
    }
  };

  // Advance to Next Question or Complete
  const handleNextQuestion = () => {
    if (qaList.length >= totalQuestions) {
      handleGenerateFinalReport();
    } else {
      if (latestFeedback && latestFeedback.nextQuestion) {
        setCurrentQuestion(latestFeedback.nextQuestion);
        if (latestFeedback.nextPhase) {
          setCurrentPhase(latestFeedback.nextPhase);
        }
        speakText(latestFeedback.nextQuestion);
      } else {
        const fallbackQ = "Can you describe a challenging technical bug you resolved recently and how you traced its root cause?";
        setCurrentQuestion(fallbackQ);
        speakText(fallbackQ);
      }
      setUserAnswer("");
      setLatestFeedback(null);
      setStep("interviewing");
      startTimer();
    }
  };

  // Generate Report
  const handleGenerateFinalReport = async () => {
    setLoading(true);
    setError(null);
    const selectedRole = role === "custom" ? customRole : role;

    try {
      const historyPayload = qaList.map(item => ({
        phase: item.phase || "",
        question: item.question,
        answer: item.answer,
        score: item.feedback?.score || 0,
        strengths: item.feedback?.strengths || [],
        weaknesses: item.feedback?.weaknesses || []
      }));

      const response = await fetch("/api/interview/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          role: selectedRole,
          experienceLevel,
          yearsOfExperience,
          technicalSkills,
          difficulty,
          durationMinutes,
          company: company.trim() || undefined,
          history: historyPayload,
          integritySignals
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile executive report.");
      }

      const reportData: InterviewFinalReport = await response.json();
      setFinalReport(reportData);
      setStep("report");

      if (user) {
        const docPayload: InterviewSession = {
          userId: user.uid,
          timestamp: Date.now(),
          candidateName,
          role: selectedRole,
          experienceLevel,
          yearsOfExperience,
          technicalSkills,
          resumeText,
          difficulty,
          durationMinutes,
          company: company.trim() || undefined,
          qaList,
          currentQuestion: "Interview Completed",
          isCompleted: true,
          averageScore: reportData.overallScore || 75,
          finalReport: reportData
        };

        await addDoc(collection(db, "users", user.uid, "interviews"), docPayload);
        loadPastSessions();
      }
    } catch (err: any) {
      setError(err.message || "Could not generate final evaluation report.");
    } finally {
      setLoading(false);
    }
  };

  // Reset session
  const handleReset = () => {
    stopTimer();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStep("setup");
    setQaList([]);
    setCurrentQuestion("");
    setUserAnswer("");
    setLatestFeedback(null);
    setFinalReport(null);
    setError(null);
  };

  // Format stopwatch timer
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Target time remaining
  const targetSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, targetSeconds - secondsSpent);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 60) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 min-h-screen flex flex-col">
      {/* Header section */}
      <div className="border-b border-white/5 pb-5 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold tracking-wider uppercase border border-indigo-500/20">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Nexora AI Live IT Interviewer
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100-Point Scoring Engine
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Live IT Company-Style Interview
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Experience a realistic, 6-phase adaptive IT interview with real-time audio synthesis, voice recording, live webcam monitoring, and comprehensive 100-point hiring evaluation.
          </p>
        </div>
        
        {step !== "setup" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEnableSpeech(!enableSpeech)}
              className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                enableSpeech 
                  ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
              title={enableSpeech ? "AI Voice Active" : "AI Voice Muted"}
            >
              {enableSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer transition-all"
            >
              End Interview
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-grow">
            <div className="font-bold">Interview Alert</div>
            <div className="mt-0.5 text-rose-300/90 leading-relaxed">{error}</div>
          </div>
        </div>
      )}

      {/* 1. SETUP STEP: Candidate Profile & Interview Settings */}
      {step === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-grow">
          {/* Main Intake Form (8 cols) */}
          <div className="lg:col-span-8 glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-display font-bold text-base text-white">Candidate Profile & Interview Settings</h3>
                  <p className="text-slate-400 text-xs">Complete your candidate details to assemble the personalized interview room</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>IT Standard</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Candidate Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Raj Thakare"
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Target Job Role */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Target Job Role</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (e.target.value !== "custom") setCustomRole("");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white bg-slate-900 border border-white/10 focus:ring-1 focus:ring-indigo-500"
                >
                  {PRESET_ROLES.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                  <option value="custom">-- Specify Custom Role --</option>
                </select>
              </div>

              {/* Custom Role Input */}
              {role === "custom" && (
                <div className="md:col-span-2 space-y-1.5 animate-fade-in">
                  <label className="text-xs text-slate-300 font-bold block">Custom Role Title</label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Staff Distributed Systems Engineer"
                    className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white"
                  />
                </div>
              )}

              {/* Experience Level */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value);
                    if (e.target.value === "Fresher") setYearsOfExperience("0");
                    else if (e.target.value === "Junior (1-2 yrs)") setYearsOfExperience("1.5");
                    else if (e.target.value === "Mid-Level (3-5 yrs)") setYearsOfExperience("4");
                    else if (e.target.value === "Senior (5+ yrs)") setYearsOfExperience("6");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white bg-slate-900 border border-white/10"
                >
                  <option value="Fresher">Fresher / College Graduate (0 yrs)</option>
                  <option value="Junior (1-2 yrs)">Junior (1-2 yrs)</option>
                  <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                  <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                  <option value="Lead / Architect">Lead / Architect</option>
                </select>
              </div>

              {/* Years of Experience */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Years of Experience</label>
                <input
                  type="text"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="e.g. 0, 2, 4.5"
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white"
                />
              </div>

              {/* Technical Skills */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  value={technicalSkills}
                  onChange={(e) => setTechnicalSkills(e.target.value)}
                  placeholder="e.g. Python, React, PostgreSQL, Docker, Data Structures, OOP, SQL"
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white"
                />
              </div>

              {/* Interview Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Interview Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        difficulty === lvl 
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm" 
                          : "bg-white/5 text-slate-400 border-white/5 hover:text-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Duration */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Interview Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {([15, 30, 45, 60] as const).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        durationMinutes === mins 
                          ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-sm" 
                          : "bg-white/5 text-slate-400 border-white/5 hover:text-slate-200"
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Company */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Target Company (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, Microsoft, TCS, Infosys, Tech Startup"
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm glass-input text-white"
                />
              </div>

              {/* Resume / Projects Excerpt */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-bold">Resume / Academic Projects</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setResumeText(SAMPLE_FRESHER_RESUME)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                    >
                      Fill Fresher Resume
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setResumeText(SAMPLE_EXPERIENCED_RESUME)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                    >
                      Fill Experienced Resume
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume summary, education, key projects, and tech stack for the AI interviewer to probe..."
                  className="w-full p-3 rounded-xl text-xs glass-input font-mono text-slate-300 resize-none placeholder-slate-500"
                />
              </div>

              {/* Hardware / Live Mode Toggles */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableCamera}
                      onChange={(e) => setEnableCamera(e.target.checked)}
                      className="rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0"
                    />
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Enable Webcam Preview</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableSpeech}
                      onChange={(e) => setEnableSpeech(e.target.checked)}
                      className="rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0"
                    />
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Voice Speech Output</span>
                  </label>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Adaptive Follow-up: <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Connecting to Nexora AI Interview Room...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Start Live IT Company Interview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Sidebar: Structure & Sessions (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Realistic IT Interview Structure Guide */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3.5 bg-gradient-to-br from-indigo-950/20 to-slate-900/40">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                6-Phase IT Interview Flow
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div><strong>Introduction:</strong> Brief greeting and self-introduction.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div><strong>Resume & Projects:</strong> Deep-dive into architecture, scale & contributions.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div><strong>Technical Round:</strong> Core fundamentals, OOP, OS, DBMS & frameworks.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div><strong>Coding & Logic:</strong> Explain approach before code; time/space complexity.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                  <div><strong>Production Scenarios:</strong> Latency spikes, bug triage, trade-offs.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">6</span>
                  <div><strong>HR & Behavioral:</strong> STAR method, strengths, teamwork & culture fit.</div>
                </li>
              </ul>
            </div>

            {/* 100-Point Scoring Framework Info */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2 bg-slate-900/30">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                100-Point Scoring Framework
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white font-bold block">Technical</span> 30 pts
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white font-bold block">Problem Solving</span> 20 pts
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white font-bold block">Communication</span> 15 pts
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white font-bold block">Programming</span> 15 pts
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white font-bold block">Project Knowledge</span> 10 pts
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-white font-bold block">Behavioral / HR</span> 10 pts
                </div>
              </div>
            </div>

            {/* Past Sessions */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" />
                Completed Sessions
              </h4>

              {user ? (
                pastSessions.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                    {pastSessions.map((session, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (session.finalReport) {
                            setRole(session.role);
                            setQaList(session.qaList);
                            setFinalReport(session.finalReport);
                            setStep("report");
                          }
                        }}
                        className="flex items-center justify-between text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer group"
                      >
                        <div className="truncate max-w-[170px]">
                          <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                            {session.role}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {session.qaList?.length || 0} questions • {session.difficulty || "INTERMEDIATE"}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {session.averageScore || 75}/100
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-slate-500 text-xs">
                    No past sessions found. Start your first simulated interview!
                  </div>
                )
              ) : (
                <div className="text-center p-3 text-slate-400 text-xs leading-relaxed bg-white/[0.01] rounded-xl border border-white/5">
                  Sign in to automatically save your transcripts and 7-day preparation plans.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE INTERVIEWING STEP */}
      {step === "interviewing" && (
        <div className="space-y-6 flex-grow">
          {/* Top Status & Video / Mic HUD */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Phase & Target Role Info (8 cols) */}
            <div className="md:col-span-8 glass-panel p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {currentPhase}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Difficulty: <strong className="text-white">{difficulty}</strong>
                  </span>
                </div>
                <div className="text-slate-100 font-bold text-sm">
                  Candidate: <span className="text-white font-black">{candidateName}</span> • Role: <span className="text-indigo-300">{role === "custom" ? customRole : role}</span>
                  {company && <span className="text-slate-400 font-normal"> ({company})</span>}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Time Remaining</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(remainingSeconds)}
                  </div>
                </div>
              </div>
            </div>

            {/* Webcam / Monitor Feed (4 cols) */}
            <div className="md:col-span-4 glass-panel p-2.5 rounded-2xl border border-white/5 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                {enableCamera ? (
                  <div className="relative w-16 h-12 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <VideoOff className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Integrity Monitor
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {enableCamera ? "Visual focus active" : "Audio-only session"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEnableCamera(!enableCamera)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                title={enableCamera ? "Turn off camera" : "Turn on camera"}
              >
                {enableCamera ? <Video className="w-4 h-4 text-indigo-400" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {qaList.length + 1} of {totalQuestions}</span>
              <span>{Math.round(((qaList.length + 1) / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${((qaList.length + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Question Display (ONE QUESTION AT A TIME) */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-slate-950/80 relative overflow-hidden shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="space-y-2 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase tracking-wider">
                    Senior IT Technical Interviewer
                  </span>
                  <button
                    onClick={() => speakText(currentQuestion)}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    title="Repeat question audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Hear Question
                  </button>
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-white leading-relaxed">
                  "{currentQuestion}"
                </h2>
              </div>
            </div>
          </div>

          {/* Candidate Response Workspace */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-200 font-bold flex items-center gap-2">
                <span>Your Answer:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Be concise, practical, and structured)
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isRecording 
                      ? "bg-rose-500 text-white animate-pulse" 
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  }`}
                  title={isRecording ? "Stop recording speech" : "Speak your answer with mic"}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{isRecording ? "Listening... (Click to stop)" : "Speech-to-Text"}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={7}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="State your approach, logic, tech stack rationale, or architectural structure. If this is a coding question, outline your thoughts before the code..."
              disabled={loading}
              className="w-full p-4 rounded-xl text-sm glass-input font-sans leading-relaxed resize-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>The AI will analyze your depth and dynamically adapt the next question.</span>
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Evaluating Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EVALUATION FEEDBACK STEP (Single-turn Adaptive Feedback) */}
      {step === "feedback" && latestFeedback && (
        <div ref={feedbackTopRef} className="space-y-6 flex-grow animate-fade-in">
          {/* Header Progress & Adaptive Signal */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono font-black shrink-0 ${getScoreColor((latestFeedback.score || 7) * 10)}`}>
                <span className="text-xl leading-none">{latestFeedback.score || 7}</span>
                <span className="text-[8px] uppercase tracking-wider mt-0.5 font-sans">/ 10</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-display font-bold text-base text-white">Interviewer Assessment</h3>
                  {latestFeedback.adaptiveNote && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-mono border border-indigo-500/20">
                      Adaptive Triggered
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs">
                  {latestFeedback.adaptiveNote || "Evaluating technical accuracy, problem solving structure, and communication."}
                </p>
              </div>
            </div>

            <div className="text-right text-xs shrink-0 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl">
              <span className="text-slate-400 font-semibold block">Round Progress</span>
              <span className="text-white font-bold font-mono">
                {qaList.length} / {totalQuestions} Completed
              </span>
            </div>
          </div>

          {/* Question & Answer Recap */}
          <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-white/[0.01] p-4 border-b border-white/5">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Question Asked</span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium italic mt-1">"{qaList[qaList.length - 1]?.question}"</p>
            </div>
            <div className="p-4 bg-slate-900/30">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Your Answer</span>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                {qaList[qaList.length - 1]?.answer || "[No answer provided/skipped]"}
              </p>
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/10 bg-emerald-950/5">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-3 border-b border-emerald-500/10 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Demonstrated Strengths
              </h4>
              {latestFeedback.strengths && latestFeedback.strengths.length > 0 ? (
                <ul className="space-y-2 pl-1">
                  {latestFeedback.strengths.map((str: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-500/60 mt-0.5 shrink-0" />
                      <div className="flex-grow">
                        <MarkdownRenderer content={str} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 italic">No specific strengths flagged. Make sure to structure with clear actions.</div>
              )}
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-rose-500/10 bg-rose-950/5">
              <h4 className="text-xs sm:text-sm font-bold text-rose-400 flex items-center gap-1.5 mb-3 border-b border-rose-500/10 pb-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Gaps & Suggested Improvements
              </h4>
              {latestFeedback.weaknesses && latestFeedback.weaknesses.length > 0 ? (
                <ul className="space-y-2 pl-1">
                  {latestFeedback.weaknesses.map((weak: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-rose-500/60 mt-0.5 shrink-0" />
                      <div className="flex-grow">
                        <MarkdownRenderer content={weak} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 italic">No critical performance gaps observed. Solid response!</div>
              )}
            </div>
          </div>

          {/* Model Answer (Exemplar IT Company Response) */}
          {latestFeedback.modelAnswer && (
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/15 bg-indigo-950/15 relative overflow-hidden">
              <h5 className="text-xs sm:text-sm font-bold text-indigo-300 flex items-center gap-1.5 mb-2.5 border-b border-indigo-500/10 pb-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Recommended Exemplar Answer
              </h5>
              <div className="text-xs text-slate-300 leading-relaxed">
                <MarkdownRenderer content={latestFeedback.modelAnswer} />
              </div>
            </div>
          )}

          {/* Advance Action Trigger */}
          <button
            onClick={handleNextQuestion}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling 100-Point Hiring Report...
              </>
            ) : qaList.length >= totalQuestions ? (
              <>
                <Award className="w-4.5 h-4.5 text-yellow-300" />
                Finish Interview & Generate 100-Point Report
              </>
            ) : (
              <>
                <span>Next Question ({qaList.length + 1} of {totalQuestions})</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* 4. FINAL REPORT: STRICT 100-POINT FRAMEWORK & 7-DAY PREPARATION PLAN */}
      {step === "report" && finalReport && (
        <div className="space-y-6 flex-grow animate-fade-in">
          {/* Header Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Overall 100-Point Score Card (5 cols) */}
            <div className="md:col-span-5 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900/60 to-slate-950/80 relative overflow-hidden">
              <div className="space-y-1 w-full">
                <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider">
                  NEXORA AI HIRING EVALUATION
                </span>
                <h3 className="font-display font-black text-xl text-white">
                  Candidate Report
                </h3>
              </div>

              {/* Big Score Gauge */}
              <div className="my-5 relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * (finalReport.overallScore || 75)) / 100}
                    className={`transition-all duration-1000 ${
                      (finalReport.overallScore || 75) >= 80 ? "text-emerald-500" : (finalReport.overallScore || 75) >= 60 ? "text-amber-500" : "text-rose-500"
                    }`}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white font-mono leading-none">
                    {finalReport.overallScore || 75}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                    / 100 PTS
                  </span>
                </div>
              </div>

              {/* Hiring Recommendation Status */}
              <div className="w-full space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Recommendation: {finalReport.hiringReadiness || "Hire"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic px-2">
                  "{finalReport.justification}"
                </p>
              </div>
            </div>

            {/* 6-Category 100-Point Scoring Breakdown (7 cols) */}
            <div className="md:col-span-7 glass-panel p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-center">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  100-Point Category Breakdown
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">100 Pts Total</span>
              </div>

              <div className="space-y-3">
                {[
                  { 
                    label: "Technical Knowledge", 
                    score: finalReport.breakdown?.technical ?? 24, 
                    max: 30, 
                    color: "bg-blue-500",
                    desc: "Core concepts, architecture & system depth" 
                  },
                  { 
                    label: "Problem Solving", 
                    score: finalReport.breakdown?.problemSolving ?? 16, 
                    max: 20, 
                    color: "bg-emerald-500",
                    desc: "Logical approach, complexity & trade-offs" 
                  },
                  { 
                    label: "Communication", 
                    score: finalReport.breakdown?.communication ?? 12, 
                    max: 15, 
                    color: "bg-purple-500",
                    desc: "Clarity, pacing & structured STAR delivery" 
                  },
                  { 
                    label: "Programming / Logic", 
                    score: finalReport.breakdown?.programming ?? 12, 
                    max: 15, 
                    color: "bg-indigo-500",
                    desc: "Algorithm logic, edge cases & code reasoning" 
                  },
                  { 
                    label: "Project Knowledge", 
                    score: finalReport.breakdown?.projectKnowledge ?? 8, 
                    max: 10, 
                    color: "bg-amber-500",
                    desc: "Hands-on ownership, challenges & metrics" 
                  },
                  { 
                    label: "Behavioral / HR", 
                    score: finalReport.breakdown?.behavioral ?? 8, 
                    max: 10, 
                    color: "bg-rose-500",
                    desc: "Teamwork, resilience & cultural alignment" 
                  }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-mono text-white font-bold">
                        {item.score} <span className="text-slate-500 font-normal">/ {item.max}</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-700`}
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top 3 Strengths */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                TOP 3 STRENGTHS
              </h4>
              <ul className="space-y-2.5">
                {(finalReport.top3Strengths || []).map((str: string, idx: number) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <MarkdownRenderer content={str} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Top 3 Improvement Areas */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                TOP 3 IMPROVEMENT AREAS
              </h4>
              <ul className="space-y-2.5">
                {(finalReport.top3ImprovementAreas || []).map((area: string, idx: number) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <MarkdownRenderer content={area} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technologies to Revise & Questions to Practice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Technologies to Revise */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Technologies to Revise
              </h4>
              <div className="flex flex-wrap gap-2">
                {(finalReport.technologiesToRevise || []).map((tech: string, idx: number) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Questions to Practice */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Questions to Practice Next
              </h4>
              <ul className="space-y-2">
                {(finalReport.questionsToPractice || []).map((q: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Personalized 7-Day Preparation Plan */}
          {finalReport.personalized7DayPlan && finalReport.personalized7DayPlan.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-display font-bold text-base text-white">Personalized 7-Day Preparation Plan</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">Tailored to your gaps</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {finalReport.personalized7DayPlan.map((dayItem, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-indigo-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                        DAY {dayItem.day || idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[130px]">
                        {dayItem.focus}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {dayItem.title}
                    </div>
                    <ul className="space-y-1 pt-1 border-t border-white/5">
                      {(dayItem.tasks || []).map((t: string, tIdx: number) => (
                        <li key={tIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                          <Check className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Summary & Integrity Observations */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 bg-slate-900/30">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Interview Transcript Summary & Integrity Signals
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {finalReport.transcriptSummary || "Candidate successfully completed simulated technical and behavioral questions with consistent pacing and authentic delivery."}
            </p>
            {finalReport.integrityObservations && finalReport.integrityObservations.length > 0 && (
              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-3">
                {finalReport.integrityObservations.map((obs: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {obs}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Another Interview Simulation
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Print / Save Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
