import {
  accessTokenCookie,
  refreshTokenCookie,
  userIdCookie,
} from "~/cookies/cookies";

export const setCookiesClientSide = async (
  accessToken: string,
  refreshToken: string,
  userId: string
) => {
  try {
    // Set cookies using document.cookie
    document.cookie = await accessTokenCookie.serialize(accessToken);
    document.cookie = await refreshTokenCookie.serialize(refreshToken);
    document.cookie = await userIdCookie.serialize(userId);

    // Verify cookies were set
    if (
      !document.cookie.includes("access-token") ||
      !document.cookie.includes("refresh-token") ||
      !document.cookie.includes("user-id")
    ) {
      throw new Error("Failed to set cookies");
    }
  } catch (error) {
    console.error("Error setting cookies:", error);
    throw error;
  }
};
