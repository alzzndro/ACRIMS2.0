import { db } from '../config/db.js';

// ✔ Get all room change forms
export async function getAllRoomChangeForms() {
    const [forms] = await db.query(
        "SELECT * FROM room_change_form"
    );
    return forms;
};

// ✔ Get form by ID
export async function getRoomChangeFormById(id) {
    const [[form]] = await db.query(
        "SELECT * FROM room_change_form WHERE id = ?",
        [id]
    );
    return form;
};

// ✔ Add new room change form
export async function addRoomChangeForm(data) {
    try {
        const [result] = await db.query(
            `INSERT INTO room_change_form (
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
                reason_of_change
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.full_name,
                data.email,
                data.date_submitted,
                data.time_submitted,
                data.department_id,
                data.from_room,
                data.to_room,
                data.from_day,
                data.to_day,
                data.from_time,
                data.to_time,
                data.schedule_number,
                data.reason_of_change || null,
            ]
        );

        return result.insertId;
    } catch (error) {
        console.log("Error in roomChangeForm model: ", error.message);
        throw error;
    }
};


// ✔ Update room change form
export async function updateRoomChangeForm(data, id) {
    const [result] = await db.query(
        `UPDATE room_change_form
         SET 
            department_id = ?,
            from_room = ?,
            to_room = ?,
            from_day = ?,
            to_day = ?,
            from_time = ?,
            to_time = ?,
            schedule_number = ?,
            reason_of_change = ?,
            approved_by = ?,
            is_approved_head = ?,
            is_approved_room_loading = ?,
            is_noted_by_checker = ?
         WHERE id = ?`,
        [
            data.department_id,
            data.from_room,
            data.to_room,
            data.from_day,
            data.to_day,
            data.from_time,
            data.to_time,
            data.schedule_number,
            data.reason_of_change || null,
            data.approved_by || null,
            data.is_approved_head ?? null,
            data.is_approved_room_loading ?? null,
            data.is_noted_by_checker ?? null,
            id
        ]
    );

    return result;
};


// ✔ Delete form
export async function deleteRoomChangeForm(id) {
    const [{ affectedRows }] = await db.query(
        "DELETE FROM room_change_form WHERE id = ?",
        [id]
    );

    return affectedRows;
};
