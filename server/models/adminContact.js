// server/models/adminContact.js
import mongoose from 'mongoose';

const adminContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address']
  },
  professionalReg: {
    type: String,
    trim: true,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: [
      'General Inquiry',
      'Account Validation & Verification',
      'SwiftRx™ Prescription Help',
      'Fulfillment & Cold-Chain Delivery',
      'Regulatory/Audit Request'
    ],
    default: 'General Inquiry'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdminContact = mongoose.models.AdminContact || mongoose.model('AdminContact', adminContactSchema);
export default AdminContact;