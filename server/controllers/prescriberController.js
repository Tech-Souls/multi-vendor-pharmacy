import PrescriberLink       from "../models/PrescriberLink.js";
import PrescriptionRequest  from "../models/PrescriptionRequest.js";
import Prescription         from "../models/Prescription.js"; // ✅ add this
import User                 from "../models/User.js";

// ─────────────────────────────────────────────────────────────
// SEARCH PRESCRIBERS
// ─────────────────────────────────────────────────────────────
export const searchPrescribers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(200).json([]);
    }

    const prescribers = await User.find({
      role: "prescriber",              // ✅ FIX 1: only return prescribers
      _id: { $ne: req.user._id },     // ✅ FIX 2: exclude yourself from results
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName:  { $regex: query, $options: "i" } },
        { email:     { $regex: query, $options: "i" } },
      ],
    }).select(
      "firstName lastName email registrationNumber role professionalRole"
    );

    const formatted = prescribers.map((user) => ({
      _id:                user._id,
      name:               `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email:              user.email,
      role:               user.role,
      professionalRole:   user.professionalRole,
      registrationNumber: user.registrationNumber,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("searchPrescribers error:", error);
    return res.status(500).json({ success: false, message: "Failed to search prescribers" });
  }
};

// ─────────────────────────────────────────────────────────────
// SEND LINK REQUEST
// ─────────────────────────────────────────────────────────────
export const sendLinkRequest = async (req, res) => {
  try {
    const { prescriberId, requesterRole, registrationNumber, message } = req.body;
    const requesterId = req.user?._id || req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!prescriberId || !registrationNumber || !requesterRole) {
      return res.status(400).json({
        success: false,
        message: "Prescriber, requester role and registration number are required",
      });
    }

    // ✅ FIX 3: use .toString() on both sides — ObjectId vs string comparison was broken
    if (prescriberId.toString() === requesterId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot link yourself" });
    }

    const existingLink = await PrescriberLink.findOne({ requesterId, prescriberId });
    if (existingLink) {
      return res.status(400).json({ success: false, message: "Link request already exists" });
    }

    const newLink = await PrescriberLink.create({
      requesterId,
      prescriberId,
      requesterRole,
      registrationNumber,
      message,
      status: "pending",
    });

    return res.status(201).json({ success: true, message: "Link request sent successfully", link: newLink });
  } catch (error) {
    console.error("sendLinkRequest error:", error);
    return res.status(500).json({ success: false, message: "Failed to send link request" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET ACTIVE LINKS
// ─────────────────────────────────────────────────────────────
export const getActiveLinks = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const links = await PrescriberLink.find({
      requesterId: userId,
      status: { $in: ["active", "pending"] },
    }).populate(
      "prescriberId",
      "firstName lastName email registrationNumber role professionalRole prescriberId"
    );

    const formatted = links.map((link) => ({
      ...link.toObject(),
      prescriberId: link.prescriberId
        ? {
            ...link.prescriberId.toObject(),
            name: `${link.prescriberId.firstName || ""} ${link.prescriberId.lastName || ""}`.trim(),
          }
        : null,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Active links error:", error);
    res.status(500).json({ success: false, message: "Error fetching linked prescribers" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PRESCRIBER PATIENTS
// ─────────────────────────────────────────────────────────────
export const getMyPatients = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // PrescriptionRequest se — jo is prescriber ko bheja gaya
    const requests = await PrescriptionRequest.find({
      prescriberId: userId,
      status: 'approved' // sirf approved wale patients dikhao
    })
    .populate('requesterId', 'firstName lastName email phoneNumber address dob')
    .sort({ createdAt: -1 });

    const seen = new Set();
    const patients = requests.map((item) => {
      const user = item.requesterId;
      const id = user?._id?.toString() || item._id.toString();
      if (seen.has(id)) return null;
      seen.add(id);
      return {
        _id:           id,
        firstName:     item.patientName?.firstName || user?.firstName || "",
        lastName:      item.patientName?.lastName  || user?.lastName  || "",
        dob:           item.dob        || user?.dob        || "",
        personalEmail: user?.email     || "",
        mobileNumber:  user?.phoneNumber || "",
        addressLine1:  user?.address   || "",
        status:        item.status     || "pending",
        lastRequestedAt: item.createdAt,
      };
    }).filter(Boolean);

    res.status(200).json({ patients, total: patients.length });
  } catch (error) {
    console.error("getMyPatients error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch patients." });
  }
};

export const deleteMyPatient = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const patientId = req.params.patientId;

    const deleted = await PrescriptionRequest.deleteMany({
      prescriberId: userId,
      requesterId: patientId,
    });

    if (!deleted.deletedCount) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("deleteMyPatient error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete patient" });
  }
};

// ─────────────────────────────────────────────────────────────
// SUBMIT PRESCRIPTION REQUEST
// ─────────────────────────────────────────────────────────────
// SUBMIT PRESCRIPTION REQUEST
// ─────────────────────────────────────────────────────────────
export const submitPrescriptionRequest = async (req, res) => {
  try {
    const {
      prescriberId,
      patientFirstName,
      patientLastName,
      dob,
      consultationDate,
      treatment,
      productsRequired,
      clinicalNotes,
    } = req.body;

    const requesterId = req.user?._id || req.user?.id;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!prescriberId || !patientFirstName || !patientLastName || !treatment) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ FIXED: Removed the req.file check as consent documentation is no longer required

    let parsedProducts = [];
    try {
      // If productsRequired is already an array, use it; otherwise parse
      parsedProducts = Array.isArray(productsRequired) 
        ? productsRequired 
        : (productsRequired ? JSON.parse(productsRequired) : []);
    } catch (err) {
      parsedProducts = [];
    }

    const newRequest = await PrescriptionRequest.create({
      requesterId,
      prescriberId,
      patientName: { firstName: patientFirstName, lastName: patientLastName },
      dob,
      consultationDate,
      treatment,
      productsRequired: parsedProducts,
      clinicalNotes,
      // ✅ FIXED: Removed consentDocumentation reference
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Prescription request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("submitPrescriptionRequest error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit prescription request" });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN - GET LINK REQUESTS
// ─────────────────────────────────────────────────────────────
export const getAdminPendingLinks = async (req, res) => {
  try {
    const links = await PrescriberLink.find()
      .populate("requesterId",  "firstName lastName email")
      .populate("prescriberId", "firstName lastName email")
      .sort({ createdAt: -1 });

    const formatted = links.map((link) => ({
      ...link.toObject(),
      requesterId: link.requesterId
        ? { ...link.requesterId.toObject(), name: `${link.requesterId.firstName || ""} ${link.requesterId.lastName || ""}`.trim() }
        : null,
      prescriberId: link.prescriberId
        ? { ...link.prescriberId.toObject(), name: `${link.prescriberId.firstName || ""} ${link.prescriberId.lastName || ""}`.trim() }
        : null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("getAdminPendingLinks error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch link requests" });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN - GET PRESCRIPTION REQUESTS
// ─────────────────────────────────────────────────────────────
export const getAdminPrescriptionRequests = async (req, res) => {
  try {
    const requests = await PrescriptionRequest.find()
      .populate("requesterId",      "firstName lastName email")
      .populate("prescriberId",     "firstName lastName email")
      .populate("productsRequired", "name")
      .sort({ createdAt: -1 });

    const formatted = requests.map((item) => ({
      _id:     item._id,
      patient: { firstName: item.patientName?.firstName || "", lastName: item.patientName?.lastName || "" },
      prescriber: {
        name:  item.prescriberId ? `${item.prescriberId.firstName || ""} ${item.prescriberId.lastName || ""}`.trim() : "Unknown",
        email: item.prescriberId?.email || "",
      },
      medications:          item.productsRequired?.map((p) => ({ _id: p._id, name: p.name })) || [],
      clinicalNotes:        item.clinicalNotes || "",
      treatment:            item.treatment || "",
consentDocumentation: item.consentDocumentation ? `http://localhost:4000/${item.consentDocumentation}` : "No documentation provided",
      status:               item.status || "pending",
      createdAt:            item.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("getAdminPrescriptionRequests error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch prescription requests" });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY LINK REQUEST
// ─────────────────────────────────────────────────────────────
export const verifyLink = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updatedLink = await PrescriberLink.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedLink) {
      return res.status(404).json({ success: false, message: "Link request not found" });
    }

    return res.status(200).json({ success: true, message: `Link ${status} successfully`, link: updatedLink });
  } catch (error) {
    console.error("verifyLink error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify link" });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY PRESCRIPTION REQUEST
