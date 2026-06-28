const cron = require("node-cron");
const Appointment = require("../models/Appointment");

cron.schedule("*/30 * * * *", async () => {
  console.log("⏰ Running cron job...");

  try {
    const now = new Date();
    const appointments = await Appointment.find({
      status: { $in: ["pending", "accepted", "rescheduled"] },
    }).lean();

    for (let appt of appointments) {
      const apptDateTime = new Date(`${appt.date}T${appt.endTime}`);

      if (apptDateTime < now) {
        
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