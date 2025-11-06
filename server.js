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
app.use(cors({origin:'*'}));
app.use(express.json());

// Public routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/followups",auth, followupRoutes);
// Protected routes (require JWT)
app.use("/leads", auth, leadRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running${PORT}`));
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