// ─────────────────────────────────────────────────────────────
export const verifyPrescriptionRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected", "deleted"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (status === "deleted") {
      const deletedRequest = await PrescriptionRequest.findByIdAndDelete(req.params.id);
      if (!deletedRequest) {
        return res.status(404).json({ success: false, message: "Prescription request not found" });
      }
      return res.status(200).json({ success: true, message: "Prescription request deleted successfully" });
    }

    const updatedRequest = await PrescriptionRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: "Prescription request not found" });
    }

    return res.status(200).json({ success: true, message: `Prescription request ${status} successfully`, request: updatedRequest });
  } catch (error) {
    console.error("verifyPrescriptionRequest error:", error);
    return res.status(500).json({ success: false, message: "Failed to update prescription request" });
  }
};

// ─────────────────────────────────────────────────────────────
// PRESCRIBER DASHBOARD
// ─────────────────────────────────────────────────────────────
export const getPrescriberDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "prescriber") {
      return res.status(403).json({ success: false, message: "Access denied. Prescriber role required." });
    }

    const [
      activeLinksCount,
      pendingLinksCount,
      totalRequests,
      pendingRequests,
      approvedRequests,
      recentRequests,
    ] = await Promise.all([
      PrescriberLink.countDocuments({ prescriberId: userId, status: "active" }),
      PrescriberLink.countDocuments({ prescriberId: userId, status: "pending" }),
      PrescriptionRequest.countDocuments({ prescriberId: userId }),
      PrescriptionRequest.countDocuments({ prescriberId: userId, status: "pending" }),
      PrescriptionRequest.countDocuments({ prescriberId: userId, status: "approved" }),
      PrescriptionRequest.find({ prescriberId: userId })
        .populate("requesterId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const recentPrescriptions = recentRequests.map((item) => ({
      _id: item._id,
      user: {
        firstName: item.patientName?.firstName || "",
        lastName:  item.patientName?.lastName  || "",
      },
      method:    item.treatment || "consultation",
      status:    item.status    || "pending",
      createdAt: item.createdAt,
    }));

    const alerts = [];
    if (pendingLinksCount > 0) {
      alerts.push({ type: "pending_links", message: `${pendingLinksCount} pending link request(s)` });
    }
    if (pendingRequests > 0) {
      alerts.push({ type: "pending_requests", message: `${pendingRequests} prescription request(s) awaiting review` });
    }

    return res.status(200).json({
      success: true,
      data: {
        orders: {
          totalRevenue:    0,
          totalOrders:     totalRequests,
          totalCommission: approvedRequests * 10,
          pendingOrders:   pendingRequests,
        },
        stock: {
          totalProducts: 0, totalUnits: 0, lowStockCount: 0,
          expiring30Count: 0, expiring60Count: 0, expiredCount: 0,
        },
        threePot: {
          equilibriumStatus: "green",
          pot1StockValue:    0,
          pot2Deposit:       0,
          pot3Commission:    approvedRequests * 10,
        },
        alerts:              { count: alerts.length, items: alerts },
        recentPrescriptions,
        stats: {
          totalLinkedUsers:               activeLinksCount,
          pendingLinkRequests:            pendingLinksCount,
          totalPrescriptionRequests:      totalRequests,
          pendingPrescriptionRequests:    pendingRequests,
          approvedPrescriptionRequests:   approvedRequests,
        },
      },
    });
  } catch (error) {
    console.error("getPrescriberDashboard error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard data", error: error.message });
  }
};