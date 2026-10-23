import { 
  LayoutDashboard,
  MessageSquare, 
  FileText, 
  Map, 
  Target,
  GraduationCap, 
  BookOpen, 
  Search, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Compass,
  GraduationCap as StudentIcon,
  User as UserIcon,
  Shield
} from "lucide-react";
import Tooltip from "./Tooltip";

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Personalized candidate hub" },
    { id: "chat", label: "Career Chat", icon: MessageSquare, desc: "Talk with Gemini Career Coach" },
    { id: "resume", label: "Resume Maker & ATS", icon: FileText, desc: "AI Resume Generator & ATS Scanner" },
    { id: "interview", label: "Interview Prep", icon: GraduationCap, desc: "Mock interviews & feedback" },
    { id: "roadmap", label: "Career Roadmaps", icon: Map, desc: "Step-by-step career milestones" },
    { id: "skillgap", label: "Skill Gap Analyzer", icon: Target, desc: "Audit and bridge technical gaps" },
    { id: "learning", label: "Learning Hub", icon: BookOpen, desc: "Curated learning recommendations" },
    { id: "jobs", label: "Job Finder", icon: Search, desc: "Find open IT & AI job listings" },
    { id: "profile", label: "Student Profile", icon: UserIcon, desc: "Manage candidate credentials" },
    { id: "admin", label: "Super Admin", icon: Shield, desc: "Enterprise operations console" },
    { id: "about", label: "About Platform", icon: Info, desc: "Learn more about Nexora AI" },
  ];

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#030712]/90 border-r border-white/5 backdrop-blur-xl relative">
      <div>
        {/* Logo and Brand */}
        <div className={`p-6 border-b border-white/5 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div 
              onClick={() => handleNavigate("home")} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden border border-white/5 shadow-lg shadow-indigo-500/10">
                <img 
                  src="/src/assets/images/favicon_dark.jpg" 
                  alt="Nexora AI" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-black text-sm tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Nexora <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-medium">AI</span>
              </span>
            </div>
          )}
          {collapsed && (
            <div 
              onClick={() => handleNavigate("home")}
              className="relative flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden border border-white/5 shadow-lg shadow-indigo-500/10"
            >
              <img 
                src="/src/assets/images/favicon_dark.jpg" 
                alt="Nexora AI" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Student/Fresher Badge Indicator */}
        {!collapsed && (
          <div className="px-4 py-3 mx-4 my-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
              <StudentIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Workspace Mode</div>
              <div className="text-xs font-bold text-slate-200">Fresher / Student</div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            const buttonEl = (
              <button
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {!collapsed && (
                  <div className="flex-grow min-w-0">
                    <span className="block truncate font-semibold">{item.label}</span>
                  </div>
                )}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id} content={`${item.label} - ${item.desc}`} position="right">
                  {buttonEl}
                </Tooltip>
              );
            }

            return <div key={item.id}>{buttonEl}</div>;
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer Button */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2">
        <button
          onClick={() => handleNavigate("home")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer`}
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-full py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Slide-over */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm xl:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <div 
          className={`absolute top-0 left-0 bottom-0 w-64 max-w-[80vw] transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden xl:block h-screen sticky top-0 transition-all duration-300 flex-shrink-0 ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
