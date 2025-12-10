import * as model from '../models/room_change_form.model.js';

// GET all forms
export async function getAllRoomChangeForms() {
    const forms = await model.getAllRoomChangeForms();
    return forms;
}

// GET form by ID
export async function getRoomChangeFormById(id) {
    const form = await model.getRoomChangeFormById(id);
    return form;
}

// POST - Add form
export async function addRoomChangeForm(data) {
    return await model.addRoomChangeForm(data);
}

// PUT - Update form
export async function updateRoomChangeForm(data, id = 0) {
    return await model.updateRoomChangeForm(data, id);
}

// DELETE form
export async function deleteRoomChangeForm(id) {
    const affectedRows = await model.deleteRoomChangeForm(id);
    return affectedRows;
}
