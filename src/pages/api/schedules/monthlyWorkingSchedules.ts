import { NextApiRequest, NextApiResponse } from "next";
import { storage, firestore } from "../../../../firebaseAdmin.config"; // Adjust the path to your firebaseAdmin.config.ts
import { GetSignedUrlConfig } from "@google-cloud/storage";

interface ScheduleData {
  fileType: string;
  month: string;
  name: string;
  storagePath: string;
  uploadedAt: string;
  year: string;
  signedUrl?: string;
}

// Function to fetch monthly working schedules from Firestore
async function fetchMonthlyWorkingSchedules() {
  try {
    const collectionRef = firestore.collection("monthlyWorkingSchedules");
    const snapshot = await collectionRef.get();

    // Map the documents to an array of objects and generate signed URLs for each file
    const schedules = await Promise.all(
      snapshot.docs.map(
        async (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
          const data = doc.data() as ScheduleData; // Explicit typing of document data
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

          // Return the document data along with the signed URL (without logging)
          return {
            id: doc.id,
            ...data,
            signedUrl, // This will be the usable URL
          };
        },
      ),
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
