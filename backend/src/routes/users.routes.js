import express from 'express';
import upload from "../middleware/multer.js";
const router = express.Router();
import * as usersController from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// For Login and Register
router.post('/register', usersController.addUser);
router.post('/login', usersController.loginUser);

// JWT verification
router.get('/verify', authMiddleware, usersController.verify);
router.get('/me', authMiddleware, usersController.getUser);

router.get('/', authMiddleware, usersController.getAllUsers);
router.get('/uzers', usersController.getAllUsers);
router.put('/edit/image', authMiddleware, upload.single("image"), usersController.editUserPhoto);
router.put('/edit/details', authMiddleware, usersController.editUserDetails);
router.put('/edit/password/:id', authMiddleware, usersController.editUserPassword);
router.delete('/:id', authMiddleware, usersController.deleteUser);

export { router };