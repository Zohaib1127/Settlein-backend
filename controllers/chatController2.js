import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";


export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const myId = req.user.id;

    if (!text || !receiverId) {
      return res.status(400).json({ message: "Text and Receiver ID are required" });
    }
    const newMessage = await Message.create({
      sender: myId,
      receiver: receiverId,
      text: text,
      status: "sent" 
    });

    const sender = await User.findById(myId);
    
    const notif = await Notification.create({
      userId: receiverId,
      senderId: myId, 
      title: "New Message 💬",
      message: `${sender.name}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
      link: `/dashboard/chat/${myId}`, 
      type: "info"
    });

    // 3. Socket.io Real-time update
    if (global.io) {
      global.io.to(receiverId.toString()).emit("receiveMessage", {
        _id: newMessage._id,
        senderId: myId,
        text: text,
        status: "sent",
        createdAt: newMessage.createdAt
      });
      
      global.io.to(receiverId.toString()).emit("newNotification", notif);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("❌ Send Message Error:", err.message);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* ================= 2. GET MESSAGES (History) ================= */
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= 3. MARK AS SEEN (Blue Ticks Logic) ================= */
export const markAsSeen = async (req, res) => {
  try {
    const { senderId } = req.params; 
    const myId = req.user.id;      

    await Message.updateMany(
      { sender: senderId, receiver: myId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    if (global.io) {
      global.io.to(senderId.toString()).emit("messagesSeen", {
        seenBy: myId
      });
    }

    res.status(200).json({ message: "Marked as seen" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};