// pages/api/saveSchedule.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { admin, firestore } from "../../../../firebaseAdmin.config";

// Define the Schedule interface
interface Schedule {
  Employee: string;
  Date: string;
  Day: string;
  School: string;
  Shift: string;
}

// Define the request body type
interface ScheduleRequestBody {
  schedule: Schedule[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const body = req.body as ScheduleRequestBody;
    const { schedule } = body;

    // Validate the schedule data
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ error: "Invalid schedule data." });
    }

    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid authorization header." });
      }

      const token = authHeader.replace("Bearer ", "");

      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Extract year and month from the schedule
      if (schedule.length === 0) {
        return res.status(400).json({ error: "Schedule data is empty." });
      }

      const firstDate = schedule[0].Date;
      const [year, month] = firstDate.split("/").map(Number);
      if (!year || !month) {
        return res
          .status(400)
          .json({ error: "Invalid date format in schedule." });
      }

      // Reference to the correct monthly document
      const docRef = firestore
        .collection("monthlySchedules")
        .doc(`${year}-${month}`);

      // Update or create the document
      await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (doc.exists) {
          // If the document exists, append the new schedules
          const existingData = doc.data()?.schedules || [];
          const updatedSchedules = [...existingData, ...schedule];
          transaction.update(docRef, { schedules: updatedSchedules });
        } else {
          // If the document does not exist, create it with the schedule
          transaction.set(docRef, { schedules: schedule, year, month });
        }
      });

      res.status(200).json({
        message: "Schedule saved successfully!",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error saving schedule:", error.message);
        res.status(500).json({ error: error.message });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
