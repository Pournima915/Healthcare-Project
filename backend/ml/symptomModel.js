
exports.predict = (symptoms) => {
  try {
    // ✅ Safety check
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return "No symptoms provided";
    }

    // Convert to lowercase string for matching
    const s = symptoms.join(" ").toLowerCase();

    // ✅ Basic rule-based AI (you can upgrade later)

    if (s.includes("fever") && s.includes("cough")) {
      return "Possible Flu or Viral Infection";
    }

    if (s.includes("headache") && s.includes("nausea")) {
      return "Possible Migraine";
    }

    if (s.includes("chest pain")) {
      return "⚠️ Possible Heart Issue - Consult Cardiologist Immediately";
    }

    if (s.includes("stomach pain") || s.includes("vomiting")) {
      return "Possible Gastric Problem";
    }

    if (s.includes("skin") || s.includes("rash")) {
      return "Possible Skin Allergy - Consult Dermatologist";
    }

    return "General Checkup Recommended";
  } catch (err) {
    console.log("❌ AI Prediction Error:", err);
    return "Error in prediction";
  }
};