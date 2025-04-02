import { LoaderFunction } from "@remix-run/node";
import vCardsJS from "vcards-js";

// API route to generate vCard dynamically
export const loader: LoaderFunction = async ({ params, request }) => {
  const { id } = params;
  const url = new URL(request.url);
  const paramsData = url.searchParams;

  if (!id) {
    return new Response("Missing ID", { status: 400 });
  }

  // Extract user data from query params
  const firstName = paramsData.get("firstName") || "Unknown";
  const lastName = paramsData.get("lastName") || "";
  const phone = paramsData.get("phone") || "";
  const email = paramsData.get("email") || "";
  const profileUrl = paramsData.get("profileUrl") || "";
  const linkedIn = paramsData.get("linkedIn") || "";
  const instagram = paramsData.get("instagram") || "";

  // Generate vCard
  const vCard = vCardsJS();
  vCard.firstName = firstName;
  vCard.lastName = lastName;
  vCard.organization = "LIT School";
  vCard.workPhone = phone;
  vCard.email = email;
  vCard.photo.attachFromUrl(profileUrl, "JPEG");
  vCard.socialUrls['linkedIn'] = linkedIn;
  vCard.socialUrls['instagram'] = instagram;

  // Convert vCard to a formatted string
  const vCardString = vCard.getFormattedString();

  // Return vCard file as a response
  return new Response(vCardString, {
    headers: {
      "Content-Type": "text/vcard",
      "Content-Disposition": `attachment; filename=${firstName}-${lastName}.vcf`,
    },
  });
};
