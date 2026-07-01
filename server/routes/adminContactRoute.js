// server/routes/adminContactRoute.js
import express from 'express';
import * as contactController from '../controllers/adminContactController.js';

const router = express.Router();

// ==================== CONTACT MESSAGES ====================
router.post('/contacts', contactController.createContact);
router.get('/contacts', contactController.getAllContacts);
router.get('/contacts/:id', contactController.getContactById);
router.delete('/contacts/:id', contactController.deleteContact);

// ==================== CONTACT SETTINGS ====================
router.get('/contact-settings', contactController.getContactSettings);
router.put('/contact-settings', contactController.updateContactSettings);
router.delete('/contact-settings/reset', contactController.resetContactSettings);

export default router;