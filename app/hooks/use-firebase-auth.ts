"use client";

import type { RecaptchaVerifier } from "firebase/auth";
import { useCallback, useState } from "react";
import { auth } from "../../firebase.client";

export function useFirebaseAuth() {
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const initializeRecaptcha = useCallback(
    async (containerId: string) => {
      if (typeof window === "undefined") return null;

      try {
        // Check if reCAPTCHA is already initialized
        if (recaptchaVerifier) {
          console.log("reCAPTCHA already initialized, reusing...");
          return recaptchaVerifier;
        }

        // Clear any existing reCAPTCHA in the container
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = "";
        }

        console.log("Initializing Firebase Auth and reCAPTCHA...");

        const { RecaptchaVerifier } = await import("firebase/auth");

        console.log("Firebase auth instance:", auth);
        console.log("Firebase app:", auth.app);

        const verifier = new RecaptchaVerifier(auth, containerId, {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved successfully");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },
        });

        // Render the reCAPTCHA
        console.log("Rendering reCAPTCHA...");
        await verifier.render();
        console.log("reCAPTCHA rendered successfully");

        setRecaptchaVerifier(verifier);
        return verifier;
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        return null;
      }
    },
    [recaptchaVerifier]
  );

  const sendOTP = async (phoneNumber: string) => {
    if (typeof window === "undefined") return null;

    try {
      console.log("Attempting to send OTP to:", phoneNumber);

      const { signInWithPhoneNumber } = await import("firebase/auth");

      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      console.log("Using auth instance:", auth);
      console.log("Using reCAPTCHA verifier:", recaptchaVerifier);

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      console.log(
        "OTP sent successfully, confirmation result:",
        confirmationResult
      );

      return confirmationResult;
    } catch (error) {
      console.error("Error sending OTP:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("invalid-app-credential")) {
          throw new Error(
            "Phone authentication is not enabled in Firebase Console. Please enable it in Authentication → Sign-in method."
          );
        } else if (error.message.includes("auth/operation-not-allowed")) {
          throw new Error(
            "Phone authentication is not enabled for this Firebase project."
          );
        } else if (error.message.includes("auth/invalid-phone-number")) {
          throw new Error(
            "Please enter a valid phone number with country code (e.g., +91 9876543210)"
          );
        } else if (error.message.includes("auth/quota-exceeded")) {
          throw new Error("SMS quota exceeded. Please try again later.");
        }
      }

      throw error;
    }
  };

  const clearRecaptcha = useCallback(() => {
    if (recaptchaVerifier) {
      try {
        console.log("Clearing reCAPTCHA...");
        recaptchaVerifier.clear();
      } catch (error) {
        console.error("Error clearing reCAPTCHA:", error);
      }
      setRecaptchaVerifier(null);
    }
  }, [recaptchaVerifier]);

  return {
    initializeRecaptcha,
    sendOTP,
    clearRecaptcha,
    recaptchaVerifier,
  };
}
