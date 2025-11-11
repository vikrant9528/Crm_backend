const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: Number,
  email: String,
  source: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "lost", "closed", "pending", "completed","not_interested","site_visit","closed"],
    default: "new"
  },
  budget: String,
  notes: String,
  followUp: {type: Date},
  time: {type:String},
  call_track:{type:Number,default:0},
  all_call_track:{type:Number},
  all_whatsapp_track:{type:Number},
  whatsapp_track:{type:Number,default:0},
  createdAt: { type: Date, default: Date.now }
},{timestamps:true});

module.exports = mongoose.model("Lead", leadSchema);
