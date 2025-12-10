import express from 'express';
const router = express.Router();
import * as roomChangeFormController from '../controllers/room_change_controller.js';

router.get('/', roomChangeFormController.getAllRoomChangeForms);
router.post('/add', roomChangeFormController.addRoomChangeForm);
router.get('/:id', roomChangeFormController.getRoomChangeFormById);
router.delete('/delete/:id', roomChangeFormController.deleteRoomChangeForm);
router.put('/update/:id', roomChangeFormController.updateRoomChangeForm);

export { router };