const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();

require("./config/passport");

const User = require("./models/user");
const LoginLog = require("./models/LoginLog");
const googleAuthRoutes = require("./routes/googleAuth");
const lessonRoutes = require("./routes/lessonRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const progressRoutes = require("./routes/progressRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");

const feedbackRoutes = require("./routes/feedbackRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const { authenticateToken } = require("./middleware/auth");

const app = express();

/* -------------------- CORS -------------------- */
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

/* -------------------- SESSION -------------------- */
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

/* -------------------- GOOGLE AUTH ROUTES -------------------- */
app.use("/auth", googleAuthRoutes);

/* -------------------- API ROUTES -------------------- */
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/questions', questionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/users", userRoutes);

app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);


/* -------------------- MONGODB CONNECTION -------------------- */
mongoose
  .connect("mongodb+srv:")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => {
    console.log("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* -------------------- REGISTER -------------------- */
app.post("/register", async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      specialPassword
    } = req.body;

    if (
      !username ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Special password verification for teacher and admin
    if (role === "teacher" && specialPassword !== "TeachGamified1011") {
      return res.status(400).json({ error: "Invalid teacher registration password" });
    }
    if (role === "admin" && specialPassword !== "AdminGamified1011") {
      return res.status(400).json({ error: "Invalid admin registration password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      user_id: "U" + Date.now(),
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      providers: ["local"],
      registration_date: new Date(),
      last_login: null
    });

    // Create Student record if role is student
    if (role === "student") {
      const Student = require("./models/student");
      await Student.create({
        user_id: newUser._id,
        grade_level: "10"
      });
    }

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* -------------------- LOGIN -------------------- */
app.post("/login", async (req, res) => {
  try {
    const { username, password, selectedRole } = req.body;

    if (!username || !password || !selectedRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password against stored hashed password for all roles
    // Special password (TeachGamified1011/AdminGamified1011) is only required during registration
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ROLE_HIERARCHY = {
      admin: ["admin", "teacher", "student"],
      teacher: ["teacher", "student"],
      student: ["student"]
    };

    if (!ROLE_HIERARCHY[user.role].includes(selectedRole)) {
      return res.status(403).json({
        message: "You are not authorized to log in as this role"
      });
    }

    user.last_login = new Date();
    await user.save();

    // LOGIN LOGGING (ADDED)
    await LoginLog.create({
      user: user._id,
      username: user.username || user.email.split("@")[0],
      email: user.email,
      role_used: selectedRole,
      provider: 'local'
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        provider: (user.providers && user.providers.includes('local')) ? 'local' : 'google',
        effectiveRole: selectedRole
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      effectiveRole: selectedRole,
      actualRole: user.role,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

/* -------------------- RESET PASSWORD -------------------- */
app.post("/reset-password", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    message: "Server is running",
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// --- Test Route ---
app.get("/test-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ message: "DB connected", collections });
  } catch (err) {
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("POST /register");
  console.log("POST /login");
  console.log("POST /reset-password");
  console.log("GET  /auth/google");
  console.log("GET  /health");
  console.log("GET  /auth/check");
  console.log("GET  /api/lessons");
  console.log("POST /api/lessons");
  console.log("GET  /api/lessons/grade/:grade");
  console.log("GET  /api/lessons/:id");
  console.log("PUT  /api/lessons/:id");
  console.log("DELETE /api/lessons/:id");
  console.log("GET  /api/lessons/deleted/all");
  console.log("POST /api/lessons/:id/restore");
  console.log("DELETE /api/lessons/:id/permanent");
  console.log("GET  /api/quizzes");
  console.log("POST /api/quizzes");
  console.log("GET  /api/quizzes/grade/:grade");
  console.log("GET  /api/quizzes/lesson/:lessonId");
  console.log("GET  /api/quizzes/:id");
  console.log("POST /api/quizzes/:id/attempt");
  console.log("PUT  /api/quizzes/:id");
  console.log("DELETE /api/quizzes/:id");
  console.log("GET  /api/quizzes/deleted/all");
  console.log("POST /api/quizzes/:id/restore");
  console.log("DELETE /api/quizzes/:id/permanent");
  console.log("GET  /api/questions");
  console.log("GET  /api/questions/quiz/:quizId");
  console.log("GET  /api/questions/:id");
  console.log("POST /api/questions");
  console.log("PUT  /api/questions/:id");
  console.log("DELETE /api/questions/:id");
  console.log("GET  /api/progress");
  console.log("GET  /api/leaderboard");
  console.log("GET  /api/users");
  console.log("GET  /api/feedback");
  console.log("POST /api/feedback");
  console.log("PUT  /api/feedback/:id");
  console.log("DELETE /api/feedback/:id");
  console.log("GET  /api/notifications");
  console.log("GET  /api/notifications/all");
  console.log("POST /api/notifications/create");
  console.log("DELETE /api/notifications/:id");
});

/* -------------------- MONGODB EVENTS -------------------- */
mongoose.connection.on("error", err => {
  console.log("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});


//Check Authentication Status
app.get("/auth/check", authenticateToken, async (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user.userId,
      user_id: req.user.user_id,
      email: req.user.email,
      role: req.user.role,
      effectiveRole: req.user.effectiveRole
    }
  });
});
