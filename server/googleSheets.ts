import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

// Standard Firebase Web configuration matched from /src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDlhi8KEu_NVhWCxDB7cERev0Qw7SpJe-Y",
  authDomain: "gen-lang-client-0036166494.firebaseapp.com",
  projectId: "gen-lang-client-0036166494",
  storageBucket: "gen-lang-client-0036166494.firebasestorage.app",
  messagingSenderId: "210265768889",
  appId: "1:210265768889:web:e16e70b3a3553d3b186c68",
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp, "ai-studio-careerpilotai-59c4ee05-4166-4815-aaa4-b8fc7644a2f9");

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // Epoch milliseconds
  connectedEmail?: string;
  connectedName?: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
}

const CONFIG_DOC_PATH = "google_integration/config";

// Retrieve configuration from Firestore
export async function getGoogleConfig(): Promise<GoogleConfig | null> {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as GoogleConfig;
    }
    
    // Fallback to environment variables if Firestore is empty
    const envClientId = process.env.GOOGLE_CLIENT_ID || "";
    const envClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const envRedirectUri = process.env.GOOGLE_REDIRECT_URI || "";
    
    if (envClientId) {
      return {
        clientId: envClientId,
        clientSecret: envClientSecret,
        redirectUri: envRedirectUri,
        spreadsheetName: "CareerPilot_Inquiries"
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error reading Google Config from Firestore:", error);
    return null;
  }
}

// Save or update configuration in Firestore
export async function saveGoogleConfig(config: Partial<GoogleConfig>): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    const snap = await getDoc(docRef);
    
    const defaultData = {
      clientId: "",
      clientSecret: "",
      redirectUri: "",
      spreadsheetName: "CareerPilot_Inquiries",
    };

    if (snap.exists()) {
      await updateDoc(docRef, config as any);
    } else {
      await setDoc(docRef, { ...defaultData, ...config });
    }
  } catch (error) {
    console.error("Error writing Google Config to Firestore:", error);
  }
}

// Disconnect Google integration
export async function disconnectGoogle(): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    await setDoc(docRef, {
      clientId: "",
      clientSecret: "",
      redirectUri: "",
      accessToken: "",
      refreshToken: "",
      expiresAt: 0,
      connectedEmail: "",
      connectedName: "",
      spreadsheetId: "",
      spreadsheetName: "CareerPilot_Inquiries",
    });
  } catch (error) {
    console.error("Error disconnecting Google integration:", error);
  }
}

// Get the authorization URL to redirect users
export async function getGoogleAuthUrl(customRedirect?: string): Promise<string> {
  const config = await getGoogleConfig();
  if (!config || !config.clientId) {
    throw new Error("Google Client Credentials are not configured. Please complete configuration first.");
  }
  
  const redirectUri = customRedirect || config.redirectUri || "";
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ].join(" ");
  
  return `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${encodeURIComponent(config.clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=google_sheets_auth`;
}

// Exchange authorization code for Access & Refresh tokens
export async function handleGoogleAuthCallback(code: string, customRedirect?: string): Promise<void> {
  const config = await getGoogleConfig();
  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error("Google configuration not found during token exchange.");
  }

  const redirectUri = customRedirect || config.redirectUri || "";
  
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams();
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  const data = await response.json();
  
  // Retrieve profile of authenticated user
  let connectedEmail = "unknown@google.com";
  let connectedName = "Google User";
  try {
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { "Authorization": `Bearer ${data.access_token}` }
    });
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      connectedEmail = profile.email || connectedEmail;
      connectedName = profile.name || connectedName;
    }
  } catch (err) {
    console.error("Could not fetch Google profile details:", err);
  }

  // Calculate expiration (e.g. standard 3600 seconds)
  const expiresAt = Date.now() + (data.expires_in * 1000);

  const updatedConfig: Partial<GoogleConfig> = {
    accessToken: data.access_token,
    expiresAt,
    connectedEmail,
    connectedName,
    redirectUri
  };

  // Google only returns refresh_token on the FIRST authorization (or when prompt=consent is used)
  if (data.refresh_token) {
    updatedConfig.refreshToken = data.refresh_token;
  }

  await saveGoogleConfig(updatedConfig);
}

// Ensure valid access token, performing a silent refresh if expired or near expiry
export async function getValidAccessToken(): Promise<string | null> {
  const config = await getGoogleConfig();
  if (!config || !config.refreshToken) {
    return null;
  }

  const now = Date.now();
  // If access token is valid and has more than 5 minutes left, return it
  if (config.accessToken && config.expiresAt && config.expiresAt - now > 300000) {
    return config.accessToken;
  }

  // Otherwise, refresh the token using Google OAuth token refresh
  console.log("Refreshing Google OAuth access token...");
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams();
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);
  params.append("refresh_token", config.refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!response.ok) {
    console.error("Google Token Refresh failed:", await response.text());
    return null;
  }

  const data = await response.json();
  const expiresAt = Date.now() + (data.expires_in * 1000);

  await saveGoogleConfig({
    accessToken: data.access_token,
    expiresAt
  });

  return data.access_token;
}

