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
  res.json({error:false , token , message:'login successfull' , details:{_id:result._id,role:result.role,profileImage:result.profileImage , name:result.name , email:result.email} });
});

router.post("/signup", upload.single("file"), async (req, res) => {
  try {
    const { name, phone, email, role, password, empCode } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: true, message: "Email already exists" });

    let profileImage = null;

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "userData" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const uploadResult = await uploadToCloudinary();
      profileImage = uploadResult.secure_url;
    }

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

  } catch (err) {
    return res.status(400).json({ error: true, message: err.message });
  }
});


module.exports = router;