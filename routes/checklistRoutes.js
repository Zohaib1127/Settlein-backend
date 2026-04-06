import express from "express";
import {
  createChecklist,
  getChecklists,
  addItem,
  toggleItem,
  deleteChecklist,
} from "../controllers/checklistController.js";

import  {protect}  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createChecklist);
router.get("/", protect, getChecklists);
router.post("/:id/items", protect, addItem);
router.put("/:id/items/:itemId", protect, toggleItem);
router.delete("/:id", protect, deleteChecklist);

export default router;