const cron = require("node-cron");
const Child = require("../models/Child");
const sendNotification = require("./sendNotification");

// Runs once a day at 8:00 AM (server time). Checks every approved child's
// schedule for vaccines due exactly today or exactly tomorrow, and notifies
// the parent for each one found. If the child's visit type is "home", the
// hospital is notified too, since they need to prepare to visit the address.
function startVaccineReminderCron() {
  cron.schedule("0 8 * * *", async () => {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      const startOfDayAfter = new Date(startOfTomorrow);
      startOfDayAfter.setDate(startOfDayAfter.getDate() + 1);

      const children = await Child.find({
        status: "Approved",
        "schedule.status": "Pending",
      })
        .populate("schedule.vaccine", "name")
        .populate("parent", "name email notificationPrefs")
        .populate("hospital", "name email notificationPrefs");

      for (const child of children) {
        if (!child.parent) continue;

        for (const item of child.schedule) {
          if (item.status !== "Pending" || !item.dueDate) continue;

          const due = new Date(item.dueDate);
          const isToday = due >= startOfToday && due < startOfTomorrow;
          const isTomorrow = due >= startOfTomorrow && due < startOfDayAfter;
          if (!isToday && !isTomorrow) continue;

          const vaccineName = item.vaccine?.name || "a vaccine";
          const when = isToday ? "today" : "tomorrow";

          await sendNotification({
            recipientId: child.parent._id,
            role: "parent",
            title: `Vaccine due ${when}`,
            message: `${child.childName}'s ${vaccineName} vaccine is due ${when}.`,
            category: "vaccineReminders",
            user: child.parent,
            smsEligible: true,
          });

          // ✅ Home visit — the hospital needs to know too, since they're
          // the ones travelling to the child's address.
          if (child.requestType === "home" && child.hospital) {
            await sendNotification({
              recipientId: child.hospital._id,
              role: "hospital",
              title: `Home visit due ${when}`,
              message: `${child.childName}'s ${vaccineName} home visit is due ${when} at ${child.address || "the registered address"}.`,
              category: "vaccineReminders",
              user: child.hospital,
              smsEligible: true,
            });
          }
        }
      }
    } catch (error) {
      console.error("Vaccine reminder cron failed:", error.message);
    }
  });
}

module.exports = startVaccineReminderCron;