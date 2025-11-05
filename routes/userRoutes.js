const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const router = express.Router();

router.post("/", async (req, res) => {
    console.log('users routes hit');
    console.log(req.body);
     
  try {
    const user = new User(req.body);
    console.log(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userDetail = await User.findById(req.params.id);
    if(!userDetail) return res.status(404).json({ error:true, message:"User not found" });
    const users = userDetail.role === 'admin' ? await User.find({},{_id:1, name:1, role:1}) : await User.find({ role: { $ne: "admin" } }, "_id name role");
    // // const users = await User.find({ role: { $ne: "admin" } }, "_id name role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// router.get("/:id", async (req, res) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id))
//     return res.status(400).json({ error: "Invalid user ID" });
//   const user = await User.findById(req.params.id);
//   if (!user) return res.status(404).json({ error: "User not found" });
//   res.json(user);
// });

module.exports = router;
