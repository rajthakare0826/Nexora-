import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ResumeAnalysis, CareerRoadmap, InterviewSession } from "../types";
import { 
  Sparkles, 
  FileText, 
  Map, 
  Target,
  GraduationCap, 
  MessageSquare, 
  Briefcase,
  Search,
  BookOpen,
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Award, 
  Zap, 
  Star, 
  Plus, 
  History,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown
} from "lucide-react";
import Tooltip from "./Tooltip";

interface DashboardProps {
  user: FirebaseUser | null;
  onNavigate: (pageId: string) => void;
  onOpenAuth: () => void;
}

export default function Dashboard({ user, onNavigate, onOpenAuth }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [resumeHistory, setResumeHistory] = useState<ResumeAnalysis[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [roadmapHistory, setRoadmapHistory] = useState<CareerRoadmap[]>([]);

  // Derived metrics
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [averageInterviewScore, setAverageInterviewScore] = useState<number | null>(null);
  const [completedMilestonesCount, setCompletedMilestonesCount] = useState<number>(4); // Default visual dummy progress

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Resume Analyses
      const resumeQuery = query(
        collection(db, "users", user.uid, "resume_analyses"),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      const resumeSnap = await getDocs(resumeQuery);
      const resumes: ResumeAnalysis[] = [];
      resumeSnap.forEach((doc) => {
        resumes.push({ id: doc.id, ...doc.data() } as ResumeAnalysis);
      });
      setResumeHistory(resumes);

      if (resumes.length > 0) {
        setLatestScore(resumes[0].atsScore);
      }

      // 2. Fetch Interviews
      const interviewQuery = query(
        collection(db, "users", user.uid, "interviews"),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      const interviewSnap = await getDocs(interviewQuery);
      const interviews: InterviewSession[] = [];
      interviewSnap.forEach((doc) => {
        interviews.push({ id: doc.id, ...doc.data() } as InterviewSession);
      });
      setInterviewHistory(interviews);

      if (interviews.length > 0) {
        const totalRating = interviews.reduce((acc, curr) => acc + (curr.averageScore || 0), 0);
        setAverageInterviewScore(Math.round(totalRating / interviews.length));
      }

      // 3. Fetch Roadmaps
      const roadmapQuery = query(
        collection(db, "users", user.uid, "roadmaps"),
        orderBy("timestamp", "desc"),
        limit(4)
      );
      const roadmapSnap = await getDocs(roadmapQuery);
      const roadmaps: CareerRoadmap[] = [];
      roadmapSnap.forEach((doc) => {
        roadmaps.push({ id: doc.id, ...doc.data() } as CareerRoadmap);
      });
      setRoadmapHistory(roadmaps);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get dynamic hour greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format timestamp helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const getInterviewScoreColor = (score: number) => {
    if (score >= 4) return "text-emerald-400";
    if (score >= 3) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-white space-y-8 relative">
      {/* Absolute background visual highlights */}
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Top Banner & Welcome Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 font-bold tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            WORKPLACE INTELLIGENCE HUB Active
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {user ? (user.displayName || user.email?.split("@")[0]) : "Guest Candidate"}
            </span>
            👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Analyze your skill gaps, monitor professional prep iterations, and orchestrate automated milestone progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
            Today: July 15, 2026
          </span>
          <button
            onClick={() => user ? loadDashboardData() : onOpenAuth()}
            className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            Refresh Hub
          </button>
        </div>
      </div>

      {/* Guest Mode Warning Callout */}
      {!user && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-blue-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-slate-200">Cloud Sync & Persistent History Disabled</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                You are currently in guest mode. Sign in to set up a candidate profile, customize automated ATS check points, and store your resume analysis history and career roadmaps permanently.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 shrink-0 cursor-pointer"
          >
            Connect Firebase Account
          </button>
        </div>
      )}

      {/* METRIC OVERVIEW (BENTO GRID CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Resume Analysis Score Gauge */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-mono tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                ATS RESUME SCORING
              </span>
              {latestScore !== null && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getScoreBadgeColor(latestScore)}`}>
                  {latestScore >= 85 ? "Optimal" : latestScore >= 70 ? "Needs Work" : "Critical"}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-6 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : latestScore !== null ? (
              <div className="flex items-center gap-4 py-2">
                {/* Score Big Circle Representation */}
                <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-xl font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-emerald-500 border-b-transparent border-l-transparent animate-pulse-slow" />
                  {latestScore}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Latest ATS Readiness</h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Based on your evaluated {resumeHistory[0]?.fileName || "uploaded resume"}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-500">No resumes analyzed yet</p>
                <button
                  onClick={() => onNavigate("resume")}
                  className="mt-2 text-xs text-emerald-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  Analyze Resume Now
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Keep score above 85 to pass ATS
            </span>
            <span className="font-mono text-[10px]">{resumeHistory.length} uploads</span>
          </div>
        </div>

        {/* Card 2: Interview Proficiency Metric */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-mono tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                MOCK INTERVIEW STATS
              </span>
              {averageInterviewScore !== null && (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold font-mono text-blue-300">
                  {averageInterviewScore}% Avg
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-6 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : averageInterviewScore !== null ? (
              <div className="py-2 space-y-1">
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-bold font-mono text-blue-400">{averageInterviewScore}%</span>
                  <span className="text-xs text-slate-400 pb-1">competency score</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.round((averageInterviewScore / 100) * 5) ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} 
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">({interviewHistory.length} prep sessions)</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-500">No mock sessions completed</p>
                <button
                  onClick={() => onNavigate("interview")}
                  className="mt-2 text-xs text-blue-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  Start Practice Interview
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              Targeting: Star-Method Answers
            </span>
            <span className="font-mono text-[10px]">{interviewHistory.length} completed</span>
          </div>
        </div>

        {/* Card 3: Saved Roadmaps & Career Goals */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-mono tracking-wider flex items-center gap-1.5">
                <Map className="w-4 h-4 text-purple-400" />
                CAREER MILESTONES
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold font-mono text-purple-300">
                Active Goals
              </span>
            </div>

            {loading ? (
              <div className="py-6 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : roadmapHistory.length > 0 ? (
              <div className="py-1.5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 truncate">{roadmapHistory[0].title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Target: {roadmapHistory[0].career}</p>
                </div>
                {/* Milestone Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>PROGRESS BAR</span>
                    <span>45% COMPLETE</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 w-[45%]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-500">No career roadmaps built yet</p>
                <button
                  onClick={() => onNavigate("roadmap")}
                  className="mt-2 text-xs text-purple-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  Generate Roadmap
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Curated roadmap paths
            </span>
            <span className="font-mono text-[10px]">{roadmapHistory.length} saved</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div>
        <h3 className="font-display font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          AI Recruitment Suite Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Tooltip content="Launch instant ATS resume scan and structure check">
            <button
              onClick={() => onNavigate("resume")}
              className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/20 text-left cursor-pointer transition-all flex flex-col justify-between h-32 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">ATS Score Scan</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Analyze & update resume</span>
              </div>
            </button>
          </Tooltip>

          <Tooltip content="Audit your skills gap and career readiness score">
            <button
              onClick={() => onNavigate("skillgap")}
              className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/20 text-left cursor-pointer transition-all flex flex-col justify-between h-32 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Skill Gap Audit</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Audit career readiness</span>
              </div>
            </button>
          </Tooltip>

          <Tooltip content="Simulate HR or technical coding interview question loops">
            <button
              onClick={() => onNavigate("interview")}
              className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 text-left cursor-pointer transition-all flex flex-col justify-between h-32 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Mock HR Prep</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Practice verbal reviews</span>
              </div>
            </button>
          </Tooltip>

          <Tooltip content="Ask Gemini Career Coach for path advice or job insights">
            <button
              onClick={() => onNavigate("chat")}
              className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/20 text-left cursor-pointer transition-all flex flex-col justify-between h-32 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Career Counselor</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Chat with senior coach</span>
              </div>
            </button>
          </Tooltip>

          <Tooltip content="Generate personalized milestone curriculum map">
            <button
              onClick={() => onNavigate("roadmap")}
              className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/20 text-left cursor-pointer transition-all flex flex-col justify-between h-32 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-all">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Roadmap Builder</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Generate phase curriculum</span>
              </div>
            </button>
          </Tooltip>

          <Tooltip content="Find matching software and IT career listings">
            <button
              onClick={() => onNavigate("jobs")}
              className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/20 text-left cursor-pointer transition-all flex flex-col justify-between h-32 group sm:col-span-2 lg:col-span-1"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Job Finder</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Explore matching roles</span>
              </div>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* DETAILED HISTORIES (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Resume Analyses + Interview logs (8/12 wide) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Resume History Module */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="font-display font-bold text-sm text-white">ATS Resume Analysis Logs</h3>
              </div>
              <button
                onClick={() => onNavigate("resume")}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                Scan New
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-mono">Synchronizing scans...</span>
              </div>
            ) : resumeHistory.length > 0 ? (
              <div className="divide-y divide-white/5">
                {resumeHistory.map((ana) => (
                  <div key={ana.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                          {ana.targetRole}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                          <span className="truncate max-w-[150px] sm:max-w-none">{ana.fileName}</span>
                          <span>•</span>
                          <span>{formatDate(ana.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${getScoreBadgeColor(ana.atsScore)}`}>
                          {ana.atsScore}/100
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate("resume")}
                        className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        aria-label="View feedback summary"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-white/5 rounded-xl">
                <FileText className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs max-w-sm mx-auto">No resume scans registered on your profile. Upload a copy to verify your ATS score.</p>
                <button
                  onClick={() => onNavigate("resume")}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg cursor-pointer transition-all inline-block mt-2"
                >
                  Analyze Resume
                </button>
              </div>
            )}
          </div>

          {/* Mock Interview History Module */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="font-display font-bold text-sm text-white">Mock Interview Prep History</h3>
              </div>
              <button
                onClick={() => onNavigate("interview")}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                Prep New
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-mono font-bold">Synchronizing mocks...</span>
              </div>
            ) : interviewHistory.length > 0 ? (
              <div className="divide-y divide-white/5">
                {interviewHistory.map((session) => (
                  <div key={session.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                        <GraduationCap className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                          {session.role}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                          <span>{session.qaList?.length || 0} Questions Answered</span>
                          <span>•</span>
                          <span>{formatDate(session.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono ${getInterviewScoreColor((session.averageScore || 0) / 20)}`}>
                          Competency: {session.averageScore}%
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate("interview")}
                        className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        aria-label="View mock evaluation details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-white/5 rounded-xl">
                <GraduationCap className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs max-w-sm mx-auto">No practice interviews saved. Start a mock behavioral interview to train your responses.</p>
                <button
                  onClick={() => onNavigate("interview")}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg cursor-pointer transition-all inline-block mt-2"
                >
                  Start Prep Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Saved roadmaps & Quick Tips (4/12 wide) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Saved Roadmaps Block */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Map className="w-4.5 h-4.5 text-purple-400" />
                <h3 className="font-display font-bold text-sm text-white">Saved Roadmaps</h3>
              </div>
              <button
                onClick={() => onNavigate("roadmap")}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                Create
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-mono font-bold">Synchronizing roadmaps...</span>
              </div>
            ) : roadmapHistory.length > 0 ? (
              <div className="space-y-4">
                {roadmapHistory.map((mapItem) => (
                  <div key={mapItem.id} className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/20 transition-all cursor-pointer group" onClick={() => onNavigate("roadmap")}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                        {mapItem.title}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {mapItem.description}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{mapItem.currentLevel} Path</span>
                      <span>Salary Range: {mapItem.estimatedSalaryRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-white/5 rounded-xl">
                <Map className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs max-w-xs mx-auto">No saved roadmaps yet. Map your career with step-by-step goals.</p>
                <button
                  onClick={() => onNavigate("roadmap")}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg cursor-pointer transition-all inline-block mt-2"
                >
                  Generate Path
                </button>
              </div>
            )}
          </div>

          {/* AI Career Coach Strategy Insights */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-950/20 via-slate-900/40 to-blue-950/10 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4.5 h-4.5 text-blue-400" />
              <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Gemini Strategy Tip</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              &ldquo;When preparing for technical roles, always frame behavioral answers with the **STAR Method** (Situation, Task, Action, Result). Quantify accomplishments to bypass ATS word counts.&rdquo;
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-500">SYSTEM COACH UPDATE</span>
              <button 
                onClick={() => onNavigate("chat")}
                className="text-[10px] text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                Discuss Strategy
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
