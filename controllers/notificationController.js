import Notification from "../models/Notification.js";

// 1. Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user._id },
        { userId: null } // System-wide notifications
      ],
      
      deletedBy: { $ne: req.user._id } 
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json([]);
  }
};

// 2. Create Notification 
export const createNotification = async (req, res) => {
  try {
    
    const { userId, title, message, type, link, senderId } = req.body;

    const newNotif = await Notification.create({
      userId, 
      senderId: senderId || null, 
      title,
      message,
      type: type || "info",
      link: link || null,
    });

    
    if (global.io && userId) {
      global.io.to(userId.toString()).emit("newNotification", newNotif);
    }

    res.status(201).json(newNotif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Delete Single 
export const deleteNotification = async (req, res) => {
  try {
    
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { deletedBy: req.user._id }
    });
    res.json({ message: "Hidden for you" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Clear All 
export const clearNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }],
      deletedBy: { $ne: req.user._id }
    });

    const notifIds = notifications.map(n => n._id);

    await Notification.updateMany(
      { _id: { $in: notifIds } },
      { $addToSet: { deletedBy: req.user._id } }
    );

    res.json({ message: "All notifications hidden for you" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};