import fetchIntercept from "fetch-intercept";
import Cookies from "js-cookie";
import { getRefreshToken } from "~/api/authAPI";

// Modify RegisterInterceptor to refresh the token if only accessToken is available
let refreshingToken = false; // Flag to prevent infinite refresh loop

export const RegisterInterceptor = (
  accessToken?: string,
  refreshToken?: string,
  setIsUnauthorized?: (state: boolean) => void
) => {
  fetchIntercept.register({
    request: async (url, config = {}) => {
      if (typeof url !== "string" || !url.trim()) {
        console.log("Invalid URL: Expected a string, but got:", url);
        return [url, config]; // Return as is if URL is not a string
      }
      console.log("URL:", url);

      // Skip Firebase endpoints
      if (
        url.includes("googleapis.com") ||
        url.includes("firebase") ||
        url.includes("firebaseapp.com")
      ) {
        console.log("Skipping Firebase or Google API endpoints.");
        return [url, config];
      }

      const publicEndpoints = [
        "/auth/signup",
        "/auth/login",
        "/auth/resend-otp",
        "/auth/verify-otp",
        "/auth/refresh-token",
        "/student/verify-mobile-number",
        "/student/verify-otp-number",
        "/student/profile",
        "/student/interviewers-list",
        "admin/cohort",
        "admin/program",
        "admin/center",
        "/set-cookies",
        "/logout",
        "/application",
        "/dashboard",
      ];

      const isPublic = publicEndpoints.some((endpoint) =>
        url.includes(endpoint)
      );

      console.log("isPublic", !!isPublic, accessToken, refreshToken);

      // If both accessToken and refreshToken are not available, trigger the unauthorized state
      // if (!isPublic && !accessToken && !refreshToken) {
      //   console.log("No Access Token or Refresh Token");

      //   if (setIsUnauthorized) {
      //     setIsUnauthorized(true); // Set unauthorized state to show login dialog
      //   }

      //   return [url, config];
      // }

      // If accessToken is missing but refreshToken is available, call the refresh-token API
      if (!isPublic && !accessToken && refreshToken && !refreshingToken) {
        console.log(
          "Access Token is missing, using Refresh Token to get new Access Token",
          refreshToken
        );

        const x = refreshToken;

        const refPayload = {
          refreshToken: x,
        };

        console.log("ref I", refPayload);
        const response = await getRefreshToken(refPayload);

        console.log("fvev", response);
        // Prevent multiple refreshes for the same request
        refreshingToken = true;

        try {
          console.log("fvefefev", refPayload);

          const response = await getRefreshToken({ refreshToken });

          console.log("deeeeeedeeedee", response);

          const responseData = await response.json();

          if (response.ok && responseData?.success) {
            // Update cookies with new tokens
            Cookies.set("studentAccessToken", response?.accessToken, {
              secure: true,
              sameSite: "Strict",
            });
            Cookies.set("studentRefreshToken", response?.refreshToken, {
              secure: true,
              sameSite: "Strict",
            });

            // Attach the new accessToken to the request headers
            config.headers = {
              ...config.headers,
              authorization: `Bearer ${responseData?.accessToken}`,
            };
          } else {
            console.error("Failed to refresh tokens.");
            if (setIsUnauthorized) setIsUnauthorized(true); // Trigger unauthorized state
          }
        } catch (error) {
          console.error("Error during refresh token request:", error);
          if (setIsUnauthorized) setIsUnauthorized(true); // Trigger unauthorized state
        } finally {
          // Reset the flag after the refresh process is done
          refreshingToken = false;
        }

        return [url, config];
      }

      // If both tokens are available, attach accessToken to the request header
      if (!isPublic && accessToken) {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${accessToken}`,
        };
      }

      return [url, config];
    },
  });
};
