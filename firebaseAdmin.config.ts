import admin from "firebase-admin";

// Initialize Firebase Admin with TypeScript Type Safety
let privateKey: string | undefined = process.env.FIREBASE_PRIVATE_KEY;

try {
  if (privateKey) {
    // Replace all '\\n' with actual '\n' characters to properly format the key
    privateKey = privateKey.replace(/\\n/g, "\n");
  } else {
    console.error("Firebase private key is not defined");
  }
} catch (e) {
  console.error("Error processing private key:", e);
}

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
        privateKey: privateKey || "",
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
} catch (initializationError) {
  console.error("Firebase Admin initialization error:", initializationError);
}

const storage = admin.storage();
const firestore = admin.firestore();

export { admin, storage, firestore };
