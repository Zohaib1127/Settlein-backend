import Checklist from "../models/Checklist.js";

/* CREATE CHECKLIST */
export const createChecklist = async (req, res) => {
  try {
    const checklist = new Checklist({
      user: req.user.id,
      title: req.body.title,
      items: [],
    });

    await checklist.save();
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ message: "Error creating checklist" });
  }
};

/* GET USER CHECKLISTS */
export const getChecklists = async (req, res) => {
  try {
    const lists = await Checklist.find({ user: req.user.id });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching checklists" });
  }
};

/* ADD ITEM */
export const addItem = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);

    checklist.items.push({
      text: req.body.text,
    });

    await checklist.save();
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: "Error adding item" });
  }
};

/* TOGGLE ITEM */
export const toggleItem = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);

    const item = checklist.items.id(req.params.itemId);
    item.done = !item.done;

    await checklist.save();
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
};

/* DELETE CHECKLIST */
export const deleteChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndDelete(req.params.id);
    res.json({ message: "Checklist deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting checklist" });
  }
};