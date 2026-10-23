import { ShieldCheck, Cpu, Database, Flame, Code2, Users, Compass, ExternalLink } from "lucide-react";

export default function About() {
  const techs = [
    {
      title: "Google Gemini Core AI",
      category: "Intelligence Engine",
      description: "Operates using native server-side API keys accessing high-performance gemini-2.5-flash models to generate ATS feedback, weekly schedules, and mock questions.",
      icon: Cpu,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/15"
    },
    {
      title: "Firebase Authentication",
      category: "Identity Provider",
      description: "Secures candidate profiles via email verification, guarding access to custom roadmaps and chat sessions using client SDK credentials.",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
    },
    {
      title: "Firestore Multi-Database",
      category: "Durable Cloud Storage",
      description: "Caches resume audits, previous mock interview scores, checked-off training progress, and coaching histories across custom database shards.",
      icon: Database,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/15"
    },
    {
      title: "Vite + React 19 + Express",
      category: "Full Stack Architecture",
      description: "Builds responsive pages using Tailwind, motion elements, and standard React hooks, proxied via Express backend endpoints to prevent credential leakage.",
      icon: Code2,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/15"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 text-white">
      {/* Intro Brand block */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5 shadow-xl shadow-indigo-500/10 flex items-center justify-center mb-4">
          <img 
            src="/src/assets/images/favicon_dark.jpg" 
            alt="Nexora AI" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl">About Nexora AI</h1>
        <p className="text-slate-400 text-xs mt-2 max-w-lg leading-relaxed">
          An advanced, production-ready fullstack AI ecosystem helping candidates construct, learn, and optimize their pathways into modern industries.
        </p>
      </div>

      {/* Narrative Section */}
      <section className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/5 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
        <h3 className="font-display font-bold text-lg text-white mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          The Vision
        </h3>
        <p className="text-slate-300 text-xs leading-relaxed mb-4">
          Navigating job searches, learning complex frameworks, and presenting yourself during stressful interviews can be an overwhelming, solitary journey. General mock data generators and canned templates often fall short of answering your specific concerns.
        </p>
        <p className="text-slate-300 text-xs leading-relaxed">
          <strong>Nexora AI</strong> acts as a persistent, high-fidelity counseling partner. By uniting high-performance **Google Gemini Large Language Models** with private, cloud-hosted **Firebase security containers**, it delivers real evaluations, checklist curricula, and Mock HR pressure-testing on a beautifully polished glassmorphic interface.
        </p>
      </section>

      {/* Architectural Stack */}
      <section className="mb-12">
        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-6 text-center md:text-left">
          Core Engineering Stack
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {techs.map((tech) => (
            <div key={tech.title} className="glass-panel p-5 rounded-2xl border border-white/5 flex gap-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${tech.color}`}>
                <tech.icon className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="text-[10px] text-blue-400 font-bold font-mono tracking-wide uppercase">{tech.category}</div>
                <h5 className="font-bold text-sm text-white mt-1">{tech.title}</h5>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security note / Open Source */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/10 text-xs text-center leading-relaxed text-slate-400">
        "Security is central to Nexora. All third-party secrets, keys, and model parameters are locked behind Express backend environments. Standard Firebase security configurations govern Firestore collections to block cross-user visibility."
      </div>
    </div>
  );
}
