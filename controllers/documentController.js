import Document from "../models/Document.js";
import Notification from "../models/Notification.js";

/* ============================
    UPLOAD DOCUMENT (FIXED)
============================ */
export const uploadDocument = async (req, res) => {
  try {
    // Basic Check
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newDoc = new Document({
      user: req.user.id,
      title: req.body.title,
      fileURL: `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`
    });

    const saved = await newDoc.save();

    // 🔔 Notification Logic
    try {
      const targetUserId = req.user.id.toString();

      
      const notif = await Notification.create({
        userId: targetUserId, // 
        title: "Document Uploaded ✅",
        message: `Your document "${newDoc.title}" has been uploaded successfully.`,
        type: "welcome" 
      });

      if (global.io) {
        global.io.to(targetUserId).emit("newNotification", notif);
        console.log(`📡 Private Upload Notification sent to: ${targetUserId}`);
      }
    } catch (notifErr) {
      console.error("❌ Notification Save Error:", notifErr.message);
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================
    DELETE DOCUMENT (FIXED)
============================ */
export const deleteDocument = async (req, res) => {
  try {
    const docId = req.params.id;
    const document = await Document.findById(docId);
    
    if (!document) return res.status(404).json({ message: "Not found" });

    const userId = document.user.toString(); 
    await Document.findByIdAndDelete(docId);

    // 🔔 Notification Logic
    try {
      const notif = await Notification.create({
        userId: userId, // 👈 FIX: Field name 'userId'
        title: "Document Removed 🗑️",
        message: `The document "${document.title}" has been removed.`,
        type: "alert"
      });

      if (global.io) {
        global.io.to(userId).emit("newNotification", notif);
        console.log(`📡 Private Delete Notification sent to: ${userId}`);
      }
    } catch (notifErr) {
      console.error("❌ Delete Notification Error:", notifErr.message);
    }

    res.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};