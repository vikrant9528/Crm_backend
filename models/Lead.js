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
  followUp: {type: Date,required: true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", leadSchema);
