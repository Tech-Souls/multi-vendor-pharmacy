import express from "express";
import {
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();



router.get("/",                ...adminOnly, getAllUsers);

// GET /api/users/prescribers — sab approved prescribers
router.get('/prescribers', protect, async (req, res) => {
  try {
    const prescribers = await User.find({ 
      role: 'prescriber',
      isActive: true 
    }).select('firstName lastName registrationNumber professionalRole primarySpeciality prescriberId practiceName');
    
    const formatted = prescribers.map(p => ({
      _id:                p._id,
      name:               `${p.firstName} ${p.lastName}`.trim(),
      registrationNumber: p.registrationNumber || 'N/A',
      professionalRole:   p.professionalRole   || 'Prescriber',
      primarySpeciality:  p.primarySpeciality  || 'General',
      prescriberId:       p.prescriberId       || '',
      practiceName:       p.practiceName       || '',
    }));

    res.json({ prescribers: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch("/:id/approve",   ...adminOnly, approveUser);
router.patch("/:id/reject",    ...adminOnly, rejectUser);
router.delete("/:id",          ...adminOnly, deleteUser);



export default router;