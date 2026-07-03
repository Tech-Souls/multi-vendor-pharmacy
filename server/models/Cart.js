// models/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: String, // ✅ CHANGED from ObjectId to String — fixes comparison issues
        required: true
      },
      name: String,
      image: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      prescriptionRequired: { type: Boolean, default: false },
    }
  ],
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);