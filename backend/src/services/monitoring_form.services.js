import * as model from '../models/monitoring_form.model.js';

// GET
export async function getAllForms() {
    const forms = await model.getAllForms();
    return forms;
}

// GET
export async function getFormById(id) {
    const form = await model.getFormById(id);
    return form;
}

// GET 
export async function getFormByChecker(id) {
    const form = await model.getFormByChecker(id);
    return form;
}

// DELETE
export async function deleteFormById(id) {
    const affectedRows = await model.deleteFormById(id);
    return affectedRows;
}

// POST
export async function addForm(data) {
    return await model.addForm(data);
}

// PUT
export async function updateForm(data, id = 0) {
    return await model.updateForm(data, id);
}