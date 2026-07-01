// server/controllers/adminContactController.js
import { AdminContact, ContactSettings } from '../models/adminContact.js';

// ==================== CONTACT MESSAGES ====================

export const createContact = async (req, res) => {
  try {
    const contactData = {
      name: req.body.name,
      email: req.body.email,
      professionalReg: req.body.professionalReg || '',
      subject: req.body.subject,
      message: req.body.message
    };

    const contact = new AdminContact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error creating contact:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating contact',
      error: error.message
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const contacts = await AdminContact.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdminContact.countDocuments();

    res.status(200).json({
      success: true,
      data: contacts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contacts',
      error: error.message 
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await AdminContact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await AdminContact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
};

// ==================== CONTACT SETTINGS ====================

export const getContactSettings = async (req, res) => {
  try {
    let settings = await ContactSettings.findOne();
    
    if (!settings) {
      settings = new ContactSettings();
      await settings.save();
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching contact settings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact settings',
      error: error.message
    });
  }
};

export const updateContactSettings = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    let settings = await ContactSettings.findOne();
    
    if (!settings) {
      settings = new ContactSettings(updateData);
      await settings.save();
    } else {
      settings = await ContactSettings.findByIdAndUpdate(
        settings._id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Contact settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating contact settings:', error.message);
    res.status(400).json({
      success: false,
      message: 'Error updating contact settings',
      error: error.message
    });
  }
};

export const resetContactSettings = async (req, res) => {
  try {
    await ContactSettings.findOneAndDelete();
    const settings = new ContactSettings();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Contact settings reset to default',
      data: settings
    });
  } catch (error) {
    console.error('Error resetting contact settings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error resetting contact settings',
      error: error.message
    });
  }
};