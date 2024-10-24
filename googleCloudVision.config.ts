import { ImageAnnotatorClient } from "@google-cloud/vision";

const googleVisionConfig = {
  projectId: process.env.GOOGLE_VISION_API_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_VISION_API_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_VISION_API_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    ),
  },
};

const client = new ImageAnnotatorClient(googleVisionConfig);

export { client };
