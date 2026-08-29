const Notification = require("../models/Notification");
const Parent = require("../models/Parent");
const Hospital = require("../models/Hospital");
const Admin = require("../models/Admin");
const sendEmail = require("./sendEmail");
const sendSMS = require("./sendSMS");

const roleModelMap = { parent: Parent, hospital: Hospital, admin: Admin };

/**
 * Central place to notify a user across every channel they've allowed.
 *
 * @param {Object} params
 * @param {string} params.recipientId - Parent/Hospital/Admin _id
 * @param {string} params.role - "parent" | "hospital" | "admin"
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.category] - e.g. "vaccineReminders", "hospitalRequests".
 *   If given, that specific toggle must ALSO be on (in addition to the
 *   general emailAlerts/smsAlerts toggles) for email/SMS to go out.
 * @param {Object} [params.user] - the user doc, if already fetched (avoids
 *   an extra DB call). If omitted, it's fetched using recipientId + role.
 * @param {boolean} [params.smsEligible=false] - SMS is only ever sent for
 *   notifications explicitly marked eligible (vaccine due-date reminders,
 *   hospital approving a child's registration, and a vaccine's next due
 *   date being set). Every other notification type — ratings, signups,
 *   stock/slot alerts, etc. — never sends SMS even if the user's SMS
 *   Alerts toggle is on, to keep SMS costs limited to time-sensitive events.
 */
const sendNotification = async ({ recipientId, role, title, message, category, user, smsEligible = false }) => {
  try {
    // 1. Always create the in-app notification — shown in the bell icon
    // regardless of email/SMS preferences.
    await Notification.create({ recipient: recipientId, role, title, message });

    // 2. Get the full user doc (for contact info + preferences) if not
    // already passed in.
    let userDoc = user;
    if (!userDoc) {
      const Model = roleModelMap[role];
      if (!Model) return;
      userDoc = await Model.findById(recipientId);
    }
    if (!userDoc) return;

    const prefs = userDoc.notificationPrefs || {};

    // 3. Category-specific opt-out — e.g. if this is a "vaccineReminders"
    // notification, that toggle must be on (not just emailAlerts/smsAlerts).
    const categoryAllowed = category ? prefs[category] !== false : true;
    if (!categoryAllowed) return;

    // 4. Email — opt-out (sent unless explicitly turned off)
    if (prefs.emailAlerts !== false && userDoc.email) {
      try {
        await sendEmail({ to: userDoc.email, subject: title, html: `<p>${message}</p>` });
      } catch (err) {
        console.error("sendNotification: email failed:", err.message);
      }
    }

    // 5. SMS — only for events explicitly marked eligible (see smsEligible
    // doc above), AND only if the user has opted in to SMS Alerts.
    if (smsEligible && prefs.smsAlerts === true && userDoc.phone) {
      await sendSMS(userDoc.phone, `${title}: ${message}`);
    }
  } catch (error) {
    console.error("sendNotification failed:", error.message);
  }
};

module.exports = sendNotification;