const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Lead = require('../models/Lead.js');
const router = express.Router();

router.get('/:id',async(req,res)=>{
  try{
    const today = new Date();
    today.setHours(0, 0, 0, 0);   // start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const endOfDayAfter = new Date(dayAfter);
    endOfDayAfter.setHours(23, 59, 59, 999);

  const user = await User.findById(req.params.id);
  if(!user) return res.status(404).json({ error:true, message:"User not found" });
    let followups = await Lead.find({   
      followUp: {
        $gte: today,
        $lte: endOfDayAfter
      } 
}).populate("assignedTo",  "_id name role");
  const grouped = {
  today: [],
  tomorrow: [],
  dayAfterTomorrow: []
};
if(user.role !== "admin") followups = followups.filter(f =>  String(f.assignedTo._id) === String(user._id));
  followups.forEach(f => {
    const d = new Date(f.followUp);
    const diff = Math.floor((d.getTime() - today.getTime()) / (1000*60*60*24));
    if (diff === 0) grouped.today.push(f);
    else if (diff === 1) grouped.tomorrow.push(f);
    else if (diff === 2) grouped.dayAfterTomorrow.push(f);
  });
  // console.log(grouped);
  res.status(200).json({error:false , followups:grouped , message:"Followups fetched successfully"});

  }catch(err){
    res.status(500).json({ error: err.message });
  }
})

module.exports = router;