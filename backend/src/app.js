import express from 'express';
import middlewares from './middleware/index.js';
import fs from 'fs';
import path from 'path';

const app = express();

import { router as monitoringFormRouter } from './routes/monitoring_form.route.js';
import { router as usersRouter } from './routes/users.routes.js';
import { router as scheduleRouter } from './routes/schedules.route.js';
import { router as scheduleJsonRouter } from './routes/schedules-json.route.js';
import { router as roomChangeFormRouter } from './routes/room_change_form.route.js';


// import fs for photo
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('✅ Created /uploads folder');
}

// ---------------------- MIDDLEWARE ----------------------
middlewares.forEach(mw => app.use(mw));


// ---------------------- ROUTES ----------------------
app.use('/form', monitoringFormRouter);
app.use('/user', usersRouter);
app.use('/schedules/json', scheduleJsonRouter);
app.use('/schedules', scheduleRouter);
app.use('/roomchange', roomChangeFormRouter);


// ---------------------- STATIC FILES ----------------------
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// ---------------------- GLOBAL ERROR HANDLER ----------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: err.message || "Global Error Somethang! Went Wrong!!",
    });
});

export { app }