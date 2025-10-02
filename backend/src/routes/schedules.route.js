import express from 'express';
import ScheduleModel from '../models/schedules.model.js';
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

// Get all schedules with optional filters
router.get('/', authMiddleware, async (req, res) => {
    try {
        const filters = {
            day: req.query.day,
            room_id: req.query.room_id,
            instructor: req.query.instructor,
            subject: req.query.subject
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const schedules = await ScheduleModel.getAllSchedules(filters);

        res.json({
            success: true,
            schedules,
            totalSchedules: schedules.length
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedules',
            error: error.message
        });
    }
});

// Get current schedules for rooms page
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const schedules = await ScheduleModel.getCurrentSchedules(day, currentTime);

        res.json({
            success: true,
            schedules,
            day,
            currentTime
        });
    } catch (error) {
        console.error('Error fetching current schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch current schedules',
            error: error.message
        });
    }
});

// Get schedule statistics (admin only)
router.get('/stats', authMiddleware, verifyAdmin, async (req, res) => {
    try {
        const stats = await ScheduleModel.getScheduleStats();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching schedule statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule statistics',
            error: error.message
        });
    }
});

// Get schedule by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await ScheduleModel.getScheduleById(id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.json({
            success: true,
            schedule
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule',
            error: error.message
        });
    }
});

// Create new schedule (admin only)
router.post('/', authMiddleware, verifyAdmin, async (req, res) => {
    try {
        const {
            room_id,
            room_name,
            day,
            start_time,
            end_time,
            subject,
            section,
            instructor,
            instructor_email,
            floor
        } = req.body;

        // Validate required fields
        if (!room_id || !day || !start_time || !end_time || !subject || !instructor) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_id, day, start_time, end_time, subject, instructor'
            });
        }

        // Validate day
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(day)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid day. Must be one of: ' + validDays.join(', ')
            });
        }

        // Validate floor
        const validFloors = ['first', 'second', 'third', 'fourth'];
        if (floor && !validFloors.includes(floor)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid floor. Must be one of: ' + validFloors.join(', ')
            });
        }

        const scheduleData = {
            room_id,
            room_name: room_name || `Room ${room_id}`,
            day,
            start_time,
            end_time,
            subject,
            section,
            instructor,
            instructor_email,
            floor: floor || 'first'
        };

        const newSchedule = await ScheduleModel.createSchedule(scheduleData);

        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            schedule: newSchedule
        });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create schedule',
            error: error.message
        });
    }
});

// Update schedule (admin only)
router.put('/:id', authMiddleware, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            room_id,
            room_name,
            day,
            start_time,
            end_time,
            subject,
            section,
            instructor,
            instructor_email,
            floor
        } = req.body;

        // Validate required fields
        if (!room_id || !day || !start_time || !end_time || !subject || !instructor) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_id, day, start_time, end_time, subject, instructor'
            });
        }

        // Validate day
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!validDays.includes(day)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid day. Must be one of: ' + validDays.join(', ')
            });
        }

        // Validate floor
        const validFloors = ['first', 'second', 'third', 'fourth'];
        if (floor && !validFloors.includes(floor)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid floor. Must be one of: ' + validFloors.join(', ')
            });
        }

        const scheduleData = {
            room_id,
            room_name: room_name || `Room ${room_id}`,
            day,
            start_time,
            end_time,
            subject,
            section,
            instructor,
            instructor_email,
            floor: floor || 'first'
        };

        const updatedSchedule = await ScheduleModel.updateSchedule(id, scheduleData);

        res.json({
            success: true,
            message: 'Schedule updated successfully',
            schedule: updatedSchedule
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        if (error.message === 'Schedule not found or already deleted') {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to update schedule',
                error: error.message
            });
        }
    }
});

// Delete schedule (admin only)
router.delete('/:id', authMiddleware, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ScheduleModel.deleteSchedule(id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        if (error.message === 'Schedule not found or already deleted') {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to delete schedule',
                error: error.message
            });
        }
    }
});

export { router };