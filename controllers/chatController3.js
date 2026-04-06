import Chat from "../models/Chat.js";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// 🟢 1. GET CHAT BY REQUEST ID (Fixed logic for dynamic participants)
export const getChatByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;

    const requestDoc = await Request.findById(requestId)
      .populate("studentId", "name email profilePic role") 
      .populate("ownerId", "name email profilePic role")   
      .populate("listingId", "title price images");

    if (!requestDoc) {
      return res.status(404).json({ message: "Housing Request not found" });
    }

    const chat = await Chat.findOne({ requestId });

    // Agar owner admin hai toh label 'admin' show hoga, warna 'partner'
    const partnerRole = requestDoc.ownerId?.role === "admin" ? "admin" : "partner";

    res.status(200).json({
      success: true,
      student: requestDoc.studentId,
      partner: requestDoc.ownerId,
      partnerRole: partnerRole, 
      requestDetails: requestDoc.listingId,
      status: requestDoc.status,
      messages: chat ? chat.messages : [], 
      requestId: requestId
    });

  } catch (error) {
    console.error("Fetch Chat Error:", error);
    res.status(500).json({ message: "Error fetching chat", error: error.message });
  }
};

// 🟢 2. SAVE MESSAGE (Fixed Receiver & Admin logic)
export const saveMessage = async (req, res) => {
  try {
    const { requestId, text, senderId } = req.body;

    if (!requestId || !text || !senderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Sender aur Request data fetch karein
    const [sender, requestDoc] = await Promise.all([
      User.findById(senderId),
      Request.findById(requestId)
    ]);

    if (!sender || !requestDoc) {
      return res.status(404).json({ message: "User or Request not found" });
    }

    const isAdmin = sender.role === "admin";

    // 2. 🔥 DYNAMIC RECEIVER LOGIC (Fix)
    // Agar bhejane wala Student hai, toh message Owner/Admin ko jaye.
    // Agar bhejane wala Owner/Admin hai, toh message Student ko jaye.
    let receiverId;
    if (senderId.toString() === requestDoc.studentId.toString()) {
      receiverId = requestDoc.ownerId; 
    } else {
      receiverId = requestDoc.studentId;
    }

    // 3. Chat logic (Document dhoondo ya naya banao)
    let chat = await Chat.findOne({ requestId });
    if (!chat) {
      chat = new Chat({
        requestId,
        participants: [requestDoc.studentId, requestDoc.ownerId],
        messages: []
      });
    }

    // Message object
    const newMessage = { 
      senderId, 
      text, 
      timestamp: new Date() 
    };

    chat.messages.push(newMessage);
    await chat.save();

    // 4. Notification Logic
    const notificationTitle = isAdmin 
      ? "Message from Admin 🛡️" 
      : `Message from ${sender.name || "User"}`;

    const chatNotification = new Notification({
      userId: receiverId, 
      senderId: senderId, 
      title: notificationTitle,
      message: text.length > 35 ? `${text.substring(0, 35)}...` : text,
      link: `/housing-chat/${requestId}`,
      type: isAdmin ? "ADMIN_CHAT" : "CHAT_MESSAGE"
    });

    await chatNotification.save();

    // 5. Real-time Socket (Notification + Live Chat Update)
    if (global.io) {
      // 1. Receiver ko notification bhejain
      global.io.to(receiverId.toString()).emit("newNotification", chatNotification);
      
      // 2. Chat room mein live message update bhejain
      global.io.to(requestId).emit("receiveMessage", {
        ...newMessage,
        requestId // Taaki frontend confirm kar sakay ye isi chat ka message hai
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Message sent", 
      chat 
    });

  } catch (error) {
    console.error("Save Message Error:", error);
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};