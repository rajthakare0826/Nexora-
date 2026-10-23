import { useState, useEffect } from "react";
import { User as FirebaseUser, updateProfile, updatePassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../lib/firebase";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Check, 
  RefreshCw, 
  Sliders, 
  Calendar, 
  Sparkles, 
  Clock, 
  Lock,
  ArrowRight,
  UserCheck
} from "lucide-react";
import Tooltip from "./Tooltip";

interface ProfileProps {
  user: FirebaseUser | null;
  onOpenAuth: () => void;
  setCurrentPage: (page: string) => void;
}

export default function Profile({ user, onOpenAuth, setCurrentPage }: ProfileProps) {
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  // Keep state synchronized with auth changes
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center text-white">
        <div className="glass-panel p-8 lg:p-12 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center">
          <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
            <User className="w-8 h-8" />
          </div>

          <h1 className="font-display font-bold text-2xl text-white tracking-tight">Personalized Student Workspace</h1>
          <p className="text-slate-400 text-xs mt-2 max-w-md leading-relaxed">
            Create an account or sign in to configure your professional candidate profile, customize automated ATS scoring variables, and synchronize AI mentoring logs across devices.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={onOpenAuth}
              className="flex-grow py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Sign In to Cloud
            </button>
            <button
              onClick={() => setCurrentPage("home")}
              className="flex-grow py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Back to Landing
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    
    if (!fullName.trim()) {
      setProfileError("Full name cannot be blank.");
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile(user, {
        displayName: fullName.trim()
      });
      setProfileSuccess("Candidate profile name synchronized successfully!");
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileError(err.message || "An error occurred while updating profile name.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess(null);
    setPwError(null);

    if (newPassword.length < 6) {
      setPwError("Password should be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      await updatePassword(user, newPassword);
      setPwSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.code === "auth/requires-recent-login") {
        setPwError("Security Check: To change your password, please sign out and sign back in first, then try again.");
      } else {
        setPwError(err.message || "An error occurred while changing password.");
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setVerifyLoading(true);
    setVerifySuccess(null);
    try {
      await sendEmailVerification(user);
      setVerifySuccess("Verification email dispatched! Check your spam or inbox.");
    } catch (err: any) {
      console.error("Verification email error:", err);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 text-white">
      {/* Intro Brand block */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 flex items-center justify-center text-white font-bold text-2xl uppercase">
            {user.email?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">Candidate Profile Workspace</h1>
            <p className="text-slate-400 text-xs mt-1">
              Configure student details, verification tokens, and cloud synchronization.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 animate-pulse text-blue-400" />
            Verified Student
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Account Metadata
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Sign In Provider</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5 capitalize flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.providerData[0]?.providerId === "google.com" ? "Google Account" : "Email & Password"}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Verification Status</span>
                <div className="mt-1 flex items-center gap-1.5">
                  {user.emailVerified ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Email Verified
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Unverified Email
                      </span>
                      {verifySuccess ? (
                        <span className="text-[10px] text-emerald-400 font-sans mt-1">{verifySuccess}</span>
                      ) : (
                        <button
                          onClick={handleSendVerification}
                          disabled={verifyLoading}
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {verifyLoading ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : null}
                          Verify Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">User Unique ID</span>
                <p className="text-[10px] font-mono text-slate-400 mt-1 break-all bg-white/[0.02] p-1.5 rounded-md border border-white/5">
                  {user.uid}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Workspace Date</span>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  July 15, 2026
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/10 text-[11px] text-slate-400 leading-relaxed">
            All user-generated assets (AI resume scoring logs, interview history logs, active job bookmarks, and custom timelines) are protected by Cloud Firewalls and accessible only when signed in.
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Candidate Profile Configuration
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-medium ml-1">Account Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.01] border border-white/5 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-slate-500 ml-1">Email addresses cannot be modified. Contact administrators for custom integrations.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-medium ml-1">Student / Candidate Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your professional name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:border-blue-500/50 focus:outline-none focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Tooltip content="Synchronize full name update">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="py-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Details
                  </button>
                </Tooltip>
              </div>
            </form>
          </div>

          {/* Password Reset Section (Only for Email provider users) */}
          {user.providerData[0]?.providerId === "password" && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                Change Workspace Password
              </h3>

              {pwSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {pwSuccess}
                </div>
              )}
              {pwError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {pwError}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-300 font-medium ml-1">New Account Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:border-blue-500/50 focus:outline-none focus:bg-white/[0.06] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-300 font-medium ml-1">Verify Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:border-blue-500/50 focus:outline-none focus:bg-white/[0.06] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Tooltip content="Submit password update">
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="py-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {pwLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                      Update Password
                    </button>
                  </Tooltip>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
