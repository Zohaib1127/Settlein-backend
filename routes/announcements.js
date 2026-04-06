import express from 'express';
import Announcement from '../models/Announcement.js'; 

const router = express.Router();

// 1. GET Latest Announcement 
router.get('/latest', async (req, res) => {
  try {
  
    const data = await Announcement.find().sort({ date: -1 }).limit(1);
    res.json(data); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get all announcements 
router.get('/', async (req, res) => {
  try {
    const data = await Announcement.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Post new announcement
router.post('/', async (req, res) => {
  const newNotif = new Announcement({
    title: req.body.title,
    content: req.body.content
  });
  try {
    const saved = await newNotif.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;