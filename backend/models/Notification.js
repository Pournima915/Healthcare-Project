const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userEmail:String,
  message:String,
  seen:{type:Boolean,default:false},
  createdAt:{type:Date,default:Date.now}
});

module.exports = mongoose.model("Notification",schema);
