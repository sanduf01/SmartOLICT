/*const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Notification = require("../models/notification");
const User = require("../models/user");
const { authenticateToken } = require("../middleware/auth");

// Admin and Teacher: Create notification
router.post("/create", authenticateToken, async (req, res) => {
  try {
    if (req.user.effectiveRole !== "admin" && req.user.effectiveRole !== "teacher") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, desc, isGlobal, targetUsers } = req.body;

    const notification = new Notification({
      title,
      desc,
      createdBy: req.user._id,
      isGlobal,
      targetUsers: isGlobal ? [] : (targetUsers ? targetUsers.map(id => new mongoose.Types.ObjectId(id)) : [])
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications for user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { isGlobal: true },
        { targetUsers: req.user._id }
      ]
    }).populate("createdBy", "firstName lastName").sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all notifications
router.get("/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const notifications = await Notification.find({})
      .populate("createdBy", "firstName lastName")
      .populate("targetUsers", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Admin: Delete notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;*/

// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Notification = require("../models/notification");
const { authenticateToken } = require("../middleware/auth");

// -------------------- CREATE NOTIFICATION --------------------
router.post("/create", authenticateToken, async (req, res) => {
  try {
    // Only admin or teacher can create notifications
    if (!["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, desc, isGlobal, targetUsers } = req.body;

    if (!title || !desc) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Ensure targetUsers is an array
    const validTargetUsers = Array.isArray(targetUsers) ? targetUsers : [];

    const notification = await Notification.create({
      title,
      desc,
      isGlobal: !!isGlobal,
      targetUsers: validTargetUsers,
      createdBy: req.user.userId
    });

    res.status(201).json({ message: "Notification created successfully", notification });

  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

// -------------------- GET ALL NOTIFICATIONS (ADMIN) --------------------
router.get("/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const notifications = await Notification.find({})
      .populate({ path: "createdBy", select: "firstName lastName", strictPopulate: false })
      .populate({ path: "targetUsers", select: "firstName lastName email", strictPopulate: false })
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// -------------------- GET USER NOTIFICATIONS --------------------
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Global notifications + notifications targeting this user
    const notifications = await Notification.find({
      $or: [
        { isGlobal: true },
        { targetUsers: req.user.userId }
      ]
    })
      .populate({ path: "createdBy", select: "firstName lastName", strictPopulate: false })
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// -------------------- DELETE NOTIFICATION --------------------
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();

    res.json({ message: "Notification deleted successfully" });

  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

// -------------------- MARK NOTIFICATION AS READ --------------------
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

module.exports = router;

