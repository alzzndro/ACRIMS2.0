import * as service from '../services/monitoring_form.services.js'
import * as mailer from '../services/mailer.services.js'

import multer from "multer";
import path from "path";
import dotenv from 'dotenv';
dotenv.config();

// GET all forms
export async function getAllForms(req, res) {
    try {
        const forms = await service.getAllForms();

        // // Formatted date_monitored
        // const formattedForms = forms.map(form => ({
        //     ...form,
        //     date_monitored: form.date_monitored.toISOString().slice(0, 10)
        // }))

        res.status(200).send(forms);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
        throw error
    }
};

// POST form
export async function addForm(req, res) {
    try {
        const {
            room_number,
            instructor_name,
            instructor_email,
            instructor_presence,
            is_late,
            remarks,
            schedule_time,
            changed_rooms
        } = req.body;

        // Normalize boolean fields
        const presenceValue = instructor_presence === "true" || instructor_presence === "1" ? 1 : 0;
        const lateValue = is_late === "true" || is_late === "1" ? 1 : 0;
        const changedRoomsValue = changed_rooms === "true" || changed_rooms === "1" ? 1 : 0;

        // File upload path
        const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

        // Insert into DB
        await service.addForm({
            room_number,
            instructor_name,
            instructor_presence: presenceValue,
            is_late: lateValue,
            remarks,
            schedule_time,
            photo: photoPath,
            checker_id: req.user.id, // always trust JWT, NOT client body
            changed_rooms: changedRoomsValue
        });

        // If instructor absent, email them
        if (!presenceValue && instructor_email) {
            await mailer.sendEmailAbsent(instructor_email);
            return res.status(201).json({
                success: true,
                message: "Form added and email sent successfully!",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Form added successfully!",
        });

    } catch (error) {
        console.error("Error in controller:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


// GET form by id
export async function getFormById(req, res) {
    try {
        const form = await service.getFormById(req.params.id)
        if (form == undefined) {
            res.status(404).send(`ID:${req.params.id} not found!`)
        } else {
            res.status(200).send(form)
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
        throw error
    }
}

// GET form by checker
export async function getFormByChecker(req, res) {
    try {
        const form = await service.getFormByChecker(req.user.id)
        if (form == undefined) {
            res.status(404).send(`ID:${req.user.id} not found!`)
        } else {
            res.status(200).send(form)
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
        throw error
    }
}

// DELETE form by id
export async function deleteFormById(req, res) {
    try {
        const affectedRows = await service.deleteFormById(req.params.id)
        if (affectedRows === 0) {
            res.status(404).send(`ID:${req.params.id} cannot be found!`)
        } else {
            res.status(200).send(`AffectedRows:${affectedRows} Form:${req.params.id} deleted successfully!`)
        }
        console.log(affectedRows);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
        throw error
    }
}

// PUT update form by id
export async function updateForm(req, res) {
    try {
        const affectedRows = await service.updateForm(req.body, req.params.id)
        if (affectedRows === 0) {
            res.status(404).send(`ID:${req.params.id} not found!`)
        } else {
            res.status(200).send("Updated successfully!")
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}