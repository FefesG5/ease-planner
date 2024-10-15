import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, signInWithEmailLink } from "firebase/auth";
import { app } from "../../../../firebase.config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const auth = getAuth(app);

  if (req.method === "POST") {
    const { email, emailLink } = req.body;

    try {
      const result = await signInWithEmailLink(auth, email, emailLink);
      console.log("Sign-In with Email Link result:", result);
      res.status(200).json({
        message: "Successfully signed in with email link.",
        user: result.user,
      });
    } catch (error) {
      console.error("Error during email link sign-in:", error);
      res.status(400).json({
        message: "An error occurred during email link sign-in.",
        error,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
