import { useState } from "react";
import { BookOpen, Search, ExternalLink, GraduationCap, Video, Compass, Code, Brain, Cloud, ClipboardList } from "lucide-react";

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Pathways", icon: Compass },
    { id: "ai", label: "AI & Machine Learning", icon: Brain },
    { id: "software", label: "Software Engineering", icon: Code },
    { id: "cloud", label: "Cloud & DevOps", icon: Cloud },
    { id: "product", label: "Product & Management", icon: ClipboardList }
  ];

  const courses = [
    {
      title: "Google AI for Beginners",
      platform: "Google AI",
      category: "ai",
      type: "Tutorial / Concept Hub",
      duration: "4 Hours",
      description: "Understand generative AI, large language models (LLMs), prompt structures, and how to apply cloud AI platforms responsibly.",
      url: "https://cloud.google.com/training/free",
      cost: "100% Free",
      isPremiumPartner: true
    },
    {
      title: "Microsoft Azure Cloud Fundamentals (AZ-900)",
      platform: "Microsoft Learn",
      category: "cloud",
      type: "Self-Paced / Interactive sandbox",
      duration: "10 Hours",
      description: "Complete roadmap to cloud architectures, core database storage, data compliance frameworks, and preparation for the official AZ-900 certificate.",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
      cost: "Free Learning Track",
      isPremiumPartner: true
    },
    {
      title: "FreeCodeCamp: Python for Data Science",
      platform: "YouTube",
      category: "ai",
      type: "Full Video Course",
      duration: "12 Hours",
      description: "Comprehensive code-along covering NumPy, Pandas, Matplotlib, and scikit-learn to master structural data cleaning and descriptive analytics.",
      url: "https://www.youtube.com/user/freecodecamp",
      cost: "100% Free",
      isPremiumPartner: false
    },
    {
      title: "Git and GitHub Collaborative Mastery",
      platform: "Coursera (Free Audit)",
      category: "software",
      type: "Audit Course / Assignments",
      duration: "8 Hours",
      description: "Master branch workflows, resolve complex rebase issues, manage open-source dependencies, and operate industrial CI/CD systems.",
      url: "https://www.coursera.org/",
      cost: "Free Audit Available",
      isPremiumPartner: false
    },
    {
      title: "Product Management Foundations",
      platform: "LinkedIn Learning",
      category: "product",
      type: "Video Series / Case Studies",
      duration: "5 Hours",
      description: "Learn how to craft high-impact user stories, structure agile sprints, prioritize backlogs using RICE, and coordinate with engineering teams.",
      url: "https://www.linkedin.com/learning/",
      cost: "Free Monthly Trial",
      isPremiumPartner: false
    },
    {
      title: "Kubernetes & Docker Container Operations",
      platform: "Microsoft Learn",
      category: "cloud",
      type: "Hands-on Sandbox Lab",
      duration: "14 Hours",
      description: "Step-by-step guidance on writing Dockerfiles, launching multi-container pods, managing services, ingress setups, and automated rolling updates.",
      url: "https://learn.microsoft.com/",
      cost: "100% Free",
      isPremiumPartner: true
    }
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Upper Headers */}
      <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-white">Vetted Free Learning Hub</h1>
          <p className="text-slate-400 text-xs mt-1">
            Access hand-picked, zero-cost professional curricula from industry-leading tech groups.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Azure, Python, PM, etc..."
            className="w-full pl-11 pr-4 py-2 rounded-xl text-xs glass-input"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected 
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10" 
                  : "bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between glass-card-hover relative overflow-hidden"
            >
              {course.isPremiumPartner && (
                <div className="absolute top-0 right-0 px-2.5 py-1 bg-blue-600/30 text-blue-300 border-b border-l border-blue-500/20 text-[9px] font-bold font-mono tracking-wider uppercase rounded-bl-xl">
                  Recommended
                </div>
              )}
              
              <div>
                {/* Badges / Header details */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-slate-400 font-mono font-bold uppercase border border-white/5">
                    {course.platform}
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold font-mono">
                    {course.cost}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white line-clamp-1">
                  {course.title}
                </h3>
                
                <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Card Footer details */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  {course.type.includes("Video") ? <Video className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  <span>{course.duration}</span>
                </div>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Go to Resource <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <BookOpen className="w-8 h-8 text-slate-500 mb-3 animate-pulse" />
          <h3 className="font-display font-bold text-base text-slate-300">No courses match your parameters</h3>
          <p className="text-xs text-slate-500 mt-1">Try checking another pathway filter or refining your typing.</p>
        </div>
      )}
    </div>
  );
}
