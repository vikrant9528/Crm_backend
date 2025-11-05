const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/login", async (req, res) => {
  console.log('login route hit');
  
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: true , message:"Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: true , message:"Invalid credentials" });

  const result = await User.findOne({email})
  const token = user.generateToken();
  res.json({error:false , token , message:'login successfull' , details:{_id:result._id,role:result.role} });
});

router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email ,role ,password , empCode } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error:true , message:"Email already exists" });

    const user = new User({   name, phone, email ,role ,password , empCode });
    await user.save();

    const token = user.generateToken();
    res.status(201).json({ error:false , user: { id: user._id, name: user.name, role: user.role }, token , message:'signup successfully' });
  } catch (err) {
    res.status(400).json({ error:true , message:err.message });
  }
});

module.exports = router;