import * as model from '../models/users.model.js'

export async function getAllUsers() {
    return await model.getAllUsers();
}

export async function addUser(data) {
    return await model.addUser(data)
}

export async function deleteUserById(id) {
    return await model.deleteUserById(id)
}

export async function loginUser(data) {
    return await model.loginUser(data)
}

export async function editUserDetails(data, id) {
    return await model.editUserDetails(data, id)
}

export async function editUserPhoto(data, id) {
    return await model.editUserPhoto(data, id)
}

export async function editUserPassword(data, id) {
    return await model.editUserPassword(data, id)
}

export async function getUser(id) {
    return await model.getUser(id)
}

export async function deleteUser(id) {
    return await model.deleteUser(id)
}