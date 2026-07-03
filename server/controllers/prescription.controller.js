import Prescription from "../models/Prescription.js";
import Medicine from "../models/medicines.js";
import fs from "fs";

export const submitPrescription = async (req, res) => {
  try {
    let { patient, prescriber, medications, prescriberId, method } = req.body;

    // ── Parse if sent as strings (multipart/form-data sends strings) ──
    if (typeof patient     === "string") { try { patient     = JSON.parse(patient);     } catch { patient     = {}; } }
    if (typeof prescriber  === "string") { try { prescriber  = JSON.parse(prescriber);  } catch { prescriber  = {}; } }
    if (typeof medications === "string") { try { medications = JSON.parse(medications); } catch { medications = [medications]; } }

    // ── Validation ────────────────────────────────────────────
    if (!patient || Object.keys(patient).length === 0) {
      return res.status(400).json({ message: "Patient details are required." });
    }
    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: "At least one medication is required." });
    }

    // ── Build prescription ────────────────────────────────────
    const newPrescription = new Prescription({
      user:              req.user.id,
      patientDetails:    patient,
      prescriberDetails: prescriber || {},

      // Support both prescriberId string and full prescriber object
      ...(prescriberId && { prescriberId }),

      // medications can be array of ObjectIds or objects with _id
      medications: medications.map((med) =>
        typeof med === "object" && med._id ? med._id : med
      ),

      status: "pending",
      method: method || "form",
    });

    await newPrescription.save();

    res.status(201).json({
      success: true,
      message: "Prescription submitted successfully for approval!",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ message: error.message || "Server error during prescription submission." });
  }
};

export const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Prescription image is required." });

    const { medicineId } = req.body;
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Medicine not found." });
    }

    const newPrescription = new Prescription({
      user:    req.user.id,
      medicine: medicineId,
      image:   req.file.filename,
      status:  "pending",
      method:  "upload",
    });

    await newPrescription.save();
    res.status(201).json({
      message: "Prescription uploaded successfully.",
      prescription: newPrescription,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to process prescription upload." });
  }
};

export const getPendingPrescriptions = async (req, res) => {
  try {
    const pending = await Prescription.find({ status: "pending" })
      .populate("user",        "firstName lastName email")
      .populate("medicine",    "name brand dosage price")
      .populate("medications", "name brand dosage price")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: pending.length, prescriptions: pending });
  } catch (error) {
    res.status(500).json({ message: "Error fetching the verification queue." });
  }
};

export const verifyPrescription = async (req, res) => {
  try {
    const { id }          = req.params;
    const { status, note } = req.body;

    if (!["approved", "rejected", "dispensed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await Prescription.findByIdAndUpdate(
      id,
      {
        status,
        pharmacistNote: note,
        verifiedAt:     Date.now(),
        verifiedBy:     req.user.id,
      },
      { new: true }
    ).populate("medicine", "name");

    if (!updated) return res.status(404).json({ message: "Prescription not found." });

    res.status(200).json({
      message:      `Prescription ${status} successfully.`,
      prescription: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Verification process failed." });
  }
};

export const checkUserPrescriptionStatus = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const prescription   = await Prescription.findOne({
      user: req.user.id,
      $or: [{ medicine: medicineId }, { medications: medicineId }],
    }).sort({ createdAt: -1 });

    res.status(200).json(prescription || { status: "none" });
  } catch (error) {
    res.status(500).json({ message: "Error checking status." });
  }
};

export const getMyPrescriptions = async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user._id })
    .populate('medications', 'name')
    .sort({ createdAt: -1 });
  res.json({ prescriptions });
};

export const deletePrescription = async (req, res) => {
  try {
    const deleted = await Prescription.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('deletePrescription error:', error);
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
};

// prescription detail
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('medications', 'name brand dosage price')
      .populate('medicine', 'name brand dosage price');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if user is authorized to view this prescription
    if (prescription.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }
    
    res.status(200).json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};