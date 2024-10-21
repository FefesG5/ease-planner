import admin from "firebase-admin";

// Initialize Firebase Admin with TypeScript Type Safety
let privateKey: string | undefined = process.env.FIREBASE_PRIVATE_KEY;

try {
  if (privateKey) {
    console.log("Private key found, processing...");

    // Log what the private key looks like before formatting
    console.log(
      `Private key before formatting (first 50 characters): ${privateKey.substring(0, 50)}`,
    );
    console.log(
      `Private key before formatting (last 50 characters): ${privateKey.substring(privateKey.length - 50)}`,
    );

    // Replace all '\\n' with actual '\n' characters to properly format the key
    privateKey = privateKey.replace(/\\n/g, "\n");

    // Log what the private key looks like after formatting
    console.log(
      `Private key after formatting (first 50 characters): ${privateKey.substring(0, 50)}`,
    );
    console.log(
      `Private key after formatting (last 50 characters): ${privateKey.substring(privateKey.length - 50)}`,
    );
  } else {
    console.error("Firebase private key is not defined");
  }
} catch (e) {
  console.error("Error processing private key:", e);
}

try {
  if (!admin.apps.length) {
    console.log("Initializing Firebase Admin...");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
        privateKey: privateKey || "",
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin initialized successfully");
  } else {
    console.log("Firebase Admin already initialized");
  }
} catch (initializationError) {
  console.error("Firebase Admin initialization error:", initializationError);
}

const storage = admin.storage();
const firestore = admin.firestore();

export { admin, storage, firestore };
