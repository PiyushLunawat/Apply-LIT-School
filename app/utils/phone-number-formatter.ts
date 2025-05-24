export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all spaces and non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // Add space after country code for Indian numbers
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return cleaned.replace("+91", "+91 ");
  }

  // Add space after country code for US numbers
  if (cleaned.startsWith("+1") && cleaned.length === 12) {
    return cleaned.replace("+1", "+1 ");
  }

  // For other country codes, add space after first 3-4 digits
  const match = cleaned.match(/^(\+\d{1,4})(\d+)$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return cleaned;
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  const formatted = formatPhoneNumber(phoneNumber);

  // Basic validation for Indian numbers
  if (formatted.startsWith("+91 ")) {
    const number = formatted.replace("+91 ", "");
    return number.length === 10 && /^\d{10}$/.test(number);
  }

  // Basic validation for US numbers
  if (formatted.startsWith("+1 ")) {
    const number = formatted.replace("+1 ", "");
    return number.length === 10 && /^\d{10}$/.test(number);
  }

  // Basic validation for other international numbers
  return formatted.length >= 10 && formatted.length <= 15;
}
