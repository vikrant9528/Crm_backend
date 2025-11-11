const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const leadRoutes = require("./routes/leadRoutes.js");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const followupRoutes = require("./routes/followupRoutes");
const auth = require("./middleware/auth");
require("dotenv").config();

const app = express();
app.use(cors({origin:'*'}));
app.use(express.json());

// ✅ Your routes here...
app.get("/alive", (req, res) => {
  res.send("✅ Server Active");
});
// Public routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/followups",auth, followupRoutes);
// Protected routes (require JWT)
app.use("/leads", auth, leadRoutes);
const PORT = process.env.PORT;
const SERVER_URL = process.env.SERVER_URL;

cron.schedule("*/14 3-16 * * *", async () => {
  // 3-16 UTC = 9AM - 10PM IST
  try {
    await axios.get(SERVER_URL);
    console.log("🔄 Keep-alive ping sent ✅");
  } catch (err) {
    console.log("⚠️ Ping failed:", err.message);
  }
});
app.listen(PORT, () => console.log(`Server running${PORT}`));
mongoose
  .connect(process.env.DATABASE_URL)
  //  .connect('mongodb://localhost:27017/crm')
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
