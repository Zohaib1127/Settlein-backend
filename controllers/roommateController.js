import RoommateProfile from "../models/RoommateProfile.js";
import Notification from "../models/Notification.js";

/* ================= CREATE OR UPDATE ================= */
export const createOrUpdateProfile = async (req, res) => {
  try {
    const profile = await RoommateProfile.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body, user: req.user.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET MATCHES (WITH FIXED PRIORITY LOGIC) ================= */
export const getMatchingProfiles = async (req, res) => {
  try {
    const myId = req.user.id;
    const myProfile = await RoommateProfile.findOne({ user: myId });

    if (!myProfile) return res.status(404).json({ message: "Create profile first" });

    const matches = await RoommateProfile.find({
      user: { $ne: myId },
      city: myProfile.city,
      budgetMin: { $lte: myProfile.budgetMax },
      budgetMax: { $gte: myProfile.budgetMin },
    }).populate("user", "name email");

    const matchesWithStatus = matches.map((profile) => {
      const p = profile.toObject();
      
      const receivedFromThem = myProfile.requests?.find(
        (r) => r.from.toString() === profile.user._id.toString()
      );

      const sentByMe = profile.requests?.find(
        (r) => r.from.toString() === myId.toString()
      );

      
      if (receivedFromThem) {
        p.requestStatus = receivedFromThem.status;
        p.direction = "received"; 
      } else if (sentByMe) {
        p.requestStatus = sentByMe.status;
        p.direction = "sent"; 
      } else {
        p.requestStatus = null;
        p.direction = "none";
      }
      return p;
    });

    res.json(matchesWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= HANDLE REQUEST (SEND/ACCEPT WITH DUAL UPDATE) ================= */
export const handleMatchRequest = async (req, res) => {
  try {
    const { receiverId, type } = req.body; 
    const myUserId = req.user.id;

    if (type === "send") {
      const targetProfile = await RoommateProfile.findById(receiverId);
      if (!targetProfile) return res.status(404).json({ message: "Target profile not found" });

      const alreadySent = targetProfile.requests.some(r => r.from.toString() === myUserId);
      if (alreadySent) return res.status(400).json({ message: "Already sent" });

      targetProfile.requests.push({ from: myUserId, status: "pending" });
      targetProfile.markModified('requests'); 
      await targetProfile.save();

      // 🔔 Notification
      try {
        const notif = await Notification.create({
          userId: targetProfile.user,
          title: "New Match Request! 👋",
          message: `${req.user.name} wants to connect as a roommate.`,
          type: "info",
          link: "/dashboard/find-roommates"
        });
        if (global.io) global.io.to(targetProfile.user.toString()).emit("newNotification", notif);
      } catch (e) { console.log("Notif error skipped"); }

      return res.json({ message: "Request sent successfully" });
    }

    if (type === "accept") {
      
      const myProfile = await RoommateProfile.findOne({ user: myUserId });
      const requestIndex = myProfile.requests.findIndex(r => r.from.toString() === receiverId);

      if (requestIndex === -1) return res.status(404).json({ message: "Request not found" });

      myProfile.requests[requestIndex].status = "accepted";
      myProfile.markModified('requests'); 
      await myProfile.save();

      
      const senderProfile = await RoommateProfile.findOne({ user: receiverId });
      if (senderProfile) {
        const myReqInSender = senderProfile.requests.findIndex(r => r.from.toString() === myUserId);
        if (myReqInSender !== -1) {
          senderProfile.requests[myReqInSender].status = "accepted";
          senderProfile.markModified('requests');
          await senderProfile.save();
        }
      }

      // 🔔 Notification to the original Sender
      try {
        const notif = await Notification.create({
          userId: receiverId, 
          title: "Request Accepted! 🎉",
          message: `${req.user.name} accepted your roommate request.`,
          type: "success",
          link: "/dashboard/find-roommates"
        });
        if (global.io) global.io.to(receiverId.toString()).emit("newNotification", notif);
      } catch (e) { console.log("Notif error skipped"); }

      return res.json({ message: "Connected!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL PROFILES ================= */
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await RoommateProfile.find().populate("user", "name email");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};