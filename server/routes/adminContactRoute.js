// server/routes/adminContactRoute.js
import express from 'express';
import * as contactController from '../controllers/adminContactController.js';

const router = express.Router();

// Public route for submitting contact form
router.post('/contacts', contactController.createContact);

// Admin routes
router.get('/contacts', contactController.getAllContacts);
router.get('/contacts/:id', contactController.getContactById);
router.delete('/contacts/:id', contactController.deleteContact);

export default router;