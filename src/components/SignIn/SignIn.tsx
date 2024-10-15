import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from "react";
import { app } from "../../../firebase.config";

const SignIn = () => {
  const [message, setMessage] = useState("");
  const auth = getAuth(app);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Signed in with Google successfully.");
        setMessage("Signed in with Google successfully.");
      })
      .catch((error) => {
        console.error("Error during Google sign-in:", error);
        setMessage("An error occurred during Google sign-in.");
      });
  };

  return (
    <div className="text-center p-8 bg-[var(--signin-container-bg-color)] border border-[var(--signin-input-border-color)] rounded-md shadow-md max-w-full my-8 mx-auto sm:max-w-xs md:max-w-md lg:max-w-lg">
      {/* Added Instructions */}
      <h2 className="text-2xl font-bold mb-4">Welcome to Ease Planner</h2>
      <p className="mb-6 text-lg text-[var(--body-text-color)]">
        Please sign in to continue. Use your Google account to get started.
      </p>

      {/* Google Sign-In Button */}
      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center p-3 my-2 bg-[var(--signin-btn-bg-color)] text-[var(--signin-text-color)] rounded-lg cursor-pointer font-bold text-base hover:bg-[var(--signin-btn-hover-bg-color)] transition-colors duration-200 ease-in-out"
      >
        <Image
          src="/web-neutral-rd-na.svg"
          alt="Google Sign-in Logo"
          width={30}
          height={30}
          className="mr-3"
        />
        <span>Sign in with Google</span>
      </button>

      {/* Display Message */}
      {message && (
        <p className="mt-4 text-[var(--error-message-text-color)] text-sm font-bold">
          {message}
        </p>
      )}
    </div>
  );
};

export default SignIn;
