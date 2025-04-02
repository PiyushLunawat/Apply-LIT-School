import { json } from "@remix-run/node";
import {
  accessTokenCookie,
  refreshTokenCookie,
  userIdCookie,
} from "~/cookies/cookies"; // Import cookies

export const action = async () => {
  try {
    // Clear cookies
    const headers = new Headers();

    headers.append(
      "Set-Cookie",
      await accessTokenCookie.serialize("", { maxAge: 0 })
    );
    headers.append(
      "Set-Cookie",
      await refreshTokenCookie.serialize("", { maxAge: 0 })
    );
    headers.append(
      "Set-Cookie",
      await userIdCookie.serialize("", { maxAge: 0 })
    );

    return json(
      { success: true, message: "Logged out successfully" },
      { headers }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return json({ success: false, message: "Logout failed" });
  }
};
