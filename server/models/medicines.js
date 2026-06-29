import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Botulinum Toxins",
        "Dermal Fillers",
        "Skin Boosters",
        "Fat Dissolvers",
        "Mesotherapy",
        "Anesthetics",
        "Skincare",
        "Consumables",
        "Injectables",   // ✅ new
      ]
    },
    subCategory: {
      type: String,
      trim: true,
      default: null,
    },
    description:       { type: String },
    howToUse:          { type: String, trim: true },
    safetyInfo:        { type: String, trim: true },
    additionalImages:  [{ type: String }],
    dosage:            { type: String },
    sideEffects:       [{ type: String }],
    expiryDate:        { type: Date, required: false },
    prescriptionRequired: { type: Boolean, default: false },
    prescriptionType: {
      type: String,
      enum: ["none", "optional", "required"],
      default: "none",
    },
    buyingPrice:  { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    price:        { type: Number, required: true },
    unitPrice:    { type: Number, default: 0 },
    stock:        { type: Number, default: 0 },
    sku:          { type: String, trim: true, unique: true, sparse: true },
    supplier:     { type: String, trim: true },
    dispensedBy:  { type: String, trim: true },
    image:        { type: String },
    sellerId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Clear subCategory if category is not Injectables or skincare
medicineSchema.pre("save", function (next) {
  // Only clear subCategory if the category doesn't have valid subcategories
  const categoriesWithSubcategories = ["Injectables", "Skincare"];
  if (!categoriesWithSubcategories.includes(this.category)) {
    this.subCategory = null;
  }
  //next();
});

medicineSchema.virtual("profitMargin").get(function () {
  if (!this.buyingPrice || !this.sellingPrice) return 0;
  const profit = this.sellingPrice - this.buyingPrice;
  return ((profit / this.sellingPrice) * 100).toFixed(2);
});

const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
export default Medicine;