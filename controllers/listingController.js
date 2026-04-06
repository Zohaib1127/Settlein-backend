import Listing from "../models/partner.js"; 
import Notification from "../models/Notification.js";

/* ============================================================
    1. CREATE LISTING (Admin Side - Same as Housing Partner)
   ============================================================ */
export const createListing = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // 🖼️ Multiple Images Handling (Multer)
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    const listing = new Listing({
      ...req.body,
      price: Number(req.body.price),
      images: imagePaths, 
      postedBy: req.user.id,
      status: "active" 
    });

    const savedListing = await listing.save();

    // 🔔 Global Notification Logic
    try {
      const notif = await Notification.create({
        userId: null, 
        title: "New Property Alert! 🏠",
        message: `A new ${listing.type || 'listing'} is available in ${listing.city}.`,
        type: "reminder",
        link: "/dashboard/housing"
      });

      if (global.io) {
        global.io.emit("newNotification", notif);
      }
    } catch (notifErr) {
      console.error("❌ Notification Error:", notifErr.message);
    }

    res.status(201).json(savedListing);
  } catch (error) {
    console.error("❌ Admin Create Error:", error.message);
    res.status(500).json({ message: "Error creating listing", error: error.message });
  }
};

/* ============================================================
    2. GET ALL LISTINGS (For Admin View)
   ============================================================ */
export const getListings = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, type } = req.query;
    let filter = {}; 
    
    if (city) filter.city = city;
    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate("postedBy", "name email role profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};

/* ============================================================
    3. GET SINGLE LISTING BY ID
   ============================================================ */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("postedBy", "name email profilePic role");

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listing" });
  }
};

/* ============================================================
    4. UPDATE LISTING (With Security & Image Update)
   ============================================================ */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // 🔒 Security: Only owner or admin can update
    if (listing.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this listing" });
    }

    let updateData = { ...req.body };

  
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    if (updateData.price) updateData.price = Number(updateData.price);

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // 🔔 Real-time Update Notification
    if (global.io) {
      global.io.emit("newNotification", { 
        title: "Listing Updated! 🔄", 
        message: `Property in ${updatedListing.city} has been modified.` 
      });
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: "Error updating listing", error: error.message });
  }
};

/* ============================================================
    5. DELETE LISTING
   ============================================================ */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Only owner or admin can delete
    if (listing.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    if (global.io) {
      global.io.emit("deleteNotification", req.params.id); 
    }

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting listing" });
  }
};