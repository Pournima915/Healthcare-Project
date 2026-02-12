const express = require("express");
const router = express.Router();

const { registerDoctor, loginDoctor } = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// Public routes
router.post("/register", registerDoctor);
router.post("/login", loginDoctor);

// Protected route
router.get(
  "/dashboard",
  authMiddleware,
  roleCheck("doctor"),
  (req, res) => {
    res.json({
      message: "Welcome Doctor Dashboard",
      user: req.user
    });
  }
);

module.exports = router;
