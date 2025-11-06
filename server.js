const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const leadRoutes = require("./routes/leadRoutes.js");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const followupRoutes = require("./routes/followupRoutes");
const auth = require("./middleware/auth");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/followups",auth, followupRoutes);
// Protected routes (require JWT)
app.use("/leads", auth, leadRoutes);
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.DATABASE_URL);
app.listen(PORT, () => console.log("Server running"));
