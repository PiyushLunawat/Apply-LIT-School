// app/routes/api/set-cookies.ts
import { json } from "@remix-run/node";
import {
  accessTokenCookie,
  refreshTokenCookie,
  userIdCookie,
} from "~/cookies/cookies"; // Import cookies
import { commitSession } from "~/cookies/sessions/sessionStore"; // Session commit utility

export const action = async ({ request }: { request: Request }) => {
  const { accessToken, refreshToken, userId } = await request.json();

  if (accessToken && refreshToken && userId) {
    try {
      // Prepare cookies
      const headers = new Headers();

      headers.append(
        "Set-Cookie",
        await accessTokenCookie.serialize(accessToken)
      );
      headers.append(
        "Set-Cookie",
        await refreshTokenCookie.serialize(refreshToken)
      );
      headers.append("Set-Cookie", await userIdCookie.serialize(userId));

      // Optionally, set a session or any other logic here

      return json(
        { success: true, message: "Cookies set successfully" },
        { headers }
      );
    } catch (error) {
      console.error("Error setting cookies:", error);
      return json({ success: false, message: "Failed to set cookies" });
    }
  }

  return json({ success: false, message: "Missing required data" });
};
