import express from 'express';
const router = express.Router();
import * as monitoringFormController from '../controllers/monitoring_form.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizedRoles } from '../controllers/user.controller.js';
import upload from '../middleware/multer.js';

router.get('/', authMiddleware, monitoringFormController.getAllForms);
router.post('/add', authMiddleware, upload.single('photo'), monitoringFormController.addForm);
router.get('/checker', authMiddleware, monitoringFormController.getFormByChecker);
router.get('/:id', authMiddleware, monitoringFormController.getFormById);
router.delete('/delete/:id', authMiddleware, monitoringFormController.deleteFormById);
router.put('/update/:id', authMiddleware, monitoringFormController.updateForm);

export { router };