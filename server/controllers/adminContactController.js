// server/controllers/adminContactController.js
import AdminContact from '../models/adminContact.js';

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