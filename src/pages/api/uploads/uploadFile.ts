import { NextApiRequest, NextApiResponse } from "next";
import { storage, firestore } from "../../../../firebaseAdmin.config";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase-admin/auth";

// Disable body parsing by Next.js so formidable can handle the multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper function to parse form data using formidable (returns a Promise)
const parseForm = async (
  req: NextApiRequest,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Extract the Authorization header for token validation
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      await getAuth().verifyIdToken(token);
    } catch (error) {
      console.error("Invalid or expired token:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    try {
      // Parse the form using formidable
      const { fields, files } = await parseForm(req);

      // Helper function to safely extract a string value from fields
      const getFieldValue = (
        field: string | string[] | undefined,
      ): string | undefined => {
        if (typeof field === "string") {
          return field;
        } else if (Array.isArray(field)) {
          return field[0];
        } else {
          return undefined;
        }
      };

      // Safely extract values from fields
      const monthValue = getFieldValue(fields.month);
      const year = getFieldValue(fields.year);
      const fileType = getFieldValue(fields.fileType);

      // Validate that necessary metadata fields are provided
      if (!monthValue || !year || !fileType) {
        return res.status(400).json({
          error: "Missing required metadata: month, year, or fileType",
        });
      }

      // Convert the month number to a month name
      const monthIndex = parseInt(monthValue, 10) - 1; // monthValue is expected to be 1-based
      if (monthIndex < 0 || monthIndex > 11) {
        return res.status(400).json({ error: "Invalid month value" });
      }

      const month = monthNames[monthIndex]; // Get the corresponding month name

      // Handle the uploaded file
      const uploadedFile = files.file;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let file: formidable.File;

      if (Array.isArray(uploadedFile)) {
        if (uploadedFile.length === 0) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        file = uploadedFile[0];
      } else {
        file = uploadedFile;
      }

      const filePath = file.filepath;
      if (!filePath) {
        return res.status(400).json({ error: "Filepath is missing" });
      }

      const originalFilename = file.originalFilename || "unknown";
      const bucket = storage.bucket(); // Get reference to Firebase storage bucket

      // Generate a unique filename for Firebase Storage
      const fileName = `${uuidv4()}-${originalFilename}`;

      // Upload the file to Firebase Storage using the path provided by formidable
      await bucket.upload(filePath, {
        destination: fileName,
        metadata: {
          contentType: file.mimetype || undefined,
        },
      });

      // Construct the internal URL or path of the file in Firebase Storage
      const storageUrl = `gs://${bucket.name}/${fileName}`;

      // Generate a unique document ID based on metadata
      const uniqueDocId = `${fileType}-${year}-${month}-${uuidv4()}`;

      // Determine the Firestore collection
      const collectionName =
        fileType === "shukkimboTemplate"
          ? "monthlyShukkimboTemplatesPDFs"
          : "monthlyWorkingSchedulesPDFs";

      // Save metadata to Firestore for future reference
      const docRef = firestore.collection(collectionName).doc(uniqueDocId);
      await docRef.set({
        name: originalFilename,
        fileType,
        month,
        year,
        storagePath: storageUrl,
        uploadedAt: new Date().toISOString(),
      });

      // Generate a signed URL for temporary access (valid for 5 minutes)
      const [signedUrl] = await bucket.file(fileName).getSignedUrl({
        action: "read",
        expires: Date.now() + 5 * 60 * 1000, // Expires in 5 minutes
      });

      // Respond with success message and signed URL
      res
        .status(200)
        .json({ message: "File uploaded successfully", signedUrl });
    } catch (error) {
      console.error("Error uploading file", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
