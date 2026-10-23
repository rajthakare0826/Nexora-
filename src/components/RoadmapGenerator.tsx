import { useState, useEffect } from "react";
import { Map, Sparkles, CheckSquare, Square, DollarSign, Award, ChevronRight, AlertCircle, Database, History, RefreshCw, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CareerRoadmap } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { logActivity } from "../lib/activityLogger";

interface RoadmapGeneratorProps {
  user: FirebaseUser | null;
}

export default function RoadmapGenerator({ user }: RoadmapGeneratorProps) {
  const [career, setCareer] = useState("");
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [pastRoadmaps, setPastRoadmaps] = useState<CareerRoadmap[]>([]);
  
  // Track completed milestones locally (helps with visual progression tracking!)
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  const popularCareers = [
    "AI Specialist & Prompt Engineer",
    "Frontend React Architect",
    "Fullstack Cloud Engineer",
    "Cybersecurity Operations Analyst",
    "UI/UX Product Designer",
    "Data Scientist & Analytics Lead"
  ];

  useEffect(() => {
    if (user) {
      loadPastRoadmaps();
    }
  }, [user]);

  const loadPastRoadmaps = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "roadmaps"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const list: CareerRoadmap[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CareerRoadmap);
      });
      setPastRoadmaps(list);
    } catch (e) {
      console.error("Failed loading roadmaps", e);
    }
  };

  const handleGenerate = async () => {
    if (!career.trim()) {
      setError("Please specify a Target Career objective.");
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedMilestones({});

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          career,
          currentLevel,
          timelineWeeks
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server failed to generate career roadmap.");
      }

      const result: CareerRoadmap = await response.json();
      setRoadmap(result);

      await logActivity({
        activity: "Career Roadmap Generated",
        details: `Generated career roadmap for: "${career}" (${currentLevel}) - "${result.title}"`,
        status: "Success"
      });

      // Save to Cloud or Local cache
      if (user) {
        const docPayload = {
          userId: user.uid,
          timestamp: Date.now(),
          career,
          currentLevel,
          title: result.title,
          description: result.description,
          phases: result.phases || [],
          estimatedSalaryRange: result.estimatedSalaryRange || "N/A",
          requiredCertifications: result.requiredCertifications || [],
          nextStepsAdvice: result.nextStepsAdvice || ""
        };
        await addDoc(collection(db, "users", user.uid, "roadmaps"), docPayload);
        loadPastRoadmaps();
      } else {
        localStorage.setItem("careerpilot_latest_roadmap", JSON.stringify(result));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during roadmap build.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (key: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Upper Headers */}
      <div className="border-b border-white/5 pb-6 mb-8">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">Milestone Roadmap Generator</h1>
        <p className="text-slate-400 text-xs mt-1">
          Generate action-packed training plans, hand-picked courses, and mastery projects for any modern trade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Config Panel */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              Build Parameters
            </h3>

            {/* Quick selectors list */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">Popular Career Objectives:</label>
              <div className="flex flex-wrap gap-1.5">
                {popularCareers.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCareer(item)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      career === item 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30" 
                        : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs text-slate-300 font-medium">Specify Target Career</label>
              <input
                type="text"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                placeholder="e.g. Flutter Mobile Developer"
                className="px-3.5 py-2 rounded-xl text-sm glass-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">Current Proficiency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentLevel(level)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      currentLevel === level
                        ? "bg-blue-500/10 border-blue-500 text-blue-400"
                        : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Timeline Duration</span>
                <span className="text-blue-400 font-bold font-mono">{timelineWeeks} Weeks</span>
              </div>
              <input
                type="range"
                min={4}
                max={24}
                step={2}
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                className="w-full accent-blue-500 bg-slate-800 rounded-lg appearance-none h-2 cursor-pointer mt-1"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Map className="w-4 h-4" />
                  Construct Training Map
                </>
              )}
            </button>
          </div>

          {/* Past roadmaps list */}
          {user && pastRoadmaps.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                Saved Roadmaps
              </h4>
              <div className="flex flex-col gap-2.5">
                {pastRoadmaps.map((hist, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRoadmap(hist)}
                    className="flex items-center justify-between text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="truncate max-w-[150px]">
                      <div className="text-xs font-bold text-white truncate">{hist.career}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{hist.currentLevel} ({hist.phases?.length || 0} Phases)</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Roadmap Visualisation Timeline */}
        <div className="lg:col-span-2">
          {roadmap ? (
            <div className="flex flex-col gap-6">
              {/* Header Box */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Roadmap Loaded
                </div>
                <h2 className="font-display font-bold text-2xl text-white">{roadmap.title}</h2>
                <div className="text-slate-300 text-xs mt-2 leading-relaxed font-sans">
                  <MarkdownRenderer content={roadmap.description} />
                </div>
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Estimated Annual Salary</div>
                      <div className="text-xs font-bold text-white font-mono">{roadmap.estimatedSalaryRange}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <Award className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Key Certification target</div>
                      <div className="text-xs font-bold text-white font-mono truncate max-w-[180px]" title={roadmap.requiredCertifications?.join(", ")}>
                        {roadmap.requiredCertifications?.[0] || "Foundational Certificate"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Milestones Checklist bar */}
              <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs bg-indigo-950/10">
                <span className="text-slate-300 font-medium">Visual Milestone Progress Tracker</span>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                  {Object.values(completedMilestones).filter(Boolean).length} / {roadmap.phases?.reduce((acc, p) => acc + (p.milestones?.length || 0), 0) || 0} Complete
                </span>
              </div>

              {/* Chronological Vertical Phases */}
              <div className="space-y-6 relative pl-4 border-l-2 border-indigo-500/20 ml-2">
                {roadmap.phases && roadmap.phases.map((phase, pIdx) => (
                  <div key={pIdx} className="relative">
                    {/* Circle Node Dot */}
                    <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 glass-card-hover">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                        <div>
                          <h3 className="font-display font-bold text-base text-white">{phase.phaseName}</h3>
                          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed font-sans">
                            <MarkdownRenderer content={phase.description} />
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-xs font-bold flex-shrink-0 self-start md:self-center">
                          <Calendar className="w-3.5 h-3.5" />
                          {phase.duration}
                        </span>
                      </div>

                      {/* Interactive Milestones Checklist */}
                      <div className="mt-4">
                        <div className="text-xs font-bold text-indigo-300 mb-2">Phase Milestones (Click to check off)</div>
                        <div className="space-y-2">
                          {phase.milestones && phase.milestones.map((milestone, mIdx) => {
                            const milestoneKey = `${pIdx}-${mIdx}`;
                            const isChecked = !!completedMilestones[milestoneKey];
                            return (
                              <button
                                key={mIdx}
                                onClick={() => toggleMilestone(milestoneKey)}
                                className="flex items-start gap-2.5 w-full text-left p-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-xs text-slate-300 hover:text-white cursor-pointer"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={isChecked ? "line-through text-slate-500" : ""}>{milestone}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Key Topics List */}
                      <div className="mt-4">
                        <div className="text-xs font-bold text-slate-400 mb-2">Key Core Syllabus:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.recommendedTopics && phase.recommendedTopics.map((topic, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 border border-white/5">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Curated Resources with badges */}
                      {phase.freeResources && phase.freeResources.length > 0 && (
                        <div className="mt-4 border-t border-white/5 pt-3">
                          <div className="text-xs font-bold text-slate-400 mb-2">Recommended Free Learning Material:</div>
                          <div className="space-y-2">
                            {phase.freeResources.map((res, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] border border-white/5 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-indigo-300">{res.name}</span>
                                  <span className="text-slate-500 mx-1.5">|</span>
                                  <span className="text-[10px] text-slate-400 font-mono italic">{res.type}</span>
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 font-mono">
                                  Free Materials Included <ExternalLink className="w-3 h-3" />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actionable Mastery Project */}
                      {phase.actionableProject && (
                        <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/15 border border-indigo-500/10">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            Phase Graduation Project: {phase.actionableProject.title}
                          </div>
                          <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                            <MarkdownRenderer content={phase.actionableProject.brief} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Concluding advice */}
              {roadmap.nextStepsAdvice && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs italic text-slate-400 text-center">
                  <MarkdownRenderer content={roadmap.nextStepsAdvice} />
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
                <Map className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-200">No roadmap built yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Provide your target career objective and skill baseline, then click "Construct Training Map" to generate your custom milestones plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
