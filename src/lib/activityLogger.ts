import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export type ActivityType =
  | "New User Registered"
  | "User Signed In"
  | "Resume Uploaded"
  | "Resume Analyzed"
  | "Resume Generated"
  | "Interview Started"
  | "Contact Form Submitted"
  | "Career Roadmap Generated"
  | "AI Chat";

export interface LogActivityParams {
  activity: ActivityType;
  details: string;
  status?: "Success" | "Pending" | "Failed";
  name?: string;
  email?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const user = auth.currentUser;
    const ua = navigator.userAgent;

    // Detect OS
    let os: "macOS" | "Windows" | "Linux" | "iOS" | "Android" = "Windows";
    if (/Macintosh|Mac OS X/.test(ua)) os = "macOS";
    else if (/Windows/.test(ua)) os = "Windows";
    else if (/Linux/.test(ua)) os = "Linux";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Android/.test(ua)) os = "Android";

    // Detect Browser
    let browser: "Chrome" | "Safari" | "Firefox" | "Edge" = "Chrome";
    if (/Edg/.test(ua)) browser = "Edge";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Chrome/.test(ua)) browser = "Chrome";
    else if (/Safari/.test(ua)) browser = "Safari";

    // Detect Device
    let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
    if (/Mobi/.test(ua)) {
      device = "Mobile";
    }
    if (/Tablet|iPad/.test(ua)) {
      device = "Tablet";
    }

    const name = params.name || user?.displayName || "Guest Candidate";
    const email = params.email || user?.email || "guest@nexora.io";

    const activityData = {
      name,
      email,
      activity: params.activity,
      timestamp: Date.now(),
      status: params.status || "Success",
      device,
      browser,
      os,
      details: params.details,
    };

    const activitiesCol = collection(db, "activities");
    await addDoc(activitiesCol, activityData);
  } catch (error) {
    console.error("Error logging telemetry activity:", error);
  }
}
