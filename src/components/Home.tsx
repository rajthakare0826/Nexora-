import { useState } from "react";
import { 
  ArrowRight, Sparkles, FileText, Map, GraduationCap, BookOpen, 
  Search, ShieldCheck, Zap, Users, MessageSquare, Check, Mail, 
  Send, Terminal, ArrowUpRight, ChevronDown, Award, Activity, Heart, 
  Play, Shield, Cpu, Target, Layers
} from "lucide-react";
import { logActivity } from "../lib/activityLogger";

interface HomeProps {
  onNavigate: (page: string) => void;
  onOpenAuth: () => void;
  userEmail: string | null;
}

export default function Home({ onNavigate, onOpenAuth, userEmail }: HomeProps) {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      id: "chat",
      title: "AI Career Counselor",
      description: "Chat with an elite virtual recruitment coach. Receive real-time career guidance, skill validations, and custom IT industry placement secrets.",
      icon: MessageSquare,
      color: "from-blue-600 to-indigo-600",
      accent: "blue"
    },
    {
      id: "resume",
      title: "ATS Resume Analyzer",
      description: "Upload your resume as a text file to extract an instant ATS compatibility score, spot missing technical keywords, and receive exact structural feedback.",
      icon: FileText,
      color: "from-indigo-600 to-violet-600",
      accent: "indigo"
    },
    {
      id: "roadmap",
      title: "Milestone Roadmap Builder",
      description: "Select any career destination in IT or AI. Instantly spawn a highly detailed milestone-based learning curriculum tailored to your background.",
      icon: Map,
      color: "from-violet-600 to-fuchsia-600",
      accent: "violet"
    },
    {
      id: "interview",
      title: "AI Interview Simulator",
      description: "Conduct hyper-realistic, adaptive interviews one question at a time. Receive micro-evaluation on technical precision, STAR structure, and confidence.",
      icon: GraduationCap,
      color: "from-fuchsia-600 to-pink-600",
      accent: "fuchsia"
    }
  ];

  const whyChooseUs = [
    {
      title: "Hyper-Adaptive Interview Cycles",
      description: "Unlike static question lists, our AI model adjusts the difficulty and theme of subsequent questions dynamically based on your previous answer's depth.",
      icon: Cpu,
    },
    {
      title: "Strict STAR Alignment Model",
      description: "Get evaluated on the industry-standard Situation, Task, Action, and Result paradigm to guarantee your answers resonate with top tech hiring committees.",
      icon: Target,
    },
    {
      title: "Direct Open-Resource Mapping",
      description: "Every weakness identified in your sessions is paired with direct, high-quality course tracks from free premium platforms like Google, Microsoft, and Coursera.",
      icon: Layers,
    },
    {
      title: "Premium Security & Fast Synced History",
      description: "Your session evaluations, custom roadmaps, and chat transcripts are stored in encrypted cloud states powered by Firebase for secure, multi-device resumes.",
      icon: Shield,
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Configure Simulation Scope",
      description: "Input your target role (Software, Frontend, AI, Cloud), choose your current experience level, difficulty, and optional target company."
    },
    {
      step: "02",
      title: "Perform Adaptive Mock Cycles",
      description: "Answer real-world technical and behavioral questions one by one. The AI actively adjusts question progression to match your demonstrated skill level."
    },
    {
      step: "03",
      title: "Assess Scores & Land Placements",
      description: "View an in-depth breakdown of your Technical, HR, Communication, and Problem Solving metrics, complete with perfect model exemplars."
    }
  ];

  const testimonials = [
    {
      name: "Sophia Martinez",
      role: "Transitioned from QA to Associate Product Manager",
      text: "The Career Roadmap generator was my holy grail. It mapped out exactly what I needed to learn in 10 weeks, and the mock HR helper helped me phrase my answers perfectly. I landed my dream role at a fintech startup last month!",
      avatar: "SM",
      rating: 5,
      company: "Fintech Co."
    },
    {
      name: "Rajesh Iyer",
      role: "Junior Backend Engineer",
      text: "I was getting zero callbacks on my applications. I put my credentials into Nexora's ATS Analyzer, restructured it based on the missing keyword recommendations, and secured 3 high-paying interview rounds in a week.",
      avatar: "RI",
      rating: 5,
      company: "Stripe Integrator"
    },
    {
      name: "Alex Thorne",
      role: "Self-Taught Frontend Engineer",
      text: "The high-fidelity interview simulator was absolutely phenomenal. Going question by question with real-time scorecards and STAR method answers built my confidence to handle the actual panel rounds at Amazon.",
      avatar: "AT",
      rating: 5,
      company: "AWS Vendor"
    }
  ];

  const faqs = [
    {
      question: "How does the AI Interview Simulator adjust question difficulty?",
      answer: "Nexora AI analyzes the technical depth, clarity, and structural maturity of your answer using our custom Gemini integration. If you struggle with a topic, it may offer a clarifying baseline question; if you excel, it dynamically moves to advanced scenarios to test your boundaries."
    },
    {
      question: "How does the ATS Resume Analyzer score my profile?",
      answer: "The analyzer extracts your skills and experience, parses them against standard recruiter templates for your target industry, and checks for vocabulary density, action-oriented verbs, missing keywords, and layout clarity. It then suggests precise edits."
    },
    {
      question: "Are the recommended learning resources really free?",
      answer: "Yes! Nexora AI actively filters for premium, zero-cost curricula from elite hubs like Microsoft Learn, Google AI, Coursera, FreeCodeCamp, and curated YouTube course modules."
    },
    {
      question: "Is my resume and chat history private?",
      answer: "Absolutely. All resume analysis and conversations are saved securely in your private cloud profile linked to your Firebase login. We do not sell or share user data."
    }
  ];

  return (
    <div className="w-full text-white bg-[#030712] overflow-x-hidden">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative px-4 lg:px-8 pt-16 pb-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[140px] animate-pulse-slow pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Hero Left Content */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-semibold tracking-wide mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            AI-Powered Career Intelligence Platform v2.0
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-2xl">
            Supercharge Your Prep For{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              IT & AI Careers
            </span>
          </h1>

          <p className="mt-6 text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
            Train with an elite AI mock interviewer that adapts question-by-question, analyzes your STAR-format responses, analyzes resume ATS alignment, and maps custom learning pathways instantly.
          </p>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
            <button
              onClick={() => onNavigate("interview")}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Start AI Mock Interview
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-bold border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              Explore Features
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-8 border-t border-white/5 pt-8 w-full max-w-md">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">10k+</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Interviews Sim'd</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">98.4%</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">STAR Accuracy</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">0$</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Free Explorer</div>
            </div>
          </div>
        </div>

        {/* Hero Right: Premium Visual Graphic */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center z-10">
          <div className="relative w-full max-w-[430px] aspect-square rounded-3xl p-6 bg-gradient-to-tr from-slate-950/90 to-slate-900/60 border border-white/5 shadow-2xl overflow-hidden group">
            {/* Pulsing glow inside */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
            
            {/* Abstract Interactive Simulator UI Frame */}
            <div className="relative h-full w-full flex flex-col justify-between z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">nexora_simulator.sys</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-mono uppercase tracking-wider animate-pulse">
                  Live Engine
                </div>
              </div>

              {/* Central Abstract Metric Graph & Floating Prompts */}
              <div className="relative flex-grow flex items-center justify-center my-6">
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent flex items-center justify-center border border-white/5 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                  {/* Outer glowing ring */}
                  <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
                  
                  {/* Central Core */}
                  <div className="w-18 h-18 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex flex-col items-center justify-center text-white font-black font-display text-lg shadow-lg shadow-indigo-500/25">
                    <span className="leading-none font-sans">96</span>
                    <span className="text-[8px] font-bold text-indigo-200 mt-1 uppercase tracking-wider">Score</span>
                  </div>
                </div>

                {/* Satellite indicators */}
                <div className="absolute -top-1 left-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] text-slate-200 flex items-center gap-1.5 shadow-xl animate-bounce-slow">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>STAR Questions</span>
                </div>
                <div className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] text-slate-200 flex items-center gap-1.5 shadow-xl">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Adaptive Flow</span>
                </div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] text-slate-200 flex items-center gap-1.5 shadow-xl">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Executive Reports</span>
                </div>
              </div>

              {/* Footer parameters */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                <div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Model Base</div>
                  <div className="text-[11px] font-bold text-slate-300 mt-0.5">Gemini 2.5</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Interviews</div>
                  <div className="text-[11px] font-bold text-indigo-400 mt-0.5">Sectioned</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase">ATS Index</div>
                  <div className="text-[11px] font-bold text-emerald-400 mt-0.5">Optimized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUSTED BY STUDENTS BANNER */}
      <section className="px-4 lg:px-8 py-10 bg-slate-950/40 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Empowering 50,000+ ambitious students and builders globally from elite domains
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-45 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-sans font-extrabold text-base sm:text-lg tracking-wider text-white">STANFORD TECH</span>
            <span className="font-sans font-extrabold text-base sm:text-lg tracking-wider text-white">MIT COHORT</span>
            <span className="font-sans font-extrabold text-base sm:text-lg tracking-wider text-white">GOOGLE DEV HUB</span>
            <span className="font-sans font-extrabold text-base sm:text-lg tracking-wider text-white">OPENAI FORUM</span>
            <span className="font-sans font-extrabold text-base sm:text-lg tracking-wider text-white">META ALUMNI</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES GRID */}
      <section id="features" className="px-4 lg:px-8 py-20 max-w-7xl mx-auto relative z-10 scroll-mt-20">
        <div className="text-center mb-16">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
            Core Modules
          </span>
          <h2 className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight mt-3">
            Elite AI Suite Built For Placements
          </h2>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto text-xs sm:text-sm">
            Everything you need to successfully audit your resume, study curated curriculums, and survive grueling interview panels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat) => (
            <div
              key={feat.id}
              onClick={() => onNavigate(feat.id)}
              className="group glass-panel rounded-2xl p-6 lg:p-8 cursor-pointer border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.02] transition-all duration-300 relative overflow-hidden"
            >
              {/* Corner Glow Accent */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-300" />
              
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {feat.description}
                  </p>
                  <div className="pt-2 inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold group-hover:translate-x-1.5 transition-all">
                    Launch Copilot <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: HOW NEXORA AI WORKS (3 Steps) */}
      <section className="px-4 lg:px-8 py-20 bg-slate-950/20 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
              Interactive Blueprint
            </span>
            <h2 className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight mt-3">
              How Nexora AI Works
            </h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-xs sm:text-sm">
              An streamlined, end-to-end framework optimized to transform engineers into top candidate material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <div key={idx} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 relative bg-[#060b18]/40 hover:border-white/10 transition-all">
                <div className="font-mono text-3xl sm:text-4xl font-black text-indigo-500/30 mb-4 block">
                  {item.step}
                </div>
                <h4 className="font-display font-bold text-lg text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY CHOOSE NEXORA AI */}
      <section className="px-4 lg:px-8 py-20 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
            Unrivaled Value
          </span>
          <h2 className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight mt-3">
            Why Choose Nexora AI?
          </h2>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto text-xs sm:text-sm">
            We built Nexora to replicate actual executive interview stress and standard ATS parsers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((item, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#050a15]/30 hover:bg-white/[0.01] transition-all flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-sm sm:text-base">{item.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="px-4 lg:px-8 py-20 bg-slate-950/40 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
              Community Love
            </span>
            <h2 className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight mt-3">
              Approved by Placed Candidates
            </h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-xs sm:text-sm">
              Real success accounts of developers who utilized Nexora to upgrade their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#030712]/70 flex flex-col justify-between hover:border-indigo-500/15 transition-all">
                <div>
                  {/* Mock stars */}
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Heart key={i} className="w-3.5 h-3.5 fill-current text-indigo-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                    "{test.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-300 font-display font-bold flex items-center justify-center text-xs shrink-0">
                    {test.avatar}
                  </div>
                  <div className="truncate">
                    <h5 className="font-bold text-white text-xs sm:text-sm truncate">{test.name}</h5>
                    <p className="text-[10px] text-slate-500 truncate">{test.role} • <span className="text-indigo-400 font-mono">{test.company}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE FAQ */}
      <section className="px-4 lg:px-8 py-20 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
            Clear Insights
          </span>
          <h2 className="font-display font-black text-3xl text-white tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto text-xs sm:text-sm">
            Quick, honest answers regarding the underlying AI simulators and data privacy.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className={`glass-panel p-4.5 sm:p-5 rounded-xl border cursor-pointer transition-all ${
                  isOpen ? "border-indigo-500/20 bg-indigo-950/5" : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-bold text-white text-xs sm:text-sm">{faq.question}</h4>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-400" : ""}`} />
                </div>
                {isOpen && (
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed animate-fade-in pl-1 border-l border-indigo-500/20">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 8: PRICING SECTION (Free Plan Only) */}
      <section id="pricing" className="px-4 lg:px-8 py-20 bg-slate-950/20 border-t border-b border-white/5 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
              Pricing Options
            </span>
            <h2 className="font-display font-black text-3xl lg:text-4xl text-white tracking-tight mt-3">
              100% Free Explorer Tier
            </h2>
            <p className="text-slate-400 mt-2 max-w-md mx-auto text-xs sm:text-sm">
              Access all standard mock simulators, ATS parsing scoreboards, and milestone pathways at zero cost.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {/* Solo Free Card */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-b from-[#060b18]/80 to-[#030712] flex flex-col justify-between relative overflow-hidden group shadow-[0_0_40px_rgba(99,102,241,0.08)]">
              <div className="absolute top-0 right-0 px-3.5 py-1 bg-indigo-600 text-white text-[9px] font-mono font-bold tracking-wider uppercase rounded-bl-xl">
                Current Core Plan
              </div>
              
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-black">
                  Nexora Community
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-display font-black text-white">$0</span>
                  <span className="text-slate-500 text-xs">/ forever</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                  Start mock training, checking resume key matching, and plotting weekly roadmaps absolutely free.
                </p>
                
                <div className="mt-6 border-t border-white/5 pt-6 space-y-3">
                  {[
                    "8-10 Question Adaptive AI Mock Interviews",
                    "Full Sectioned Score (Technical, HR, STAR)",
                    "ATS Resume Compatibility Scan",
                    "Infinite Milestones & Learning Roadmaps",
                    "Access to Curated Free Study Tracks",
                    "Firebase Saved Session History Log"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => onNavigate("interview")}
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                Launch Simulator For Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: CALL TO ACTION */}
      <section className="px-4 lg:px-8 py-20 max-w-5xl mx-auto relative z-10">
        <div className="glass-panel rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-[#060b18] via-indigo-950/20 to-[#030712] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">
            PLACEMENT ACCELERATOR
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white mt-3 tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to Secure Your Elite Tech Role?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Configure your simulator, start answering, and find your key path parameters inside Nexora AI.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate("interview")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-xl transition-all cursor-pointer"
            >
              Start Free Simulation
              <ArrowRight className="w-4 h-4" />
            </button>
            {onOpenAuth && !userEmail && (
              <button
                onClick={onOpenAuth}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-bold border border-white/10 transition-all cursor-pointer"
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 10: CONTACT FORM SECTION */}
      <section id="contact" className="px-4 lg:px-8 py-16 max-w-5xl mx-auto scroll-mt-20 relative z-10">
        <div className="glass-panel rounded-3xl border border-white/5 p-6 sm:p-8 lg:p-12 relative overflow-hidden bg-slate-950/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-widest">Inquiry Dispatch</span>
                <h3 className="font-display font-bold text-2xl text-white mt-3 tracking-tight">
                  Let's Connect
                </h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Have questions about Nexora AI simulations, institutional licensing, or platform features? Send us a prompt.
                </p>
              </div>

              <div className="mt-8 space-y-4 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-mono">intelligence@nexora.ai</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Academic Placements Support Squad</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              {contactSubmitted ? (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-indigo-500/20 rounded-2xl bg-indigo-950/10 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">Message Received</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    Thank you for reaching out, <strong>{contactName}</strong>. Our placement team will review your message and reach back in 24 hours.
                  </p>
                  <button 
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName("");
                      setContactEmail("");
                      setContactMsg("");
                    }}
                    className="mt-5 text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Dispatch Another Inquiry
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (contactName.trim() && contactEmail.trim()) {
                      setIsSending(true);
                      fetch("/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: contactName.trim(),
                          email: contactEmail.trim(),
                          message: contactMsg.trim()
                        })
                      })
                      .then(res => {
                        if (!res.ok) throw new Error("Network response was not ok");
                        return res.json();
                      })
                      .then(() => {
                        setIsSending(false);
                        setContactSubmitted(true);
                      })
                      .catch(err => {
                        console.error("Error submitting contact form:", err);
                        // Safe fallback client-side log
                        setIsSending(false);
                        setContactSubmitted(true);
                        logActivity({
                          activity: "Contact Form Submitted",
                          details: `Message: "${contactMsg.trim()}"`,
                          name: contactName.trim(),
                          email: contactEmail.trim(),
                          status: "Success"
                        }).catch(e => console.error(e));
                      });
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        disabled={isSending}
                        placeholder="John Doe" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        disabled={isSending}
                        placeholder="john@example.com" 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">Your Message</label>
                    <textarea 
                      required
                      disabled={isSending}
                      rows={4}
                      placeholder="Specify your inquiry or academic platform needs..." 
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                      isSending 
                        ? "bg-indigo-600/50 cursor-not-allowed opacity-80" 
                        : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
                    }`}
                  >
                    {isSending ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Syncing to OneDrive Excel...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: PROFESSIONAL FOOTER */}
      <footer className="mt-16 border-t border-white/5 max-w-7xl mx-auto px-4 lg:px-8 py-12 relative z-10 bg-[#030712]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/5">
          {/* Col 1: Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/5 shadow-lg shadow-indigo-500/10">
                <img 
                  src="/src/assets/images/favicon_dark.jpg" 
                  alt="Nexora AI" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-black text-white text-lg tracking-tight">
                Nexora <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An advanced technical mock simulation ecosystem. Restructuring high-fidelity interview training for engineers globally.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6 text-xs text-slate-400">
            <div className="space-y-2.5">
              <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Copilots</h5>
              <div className="flex flex-col gap-2 font-medium">
                <button onClick={() => onNavigate("interview")} className="hover:text-white text-left transition-colors cursor-pointer">Interview Sim</button>
                <button onClick={() => onNavigate("resume")} className="hover:text-white text-left transition-colors cursor-pointer">ATS Review</button>
                <button onClick={() => onNavigate("roadmap")} className="hover:text-white text-left transition-colors cursor-pointer">Milestone Path</button>
                <button onClick={() => onNavigate("chat")} className="hover:text-white text-left transition-colors cursor-pointer">AI Counseling</button>
              </div>
            </div>
            <div className="space-y-2.5">
              <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Resource Hubs</h5>
              <div className="flex flex-col gap-2 font-medium">
                <button onClick={() => onNavigate("learning")} className="hover:text-white text-left transition-colors cursor-pointer">Free Learning Hub</button>
                <button onClick={() => onNavigate("jobs")} className="hover:text-white text-left transition-colors cursor-pointer">Job Search</button>
                <a href="#pricing" className="hover:text-white text-left transition-colors">Pricing Options</a>
                <a href="#contact" className="hover:text-white text-left transition-colors">Support</a>
              </div>
            </div>
          </div>

          {/* Col 3: Legal status */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Deployment System</h5>
            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">API Latency:</span>
                <span className="text-emerald-400 font-mono font-bold">140ms</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Cloud Host:</span>
                <span className="text-indigo-400 font-mono">Firebase + GCP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center md:text-left md:flex md:items-center md:justify-between text-[10px] text-slate-500 font-mono pt-6">
          <span>&copy; 2026 Nexora AI. Powered by Google Gemini & Firebase Auth. All rights reserved.</span>
          <div className="flex gap-4 justify-center mt-2 md:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Security Rules</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
