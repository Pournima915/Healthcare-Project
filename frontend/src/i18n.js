import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 🔥 Detect language
const detectLanguage = () => {
  const saved = localStorage.getItem("lang");
  if (saved) return saved;

  const browserLang = navigator.language;

  if (browserLang.startsWith("hi")) return "hi";
  if (browserLang.startsWith("mr")) return "mr";

  return "en";
};

const resources = {
  en: {
    translation: {
      // NAV
      dashboard: "Dashboard",
      appointments: "Appointments",
      profile: "Profile",
      book: "Book Appointment",
      chat: "Chat",
      symptom: "Symptom Checker",
      call: "Call",

      // STATUS
      pending: "Pending",
      accepted: "Accepted",
      rescheduled: "Rescheduled",

      // BOOKING
      findDoctors: "Find Doctors",
      searchLocation: "Search by location",
      confirm: "Confirm Appointment",
      selectDate: "Select Date",
      selectTime: "Select Time",
      reason: "Enter reason...",

      // DOCTORS
      onlineDoctors: "Online Doctors",
      noDoctors: "No doctors online",

      // CALL
      video: "Video Call",
      voice: "Voice Call",
      calling: "Calling doctor...",
      rejected: "Doctor rejected the call",

      // SPECIALISTS
      Dentist: "Dentist",
      Cardiologist: "Cardiologist",
      Neurologist: "Neurologist",
      Orthopedic: "Orthopedic",
      Pediatrician: "Pediatrician",
      Gynecologist: "Gynecologist",
      Psychiatrist: "Psychiatrist",
      "General Physician": "General Physician",

      noAppointments: "No appointments yet",
      doctor: "Doctor",
      date: "Date",
      time: "Time",
      status: "Status",
      message: "Message",
      waiting: "Waiting",
      waitingApproval: "Waiting for doctor approval",
      confirmed: "Appointment confirmed",
      rescheduledMsg: "Appointment rescheduled",
      notSet: "Not set"
          }
  },

  hi: {
    translation: {
      dashboard: "डैशबोर्ड",
      appointments: "अपॉइंटमेंट",
      profile: "प्रोफाइल",
      book: "अपॉइंटमेंट बुक करें",
      chat: "चैट",
      symptom: "लक्षण जांच",
      call: "कॉल",

      pending: "लंबित",
      accepted: "स्वीकृत",
      rescheduled: "पुनर्निर्धारित",

      findDoctors: "डॉक्टर खोजें",
      searchLocation: "स्थान से खोजें",
      confirm: "अपॉइंटमेंट की पुष्टि करें",
      selectDate: "तारीख चुनें",
      selectTime: "समय चुनें",
      reason: "कारण लिखें...",

      onlineDoctors: "ऑनलाइन डॉक्टर",
      noDoctors: "कोई डॉक्टर ऑनलाइन नहीं",

      video: "वीडियो कॉल",
      voice: "वॉइस कॉल",
      calling: "डॉक्टर को कॉल किया जा रहा है...",
      rejected: "डॉक्टर ने कॉल अस्वीकार कर दिया",

      Dentist: "दंत चिकित्सक",
      Cardiologist: "हृदय रोग विशेषज्ञ",
      Neurologist: "न्यूरोलॉजिस्ट",
      Orthopedic: "हड्डी विशेषज्ञ",
      Pediatrician: "बाल रोग विशेषज्ञ",
      Gynecologist: "स्त्री रोग विशेषज्ञ",
      Psychiatrist: "मनोचिकित्सक",
      "General Physician": "सामान्य चिकित्सक",


      noAppointments: "No appointments yet",
      doctor: "Doctor",
      date: "Date",
      time: "Time",
      status: "Status",
      message: "Message",
      waiting: "Waiting",
      waitingApproval: "Waiting for doctor approval",
      confirmed: "Appointment confirmed",
      rescheduledMsg: "Appointment rescheduled",
      notSet: "Not set"
    }
  },

  mr: {
    translation: {
      dashboard: "डॅशबोर्ड",
      appointments: "अपॉइंटमेंट",
      profile: "प्रोफाइल",
      book: "भेट बुक करा",
      chat: "चॅट",
      symptom: "लक्षण तपासणी",
      call: "कॉल",

      pending: "प्रलंबित",
      accepted: "स्वीकृत",
      rescheduled: "पुनर्नियोजित",

      findDoctors: "डॉक्टर शोधा",
      searchLocation: "स्थानानुसार शोधा",
      confirm: "भेट निश्चित करा",
      selectDate: "तारीख निवडा",
      selectTime: "वेळ निवडा",
      reason: "कारण लिहा...",

      onlineDoctors: "ऑनलाइन डॉक्टर",
      noDoctors: "कोणताही डॉक्टर ऑनलाइन नाही",

      video: "व्हिडिओ कॉल",
      voice: "व्हॉइस कॉल",
      calling: "डॉक्टरला कॉल करत आहे...",
      rejected: "डॉक्टरने कॉल नाकारला",

      Dentist: "दंतवैद्य",
      Cardiologist: "हृदयरोग तज्ञ",
      Neurologist: "न्यूरोलॉजिस्ट",
      Orthopedic: "अस्थिरोग तज्ञ",
      Pediatrician: "बालरोग तज्ञ",
      Gynecologist: "स्त्रीरोग तज्ञ",
      Psychiatrist: "मनोचिकित्सक",
      "General Physician": "सामान्य डॉक्टर",


      noAppointments: "No appointments yet",
      doctor: "Doctor",
      date: "Date",
      time: "Time",
      status: "Status",
      message: "Message",
      waiting: "Waiting",
      waitingApproval: "Waiting for doctor approval",
      confirmed: "Appointment confirmed",
      rescheduledMsg: "Appointment rescheduled",
      notSet: "Not set"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;