import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the multi-tenant database ID generated for the container
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "ai-studio-careerpilotai-59c4ee05-4166-4815-aaa4-b8fc7644a2f9");

export const auth = getAuth(app);

// Connection test on boot as recommended in Firebase integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration: client is offline.");
    }
  }
}
testConnection();
