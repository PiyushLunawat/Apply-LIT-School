import { redirect, useNavigate } from '@remix-run/react';
import fetchIntercept from 'fetch-intercept';
import Cookies from 'js-cookie';

export const RegisterInterceptor = () => {
        fetchIntercept.register({
          request: (url, config = {}) => {
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
              // The actual route used by your pages:
              "/login",
              "/sign-up"
            ];
      
            const isPublic = publicEndpoints.some((endpoint) => url.includes(endpoint));
            const token = Cookies.get("user-token");
      
            // If not public and no token, do a client redirect
            if (!isPublic && !token) {
            //   window.location.href = "/login";
              // optionally abort or let the request pass (depending on your needs)
              return [url, config];
            }
      
            // If not public but we do have a token, attach it
            if (!isPublic && token) {
              config.headers = {
                ...config.headers,
                authorization: `Bearer ${token}`,
              };
            }
            return [url, config];
          },
      
          response: (response) => response,
        }); 
};
