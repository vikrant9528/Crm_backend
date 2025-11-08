const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../cloudinary");

router.post("/login", async (req, res) => {
  console.log('login route hit');
  
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: true , message:"Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: true , message:"Invalid credentials" });

  const result = await User.findOne({email})
  const token = user.generateToken();
  res.json({error:false , token , message:'login successfull' , details:{_id:result._id,role:result.role,profileImage:result.profileImage , name:result.name} });
});

router.post("/signup", upload.single("file"), async (req, res) => {
  try {
    const { name, phone, email, role, password, empCode } = req.body;
    const exists = await User.findOne({ email });

    if (exists) return res.status(400).json({ error: true, message: "Email already exists" });

    let profileImage = null;

    if (req.file) {
      console.log(req.file);
      
      const result = await cloudinary.uploader.upload_stream(
        { folder: "userData" },
        async (error, uploadResult) => {
          if (error) return res.status(500).json({ error: true, message: error.message });

          profileImage = uploadResult.secure_url;

          const user = new User({
            name,
            phone,
            email,
            role,
            password,
            empCode,
            profileImage
          });

          await user.save();
          const token = user.generateToken();

          return res.status(201).json({
            error: false,
            user: { id: user._id, name: user.name, role: user.role, profileImage },
            token,
            message: "Signup successfully"
          });
        }
      );

      result.end(req.file.buffer);
      return; // Stop execution here because Cloudinary uploads async
    }

    // If no file upload
    const user = new User({ name, phone, email, role, password, empCode });
    await user.save();
    const token = user.generateToken();
    res.status(201).json({
      error: false,
      user: { id: user._id, name: user.name, role: user.role },
      token,
      message: "Signup successfully"
    });

  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
});

module.exports = router;