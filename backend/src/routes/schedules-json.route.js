import express from 'express';
import {
    jsonSchedules,
    getAllSchedules,
    scheduleById,
    deleteScheduleFile,
    uploadScheduleFile,
    uploadMiddleware,
    getScheduleStats
} from '../controllers/schedule.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
};

// Get all JSON schedule files and their data (read-only)
router.get('/', authMiddleware, jsonSchedules);

// Get all schedules from all files (flattened, read-only)
router.get('/all', authMiddleware, getAllSchedules);

// Get schedule by ID from any file (read-only)
router.get('/:id', authMiddleware, scheduleById);

// Get schedule statistics (read-only)
router.get('/stats', authMiddleware, getScheduleStats);

// JSON FILE MANAGEMENT (admin only)
// Delete a schedule file (admin only)
router.delete('/files/:filename', authMiddleware, verifyAdmin, deleteScheduleFile);

// Upload and import JSON schedule file (admin only)
router.post('/upload', authMiddleware, verifyAdmin, uploadMiddleware, uploadScheduleFile);

export { router };
