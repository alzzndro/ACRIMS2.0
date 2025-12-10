import { db } from '../config/db.js'

// GET ALL USER ------------------------------------------------------------------------------
export async function getAllUsers() {
    const [records] = await db.query("SELECT * FROM users");
    return records;
}

// ADD USER ------------------------------------------------------------------------------
export async function addUser(data) {
    const [result] = await db.query(`INSERT INTO users(user_id, email, password, first_name, last_name, user_role, department_id) VALUES(?, ?, ?, ?, ?, ?, ?)`, [data.user_id, data.email, data.password, data.first_name, data.last_name, data.user_role, data.department_id])
    return result.insertId
}

// LOGIN USER ------------------------------------------------------------------------------
export async function loginUser(data) {
    const [result] = await db.query(`SELECT * FROM users WHERE email = ?`, [data.email])
    return result;
}

// EDIT USER DETAILS ------------------------------------------------------------------------------
export async function editUserDetails(data, id) {
    const [result] = await db.query(
        `UPDATE users
        SET first_name = ?, last_name = ?
        WHERE user_id = ?`,
        [data.first_name, data.last_name, id]
    )
    return result
}

export async function editUserPhoto(data, id) {
    const [result] = await db.query(
        `UPDATE users
        SET profile_image_path = ?
        WHERE user_id = ?`,
        [data.image, id]
    );
    return result;
}

export async function editUserPassword(data, id) {
    const [result] = await db.query(
        `UPDATE users
        SET password = ?
        WHERE user_id = ?`,
        [data.password, id]
    )
    return result
}

export async function getUser(id) {
    const [record] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
    return record[0];
}

export async function deleteUser(id) {
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [id]);
    return result.affectedRows;
}