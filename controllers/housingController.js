import Listing from "../models/partner.js"; 
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/* ============================================================
    1. CREATE LISTING (Admin & Partner with Image Upload)
   ============================================================ */
export const createListing = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // 🖼️ Extract Image Paths
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    const listing = new Listing({
      ...req.body,
      price: Number(req.body.price),
      images: imagePaths,
      postedBy: req.user.id || req.user._id, // Consistent ID field
      status: "active" 
    });

    const savedListing = await listing.save();

    // 🔔 Notification Logic
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
    console.error("❌ Create Error:", error.message);
    res.status(500).json({ message: "Error creating listing", error: error.message });
  }
};

/* ============================================================
    2. GET ALL LISTINGS (Public/Student/Admin)
   ============================================================ */
export const getAllListings = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, type } = req.query;
    let filter = { status: "active" }; 
    
    if (city) filter.city = city;
    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate("postedBy", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};

/* ============================================================
    3. GET MY LISTINGS 
   ============================================================ */
export const getMyListings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const listings = await Listing.find({ postedBy: userId }).sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    console.error("❌ Fetch My Listings Error:", error.message);
    res.status(500).json({ message: "Error fetching your listings" });
  }
};

/* ============================================================
    4. UPDATE LISTING
   ============================================================ */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // 🔒 Security Check
    const userId = req.user.id || req.user._id;
    if (listing.postedBy.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    if (updateData.price) updateData.price = Number(updateData.price);

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

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

    const userId = req.user.id || req.user._id;
    if (listing.postedBy.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting listing" });
  }
};