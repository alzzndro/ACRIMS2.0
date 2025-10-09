import { db } from '../config/db.js'

export async function getAllForms() {
    const [forms] = await db.query(
        "SELECT * FROM monitoring_form"
    );
    return forms;
};

export async function getFormById(id) {
    const [[form]] = await db.query(
        "SELECT * FROM monitoring_form WHERE form_id = ?", [id]
    );
    return form;
};

export async function getFormByChecker(id) {
    const [form] = await db.query(
        "SELECT * FROM monitoring_form WHERE checker_id = ?", [id]
    );
    return form;
};

export async function deleteFormById(id) {
    const [{ affectedRows }] = await db.query(
        "DELETE FROM monitoring_form WHERE form_id = ?",
        [id]
    );
    return affectedRows;
};

export async function addForm(data) {
    try {
        const [result] = await db.query(
            `INSERT INTO monitoring_form (
            date_monitored,
            time_monitored,
            room_number,
            instructor_name,
            instructor_presence,
            remarks,
            photo,
            checker_id
        ) VALUES (CURRENT_DATE, CURRENT_TIME, ?, ?, ?, ?, ?, ?)`,
            [data.room_number, data.instructor_name, data.instructor_presence, data.remarks || null, data.photo || null, data.checker_id || null]
        );
        return result.insertId;
    } catch (error) {
        console.log("Error in model: ", error.message);
    }
};

export async function updateForm(data, id) {
    const [result] = await db.query(
        `UPDATE monitoring_form
         SET 
            room_number = ?, 
            instructor_name = ?, 
            instructor_presence = ?, 
            remarks = ?
         WHERE form_id = ?`,
        [
            data.room_number,
            data.instructor_name,
            data.instructor_presence !== undefined && data.instructor_presence !== null
                ? data.instructor_presence
                : 0, // fallback if null
            data.remarks,
            id
        ]
    );

    return result;
};