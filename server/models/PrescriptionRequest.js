import mongoose from "mongoose";

const PrescriptionRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    prescriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientName: {
      firstName: {
        type: String,
        required: true,
      },

      lastName: {
        type: String,
        required: true,
      },
    },

    dob: {
      type: String,
    },

    consultationDate: {
      type: String,
    },

    treatment: {
      type: String,
      required: true,
      enum: [
        "Dermal Fillers",
        "Anti-Wrinkle Injection",
        "Vitamin B12",
        "Skin Booster",
      ],
    },

    // ✅ FIXED
    // Your medicines model is Medicine not Product
    productsRequired: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],

    clinicalNotes: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PrescriptionRequest =
  mongoose.models.PrescriptionRequest ||
  mongoose.model("PrescriptionRequest", PrescriptionRequestSchema);

export default PrescriptionRequest;