import { db as pool } from '../config/db.js';

class ScheduleModel {
    // Get all schedules with optional filters
    static async getAllSchedules(filters = {}) {
        let query = `
            SELECT 
                id,
                room_id,
                room_name,
                day,
                TIME_FORMAT(start_time, '%H:%i:%s') as start_time,
                TIME_FORMAT(end_time, '%H:%i:%s') as end_time,
                subject,
                section,
                instructor,
                instructor_email,
                floor,
                is_active,
                created_at,
                updated_at
            FROM schedules 
            WHERE is_active = 1
        `;

        const params = [];

        if (filters.day) {
            query += ' AND day = ?';
            params.push(filters.day);
        }

        if (filters.room_id) {
            query += ' AND room_id = ?';
            params.push(filters.room_id);
        }

        if (filters.instructor) {
            query += ' AND instructor LIKE ?';
            params.push(`%${filters.instructor}%`);
        }

        if (filters.subject) {
            query += ' AND subject LIKE ?';
            params.push(`%${filters.subject}%`);
        }

        query += ' ORDER BY day, start_time';

        try {
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        }
    }

    // Get schedule by ID
    static async getScheduleById(id) {
        const query = `
            SELECT 
                id,
                room_id,
                room_name,
                day,
                TIME_FORMAT(start_time, '%H:%i:%s') as start_time,
                TIME_FORMAT(end_time, '%H:%i:%s') as end_time,
                subject,
                section,
                instructor,
                instructor_email,
                floor,
                is_active,
                created_at,
                updated_at
            FROM schedules 
            WHERE id = ? AND is_active = 1
        `;

        try {
            const [rows] = await pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching schedule by ID:', error);
            throw error;
        }
    }

    // Create new schedule
    static async createSchedule(scheduleData) {
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
        } = scheduleData;

        const query = `
            INSERT INTO schedules (
                room_id, room_name, day, start_time, end_time, 
                subject, section, instructor, instructor_email, floor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const [result] = await pool.execute(query, [
                room_id, room_name, day, start_time, end_time,
                subject, section, instructor, instructor_email, floor
            ]);

            return { id: result.insertId, ...scheduleData };
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    }

    // Update schedule
    static async updateSchedule(id, scheduleData) {
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
        } = scheduleData;

        const query = `
            UPDATE schedules SET 
                room_id = ?, room_name = ?, day = ?, start_time = ?, end_time = ?,
                subject = ?, section = ?, instructor = ?, instructor_email = ?, floor = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = 1
        `;

        try {
            const [result] = await pool.execute(query, [
                room_id, room_name, day, start_time, end_time,
                subject, section, instructor, instructor_email, floor, id
            ]);

            if (result.affectedRows === 0) {
                throw new Error('Schedule not found or already deleted');
            }

            return await this.getScheduleById(id);
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    }

    // Delete schedule (soft delete)
    static async deleteSchedule(id) {
        const query = `
            UPDATE schedules SET 
                is_active = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = 1
        `;

        try {
            const [result] = await pool.execute(query, [id]);

            if (result.affectedRows === 0) {
                throw new Error('Schedule not found or already deleted');
            }

            return { success: true, message: 'Schedule deleted successfully' };
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    }

    // Get schedules by day and current time (for rooms page)
    static async getCurrentSchedules(day, currentTime) {
        const query = `
            SELECT 
                id,
                room_id,
                room_name,
                day,
                TIME_FORMAT(start_time, '%H:%i:%s') as start_time,
                TIME_FORMAT(end_time, '%H:%i:%s') as end_time,
                subject,
                section,
                instructor,
                instructor_email,
                floor
            FROM schedules 
            WHERE day = ? AND end_time >= ? AND is_active = 1
            ORDER BY start_time
        `;

        try {
            const [rows] = await pool.execute(query, [day, currentTime]);
            return rows;
        } catch (error) {
            console.error('Error fetching current schedules:', error);
            throw error;
        }
    }

    // Get schedule statistics
    static async getScheduleStats() {
        const queries = {
            total: 'SELECT COUNT(*) as count FROM schedules WHERE is_active = 1',
            byDay: `
                SELECT day, COUNT(*) as count 
                FROM schedules 
                WHERE is_active = 1 
                GROUP BY day
            `,
            byFloor: `
                SELECT floor, COUNT(*) as count 
                FROM schedules 
                WHERE is_active = 1 
                GROUP BY floor
            `,
            uniqueRooms: 'SELECT COUNT(DISTINCT room_id) as count FROM schedules WHERE is_active = 1',
            uniqueInstructors: 'SELECT COUNT(DISTINCT instructor) as count FROM schedules WHERE is_active = 1'
        };

        try {
            const [totalResult] = await pool.execute(queries.total);
            const [byDayResult] = await pool.execute(queries.byDay);
            const [byFloorResult] = await pool.execute(queries.byFloor);
            const [uniqueRoomsResult] = await pool.execute(queries.uniqueRooms);
            const [uniqueInstructorsResult] = await pool.execute(queries.uniqueInstructors);

            return {
                total: totalResult[0].count,
                byDay: byDayResult,
                byFloor: byFloorResult,
                uniqueRooms: uniqueRoomsResult[0].count,
                uniqueInstructors: uniqueInstructorsResult[0].count
            };
        } catch (error) {
            console.error('Error fetching schedule statistics:', error);
            throw error;
        }
    }
}

export default ScheduleModel;
