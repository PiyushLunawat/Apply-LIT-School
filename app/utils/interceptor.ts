import { redirect, useNavigate } from '@remix-run/react';
import fetchIntercept from 'fetch-intercept';
import Cookies from 'js-cookie';

export const RegisterInterceptor = () => {

    fetchIntercept.register({
        request: function (url, config = {}) {

            if (
                url.includes("googleapis.com") ||
                url.includes("firebase") ||
                url.includes("firebaseapp.com")
              ) {
                // Return without modifying headers or interfering
                return [url, config];
              }
          // Define endpoints that do NOT need a token (public routes)
          const publicEndpoints = [
            "/auth/signup",
            "/auth/login",
            "/auth/resend-otp",
            "/auth/verify-otp",
            "/student/verify-mobile-number",
            "/student/verify-otp-number",
          ];
      
          // If this URL is in the public list, skip token checks
          const isPublic = publicEndpoints.some((endpoint) => url.includes(endpoint));
      
          // Get token
          const token = Cookies.get("user-token");
      
          // If it is NOT a public endpoint, but we have no token, redirect
          if (!isPublic && !token) {
            // For a Remix or React app, you can simply do:
            window.location.href = "/login";
            // or: navigate("/login") if you have a router instance available
            // Then return, so the request doesn’t continue.
            return [url, config];
          }
      
          // Otherwise, if not public and we *do* have a token, set the header
          if (!isPublic && token) {
            config.headers = {
              ...config.headers,
              authorization: `Bearer ${token}`,
            };
          }
      
          return [url, config];
        },
      
        requestError: function (error) {
          return Promise.reject(error);
        },
      
        response: function (response) {
          return response;
        },
      
        responseError: function (error) {
          return Promise.reject(error);
        }
      });
      
};
