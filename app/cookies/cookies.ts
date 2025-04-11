import { createCookie } from "@remix-run/node";

// Create the cookie for accessToken
export const accessTokenCookie = createCookie("studentAccessToken", {
  // httpOnly: true, // Prevent client-side access
  // secure: true, // Ensure cookies are sent over HTTPS
  // sameSite: "strict", // Restrict cross-site cookie sending
  maxAge: 60 * 60 * 2, // 2 hours in seconds
});

// Create the cookie for refreshToken
export const refreshTokenCookie = createCookie("studentRefreshToken", {
  // httpOnly: true, // Prevent client-side access
  // secure: true, // Ensure cookies are sent over HTTPS
  // sameSite: "strict", // Restrict cross-site cookie sending
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
});

// Create the cookie for user ID (id)
export const userIdCookie = createCookie("studentId", {
  // httpOnly: true, // Prevent client-side access
  // secure: true, // Ensure cookies are sent over HTTPS
  // sameSite: "strict", // Restrict cross-site cookie sending
  maxAge: 60 * 60 * 2, // 1 day in seconds (you can adjust it)
});