// Ensure the target Google Sheet exists, or create a new one
export async function ensureGoogleSheet(accessToken: string): Promise<string> {
  const config = await getGoogleConfig();
  if (config?.spreadsheetId) {
    // Verify it still exists and we can access it
    const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}`;
    const checkRes = await fetch(checkUrl, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    if (checkRes.ok) {
      return config.spreadsheetId;
    }
    console.log("Configured Google Spreadsheet not accessible. Attempting to recreate or create new...");
  }

  const title = config?.spreadsheetName || "CareerPilot_Inquiries";
  
  // Create a brand new Google Spreadsheet
  console.log(`Creating a brand new Google Spreadsheet: ${title}...`);
  const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
  
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: "Sheet1"
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorMsg = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errorMsg}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Add column headers A1:E1 in new spreadsheet
  console.log("Setting column headers in new Google Spreadsheet...");
  const headersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:E1?valueInputOption=USER_ENTERED`;
  const patchHeaders = await fetch(headersUrl, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      values: [
        ["Full Name", "Email", "Message", "Date & Time", "Status"]
      ]
    })
  });

  if (!patchHeaders.ok) {
    console.error("Failed to set Google Sheet header values:", await patchHeaders.text());
  }

  await saveGoogleConfig({ spreadsheetId });
  return spreadsheetId;
}

// Append a single form entry to the active Google Sheet
export async function appendContactToGoogleSheets(
  name: string,
  email: string,
  message: string,
  status: string = "New"
): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      console.log("Google Sheets sync skipped: No active connection found.");
      return false;
    }

    const spreadsheetId = await ensureGoogleSheet(accessToken);
    const range = "Sheet1!A:E";
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " (UTC)";
    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [[name, email, message, nowStr, status]]
      })
    });

    if (!response.ok) {
      console.error("Google Sheets append failed:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error appending contact to Google Sheets:", error);
    return false;
  }
}

// Update the status of a specific row in Google Sheets
export async function updateGoogleRowStatus(rowIndex: number, newStatus: string): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return false;

    const config = await getGoogleConfig();
    if (!config?.spreadsheetId) return false;

    // Col E is index 5. Cell reference for Sheet1 is E{rowIndex + 2}
    const cellRange = `Sheet1!E${rowIndex + 2}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(cellRange)}?valueInputOption=USER_ENTERED`;

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [[newStatus]]
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating status cell inside Google Sheets:", error);
    return false;
  }
}

// Fetch all tickets directly from Google Sheets (to display in live view or check state)
export async function fetchGoogleSheetTickets(): Promise<any[]> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return [];

    const config = await getGoogleConfig();
    if (!config?.spreadsheetId) return [];

    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Sheet1!A2:E500`;
    const response = await fetch(getUrl, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.values || data.values.length === 0) return [];

    return data.values.map((row: any[], index: number) => ({
      index,
      fullName: row[0] || "",
      email: row[1] || "",
      message: row[2] || "",
      dateTime: row[3] || "",
      status: row[4] || "New"
    }));
  } catch (error) {
    console.error("Error fetching Google Sheet rows:", error);
    return [];
  }
}

// Bulk sync all Firestore contacts to Google Sheets
export async function syncAllFirestoreContactsToGoogleSheets(): Promise<{ success: boolean; count: number }> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) throw new Error("Google Sheets not authenticated.");

    const spreadsheetId = await ensureGoogleSheet(accessToken);

    // Get all contacts from Firestore
    const contactsCol = collection(db, "contacts");
    const q = query(contactsCol, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: true, count: 0 };
    }

    const rowsToAppend: any[][] = [];
    snapshot.forEach((snap) => {
      const data = snap.data();
      const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date();
      const nowStr = createdAt.toLocaleString("en-US", { timeZone: "UTC" }) + " (UTC)";
      rowsToAppend.push([
        data.fullName || "Anonymous",
        data.email || "",
        data.message || "",
        nowStr,
        data.status || "New"
      ]);
    });

    // Clear old data first to avoid appending duplicates (keeping only headers)
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:E500:clear`;
    await fetch(clearUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    // Append all rows at once
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:append?valueInputOption=USER_ENTERED`;
    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: rowsToAppend
      })
    });

    if (!response.ok) {
      throw new Error(`Append bulk rows failed: ${await response.text()}`);
    }

    return { success: true, count: rowsToAppend.length };
  } catch (error: any) {
    console.error("Bulk sync Google Sheets failed:", error);
    throw error;
  }
}
