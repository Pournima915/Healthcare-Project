const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    
    if (file.fieldname === "certificate") {
      cb(null, "uploads/certificates");
    } else if (file.fieldname === "profileImage") {
      cb(null, "uploads/profile");
    } else {
      cb(null, "uploads/others");
    }
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }

});


const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png/;

  const ext = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (ext) cb(null, true);
  else cb(new Error("Only PDF/JPG/PNG allowed"));
};

module.exports = multer({ storage, fileFilter });