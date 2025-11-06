const express = require("express");
const mongoose = require("mongoose");
const Lead = require('../models/Lead.js');
const Timline = require('../models/Timeline.js');
const Timeline = require("../models/Timeline.js");

const router = express.Router();

// Create Lead
router.post("/", async (req, res) => {
  try {
    let assignedTo;
    if (req.user.role === "employee") {
      assignedTo = req.user._id; // employee can only assign to self;
    } else {
        assignedTo = req.body.assignedTo;
      if (!req.body.assignedTo || !mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
        return res.status(400).json({ error:true , message:"Invalid or missing assignedTo ID" });
      }
      
    }
    const lead = new Lead({
      ...req.body,
      assignedTo
    });
    await lead.save();
    res.status(201).json({error:false , message:'lead succesfully added' , lead});
  } catch (err) {
    res.status(400).json({ error:true , message:err.message});
  }
});

// Get leads (admin sees all, employee sees only assigned)
router.get("/", async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const leads = await Lead.find(filter).populate("assignedTo", "_id name role");
    const timeline = await Timeline.find({},{action:1,from:1,to:1,createdAt:1,name:1,_id:0});
    res.json({leads,timeline});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one Lead
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name role");
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    if (req.user.role !== "admin" && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Lead
router.put("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    console.log(lead);
    
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    const oldLead = lead.toObject();

    if (req.user.role !== "admin" && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    Object.assign(lead, req.body);
    await lead.save();
    const changedFields = [];
    for (let key in req.body) {
      if(key != 'assignedTo'){
      if (oldLead[key] !== req.body[key]) {
        changedFields.push({ field: key, oldValue: oldLead[key], newValue: req.body[key] });
      }
      }
    }

    // Save timeline updates for each changed field
    for (let change of changedFields) {
      await Timeline.create({
        lead: lead._id,
        user: req.user._id,
        action: `${change.field}_changed`,
        from: change.oldValue,
        to: change.newValue,
        name:` by ${req.user.name}`
      });
    }
    res.json({lead,error:false,message:'lead updated successfully'});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/empTrack/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    if (req.user.role !== "admin" && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Partial update: only fields present in req.body will change
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true } // returns updated doc & runs schema validators
    );

    res.json({ lead: updatedLead, error: false, message: "Lead updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Delete Lead
router.delete("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error:true , message:'Lead not found' });

    if (req.user.role !== "admin" && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ error:true , message:'forbidden' });
    }

    await lead.deleteOne();
    res.status(200).json({ error:false, message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ error:true,message: err.message });
  }
});

module.exports = router;
