import * as service from '../services/users.services.js'
import jwt from 'jsonwebtoken'


// GET ALL USER -------------------------------------------------------------------------------------------
export async function getAllUsers(req, res) {
    try {
        const users = await service.getAllUsers();
        res.status(200).send(users)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal Error")
    }
}

// ADD USER -------------------------------------------------------------------------------------------
export async function addUser(req, res) {
    try {
        const { email, password, user_role } = req.body

        // check if input contains no value
        if (!email || !password || !user_role) {
            return res.status(400).send("Bad Request! No value or lacks value! ")
        } else {
            await service.addUser({ email, password, user_role })
            res.status(201).send("User added successfully!")
        }

    } catch (error) {
        console.error("Something went sideways: ", error);
        res.status(500).json({ error: "Internal server error" })
        throw error;
    }
}


// LOGIN USER -------------------------------------------------------------------------------------------
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body

        // if input contains no values
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const result = await service.loginUser({ email })

        // if email not exist
        if (!result || result.length === 0) {
            return res.status(401).json({ email: false })
        }

        const user = result[0]

        // compare password to user's password
        if (password !== user.password) {
            return res.status(401).json({ password: false })
        }

        const token = jwt.sign({ id: user.user_id, email: user.email, role: user.user_role }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' })

        // successful
        return res.status(200).json({
            success: true,
            message: `${user.user_id} logged in successfully!`,
            token: token,
            user: {
                id: user.user_id,
                role: user.user_role,
                name: user.first_name,
                email: user.email,
            }
        })


    } catch (error) {
        res.status(500).json({ success: "False", error: error.message })
    }
}

// EDIT USER -------------------------------------------------------------------------------------------
export async function editUserDetails(req, res) {
    try {
        let { first_name, last_name } = req.body;
        const id = req.user.id;

        first_name = first_name ? first_name.toLowerCase() : "";
        last_name = last_name ? last_name.toLowerCase() : "";

        if (!first_name || !last_name) {
            res.status(400).send("Please fill out the form!");
        }

        const result = await service.editUserDetails({ first_name, last_name }, id);

        if (result.affectedRows === 0) {
            res.status(404).send(`${id} is not found`);
        }

        res.status(200).json({ success: true, message: `${id} Updated successfully!` });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export async function editUserPassword(req, res) {
    try {
        const { password } = req.body
        const id = req.params.id

        if (!password) {
            res.status(400).send("Please fill out the form")
        }

        const result = await service.editUserPassword({ password }, id)

        if (result.affectedRows === 0) {
            res.status(404).send(`${id} User not found!!`)
        }

        res.status(200).send(`${id}'s password updated successfully!`)
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

export async function editUserPhoto(req, res) {
    try {
        const id = req.user.id;

        if (!req.file) {
            return res.status(400).send("Please upload an image!");
        }

        // File path relative to your public folder
        const imagePath = `/uploads/${req.file.filename}`;

        const result = await service.editUserPhoto({ image: imagePath }, id);

        if (result.affectedRows === 0) {
            return res.status(404).send(`${id} User not found!!`);
        }

        res.status(200).send(`User ${id} uploaded successfully!`);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// JWT Inspector
export async function verify(req, res) {
    return res.json({
        success: true,
        message: "Token is valid!",
        user: req.user
    })
}

// Role Guard
export async function authorizedRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next()
    }
}

// User me
export async function getUser(req, res) {
    try {
        const user = await service.getUser(req.user.id)
        res.status(200).send(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal Error")
    }
}

// DELETE USER
export async function deleteUser(req, res) {
    try {
        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const affectedRows = await service.deleteUser(userId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}