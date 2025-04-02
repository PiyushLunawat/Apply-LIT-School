import { json, LoaderFunction } from "@remix-run/node";
import { redirect, useNavigate } from "@remix-run/react";
import fetchIntercept from "fetch-intercept";
import Cookies from "js-cookie";

export const RegisterInterceptor = (
  accessToken: string
  // setIsUnauthorized: (state: boolean) => void
) => {
  fetchIntercept.register({
    request: async (url, config = {}) => {
      if (typeof url !== "string" || !url.trim()) {
        console.error("Invalid URL: Expected a string, but got:", url);
        return [url, config]; // Return as is if URL is not a string
      }
      console.log("fucccc", accessToken);
      // Skip Firebase endpoints
      if (
        url.includes("googleapis.com") ||
        url.includes("firebase") ||
        url.includes("firebaseapp.com")
      ) {
        return [url, config];
      }

      const publicEndpoints = [
        "/auth/signup",
        "/auth/login",
        "/auth/resend-otp",
        "/auth/verify-otp",
        "/student/verify-mobile-number",
        "/student/verify-otp-number",
      ];

      const isPublic = publicEndpoints.some((endpoint) =>
        url.includes(endpoint)
      );

      // const cookieHeader = request.headers.get("Cookie");
      // const accessToken = await accessTokenCookie.parse(cookieHeader);

      // If not public and no token, do a client redirect
      if (!isPublic && !accessToken) {
        //   window.location.href = "/login";
        // optionally abort or let the request pass (depending on your needs)
        return [url, config];
      }

      // If not public but we do have a token, attach it
      if (!isPublic && accessToken) {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${accessToken}`,
        };
      }
      return [url, config];
    },

    // response: (response) => {
    //   console.log("fucxkkkk auth");
    //   if (response.status === 401) {
    //     // setIsUnauthorized(true);
    //   }
    //   return response;
    // },
  });
};
