import { useState } from "react";
import { Search, ExternalLink, Globe, Briefcase, Sparkles, Navigation } from "lucide-react";

export default function JobFinder() {
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("India");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);

  // Formulate high-value search queries dynamically for external portals
  const generateLinkedInUrl = () => {
    const queryRole = encodeURIComponent(role);
    const queryLoc = encodeURIComponent(isRemoteOnly ? "Remote" : location);
    return `https://www.linkedin.com/jobs/search/?keywords=${queryRole}&location=${queryLoc}`;
  };

  const generateWellfoundUrl = () => {
    const queryRole = encodeURIComponent(role);
    return `https://wellfound.com/jobs?q=${queryRole}`;
  };

  const generateNaukriUrl = () => {
    const queryRole = encodeURIComponent(role.replace(/\s+/g, "-").toLowerCase());
    const queryLoc = encodeURIComponent(location.toLowerCase());
    return `https://www.naukri.com/${queryRole}-jobs-in-${queryLoc}`;
  };

  const generateInternshalaUrl = () => {
    const queryRole = encodeURIComponent(role.toLowerCase());
    return `https://internshala.com/internships/matching-${queryRole}`;
  };

  const platforms = [
    {
      name: "LinkedIn Jobs",
      audience: "Global Corporates & Enterprise",
      logoLetter: "L",
      logoColor: "bg-[#0A66C2]",
      description: "Discover verified mid-to-senior postings, contact direct hiring managers, and apply instantly using your profile credentials.",
      urlGenerator: generateLinkedInUrl,
      accent: "border-[#0A66C2]/15 hover:border-[#0A66C2]/35"
    },
    {
      name: "Wellfound (AngelList)",
      audience: "High-Growth Startups & Web3",
      logoLetter: "W",
      logoColor: "bg-red-500",
      description: "Apply to pre-vetted remote and local startup positions. Direct connection with co-founders with salary transparency up front.",
      urlGenerator: generateWellfoundUrl,
      accent: "border-red-500/15 hover:border-red-500/35"
    },
    {
      name: "Naukri",
      audience: "Indian Professional Ecosystem",
      logoLetter: "N",
      logoColor: "bg-[#002C63]",
      description: "The largest corporate career platform in India. Ideal for junior, senior, and corporate roles in MNCs and tech startups.",
      urlGenerator: generateNaukriUrl,
      accent: "border-[#002C63]/15 hover:border-[#002C63]/35"
    },
    {
      name: "Internshala",
      audience: "Internships & Entry-Level",
      logoLetter: "I",
      logoColor: "bg-[#008BD3]",
      description: "The leading portal for securing paid internships, student apprenticeships, and direct college-graduate entry tracks.",
      urlGenerator: generateInternshalaUrl,
      accent: "border-[#008BD3]/15 hover:border-[#008BD3]/35"
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="border-b border-white/5 pb-6 mb-8">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">Dynamic Job Search Center</h1>
        <p className="text-slate-400 text-xs mt-1">
          Formulate pre-filtered job search query URLs for the industry's largest recruitment portals.
        </p>
      </div>

      {/* Query config card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 mb-8">
        <h3 className="font-display font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Filter Your Match Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300 font-medium">Target Role Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. React Developer"
                className="w-full pl-11 pr-4 py-2 rounded-xl text-xs glass-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300 font-medium">Preferred Country / Location</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                disabled={isRemoteOnly}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. India, Bengaluru, US"
                className="w-full pl-11 pr-4 py-2 rounded-xl text-xs glass-input disabled:opacity-50"
              />
            </div>
          </div>

          {/* Quick Remote Toggle */}
          <div className="flex items-center gap-2 mb-1 pl-1">
            <input
              type="checkbox"
              id="remote-only-checkbox"
              checked={isRemoteOnly}
              onChange={(e) => setIsRemoteOnly(e.target.checked)}
              className="w-4.5 h-4.5 accent-blue-500 rounded border-white/10 bg-slate-800 cursor-pointer"
            />
            <label htmlFor="remote-only-checkbox" className="text-xs text-slate-300 font-medium cursor-pointer">
              Remote Roles Only
            </label>
          </div>
        </div>
      </div>

      {/* Target Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((plat) => (
          <div
            key={plat.name}
            className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] ${plat.accent}`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl ${plat.logoColor} flex items-center justify-center font-display font-black text-white text-base shadow`}>
                  {plat.logoLetter}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">{plat.name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium font-mono">{plat.audience}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{plat.description}</p>
            </div>

            <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Search for: "{role}"</span>
              </div>
              <a
                href={plat.urlGenerator()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/25 transition-all cursor-pointer"
              >
                Scan on Portal <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
