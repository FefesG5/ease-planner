import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../../firebaseAdmin.config";

export default async function deleteSchedule(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId, scheduleId } = req.body;

  if (!userId || !scheduleId) {
    return res.status(400).json({ error: "Missing userId or scheduleId" });
  }

  try {
    await firestore
      .collection("registered-users")
      .doc(userId)
      .collection("filteredSchedules")
      .doc(scheduleId)
      .delete();

    return res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return res.status(500).json({ error: "Failed to delete schedule" });
  }
}
