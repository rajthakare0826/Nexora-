import { useState, FormEvent } from "react";
import { auth } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { X, Lock, Mail, User, Sparkles, Chrome, RefreshCw, KeyRound, ArrowLeft } from "lucide-react";
import Tooltip from "./Tooltip";
import { logActivity } from "../lib/activityLogger";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!email.trim()) {
      setError("Please provide your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Password reset email has been dispatched! Please verify your spam folder if it doesn't appear.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No registered account found with this email address.");
      } else {
        setError(err.message || "Could not dispatch password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateProfile(userCredential.user, { displayName: fullName.trim() });
        }
        await logActivity({
          activity: "New User Registered",
          details: `Registered account: ${email.trim()}`,
          name: fullName.trim() || undefined,
          email: email.trim(),
          status: "Success"
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        await logActivity({
          activity: "User Signed In",
          details: "Authenticated via Email and Password",
          name: userCredential.user.displayName || undefined,
          email: userCredential.user.email || email.trim(),
          status: "Success"
        });
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      // Map common friendly error messages
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      await logActivity({
        activity: isNewUser ? "New User Registered" : "User Signed In",
        details: isNewUser ? "Registered via Google Auth" : "Authenticated via Google Auth",
        name: result.user.displayName || undefined,
        email: result.user.email || undefined,
        status: "Success"
      });

      onClose();
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Could not complete Google Sign-In.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setIsSignUp(false);
    setIsForgotPassword(false);
    setError(null);
    setSuccessMessage(null);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 lg:p-8 border border-white/10 shadow-2xl overflow-hidden text-white">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-indigo-600/20 blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Close authentication window"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Forgot Password Header */}
        {isForgotPassword ? (
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 mb-3">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs text-slate-400 mt-1 text-center">
              Provide your email to receive password reset instructions
            </p>
          </div>
        ) : (
          /* Normal Sign-In/Sign-Up Header */
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 text-center">
              {isSignUp ? "Unlock personalized AI roadmaps and ATS resume scoring" : "Sign in to save your career chats and roadmaps"}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-medium">
            {successMessage}
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:outline-none focus:border-blue-500/30"
                />
              </div>
            </div>

            <Tooltip content="Request password recovery">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Please wait..." : "Request Reset Link"}
              </button>
            </Tooltip>

            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </form>
        ) : (
          /* NORMAL SIGN-IN/SIGN-UP FORM */
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-medium ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:outline-none focus:border-blue-500/30"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-medium ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:outline-none focus:border-blue-500/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs text-slate-300 font-medium">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] text-blue-400 hover:underline hover:text-blue-300 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm glass-input text-white focus:outline-none focus:border-blue-500/30"
                  />
                </div>
              </div>

              <Tooltip content={isSignUp ? "Submit sign up form" : "Submit sign in form"}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 hover:translate-y-[-1px] disabled:opacity-50 disabled:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </Tooltip>
            </form>

            {/* Google Identity Provider Sign-In */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-mono tracking-wider">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <Tooltip content="Authenticate with Google Single Sign-On">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4 text-blue-400" />
                  Sign In with Google
                </button>
              </Tooltip>
            </div>

            <div className="mt-5 text-center text-xs text-slate-400">
              <span>{isSignUp ? "Already have an account?" : "New to Nexora AI?"}</span>{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-blue-400 font-medium hover:underline focus:outline-none cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Create one now"}
              </button>
            </div>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="text-[10px] text-slate-500 hover:text-slate-400 font-mono tracking-wider hover:underline focus:outline-none cursor-pointer"
          >
            CONTINUE AS GUEST
          </button>
        </div>
      </div>
    </div>
  );
}
