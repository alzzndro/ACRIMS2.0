import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for JSON file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const jsonDirPath = path.join(process.cwd(), 'public', 'json');
        cb(null, jsonDirPath);
    },
    filename: (req, file, cb) => {
        // Ensure .json extension
        const fileName = file.originalname.toLowerCase().endsWith('.json')
            ? file.originalname
            : `${file.originalname}.json`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept only JSON files
        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper function to get JSON directory path
function getJsonDirPath() {
    return path.join(process.cwd(), 'public', 'json');
}

// Helper function to read all schedule files
async function readAllScheduleFiles() {
    const jsonDirPath = getJsonDirPath();

    return new Promise((resolve, reject) => {
        fs.readdir(jsonDirPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            const jsonFiles = files.filter(file => file.endsWith('.json'));

            const jsonDataPromises = jsonFiles.map(file => {
                const filePath = path.join(jsonDirPath, file);
                return new Promise((fileResolve, fileReject) => {
                    fs.readFile(filePath, 'utf8', (readErr, jsonData) => {
                        if (readErr) {
                            return fileReject(readErr);
                        }

                        try {
                            const parsedData = JSON.parse(jsonData);
                            fileResolve({
                                filename: file,
                                data: parsedData,
                                schedules: parsedData.schedules || []
                            });
                        } catch (parseError) {
                            fileReject(parseError);
                        }
                    });
                });
            });

            Promise.all(jsonDataPromises)
                .then(resolve)
                .catch(reject);
        });
    });
}

// Helper function to write JSON file
async function writeJsonFile(filename, data) {
    const jsonDirPath = getJsonDirPath();
    const filePath = path.join(jsonDirPath, filename);

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Get all JSON schedule files and their data
export async function jsonSchedules(req, res) {
    try {
        const allData = await readAllScheduleFiles();
        res.json({
            success: true,
            files: allData,
            totalFiles: allData.length,
            totalSchedules: allData.reduce((sum, file) => sum + file.schedules.length, 0)
        });
    } catch (error) {
        console.error('Error reading schedule files:', error);
        res.status(500).json({
            success: false,
            error: 'Error reading schedule files',
            message: error.message
        });
    }
}

// Get all schedules from all files (flattened)
export async function getAllSchedules(req, res) {
    try {
        const allData = await readAllScheduleFiles();
        const allSchedules = allData.flatMap(file =>
            file.schedules.map(schedule => ({
                ...schedule,
                source_file: file.filename
            }))
        );

        res.json({
            success: true,
            schedules: allSchedules,
            totalSchedules: allSchedules.length
        });
    } catch (error) {
        console.error('Error reading schedules:', error);
        res.status(500).json({
            success: false,
            error: 'Error reading schedules',
            message: error.message
        });
    }
}

// Get schedule by ID from any file
export async function scheduleById(req, res) {
    const scheduleId = req.params.id;

    try {
        const allData = await readAllScheduleFiles();
        let foundSchedule = null;
        let sourceFile = null;

        for (const file of allData) {
            const schedule = file.schedules.find(s => s.id === scheduleId);
            if (schedule) {
                foundSchedule = { ...schedule, source_file: file.filename };
                sourceFile = file.filename;
                break;
            }
        }

        if (foundSchedule) {
            res.json({
                success: true,
                schedule: foundSchedule,
                source_file: sourceFile
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Schedule not found'
            });
        }
    } catch (error) {
        console.error('Error finding schedule:', error);
        res.status(500).json({
            success: false,
            error: 'Error finding schedule',
            message: error.message
        });
    }
}

// JSON files are immutable for schedule operations
// Only file management (upload/delete) is allowed


// Delete a schedule file
export async function deleteScheduleFile(req, res) {
    const { filename } = req.params;

    try {
        const jsonDirPath = getJsonDirPath();
        const filePath = path.join(jsonDirPath, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Schedule file not found'
            });
        }

        // Delete file
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            filename,
            message: 'Schedule file deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting schedule file:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting schedule file',
            message: error.message
        });
    }
}

// Upload and import JSON schedule file
export async function uploadScheduleFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Validate JSON content
        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'utf8');

        try {
            const jsonData = JSON.parse(fileContent);

            // Validate structure
            if (!jsonData.schedules || !Array.isArray(jsonData.schedules)) {
                // Try to fix structure if it's just an array
                if (Array.isArray(jsonData)) {
                    const fixedData = { schedules: jsonData };
                    await writeJsonFile(req.file.filename, fixedData);
                } else {
                    throw new Error('Invalid JSON structure. Expected { schedules: [...] }');
                }
            }
        } catch (parseError) {
            // Delete invalid file
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                error: 'Invalid JSON file',
                message: parseError.message
            });
        }

        res.json({
            success: true,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            message: 'Schedule file uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading schedule file:', error);
        res.status(500).json({
            success: false,
            error: 'Error uploading schedule file',
            message: error.message
        });
    }
}

// Export the upload middleware
export const uploadMiddleware = upload.single('scheduleFile');

// Get schedule statistics
export async function getScheduleStats(req, res) {
    try {
        const allData = await readAllScheduleFiles();

        const stats = {
            totalFiles: allData.length,
            totalSchedules: 0,
            schedulesByDay: {},
            schedulesByRoom: {},
            schedulesByInstructor: {},
            files: []
        };

        allData.forEach(file => {
            const fileStats = {
                filename: file.filename,
                scheduleCount: file.schedules.length,
                lastModified: fs.statSync(path.join(getJsonDirPath(), file.filename)).mtime
            };

            stats.files.push(fileStats);
            stats.totalSchedules += file.schedules.length;

            file.schedules.forEach(schedule => {
                // Count by day
                stats.schedulesByDay[schedule.day] = (stats.schedulesByDay[schedule.day] || 0) + 1;

                // Count by room
                stats.schedulesByRoom[schedule.room_id] = (stats.schedulesByRoom[schedule.room_id] || 0) + 1;

                // Count by instructor
                stats.schedulesByInstructor[schedule.instructor] = (stats.schedulesByInstructor[schedule.instructor] || 0) + 1;
            });
        });

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error getting schedule stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error getting schedule statistics',
            message: error.message
        });
    }
}