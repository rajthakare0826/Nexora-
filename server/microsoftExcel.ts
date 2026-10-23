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

// Base64 of a completely valid minimal Excel sheet with one Sheet1
const BLANK_XLSX_BASE64 = 
  "UEsDBBQAAAAIADG6o1IAAAAAAAAAAAAAAAAGAAAAX3JlbHMvLnJlbHOtksFOwzAMhu9IvEOrdyg0IdB2CAnEAdg48gZNW8VpYidp7N0bF8SgInHiF9vS7/+vY7v9MpvZg8foK6v6RdcgONfO9bWqf8bvzSNozKInm72p6i8Odfu6u7vDk6XpRF9FVaX0NSpX9pC0pMoY5FpW5U/m7XvS6FzYqR0egep0uVb1I8f9Z49PclN3ZisW/V0pZ93ZksYq1+mSFrZzW9/2z1I7lsc+g7r7N6K+19CgL8bA8e3rC9K1n4tQp8Y50m+2EaU7Bf2fWjD1gQ+FpGZ7zUvOAszD36y8B1BLAwQUAAAACADGuqNSAAAAAAAAAAAAAAAAHwAAAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzfZC/TsMwEMV3pD5D5S1pWhAoSjtCoQ6AxpE3NPYmscvEnpPauzcugIJEwsZ39pff/z7b7ZfZzB6ixKIsYNE2IDjX3vW1grX6mDxCYxYDWdfYClbYyLr52N3d4dnSDqIvolWpYitshL7PFFHFDVlkSlvVkvnbY/KeNHrXYTeG2S0fVD0InL93eCunbGeu4mG+K2WtO1vwWKV6Lp8W9HNDPz72V6mZimOfQdP/G9HQa2jRF8PA2+/XD0id7YtQp8Y50u98XzS9p8H8p06Yf0p07OAnR8p8AsInUEsDBBQAAAAIADK6o1IAAAAAAAAAAAAAAAALAAAAeGwvX3JlbHMvLnJlbHMrUjBv8C1LzClNVShKTczJyVfQy8wrLs/JSSzJzM9zzs/PT89L1cvLzE1MSY0vLk3LM8hLLCnWK0mtKAGygSwuSAWyFKDykzOL4zOT81KLM/NyU/NyU1KLS7JzkzOKc3NSi+PzQfzi4tRcAOZaHTFKAAAAUEsDBBQAAAAIADK6o1IAAAAAAAAAAAAAAAALAAAAeGwvd29ya2Jvb2sueG1srUvMKU1VKEpNzMnJV9DLzCsuz8lJLMnMzzPWy0ssKdYrSa0oAbKBLC5IBbIUoPKTM4vjM5PzUosz83JT83JTUotLsnOTM4pzc1KL4/NB/OLi1FwA5lodMUoAAABQSwMEFAAAAAgAMrqjUgAAAAAAAAAAAAAAAAsAAAB4bC9zaGVldHMvc2hlZXQxLnhtbCtKzClNVShKTczJyVfQy8wrLs/JSSzJzM8z1MtLLCnWK0mtKAGygSwuSAWyFKDykzOL4zOT81KLM/NyU/NyU1KLS7JzkzOKc3NSi+PzQfzi4tRcAOZaHTFKAAAAUEsBAhQAFAAAAAgAMbqjUgAAAAAAAAAAAAAAAAYAAAAAAAAAAAABAAAAAAFfcmVscy8ucmVsc1BLAQIUABQAAAAIADGuqNSAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAEAAAAAAYmwvX3JlbHMvd29ya2Jvb2subXhtbC5yZWxzUEsBAhQAFAAAAAgAMrqjUgAAAAAAAAAAAAAAAAsAAAAAAAAAAAABAAAAAAB4bC9fcmVscy8ucmVsc1BLAQIUABQAAAAIADK6o1IAAAAAAAAAAAAAAAALAAAAAAAAAAAAAQAAAAAAeGwvd29ya2Jvb2useG1sUEsBAhQAFAAAAAgAMrqjUgAAAAAAAAAAAAAAAAsAAAAAAAAAAAABAAAAAAB4bC9zaGVldHMvc2hlZXQxLnhtbFBLBQYAAAAABQAFAIkAAABTAAAAAAA=";

export interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // Epoch milliseconds
  connectedEmail?: string;
  connectedName?: string;
  excelFilePath?: string;
  excelTableId?: string;
}

const CONFIG_DOC_PATH = "microsoft_integration/config";

