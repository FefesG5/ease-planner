import { NextApiRequest, NextApiResponse } from "next";
import { storage, firestore } from "../../../../firebaseAdmin.config";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import { v4 as uuidv4 } from "uuid";

// Disable body parsing by Next.js so formidable can handle the multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const form = new IncomingForm();

    form.parse(req, async (err, fields: Fields, files: Files) => {
      if (err) {
        console.error("Error parsing the files", err);
        return res.status(500).json({ error: "Error parsing the files" });
      }

      try {
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
        const month = getFieldValue(fields.month);
        const year = getFieldValue(fields.year);
        const fileType = getFieldValue(fields.fileType);

        // Validate that necessary metadata fields are provided
        if (!month || !year || !fileType) {
          return res.status(400).json({
            error: "Missing required metadata: month, year, or fileType",
          });
        }

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

        // Get filePath and other details
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
            ? "monthlyShukkimboTemplates"
            : "monthlyWorkingSchedules";

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
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
