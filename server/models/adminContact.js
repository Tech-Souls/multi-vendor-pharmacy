// server/models/adminContact.js
import mongoose from 'mongoose';

// Contact Settings Schema
const contactSettingsSchema = new mongoose.Schema({
  pharmacyName: {
    type: String,
    default: 'Time Pharmacy'
  },
  address: {
    type: String,
    default: '[Insert Registered Business Address Details]'
  },
  country: {
    type: String,
    default: 'United Kingdom'
  },
  gphcPremisesNo: {
    type: String,
    default: 'GPhC Premises No: 9010453'
  },
  operatingHours: {
    type: String,
    default: 'Monday – Friday: 09:00 to 18:00'
  },
  weekendHours: {
    type: String,
    default: 'Saturday – Sunday: Closed'
  },
  pomCutoff: {
    type: String,
    default: 'POM Cut-off: 15:00 for same-day dispatch'
  },
  phoneNumber: {
    type: String,
    default: '+44 (0) 20 0000 0000'
  },
  phoneBadge: {
    type: String,
    default: 'Clinical queries / Prescriber validation desk'
  },
  email: {
    type: String,
    default: 'support@drgpharma.com'
  },
  emailBadge: {
    type: String,
    default: 'Submit scanned manual Rx forms here'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// User Messages Schema
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

// Create models
const AdminContact = mongoose.models.AdminContact || mongoose.model('AdminContact', adminContactSchema);
const ContactSettings = mongoose.models.ContactSettings || mongoose.model('ContactSettings', contactSettingsSchema);

export { AdminContact, ContactSettings };