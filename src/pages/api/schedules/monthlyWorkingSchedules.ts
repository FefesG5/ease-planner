import { NextApiRequest, NextApiResponse } from "next";
import { storage, firestore } from "../../../../firebaseAdmin.config";
import { GetSignedUrlConfig } from "@google-cloud/storage";
import { getAuth } from "firebase-admin/auth";
import { ScheduleMetadata } from "@/interfaces/schedulesInterface";

// Function to fetch monthly working schedules from Firestore
async function fetchMonthlyWorkingSchedules() {
  try {
    const collectionRef = firestore.collection("monthlyWorkingSchedulesPDFs");
    const snapshot = await collectionRef.get();

    // Map the documents to an array of objects and generate signed URLs for each file
    const schedules = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as ScheduleMetadata; // Explicit typing of document data
        const filePath = data.storagePath; // 'gs://...' path from Firestore

        // Generate a signed URL (temporary URL) for the file
        const bucket = storage.bucket(); // Get reference to the storage bucket
        const file = bucket.file(
          filePath.replace("gs://ease-planner-33986.appspot.com/", ""),
        ); // Replace 'gs://' with the correct path

        const options: GetSignedUrlConfig = {
          action: "read",
          expires: Date.now() + 60 * 60 * 1000, // URL expires in 1 hour
        };

        const [signedUrl] = await file.getSignedUrl(options);

        // Return the document data along with the signed URL
        return {
          id: doc.id,
          ...data,
          signedUrl, // This will be the usable URL
        };
      }),
    );

    return schedules;
  } catch (error) {
    console.error("Error fetching schedules from Firestore:", error);
    throw new Error("Failed to fetch schedules from Firestore");
  }
}

// API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify the token using Firebase Admin SDK
      await getAuth().verifyIdToken(token);
    } catch (error) {
      console.error("Invalid or expired token:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    try {
      const schedules = await fetchMonthlyWorkingSchedules();
      return res.status(200).json(schedules);
    } catch (error) {
      console.error("Error in API handler:", error);
      return res.status(500).json({ error: "Failed to fetch schedules" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
