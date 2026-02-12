const patientDashboard = (req, res) => {
  res.json({ message: "Welcome to Patient Dashboard", user: req.user });
};

const doctorDashboard = (req, res) => {
  res.json({ message: "Welcome to Doctor Dashboard", user: req.user });
};

const adminDashboard = (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard", user: req.user });
};

module.exports = { patientDashboard, doctorDashboard, adminDashboard };
