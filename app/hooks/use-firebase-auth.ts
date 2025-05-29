"use client";

import type { RecaptchaVerifier } from "firebase/auth";
import { useCallback, useState } from "react";
import { auth } from "../../firebase.client";

export function useFirebaseAuth() {
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // const clearRecaptcha = useCallback(() => {
  //   if (recaptchaVerifier) {
  //     try {
  //       console.log("Clearing reCAPTCHA...");
  //       recaptchaVerifier.clear();
  //     } catch (error) {
  //       console.error("Error clearing reCAPTCHA:", error);
  //     }
  //   }
  //   setRecaptchaVerifier(null);
  //   setIsReady(false);

  //   // Clear the container
  //   const container = document.getElementById("recaptcha-container");
  //   if (container) {
  //     container.innerHTML = "";
  //   }
  // }, [recaptchaVerifier]);

  const initializeRecaptcha = useCallback(
    async (containerId: string): Promise<RecaptchaVerifier | null> => {
      if (typeof window === "undefined") return null;

      // If already initializing, wait for it to complete
      if (isInitializing) {
        console.log("Already initializing, waiting...");
        return new Promise((resolve) => {
          const checkReady = setInterval(() => {
            if (isReady && recaptchaVerifier) {
              clearInterval(checkReady);
              resolve(recaptchaVerifier);
            }
          }, 100);

          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkReady);
            resolve(null);
          }, 10000);
        });
      }

      // If already ready, return existing verifier
      if (isReady && recaptchaVerifier) {
        console.log("reCAPTCHA already ready, reusing...");
        return recaptchaVerifier;
      }

      setIsInitializing(true);

      try {
        // Clear any existing reCAPTCHA first
        // clearRecaptcha();

        // Wait a bit for cleanup
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Check if container exists
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`Container with ID '${containerId}' not found`);
        }

        console.log("Initializing Firebase Auth and reCAPTCHA...");

        const { RecaptchaVerifier } = await import("firebase/auth");

        const verifier = new RecaptchaVerifier(auth, containerId, {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved successfully");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired, clearing...");
            setIsReady(false);
            setRecaptchaVerifier(null);
          },
          "error-callback": (error: Error) => {
            console.error("reCAPTCHA error:", error);
            setIsReady(false);
            setRecaptchaVerifier(null);
          },
        });

        // Render the reCAPTCHA and wait for it to be ready
        console.log("Rendering reCAPTCHA...");
        await verifier.render();
        console.log("reCAPTCHA rendered successfully");

        // Additional wait to ensure it's fully ready
        await new Promise((resolve) => setTimeout(resolve, 500));

        setRecaptchaVerifier(verifier);
        setIsReady(true);
        setIsInitializing(false);

        return verifier;
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        setIsInitializing(false);
        setIsReady(false);
        setRecaptchaVerifier(null);
        return null;
      }
    },
    [isInitializing, isReady, recaptchaVerifier]
  );

  const sendOTP = async (
    phoneNumber: string,
    containerId = "recaptcha-container"
  ) => {
    if (typeof window === "undefined") return null;

    try {
      console.log("Attempting to send OTP to:", phoneNumber);

      // Ensure reCAPTCHA is initialized and ready
      let verifier = recaptchaVerifier;

      if (!verifier || !isReady) {
        console.log("reCAPTCHA not ready, initializing...");
        verifier = await initializeRecaptcha(containerId);

        if (!verifier) {
          throw new Error("Failed to initialize reCAPTCHA. Please try again.");
        }

        // Wait a bit more to ensure it's fully ready
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const { signInWithPhoneNumber } = await import("firebase/auth");

      console.log("Using auth instance:", auth);
      console.log("Using reCAPTCHA verifier:", verifier);

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );
      console.log(
        "OTP sent successfully, confirmation result:",
        confirmationResult
      );

      return confirmationResult;
    } catch (error) {
      console.error("Error sending OTP:", error);

      // Clear verifier on error and reset state
      // clearRecaptcha();

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
        } else if (error.message.includes("auth/too-many-requests")) {
          throw new Error("Too many requests. Please try again later.");
        } else if (error.message.includes("reCAPTCHA")) {
          throw new Error("reCAPTCHA verification failed. Please try again.");
        }
      }

      throw error;
    }
  };

  return {
    initializeRecaptcha,
    sendOTP,
    // clearRecaptcha,
    recaptchaVerifier,
    isInitializing,
    isReady,
  };
}
