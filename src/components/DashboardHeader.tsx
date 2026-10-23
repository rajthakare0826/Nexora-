import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Search, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Sparkles, 
  Check, 
  Menu,
  FileText,
  MessageSquare,
  GraduationCap,
  Map,
  BookOpen,
  Info,
  Sliders,
  Compass
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import Tooltip from "./Tooltip";

interface DashboardHeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: FirebaseUser | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "tip";
}

export default function DashboardHeader({
  currentPage,
  setCurrentPage,
  user,
  onLogout,
  onOpenAuth,
  setMobileSidebarOpen
}: DashboardHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initial student/fresher centric notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "ATS Expert Insight",
      message: "Pro Tip for Freshers: Resumes with precise skills checklists score up to 40% higher on automated ATS readers.",
      time: "2 hours ago",
      read: false,
      type: "tip"
    },
    {
      id: "2",
      title: "Coaching Modules Upgraded",
      message: "The Gemini AI Career counselor model was updated to include 2026 technical job specifications.",
      time: "1 day ago",
      read: false,
      type: "info"
    },
    {
      id: "3",
      title: "Workspace Synchronized",
      message: "Your dashboard profile is active and synced with the Firebase Cloud storage layer successfully.",
      time: "2 days ago",
      read: true,
      type: "success"
    }
  ]);

  const searchShortcuts = [
    { id: "chat", label: "Career Chat Coach", category: "AI Assistant", icon: MessageSquare, keywords: "chat assistant gemini coach speak help talk" },
    { id: "resume", label: "ATS Resume Analyzer", category: "Resume Scanner", icon: FileText, keywords: "resume ats score file upload critique pdf" },
    { id: "interview", label: "Interview Preparation Room", category: "HR Practicing", icon: GraduationCap, keywords: "interview mock prep answer feedback hr" },
    { id: "roadmap", label: "Interactive Milestones Roadmap", category: "Career Pathing", icon: Map, keywords: "roadmap path goals plan timeline track" },
    { id: "learning", label: "Learning & Academics Hub", category: "Skill Hub", icon: BookOpen, keywords: "learn courses books resources study degree" },
    { id: "jobs", label: "Open Technical Jobs Finder", category: "Job Placements", icon: Search, keywords: "jobs find opening search recruiter careers tech" },
    { id: "about", label: "About & Methodology Documentation", category: "Info", icon: Info, keywords: "about platform guide docs help FAQ" },
  ];

  // Filter shortcuts
  const filteredShortcuts = searchQuery.trim() === "" 
    ? [] 
    : searchShortcuts.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchFocused(false);
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Map page ID to breadcrumbs readable title
  const getBreadcrumbs = () => {
    const defaultCrumb = { title: "Workspace", url: "#", active: false };
    switch (currentPage) {
      case "dashboard":
        return [defaultCrumb, { title: "Dashboard", active: true }];
      case "chat":
        return [defaultCrumb, { title: "Career Chat", active: true }];
      case "resume":
        return [defaultCrumb, { title: "ATS Evaluator", active: true }];
      case "interview":
        return [defaultCrumb, { title: "Interview Prep", active: true }];
      case "roadmap":
        return [defaultCrumb, { title: "Career Roadmaps", active: true }];
      case "learning":
        return [defaultCrumb, { title: "Learning Hub", active: true }];
      case "jobs":
        return [defaultCrumb, { title: "Job Finder", active: true }];
      case "about":
        return [defaultCrumb, { title: "About Nexora", active: true }];
      case "admin":
        return [defaultCrumb, { title: "Super Admin", active: true }];
      default:
        return [defaultCrumb];
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "G";

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-[#020617]/80 border-b border-white/5 backdrop-blur-md px-4 xl:px-8 flex items-center justify-between">
      {/* Breadcrumb Left Hand Navigation */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle Hamburger */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="xl:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="hover:text-blue-400 cursor-pointer transition-colors" onClick={() => setCurrentPage("home")}>
            Nexora AI
          </span>
          {getBreadcrumbs().map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600 font-mono">/</span>
              <span className={crumb.active ? "text-blue-400 font-semibold" : "text-slate-400"}>
                {crumb.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Center Search Bar with Shortcuts Navigation */}
      <div className="flex-grow max-w-sm mx-4" ref={searchRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFocused(true);
            }}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search tools, templates or FAQs..."
            className="w-full bg-white/[0.04] border border-white/5 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
            aria-label="Global search bar"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 text-slate-400 hover:text-white px-1.5 py-0.5 rounded-md cursor-pointer font-mono"
            >
              Clear
            </button>
          )}

          {/* Search Dropdown Panel */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-3 max-h-[320px] overflow-y-auto scrollbar-thin animate-fade-in z-[110]">
              <div className="text-[10px] font-mono text-slate-500 px-2 pb-2 border-b border-white/5 uppercase tracking-wider font-bold">
                {searchQuery.trim() === "" ? "Quick Feature Shortcuts" : `Results for "${searchQuery}"`}
              </div>

              <div className="mt-2 space-y-1">
                {searchQuery.trim() === "" ? (
                  searchShortcuts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setSearchFocused(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{item.label}</div>
                            <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-400 transition-colors">Go →</span>
                      </button>
                    );
                  })
                ) : filteredShortcuts.length > 0 ? (
                  filteredShortcuts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setSearchFocused(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{item.label}</div>
                            <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Go →</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-xs text-slate-400 font-semibold">No results found</div>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">Try keywords like "resume", "coach", "fresher", "roadmap", or "HR".</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Notification bell & profile menu */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <Tooltip content="Workspace System Notifications">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white relative cursor-pointer"
              aria-label="Toggle notifications panel"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-md shadow-blue-500/50 animate-ping" />
              )}
            </button>
          </Tooltip>

          {notificationOpen && (
            <div className="absolute right-0 mt-3.5 w-80 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in z-[110]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Workspace Logs
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Guidance tailored for students & freshers</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-blue-400 hover:underline cursor-pointer font-semibold"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-[250px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                      }}
                      className={`p-3.5 text-left transition-all hover:bg-white/[0.02] cursor-pointer relative group ${
                        notif.read ? "opacity-60" : "bg-blue-950/[0.05]"
                      }`}
                    >
                      {!notif.read && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-400" />
                      )}
                      <div className="pl-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold ${
                            notif.type === "tip" ? "text-amber-300" : notif.type === "success" ? "text-emerald-400" : "text-blue-400"
                          }`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px] text-slate-500">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <button
                          onClick={(e) => handleNotificationDismiss(notif.id, e)}
                          className="mt-1.5 text-[9px] text-slate-500 hover:text-white hover:underline block opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Dismiss Log
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs font-semibold">All logs checked!</span>
                    <p className="text-[10px] text-slate-600 mt-0.5">We will notify you of career developments.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all cursor-pointer text-left"
            aria-label="Toggle user profile menu"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-lg shadow-blue-500/10">
              {userInitial}
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-bold text-slate-200 tracking-tight leading-none truncate max-w-[100px]">
                {user?.email ? user.email.split("@")[0] : "Guest User"}
              </div>
              <div className="text-[9px] font-mono text-slate-500 leading-none mt-1">
                {user ? "Pro Member" : "Visitor Mode"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in z-[110]">
              <div className="p-4 border-b border-white/5 bg-white/[0.01]">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">My Account</div>
                <div className="text-xs text-slate-300 font-semibold mt-1 truncate">
                  {user?.email || "Guest Account"}
                </div>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-bold uppercase">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  {user ? "Verified Student" : "Guest Mode"}
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setCurrentPage("profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 text-left cursor-pointer transition-all"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      Student Profile
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage("chat");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 text-left cursor-pointer transition-all"
                    >
                      <Sliders className="w-4 h-4 text-slate-500" />
                      Workspace Panel
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 text-left cursor-pointer transition-all border border-transparent"
                    >
                      <LogOut className="w-4 h-4 text-rose-400/75" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setCurrentPage("profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 text-left cursor-pointer transition-all"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      Student Profile
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 text-left cursor-pointer transition-all font-bold border border-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign In to Cloud
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
