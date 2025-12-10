import * as service from '../services/room_change_services.js';
import dotenv from 'dotenv';
dotenv.config();

// GET all forms
export async function getAllRoomChangeForms(req, res) {
    try {
        const forms = await service.getAllRoomChangeForms();
        res.status(200).send(forms);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        throw error;
    }
};

// POST create new room change form
export async function addRoomChangeForm(req, res) {
    try {
        const {
            full_name,
            email,
            date_submitted,
            time_submitted,
            department_id,
            from_room,
            to_room,
            from_day,
            to_day,
            from_time,
            to_time,
            schedule_number,
            reason_of_change,
            approved_by
        } = req.body;

        await service.addRoomChangeForm({
            full_name,
            email,
            date_submitted,
            time_submitted,
            department_id,
            from_room,
            to_room,
            from_day,
            to_day,
            from_time,
            to_time,
            schedule_number,
            reason_of_change,
            approved_by
        });

        return res.status(201).json({
            success: true,
            message: "Room change form added successfully!"
        });

    } catch (error) {
        console.error("Error in controller:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// GET form by ID
export async function getRoomChangeFormById(req, res) {
    try {
        const form = await service.getRoomChangeFormById(req.params.id);

        if (!form) {
            return res.status(404).send(`ID:${req.params.id} not found!`);
        }

        res.status(200).send(form);

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        throw error;
    }
};


// DELETE form by ID
export async function deleteRoomChangeForm(req, res) {
    try {
        const affectedRows = await service.deleteRoomChangeForm(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).send(`ID:${req.params.id} cannot be found!`);
        }

        res.status(200).send(`AffectedRows:${affectedRows} Form:${req.params.id} deleted successfully!`);

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        throw error;
    }
};


// PUT update form by ID
export async function updateRoomChangeForm(req, res) {
    try {
        const result = await service.updateRoomChangeForm(req.body, req.params.id);

        if (result.affectedRows === 0) {
            return res.status(404).send(`ID:${req.params.id} not found!`);
        }

        res.status(200).send("Updated successfully!");

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
