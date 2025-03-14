import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "../../../../firebaseAdmin.config";

const generateFilteredSchedule = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { scheduleId, teacherName, userId } = req.body;

  if (!scheduleId || !teacherName || !userId) {
    console.error("Missing required fields:", {
      scheduleId,
      teacherName,
      userId,
    });
    return res.status(400).json({
      error: "Missing required fields: scheduleId, teacherName, or userId",
    });
  }

  try {
    // Fetch the selected schedule document from the monthlySchedules collection
    const scheduleRef = firestore
      .collection("monthlySchedules")
      .doc(scheduleId);
    const scheduleSnapshot = await scheduleRef.get();

    if (!scheduleSnapshot.exists) {
      console.error("Schedule document not found for ID:", scheduleId);
      return res.status(404).json({ error: "Schedule not found" });
    }

    const scheduleData = scheduleSnapshot.data();
    if (!scheduleData || !scheduleData.schedules) {
      console.error("No schedules found in document for ID:", scheduleId);
      return res
        .status(404)
        .json({ error: "No schedules found in the document" });
    }

    // Filter the schedules for the selected teacher
    const filteredSchedules = scheduleData.schedules.filter(
      (entry: { Employee: string }) => entry.Employee === teacherName,
    );

    if (filteredSchedules.length === 0) {
      console.warn("No schedules found for the selected teacher:", teacherName);
      return res.status(200).json({
        message: `No schedules found for teacher ${teacherName}.`,
        found: false,
      });
    }

    // Save the filtered schedule under the user's document in registered-users collection
    const userRef = firestore.collection("registered-users").doc(userId);
    const saveResult = await userRef.collection("filteredSchedules").add({
      month: scheduleData.month,
      year: scheduleData.year,
      teacherName,
      schedules: filteredSchedules,
      generatedAt: new Date().toISOString(),
    });

    console.info("Filtered schedule saved successfully under user:", userId);
    res.status(200).json({
      message: "Filtered schedule saved successfully",
      found: true,
    });
  } catch (error) {
    console.error("Error generating filtered schedule:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default generateFilteredSchedule;
