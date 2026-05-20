const cron = require("node-cron");
const Appointment = require("../models/Appointment");

// ⏰ Runs every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("⏰ Running cron job...");

  try {
    const now = new Date();

    // ✅ Get only required fields (lean = no validation)
    const appointments = await Appointment.find({
      status: { $in: ["pending", "accepted", "rescheduled"] },
    }).lean();

    for (let appt of appointments) {
      const apptDateTime = new Date(`${appt.date}T${appt.endTime}`);

      if (apptDateTime < now) {
        // ✅ DIRECT UPDATE (NO VALIDATION TRIGGERED)
        await Appointment.updateOne(
          { _id: appt._id },
          { $set: { status: "completed" } }
        );
      }
    }

    console.log("✅ Past appointments updated");
  } catch (err) {
    console.error("❌ Cron error:", err.message);
  }
});