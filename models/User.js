const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: Number,
  email: { type: String, required: true, unique: true },
//   address: String,
//   designation: String,
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  password: { type: String, required: true } ,  // <-- missing before
  empCode : {type:String, required:true} , 
  profileImage : {type:String , required:true}
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

module.exports = mongoose.model("User", userSchema);
