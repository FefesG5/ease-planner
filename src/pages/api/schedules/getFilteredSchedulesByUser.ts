import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../../firebaseAdmin.config";

export default async function getFilteredSchedulesByUser(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Reference to the user's document
    const userDocRef = firestore
      .collection("registered-users")
      .doc(userId as string);

    // Fetch filtered schedules subcollection
    const filteredSchedulesSnapshot = await userDocRef
      .collection("filteredSchedules")
      .get();

    // Map through documents and construct the response
    const filteredSchedules = filteredSchedulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(filteredSchedules);
  } catch (error) {
    console.error("Error fetching user filtered schedules:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
