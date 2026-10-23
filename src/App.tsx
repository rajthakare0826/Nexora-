import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import Home from "./components/Home";
import CareerChat from "./components/CareerChat";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import RoadmapGenerator from "./components/RoadmapGenerator";
import InterviewAssistant from "./components/InterviewAssistant";
import LearningHub from "./components/LearningHub";
import JobFinder from "./components/JobFinder";
import About from "./components/About";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import SkillGapAnalyzer from "./components/SkillGapAnalyzer";
import AdminDashboard from "./components/AdminDashboard";
import { AlertCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Monitor Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Redirect authenticated users to the personalized dashboard when logging in
  useEffect(() => {
    if (user && currentPage === "home") {
      setCurrentPage("dashboard");
    }
  }, [user, currentPage]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentPage("home");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    // Auto scroll to top of page on navigation
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={handleNavigate} onOpenAuth={() => setAuthModalOpen(true)} userEmail={user?.email || null} />;
      case "dashboard":
        return <Dashboard user={user} onNavigate={handleNavigate} onOpenAuth={() => setAuthModalOpen(true)} />;
      case "chat":
        return <CareerChat user={user} onOpenAuth={() => setAuthModalOpen(true)} />;
      case "resume":
        return <ResumeAnalyzer user={user} />;
      case "roadmap":
        return <RoadmapGenerator user={user} />;
      case "skillgap":
        return <SkillGapAnalyzer user={user} />;
      case "interview":
        return <InterviewAssistant user={user} />;
      case "learning":
        return <LearningHub />;
      case "jobs":
        return <JobFinder />;
      case "about":
        return <About />;
      case "profile":
        return <Profile user={user} onOpenAuth={() => setAuthModalOpen(true)} setCurrentPage={handleNavigate} />;
      case "admin":
        return <AdminDashboard user={user} />;
      default:
        return <Home onNavigate={handleNavigate} onOpenAuth={() => setAuthModalOpen(true)} userEmail={user?.email || null} />;
    }
  };

  if (currentPage === "home") {
    return (
      <div className="min-h-screen bg-[#020617] text-[#f8fafc] font-sans selection:bg-blue-500/30 selection:text-white flex flex-col relative overflow-x-hidden">
        {/* Dynamic Background Mesh Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[-200px] w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Global Header Navigation */}
        <Header
          currentPage={currentPage}
          setCurrentPage={handleNavigate}
          user={user}
          onLogout={handleLogout}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Guest Mode Advisory Banner */}
        {!authLoading && !user && showGuestBanner && (
          <div className="w-full bg-indigo-950/40 border-b border-indigo-500/10 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-xs text-indigo-300 font-mono tracking-wide z-40">
            <div className="flex items-center gap-2 max-w-[85%]">
              <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-pulse" />
              <span>
                You are browsing in guest mode.{" "}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="font-bold underline text-white hover:text-indigo-200 cursor-pointer"
                >
                  Sign In
                </button>{" "}
                to sync your career roadmaps, resume score logs, and HR prep sessions to the cloud.
              </span>
            </div>
            <button
              onClick={() => setShowGuestBanner(false)}
              className="p-1 text-indigo-400 hover:text-white rounded hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active App Viewport Area */}
        <main className="flex-grow flex flex-col items-center justify-start relative z-10 w-full">
          {authLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 animate-spin">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-slate-400 font-mono mt-3 animate-pulse">Syncing user profile...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <Home onNavigate={handleNavigate} onOpenAuth={() => setAuthModalOpen(true)} userEmail={user?.email || null} />
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Auth Modal Trigger */}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#f8fafc] font-sans selection:bg-blue-500/30 selection:text-white flex relative overflow-x-hidden">
      {/* Sidebar on Left */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handleNavigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Workspace Frame on Right */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen relative">
        {/* Dynamic Background Mesh Accents inside dashboard */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

        {/* Dashboard Specific Header */}
        <DashboardHeader
          currentPage={currentPage}
          setCurrentPage={handleNavigate}
          user={user}
          onLogout={handleLogout}
          onOpenAuth={() => setAuthModalOpen(true)}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Guest Mode Advisory Banner inside dashboard */}
        {!authLoading && !user && showGuestBanner && (
          <div className="w-full bg-indigo-950/40 border-b border-indigo-500/10 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-xs text-indigo-300 font-mono tracking-wide z-20">
            <div className="flex items-center gap-2 max-w-[85%]">
              <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-pulse" />
              <span>
                You are browsing in guest mode.{" "}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="font-bold underline text-white hover:text-indigo-200 cursor-pointer"
                >
                  Sign In
                </button>{" "}
                to sync your career roadmaps, resume score logs, and HR prep sessions to the cloud.
              </span>
            </div>
            <button
              onClick={() => setShowGuestBanner(false)}
              className="p-1 text-indigo-400 hover:text-white rounded hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Page Viewport Container */}
        <main className="flex-grow flex flex-col items-center justify-start relative z-10 w-full overflow-y-auto">
          {authLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 animate-spin">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-slate-400 font-mono mt-3 animate-pulse">Syncing workspace...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

