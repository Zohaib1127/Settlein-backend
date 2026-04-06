import Request from "../models/Request.js";
import Listing from "../models/partner.js";
import Notification from "../models/Notification.js"; 


export const sendRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;
    const studentId = req.user.id || req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const existing = await Request.findOne({ listingId, studentId });
    if (existing) {
      return res.status(400).json({ message: "Request already sent!" });
    }

    const newRequest = new Request({
      listingId,
      studentId,
      ownerId: listing.postedBy,
      message
    });

    await newRequest.save();

    
    try {
      const ownerNotif = new Notification({
        userId: listing.postedBy,      
        senderId: studentId,           
        title: "New Housing Request",
        message: `New interest request for "${listing.title}"`,
        link: "/dashboard/requests",
        type: "new_request"
      });

      await ownerNotif.save();

      // Socket Emit to Owner
      if (req.io) {
        req.io
          .to(listing.postedBy.toString())
          .emit("newNotification", ownerNotif);
      }

    } catch (notifError) {
     
      console.log("Notification Error:", notifError.message);
    }

    res.status(201).json({ message: "Interest request sent to owner!" });

  } catch (error) {
    console.error("Send Request Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};


export const getStudentRequests = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    
    const requests = await Request.find({ studentId })
      .populate("listingId", "title price images city") 
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Fetch Student Requests Error:", error);
    res.status(500).json({ message: "Error fetching your requests" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    
    // 1. Request dhoondo aur listing details bhi le aao (taaki notification mein title sahi aaye)
    const request = await Request.findById(id).populate("listingId");
    if (!request) return res.status(404).json({ message: "Request not found" });

    const myId = (req.user.id || req.user._id).toString();
    const myRole = req.user.role; // Maan rahe hain ke aapke auth middleware mein role aata hai

    // 2. Permission Check: Agar banda owner hai YA admin hai, tabhi aage badhne do
    const isOwner = request.ownerId && request.ownerId.toString() === myId;
    const isAdmin = myRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized: You don't have permission to update this request" });
    }

    // 3. Status update karo
    request.status = status;
    await request.save();

    // 4. Notification create karo
    const studentNotif = new Notification({
      userId: request.studentId,    
      senderId: myId,                
      title: "Housing Update",   
      message: `Your request for "${request.listingId?.title || 'Listing'}" has been ${status.toUpperCase()}!`,
      link: "/dashboard/housing",
      type: "status_update"
    });
    
    await studentNotif.save(); 

    // 5. 🔥 SOCKET EMIT
    if (req.io) {
      const targetRoom = request.studentId.toString();
      console.log("Emitting housing notification to room:", targetRoom);
      
      req.io.to(targetRoom).emit("newNotification", studentNotif);
    }

    res.status(200).json({ message: `Request ${status} successfully!`, request });
  } catch (error) {
    console.error("❌ Notification/Update Error:", error.message);
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

export const getListingRequests = async (req, res) => {
  try {
    const { listingId } = req.params;
    const requests = await Request.find({ listingId })
      .populate("studentId", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};