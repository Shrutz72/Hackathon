require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Default Route
app.get("/", (req, res) => {
    res.send("Local Issue Reporting API Running...");
});

// Import Routes
const issueRoutes = require("./routes/issueRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/issues", issueRoutes);
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
