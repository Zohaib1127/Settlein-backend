import EmergencyContact from "../models/EmergencyContact.js";
import EmergencyAlert from "../models/EmergencyAlert.js";


export const getContacts = async (req, res) => {
  try {
    const { city } = req.query;
    const query = city 
      ? { city: { $regex: new RegExp(`^${city}$`, "i") } } 
      : { city: "Gujrat" }; 

    const contacts = await EmergencyContact.find(query);
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Alert function 
export const createAlert = async (req, res) => {
  try {
    const { message, location } = req.body;
    const userId = req.user ? req.user.id : null; 

    const alert = new EmergencyAlert({
      userId,
      message,
      location
    });
    
    await alert.save();
    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ message: "Error creating alert: " + error.message });
  }
};