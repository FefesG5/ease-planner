import Image from "next/image";
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useState } from "react";
import { app } from "../../../firebase.config";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const auth = getAuth(app);

  const sendEmailLink = () => {
    const actionCodeSettings = {
      url: "http://localhost:3000/auth/verifyEmailSignIn",
      handleCodeInApp: true,
    };

    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem("emailForSignIn", email);
        setMessage("A sign-in link has been sent to your email address.");
      })
      .catch((error) => {
        console.error(error);
        setMessage("An error occurred while sending the sign-in link.");
      });
  };

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
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full p-3 my-2 rounded-md text-base outline-none bg-[var(--signin-input-bg-color)] border border-[var(--signin-input-border-color)] focus:border-blue-600 focus:ring focus:ring-blue-200"
      />
      <button
        onClick={sendEmailLink}
        className="w-full flex items-center justify-center p-2 my-2 bg-[var(--signin-btn-bg-color)] text-[var(--signin-text-color)] rounded-lg cursor-pointer font-bold text-base hover:bg-[var(--signin-btn-hover-bg-color)] transition-colors duration-200 ease-in-out"
      >
        <Image
          src="/email-icon.png"
          alt="Email Sign-in Icon"
          width={40}
          height={40}
          className="mr-2"
        />
        <span>Sign in with Email link</span>
      </button>
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
      {message && (
        <p className="mt-4 text-[var(--error-message-text-color)] text-sm font-bold">
          {message}
        </p>
      )}
    </div>
  );
};

export default SignIn;
