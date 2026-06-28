const express = require("express");
const router = express.Router();

const Doctor = require("../models/Doctor");
const upload = require("../middleware/upload");

const { registerDoctor, loginDoctor } = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

router.post(
  "/register",
  upload.single("certificate"),
  registerDoctor
);

router.post("/login", loginDoctor);


router.get("/all", async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" })
      .select("-password");

    res.json(doctors);
  } catch (error) {
    console.error("FETCH DOCTORS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/update-profile",
  upload.single("profileImage"), 
  async (req, res) => {
    try {
      const { email, name, specialization, mobile } = req.body;

      const updateData = {
        name,
        specialization,
        mobile,
      };

      if (req.file) {
        updateData.profileImage = req.file.path; 
      }

      const updatedDoctor = await Doctor.findOneAndUpdate(
        { email },
        updateData,
        { new: true }
      ).select("-password");

      res.json(updatedDoctor);

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ message: "Error updating profile" });
    }
  }
);

router.get(
  "/dashboard",
  authMiddleware,
  roleCheck("doctor"),
  (req, res) => {
    res.json({
      message: "Welcome Doctor Dashboard",
      user: req.user,
    });
  }
);

router.post("/logout", async (req, res) => {
  try {
    const { email } = req.body;

    await Doctor.updateOne({ email }, { online: false });

    res.json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;