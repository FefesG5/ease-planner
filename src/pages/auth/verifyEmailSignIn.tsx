import { useEffect, useState } from "react";

const VerifyEmailSignIn = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = window.localStorage.getItem("emailForSignIn");
    const emailLink = window.location.href;

    const signIn = async () => {
      try {
        const response = await fetch("/api/auth/signInWithEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, emailLink }),
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          window.localStorage.removeItem("emailForSignIn");
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        console.error("Error during API call:", error);
        setMessage("An error occurred during email link sign-in.");
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      signIn();
    } else {
      setMessage("Invalid sign-in attempt.");
      setLoading(false);
    }
  }, []);

  return loading ? <p>Loading...</p> : <p>{message}</p>;
};

export default VerifyEmailSignIn;
