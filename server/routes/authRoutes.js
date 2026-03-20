const express = require("express");
const passport = require("passport");
const LoginLog = require("../models/LoginLog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const router = express.Router();

/* ---------- GOOGLE REGISTER ---------- */
router.get("/google/register", (req, res, next) => {
  req.session.selectedRole = req.query.role;
  req.session.authType = "register";
  next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

/* ---------- GOOGLE LOGIN ---------- */
router.get("/google/login", (req, res, next) => {
  req.session.selectedRole = req.query.role;
  req.session.authType = "login";
  next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

/* ---------- CALLBACK ---------- */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const { authType } = req.session;
    const { selectedRole } = req.session;

    const existingUser = await User.findOne({ email: req.user.email });

    if (authType === "register") {
      // User already exists → redirect to login page
      if (existingUser) {
        return res.redirect(
          `http://localhost:5173/login?message=email_exists`
        );
      }

      // If user doesn't exist → create
      const newUser = await User.create({
        user_id: req.user.user_id || req.user._id,
        username: req.user.email.split('@')[0],
        email: req.user.email,
        firstName: req.user.firstName || req.user.firstName,
        lastName: req.user.lastName || req.user.lastName,
        role: selectedRole,
        provider: "google",
        registration_date: new Date(),
        last_login: new Date()
      });

      // Generate JWT for new user
      const token = jwt.sign(
        {
          userId: newUser._id,
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        provider: newUser.providers && newUser.providers.includes('local') ? 'local' : 'google',
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

      return res.redirect(`http://localhost:5173/login?token=${token}`);
    }

    if (authType === "login") {
      if (!existingUser) {
        return res.redirect(
          `http://localhost:5173/login?message=user_not_found`
        );
      }

      // Check role hierarchy
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

      // Set username if not set
      if (!existingUser.username) {
        existingUser.username = existingUser.email.split('@')[0];
      }

      existingUser.last_login = new Date();
      await existingUser.save();

      // Generate JWT for existing user
      const token = jwt.sign(
        {
          userId: existingUser._id,
          user_id: existingUser.user_id,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
          provider: existingUser.providers && existingUser.providers.includes('local') ? 'local' : 'google',
          effectiveRole: selectedRole
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log successful login
      await LoginLog.create({
        user: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        role_used: selectedRole,
        provider: 'google'
      });

      return res.redirect(`http://localhost:5173/login?token=${token}`);
    }

    // This code should never be reached for successful logins
    res.redirect("http://localhost:5173/homepage");
  }
);

module.exports = router;
