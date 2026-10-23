import { useState } from "react";
import { User, LogOut, Menu, X, Compass, MessageSquare, FileText, Map, Sparkles, BookOpen, Search, Info, GraduationCap } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: FirebaseUser | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Header({
  currentPage,
  setCurrentPage,
  user,
  onLogout,
  onOpenAuth,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Compass },
    { id: "chat", label: "AI Career Chat", icon: MessageSquare },
    { id: "features", label: "Features", icon: Sparkles, isScroll: true },
    { id: "resume", label: "Resume Maker & ATS", icon: FileText },
    { id: "interview", label: "Interview Prep", icon: GraduationCap },
    { id: "roadmap", label: "Career Roadmaps", icon: Map },
    { id: "pricing", label: "Pricing", icon: Sparkles, isScroll: true },
    { id: "contact", label: "Contact", icon: Info, isScroll: true },
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.isScroll) {
      if (currentPage !== "home") {
        setCurrentPage("home");
        setTimeout(() => {
          const el = document.getElementById(item.id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      } else {
        const el = document.getElementById(item.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      setCurrentPage(item.id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-4 lg:px-8 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setCurrentPage("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden shadow-lg shadow-indigo-500/10 border border-white/5">
            <img 
              src="/src/assets/images/favicon_dark.jpg" 
              alt="Nexora AI" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Nexora <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-black">AI</span>
          </span>
        </div>
 
         {/* Desktop Navigation */}
         <nav className="hidden xl:flex items-center gap-1">
           {navItems.map((item) => {
             const isActive = currentPage === item.id && !item.isScroll;
             return (
               <button
                 key={item.id}
                 id={`nav-${item.id}`}
                 onClick={() => handleItemClick(item)}
                 className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                   isActive 
                     ? "text-blue-400 bg-blue-500/10 shadow-sm border border-blue-500/20" 
                     : "text-slate-400 hover:text-white hover:bg-white/5"
                 }`}
               >
                 {item.label}
               </button>
             );
           })}
         </nav>

        {/* Auth / Action Button */}
        <div className="hidden xl:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs text-slate-300 font-mono truncate max-w-[150px]">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-signin"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-250 hover:translate-y-[-1px] active:translate-y-0 cursor-pointer"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="xl:hidden flex items-center gap-3">
          {user && (
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm text-white font-semibold">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-3 px-2 pt-2 pb-4 rounded-xl glass-panel border border-white/10 shadow-2xl flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id && !item.isScroll;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleItemClick(item);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? "text-blue-400 bg-blue-500/10 border-l-3 border-blue-500 pl-3.5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 text-blue-400" />
                {item.label}
              </button>
            );
          })}
          
          <div className="border-t border-white/5 mt-2 pt-3">
            {user ? (
              <div className="flex flex-col gap-2.5">
                <div className="text-xs text-slate-400 font-mono px-4 break-all">
                  Logged in as: {user.email}
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/10 cursor-pointer transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
