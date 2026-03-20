const express = require("express");
const passport = require("passport");
const LoginLog = require("../models/LoginLog");
const User = require("../models/user");
const ProgressReport = require("../models/progressReport");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ---------- GOOGLE REGISTER ---------- */
router.get(
  "/google/register",
  (req, res, next) => {
    req.session.selectedRole = req.query.role;
    req.session.authType = "register";
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/* ---------- GOOGLE LOGIN ---------- */
router.get(
  "/google/login",
  (req, res, next) => {
    req.session.selectedRole = req.query.role;
    req.session.authType = "login";
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/* ---------- GOOGLE CALLBACK ---------- */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const { authType, selectedRole } = req.session;

      // Check if user exists
      const existingUser = await User.findOne({ email: req.user.email });

      // ---- REGISTER FLOW ----
      if (authType === "register") {
        if (existingUser) {
          // User already exists - redirect to login with email exists message
          return res.redirect(`http://localhost:5173/login?message=email_exists`);
        }

        // Create new Google user
        const newUser = await User.create({
          user_id: "U" + Date.now(),
          email: req.user.email,
          username: req.user.email.split("@")[0],
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: selectedRole,
          providers: ["google"],
          registration_date: new Date(),
          last_login: null
        });

        // Generate JWT for new user
        const token = jwt.sign(
          {
            userId: newUser._id,
            user_id: newUser.user_id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            provider: 'google',
            effectiveRole: selectedRole
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Log successful registration
        await LoginLog.create({
          user: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role_used: selectedRole,
          provider: 'google'
        });

        return res.redirect(`http://localhost:5173/login?token=${token}&message=registered_google`);
      }

      // ---- LOGIN FLOW ----
      if (authType === "login") {
        if (!existingUser) {
          // No account exists - redirect to register
          return res.redirect(
            `http://localhost:5173/register?message=prefer_google`
          );
        }

        // Automatically link Google if not already linked
        if (!existingUser.providers) {
          existingUser.providers = ["local"];
        }
        if (!existingUser.providers.includes("google")) {
          existingUser.providers.push("google");
          existingUser.firstName = existingUser.firstName || req.user.firstName;
          existingUser.lastName = existingUser.lastName || req.user.lastName;
        }

        // Role enforcement
        const ROLE_HIERARCHY = {
          admin: ["admin", "teacher", "student"],
          teacher: ["teacher", "student"],
          student: ["student"]
        };

        if (!ROLE_HIERARCHY[existingUser.role].includes(selectedRole)) {
          return res.redirect(
            `http://localhost:5173/login?message=role_violation`
          );
        }

        // Update last login
        existingUser.last_login = new Date();
        await existingUser.save();

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: existingUser._id,
            user_id: existingUser.user_id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
            provider: 'google',
            effectiveRole: selectedRole
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Log successful login
        await LoginLog.create({
          user: existingUser._id,
          username: existingUser.username || existingUser.email.split("@")[0],
          email: existingUser.email,
          role_used: selectedRole,
          provider: 'google'
        });

        return res.redirect(`http://localhost:5173/login?token=${token}`);
      }

      // Fallback
      return res.redirect("/");
    } catch (error) {
      console.error("Google auth callback error:", error);
      return res.redirect(`http://localhost:5173/login?message=server_error`);
    }
  }
);

module.exports = router;
