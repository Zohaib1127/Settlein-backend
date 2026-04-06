import mongoose from "mongoose";
import EmergencyContact from "./models/EmergencyContact.js"; 

const MONGO_URI = "mongodb+srv://settlein_user:settlein123@settlein.bqipso8.mongodb.net/test?retryWrites=true&w=majority&appName=SettleIn";
const seedData = [
  // Gujrat
  { "service": "Police", "number": "15", "city": "Gujrat", "icon": "shield" },
  { "service": "Ambulance", "number": "1122", "city": "Gujrat", "icon": "ambulance" },
  { "service": "Fire", "number": "1122", "city": "Gujrat", "icon": "flame" },
  
  // Lahore
  { "service": "Police", "number": "15", "city": "Lahore", "icon": "shield" },
  { "service": "Ambulance", "number": "1122", "city": "Lahore", "icon": "ambulance" },
  { "service": "Hospital", "number": "042-99205701", "city": "Lahore", "icon": "hospital" },
  
  // Karachi
  { "service": "Police", "number": "15", "city": "Karachi", "icon": "shield" },
  { "service": "Ambulance", "number": "1020", "city": "Karachi", "icon": "ambulance" },
  
  // Islamabad
  { "service": "Police", "number": "15", "city": "Islamabad", "icon": "shield" },
  { "service": "Fire", "number": "1122", "city": "Islamabad", "icon": "flame" },
  
  // Rawalpindi
  { "service": "Police", "number": "15", "city": "Rawalpindi", "icon": "shield" },
  { "service": "Hospital", "number": "051-9270907", "city": "Rawalpindi", "icon": "hospital" },
  
  // Peshawar
  { "service": "Police", "number": "15", "city": "Peshawar", "icon": "shield" },
  { "service": "Ambulance", "number": "1122", "city": "Peshawar", "icon": "ambulance" },
  
  // Quetta
  { "service": "Police", "number": "15", "city": "Quetta", "icon": "shield" },
  
  // Multan
  { "service": "Police", "number": "15", "city": "Multan", "icon": "shield" },
  { "service": "Ambulance", "number": "1122", "city": "Multan", "icon": "ambulance" },
  
  // Faisalabad
  { "service": "Police", "number": "15", "city": "Faisalabad", "icon": "shield" },
  
  // Sialkot
  { "service": "Police", "number": "15", "city": "Sialkot", "icon": "shield" },
  { "service": "Fire", "number": "1122", "city": "Sialkot", "icon": "flame" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected!");

    await EmergencyContact.deleteMany({}); 
    await EmergencyContact.insertMany(seedData);
    
    console.log("Database Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();