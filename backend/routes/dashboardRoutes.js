const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");
const { patientDashboard, doctorDashboard, adminDashboard } = require("../controllers/dashboardController");

router.get("/patient", protect, roleCheck("PATIENT"), patientDashboard);
router.get("/doctor", protect, roleCheck("DOCTOR"), doctorDashboard);
router.get("/admin", protect, roleCheck("ADMIN"), adminDashboard);

module.exports = router;
