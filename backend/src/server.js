import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js'
import { db } from './config/db.js'

// ---------------------- USE PORT FROM .ENV FILE ----------------------
const PORT = process.env.PORT || 3002;

// ---------------------- ENSURING DB CONNECTION ----------------------
// ---------------------- STARTING THE SERVER ----------------------
async function startServer() {
    try {
        await db.query("SELECT 1")
            .then(() => {
                console.log("DB connected successfully!");
                app.listen(PORT, () => {
                    console.log(`App listening on port ${PORT}!`);
                });
            })
    } catch (error) {
        console.log(`Db Connection Failed: ${error}`);
    }
}

startServer()


