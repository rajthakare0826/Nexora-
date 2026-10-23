import { useState, useEffect } from "react";
import { 
  Target, GraduationCap, Sparkles, Cpu, Layers, Award, Activity, 
  Check, Plus, Trash2, History, BookOpen, Briefcase, Timer, 
  ChevronRight, AlertCircle, ExternalLink, Save, Database, RefreshCw, X 
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SkillGapReport, MissingSkill, SkillGapLearningStep, SkillGapProject, SkillGapCertification } from "../types";
import { logActivity } from "../lib/activityLogger";

interface SkillGapAnalyzerProps {
  user: FirebaseUser | null;
}

export default function SkillGapAnalyzer({ user }: SkillGapAnalyzerProps) {
  const [targetCareer, setTargetCareer] = useState("");
  const [currentEducation, setCurrentEducation] = useState("");
  const [currentSkillsInput, setCurrentSkillsInput] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [pastReports, setPastReports] = useState<SkillGapReport[]>([]);
  const [activeTab, setActiveTab] = useState<"gaps" | "roadmap" | "projects" | "certifications">("gaps");

  const careerPresets = [
    {
      title: "AI & Machine Learning Engineer",
      education: "Self-taught, Non-CS Bachelor's Degree",
      skills: ["Python", "Basic Algebra", "HTML", "CSS", "SQL"]
    },
    {
      title: "Fullstack Cloud Developer",
      education: "BSc in Computer Science",
      skills: ["JavaScript", "React.js", "Node.js", "HTML", "Git"]
    },
    {
      title: "Cybersecurity Analyst",
      education: "Diploma in Information Technology",
      skills: ["Basic Networking", "Linux Command Line", "Python"]
    }
  ];

  useEffect(() => {
    if (user) {
      loadPastReports();
    }
  }, [user]);

  const loadPastReports = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "skillgaps"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const list: SkillGapReport[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SkillGapReport);
      });
      setPastReports(list);
    } catch (e) {
      console.error("Failed loading past skill gap reports:", e);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills([...currentSkills, trimmed]);
      setCurrentSkillsInput("");
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setCurrentSkills(currentSkills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(currentSkillsInput);
    }
  };

  const applyPreset = (preset: typeof careerPresets[0]) => {
    setTargetCareer(preset.title);
    setCurrentEducation(preset.education);
    setCurrentSkills(preset.skills);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!targetCareer.trim()) {
      setError("Please specify a Target Career objective.");
      return;
    }
    if (currentSkills.length === 0) {
      setError("Please enter at least one current skill to perform a gap analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCareer,
          currentEducation,
          currentSkills
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server failed to analyze skill gap.");
      }

      const result: SkillGapReport = await response.json();
      setReport(result);

      await logActivity({
        activity: "Career Roadmap Generated",
        details: `Skill Gap analyzed for target career: "${targetCareer}". Readiness Score: ${result.careerReadinessScore}%.`,
        status: "Success"
      });

      // Save to Cloud or Local cache
      if (user) {
        await addDoc(collection(db, "users", user.uid, "skillgaps"), {
          userId: user.uid,
          timestamp: Date.now(),
          targetCareer: result.targetCareer,
          currentEducation: result.currentEducation,
          currentSkills: result.currentSkills || currentSkills,
          missingSkills: result.missingSkills || [],
          learningPath: result.learningPath || [],
          recommendedProjects: result.recommendedProjects || [],
          recommendedCertifications: result.recommendedCertifications || [],
          estimatedLearningTime: result.estimatedLearningTime || "Not Specified",
          careerReadinessScore: result.careerReadinessScore || 0,
          overallSummary: result.overallSummary || ""
        });
        loadPastReports();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/20" };
    if (score < 70) return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/20" };
    return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/20" };
  };

  const scoreMeta = report ? getScoreColor(report.careerReadinessScore) : null;

  return (
    <div className="w-full text-white bg-[#030712] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Core v2.4
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              Skill Gap Analyzer
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Audit your technical profile, receive an automated Readiness index, spot critical curriculum omissions, and bridge career readiness gaps.
            </p>
          </div>
          {user && pastReports.length > 0 && (
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400 font-mono">Profile Auto-Synced</span>
            </div>
          )}
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Inputs Configurator */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/20">
              <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Configure Profile Target
              </h3>

              {/* Presets picker */}
              <div className="mb-6">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-2">
                  Quick Career Presets
                </span>
                <div className="flex flex-col gap-2">
                  {careerPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPreset(preset)}
                      className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-xs transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-300 group-hover:text-blue-400 truncate transition-colors">{preset.title}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.education}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                    Target Career Objective
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Architect, ML Specialist"
                    value={targetCareer}
                    onChange={(e) => setTargetCareer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                    Current Education / Degree
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BSc Computer Science, Self-taught"
                    value={currentEducation}
                    onChange={(e) => setCurrentEducation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                {/* Skills Multi-add area */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                    Current Tech Skills ({currentSkills.length})
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Type skill & press Enter or Add"
                      value={currentSkillsInput}
                      onChange={(e) => setCurrentSkillsInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-grow px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(currentSkillsInput)}
                      className="px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Skills tags list */}
                  {currentSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2 rounded-xl bg-white/[0.01] border border-white/5">
                      {currentSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-mono font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed border-white/5 rounded-xl text-[10px] text-slate-500 font-mono">
                      No skills added yet. Insert languages/tech above.
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Auditing Profile Gaps...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      Run Skill Gap Audit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Past Audits History Block */}
            {pastReports.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-950/20">
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Recent Gap Records
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {pastReports.map((item, idx) => {
                    const colorMap = getScoreColor(item.careerReadinessScore);
                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          setReport(item);
                          setError(null);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-left ${
                          report && report.timestamp === item.timestamp
                            ? "border-blue-500/20 bg-blue-500/5"
                            : "border-white/5 bg-white/[0.01] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-bold text-white truncate">{item.targetCareer}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${colorMap.text} bg-white/5`}>
                          {item.careerReadinessScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Visual Output Dashboard */}
          <div className="lg:col-span-8">
            {report ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Score Index Card with dynamic visual elements */}
                <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 bg-gradient-to-tr from-[#060b18]/80 to-[#030712] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 uppercase font-black tracking-widest">
                        Assessment Result Scorecard
                      </span>
                      <h2 className="font-display font-black text-2xl text-white mt-1">
                        {report.targetCareer}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                        <span>Edu: <strong className="text-slate-100">{report.currentEducation}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Estimated Study: <strong className="text-indigo-400 font-mono">{report.estimatedLearningTime}</strong></span>
                      </div>
                    </div>

                    {/* Circular visual readiness score */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-slate-900 shadow-lg">
                        {/* Dynamic score text */}
                        <div className="text-center">
                          <div className={`text-2xl font-black font-mono leading-none ${scoreMeta?.text}`}>
                            {report.careerReadinessScore}%
                          </div>
                          <div className="text-[8px] text-slate-500 uppercase tracking-wider font-bold mt-1">Ready</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High quality custom progress bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">
                      <span>Baseline Gap Index</span>
                      <span className={scoreMeta?.text}>Readiness Level</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${scoreMeta?.bg}`}
                        style={{ width: `${report.careerReadinessScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary evaluation paragraph */}
                  <p className="mt-6 text-slate-300 text-xs leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    {report.overallSummary}
                  </p>
                </div>

                {/* Main Tabs Selection */}
                <div className="flex border-b border-white/5 gap-1 overflow-x-auto pb-px">
                  {[
                    { id: "gaps", label: "Missing Skills Gap", count: report.missingSkills?.length || 0 },
                    { id: "roadmap", label: "Learning Road", count: report.learningPath?.length || 0 },
                    { id: "projects", label: "Recommended Projects", count: report.recommendedProjects?.length || 0 },
                    { id: "certifications", label: "Industry Certs", count: report.recommendedCertifications?.length || 0 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-400 bg-blue-500/5"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-900 border border-white/5 text-[9px] text-slate-500 font-mono">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Tab content 1: Missing Skills Gap */}
                {activeTab === "gaps" && (
                  <div className="space-y-4 animate-fade-in">
                    {report.missingSkills && report.missingSkills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.missingSkills.map((skill, idx) => {
                          const impMap = {
                            High: "bg-red-500/10 border-red-500/20 text-red-400",
                            Medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                            Low: "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }[skill.importance] || "bg-slate-500/10 text-slate-400 border-white/5";

                          return (
                            <div key={idx} className="glass-panel p-4.5 rounded-xl border border-white/5 bg-[#050a15]/30 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block truncate">
                                    {skill.category}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${impMap}`}>
                                    {skill.importance} Priority
                                  </span>
                                </div>
                                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                  <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                                  {skill.name}
                                </h4>
                                <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                                  {skill.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-panel border border-dashed border-white/5 rounded-2xl text-xs text-slate-400">
                        <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <span>Awesome! No critical skill gaps identified. Your technical core looks optimal!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content 2: Learning Road Map */}
                {activeTab === "roadmap" && (
                  <div className="space-y-6 animate-fade-in">
                    {report.learningPath && report.learningPath.length > 0 ? (
                      <div className="relative border-l border-white/5 pl-6 ml-3 space-y-8">
                        {report.learningPath.map((item, idx) => (
                          <div key={idx} className="relative">
                            
                            {/* Chronological dot indicator */}
                            <span className="absolute -left-[35px] top-1 w-4.5 h-4.5 rounded-full bg-slate-900 border border-blue-500 flex items-center justify-center font-mono text-[9px] text-blue-400 font-bold">
                              {idx + 1}
                            </span>

                            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#050a15]/30">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-4">
                                <div>
                                  <span className="text-[9px] font-mono text-blue-400 uppercase font-black tracking-widest">{item.step}</span>
                                  <h4 className="font-display font-bold text-base text-white mt-0.5">{item.title}</h4>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-[10px] text-slate-300 font-mono font-medium shrink-0">
                                  <Timer className="w-3.5 h-3.5 text-indigo-400" />
                                  {item.duration}
                                </span>
                              </div>

                              {/* Target topics list */}
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-2">Focus Topics Mastery</span>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {item.topics.map((topic, tIdx) => (
                                    <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300 font-medium">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Resources */}
                              {item.resources && item.resources.length > 0 && (
                                <div className="border-t border-white/5 pt-3 mt-3">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-2">Curated Premium Study Materials</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {item.resources.map((res, rIdx) => (
                                      <a
                                        key={rIdx}
                                        href={res.url.startsWith("http") ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.name + " " + res.type)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-white/[0.02] transition-colors flex items-center justify-between text-left group"
                                      >
                                        <div className="truncate pr-2">
                                          <div className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">{res.name}</div>
                                          <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{res.type}</div>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-panel border border-dashed border-white/5 rounded-2xl text-xs text-slate-400">
                        <span>No custom timeline path generated yet.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content 3: Recommended Projects */}
                {activeTab === "projects" && (
                  <div className="space-y-4 animate-fade-in">
                    {report.recommendedProjects && report.recommendedProjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.recommendedProjects.map((proj, idx) => {
                          const complexityColor = {
                            Beginner: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                            Intermediate: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                            Advanced: "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          }[proj.complexity] || "bg-slate-500/10 text-slate-400 border-white/5";

                          return (
                            <div key={idx} className="glass-panel p-5 rounded-xl border border-white/5 bg-[#050a15]/30 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${complexityColor}`}>
                                    {proj.complexity} Complexity
                                  </span>
                                  <Briefcase className="w-4 h-4 text-slate-500" />
                                </div>
                                <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                                <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                                  {proj.description}
                                </p>
                              </div>

                              <div className="border-t border-white/5 pt-3 mt-4">
                                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-1.5">Acquired Technical Skills</span>
                                <div className="flex flex-wrap gap-1">
                                  {proj.skillsAcquired?.map((sk, skIdx) => (
                                    <span key={skIdx} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono text-blue-300">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-panel border border-dashed border-white/5 rounded-2xl text-xs text-slate-400">
                        <span>No project recommendations generated yet.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content 4: Recommended Certifications */}
                {activeTab === "certifications" && (
                  <div className="space-y-4 animate-fade-in">
                    {report.recommendedCertifications && report.recommendedCertifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.recommendedCertifications.map((cert, idx) => (
                          <div key={idx} className="glass-panel p-5 rounded-xl border border-white/5 bg-[#050a15]/30 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest truncate">
                                  Issued by {cert.issuer}
                                </span>
                                <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-300">
                                  {cert.estimatedCost}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                                {cert.name}
                              </h4>
                              <p className="text-slate-400 text-xs leading-relaxed mt-2.5">
                                <strong className="text-slate-300 font-semibold block mb-1 text-[10px] uppercase font-mono tracking-wider">Hiring Valuation:</strong>
                                {cert.valueToCareer}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-panel border border-dashed border-white/5 rounded-2xl text-xs text-slate-400">
                        <span>No certification credentials recommended yet.</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-3xl bg-slate-950/10">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/5 animate-pulse">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">No Skills Gap Report Selected</h3>
                <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
                  Configure your career objective on the left panel, list your core current technical competencies, and press <strong>"Run Skill Gap Audit"</strong> to generate your dynamic profile report.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