// Retrieve configuration from Firestore
export async function getMicrosoftConfig(): Promise<MicrosoftConfig | null> {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MicrosoftConfig;
    }
    
    // Fallback to environment variables if Firestore is empty
    const envClientId = process.env.MICROSOFT_CLIENT_ID || "";
    const envClientSecret = process.env.MICROSOFT_CLIENT_SECRET || "";
    const envRedirectUri = process.env.MICROSOFT_REDIRECT_URI || "";
    
    if (envClientId) {
      return {
        clientId: envClientId,
        clientSecret: envClientSecret,
        redirectUri: envRedirectUri,
        excelFilePath: "/CareerPilot_Inquiries.xlsx",
        excelTableId: "Table1"
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error reading Microsoft Config from Firestore:", error);
    return null;
  }
}

// Save or update configuration in Firestore
export async function saveMicrosoftConfig(config: Partial<MicrosoftConfig>): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_DOC_PATH);
    const snap = await getDoc(docRef);
    
    const defaultData = {
      clientId: "",
      clientSecret: "",
      redirectUri: "",
      excelFilePath: "/CareerPilot_Inquiries.xlsx",
      excelTableId: "Table1",
    };

    if (snap.exists()) {
      await updateDoc(docRef, config as any);
    } else {
      await setDoc(docRef, { ...defaultData, ...config });
    }
  } catch (error) {
    console.error("Error writing Microsoft Config to Firestore:", error);
  }
}

// Disconnect Microsoft integration
export async function disconnectMicrosoft(): Promise<void> {
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
      excelFilePath: "/CareerPilot_Inquiries.xlsx",
      excelTableId: "Table1",
    });
  } catch (error) {
    console.error("Error disconnecting Microsoft integration:", error);
  }
}

