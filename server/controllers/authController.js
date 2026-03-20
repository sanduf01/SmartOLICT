const User = require("../models/user");
const LoginLog = require("../models/LoginLog");
const ProgressReport = require("../models/progressReport");
const roleRules = require("../utils/roleRules");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { username, password, selectedRole } = req.body;

    // 1. Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 2. Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3. Role permission check
    if (!roleRules[selectedRole].includes(user.role)) {
      return res.status(403).json({ message: "Role not permitted" });
    }

    // 4. Update last login
    user.last_login = new Date();
    await user.save();

    // 5. Log login
    await LoginLog.create({
      user: user._id,
      username: user.username,
      email: user.email,
      role_used: selectedRole,
      provider: 'local'
    });

    res.json({
      message: "Login successful",
      effectiveRole: selectedRole
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
