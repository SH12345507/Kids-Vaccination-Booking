// ✅ Uses LifetimeSMS's REST API — reads credentials from .env
// Add these to your .env file:
//   LIFETIMESMS_API_TOKEN=your_api_token_here
//   LIFETIMESMS_API_SECRET=your_api_secret_here
//   LIFETIMESMS_SENDER_NAME=Lifetimesms   (or whatever sender name you registered)

const LIFETIMESMS_URL = "https://lifetimesms.com/plain";

// ✅ LifetimeSMS requires numbers in the format 92xxxxxxxxxx (no +, no leading 0).
// Numbers saved from forms are often local Pakistani format (0300-1234567 or
// 03001234567) or already in +923001234567 — this converts all of those to
// the format LifetimeSMS needs.
const normalizePhoneNumber = (raw) => {
  if (!raw) return raw;
  const digitsOnly = raw.replace(/[^\d]/g, ""); // strip +, spaces, dashes

  if (digitsOnly.startsWith("92")) return digitsOnly; // already 92300...
  if (digitsOnly.startsWith("0")) return `92${digitsOnly.slice(1)}`; // 0300... -> 92300...

  return `92${digitsOnly}`; // fallback — assume local number without leading 0
};

/**
 * Sends an SMS text message via LifetimeSMS.
 * @param {string} to - phone number in any common local/international format
 * @param {string} message - the text content
 */
const sendSMS = async (to, message) => {
  if (!to) {
    console.error("sendSMS: no phone number provided, skipping.");
    return;
  }

  const formattedTo = normalizePhoneNumber(to);

  const params = new URLSearchParams({
    api_token: process.env.LIFETIMESMS_API_TOKEN,
    api_secret: process.env.LIFETIMESMS_API_SECRET,
    to: formattedTo,
    from: process.env.LIFETIMESMS_SENDER_NAME || "Lifetimesms",
    message,
  });

  try {
    const response = await fetch(LIFETIMESMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const result = await response.text();

    // ✅ LifetimeSMS returns JSON like { status, message } — log failures
    // without throwing, so an SMS failure never crashes the request that
    // triggered it (same behavior as before).
    try {
      const parsed = JSON.parse(result);
      if (parsed.status !== 1 && parsed.status !== "1") {
        console.error("LifetimeSMS send failed:", parsed.message || result);
      }
    } catch {
      // response wasn't JSON — just log the raw text for visibility
      console.log("LifetimeSMS response:", result);
    }
  } catch (error) {
    console.error("Failed to send SMS:", error.message);
  }
};

module.exports = sendSMS;