// Get the authorization URL to redirect users
export async function getMicrosoftAuthUrl(customRedirect?: string): Promise<string> {
  const config = await getMicrosoftConfig();
  if (!config || !config.clientId) {
    throw new Error("Microsoft Client Credentials are not configured. Please complete configuration first.");
  }
  
  const redirectUri = customRedirect || config.redirectUri || "";
  const scopes = "offline_access Files.ReadWrite User.Read";
  
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` + 
    `client_id=${encodeURIComponent(config.clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=microsoft_excel_auth`;
}

// Exchange authorization code for Access & Refresh tokens
export async function handleMicrosoftAuthCallback(code: string, customRedirect?: string): Promise<void> {
  const config = await getMicrosoftConfig();
  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error("Microsoft configuration not found during token exchange.");
  }

  const redirectUri = customRedirect || config.redirectUri || "";
  
  const tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const params = new URLSearchParams();
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");
  params.append("scope", "offline_access Files.ReadWrite User.Read");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const data = await response.json();
  
  // Retrieve profile of authenticated user
  let connectedEmail = "unknown@microsoft.com";
  let connectedName = "Microsoft User";
  try {
    const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { "Authorization": `Bearer ${data.access_token}` }
    });
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      connectedEmail = profile.mail || profile.userPrincipalName || connectedEmail;
      connectedName = profile.displayName || connectedName;
    }
  } catch (err) {
    console.error("Could not fetch user profile details:", err);
  }

  // Calculate expiration (e.g. standard 3600 seconds)
  const expiresAt = Date.now() + (data.expires_in * 1000);

  await saveMicrosoftConfig({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    connectedEmail,
    connectedName,
    redirectUri // Capture the final redirect URI that worked
  });
}

// Ensure valid access token, performing a silent refresh if expired or near expiry
export async function getValidAccessToken(): Promise<string | null> {
  const config = await getMicrosoftConfig();
  if (!config || !config.refreshToken) {
    return null;
  }

  const now = Date.now();
  // If access token is valid and has more than 5 minutes left, return it
  if (config.accessToken && config.expiresAt && config.expiresAt - now > 300000) {
    return config.accessToken;
  }

  // Otherwise, refresh the token
  console.log("Refreshing Microsoft OAuth access token...");
  const tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const params = new URLSearchParams();
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);
  params.append("refresh_token", config.refreshToken);
  params.append("grant_type", "refresh_token");
  params.append("scope", "offline_access Files.ReadWrite User.Read");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!response.ok) {
    console.error("Microsoft Token Refresh failed:", await response.text());
    return null;
  }

  const data = await response.json();
  const expiresAt = Date.now() + (data.expires_in * 1000);

  await saveMicrosoftConfig({
    accessToken: data.access_token,
    refreshToken: data.refresh_token || config.refreshToken, // Microsoft might not return a new refresh token, fallback to current
    expiresAt
  });

  return data.access_token;
}

// Ensure the target Excel file and Table1 exist on OneDrive
export async function ensureExcelFileAndTable(accessToken: string): Promise<{ fileExists: boolean; tableExists: boolean }> {
  const config = await getMicrosoftConfig();
  const filePath = config?.excelFilePath || "/CareerPilot_Inquiries.xlsx";
  const encodedPath = encodeURIComponent(filePath.startsWith("/") ? filePath.slice(1) : filePath);
  
  const checkUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}`;
  
  let fileResponse = await fetch(checkUrl, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });

  let createdFile = false;
  if (fileResponse.status === 404) {
    console.log(`Excel file '${filePath}' not found. Creating a blank workbook in OneDrive...`);
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/content`;
    
    const binaryBuffer = Buffer.from(BLANK_XLSX_BASE64, "base64");
    
    const putResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      body: binaryBuffer
    });

    if (!putResponse.ok) {
      const errorMsg = await putResponse.text();
      throw new Error(`Failed to create Excel file in OneDrive: ${errorMsg}`);
    }

    createdFile = true;
    console.log("Successfully created blank Excel file. Pausing 1500ms for OneDrive indexing...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } else if (!fileResponse.ok) {
    const errorMsg = await fileResponse.text();
    throw new Error(`OneDrive API file access error: ${errorMsg}`);
  }

  // If we just created the file, let's inject headers and initialize Table1
  if (createdFile) {
    console.log("Setting column headers A1:E1 in new spreadsheet...");
    const headersUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/range(address='A1:E1')`;
    const patchHeaders = await fetch(headersUrl, {
      method: "PATCH",
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
      console.error("Failed to patch Excel header values:", await patchHeaders.text());
    }

    console.log("Defining Table1 on range Sheet1!A1:E1...");
    const tableUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/tables/add`;
    const addTable = await fetch(tableUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        address: "A1:E1",
        hasHeaders: true
      })
    });

    if (!addTable.ok) {
      console.error("Failed to initialize table structure inside Excel file:", await addTable.text());
    } else {
      console.log("Successfully initialized Excel Table1 structure!");
    }
  }

  return { fileExists: true, tableExists: true };
}

// Append a new row to Excel Online workbook
export async function appendContactToExcel(fullName: string, email: string, message: string, status = "New"): Promise<boolean> {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      console.warn("Microsoft Excel sync is pending. No active connection/credentials found.");
      return false;
    }

    await ensureExcelFileAndTable(token);

    const config = await getMicrosoftConfig();
    const filePath = config?.excelFilePath || "/CareerPilot_Inquiries.xlsx";
    const encodedPath = encodeURIComponent(filePath.startsWith("/") ? filePath.slice(1) : filePath);
    
    const appendUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/tables('Table1')/rows`;
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

    const body = {
      values: [
        [fullName, email, message, localTimeStr, status]
      ]
    };

    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error("Failed to append row to Microsoft Excel Table1:", await response.text());
      return false;
    }

    console.log(`Successfully synced submission from '${fullName}' into OneDrive Excel!`);
    return true;
  } catch (error) {
    console.error("Microsoft Excel Sync exception:", error);
    return false;
  }
}

export interface ContactTicket {
  fullName: string;
  email: string;
  message: string;
  dateTime: string;
  status: string;
  index: number; // Row index in Excel for cell status editing
}

// Read rows from the Microsoft Excel workbook, or fall back to Firestore contact activities
export async function getExcelContactTickets(): Promise<ContactTicket[]> {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      console.log("No Microsoft account connected. Falling back to Firestore for contact tickets.");
      return await getFallbackFirestoreTickets();
    }

    const config = await getMicrosoftConfig();
    const filePath = config?.excelFilePath || "/CareerPilot_Inquiries.xlsx";
    const encodedPath = encodeURIComponent(filePath.startsWith("/") ? filePath.slice(1) : filePath);
    
    // Check if file exists, create if missing
    await ensureExcelFileAndTable(token);

    const readUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/tables('Table1')/rows`;
    
    const response = await fetch(readUrl, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error("Failed to retrieve Excel rows. Code:", response.status, await response.text());
      return await getFallbackFirestoreTickets();
    }

    const data = await response.json();
    const rows = data.value || [];
    
    const tickets: ContactTicket[] = rows.map((row: any, i: number) => {
      const cols = row.values && row.values[0] ? row.values[0] : [];
      return {
        fullName: cols[0] || "Guest Inquirer",
        email: cols[1] || "no-email@nexora.io",
        message: cols[2] || "",
        dateTime: cols[3] || new Date().toISOString(),
        status: cols[4] || "New",
        index: i
      };
    });

    // Sort by Date descending to show latest tickets first
    return tickets.reverse();
  } catch (error) {
    console.error("Error reading Microsoft Excel tickets, falling back:", error);
    return await getFallbackFirestoreTickets();
  }
}

// Sync existing Firestore contact form activities to Excel
export async function syncFirestoreTicketsToExcel(): Promise<{ syncedCount: number; error?: string }> {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return { syncedCount: 0, error: "Microsoft account is not authenticated." };
    }

    const firestoreTickets = await getFallbackFirestoreTickets();
    if (firestoreTickets.length === 0) {
      return { syncedCount: 0 };
    }

    await ensureExcelFileAndTable(token);

    const config = await getMicrosoftConfig();
    const filePath = config?.excelFilePath || "/CareerPilot_Inquiries.xlsx";
    const encodedPath = encodeURIComponent(filePath.startsWith("/") ? filePath.slice(1) : filePath);
    
    // Read current rows to prevent duplicates
    const checkUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/tables('Table1')/rows`;
    const checkRes = await fetch(checkUrl, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    let existingEmailsAndMsgs = new Set<string>();
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      const checkRows = checkData.value || [];
      checkRows.forEach((r: any) => {
        const cols = r.values && r.values[0] ? r.values[0] : [];
        if (cols[1] && cols[2]) {
          existingEmailsAndMsgs.add(`${cols[1].trim().toLowerCase()}_${cols[2].trim().toLowerCase()}`);
        }
      });
    }

    let syncedCount = 0;
    const appendUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/tables('Table1')/rows`;

    // Process from oldest to newest
    const ticketsToSync = [...firestoreTickets].reverse();

    for (const t of ticketsToSync) {
      const key = `${t.email.trim().toLowerCase()}_${t.message.trim().toLowerCase()}`;
      if (existingEmailsAndMsgs.has(key)) {
        continue;
      }

      const body = {
        values: [
          [t.fullName, t.email, t.message, t.dateTime, t.status]
        ]
      };

      const response = await fetch(appendUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        syncedCount++;
      } else {
        console.error("Failed to sync row during bulk upload:", await response.text());
      }
    }

    return { syncedCount };
  } catch (err: any) {
    console.error("Bulk sync error:", err);
    return { syncedCount: 0, error: err.message };
  }
}

// Fallback to fetch from Firestore activities collection
async function getFallbackFirestoreTickets(): Promise<ContactTicket[]> {
  try {
    const colRef = collection(db, "activities");
    const snap = await getDocs(query(colRef, where("activity", "==", "Contact Form Submitted")));
    
    const tickets: ContactTicket[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Parse details to extract message body
      let message = data.details || "";
      if (message.startsWith("Message from ")) {
        const idx = message.indexOf(': "');
        if (idx !== -1) {
          message = message.slice(idx + 3);
          if (message.endsWith('"')) {
            message = message.slice(0, -1);
          }
        }
      }

      tickets.push({
        fullName: data.name || "Guest Candidate",
        email: data.email || "guest@nexora.io",
        message: message,
        dateTime: new Date(data.timestamp || Date.now()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
        status: data.status === "Success" ? "New" : data.status || "New",
        index: -1 // Firestore entries don't have an Excel row index
      });
    });

    // Sort by dateTime descending (approximate using timestamp)
    return tickets.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  } catch (error) {
    console.error("Firestore fallback retrieval error:", error);
    return [];
  }
}

// Surgical update of a contact ticket status column in Excel Online
export async function updateExcelTicketStatus(rowIndex: number, newStatus: string): Promise<boolean> {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return false;
    }

    const config = await getMicrosoftConfig();
    const filePath = config?.excelFilePath || "/CareerPilot_Inquiries.xlsx";
    const encodedPath = encodeURIComponent(filePath.startsWith("/") ? filePath.slice(1) : filePath);

    // RowIndex starts at 0, which corresponds to worksheet row 2 (since row 1 is the header)
    // The Status column is in column E (A: Full Name, B: Email, C: Message, D: Date & Time, E: Status)
    const cellAddress = `E${rowIndex + 2}`;
    const updateUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/worksheets('Sheet1')/range(address='${cellAddress}')`;

    const body = {
      values: [
        [newStatus]
      ]
    };

    const response = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error(`Failed to PATCH Excel status cell ${cellAddress}:`, await response.text());
      return false;
    }

    console.log(`Excel row index ${rowIndex} status cell successfully updated to '${newStatus}'!`);
    return true;
  } catch (error) {
    console.error("Error updating Excel status:", error);
    return false;
  }
}
