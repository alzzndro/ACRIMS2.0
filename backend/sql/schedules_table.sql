-- Create schedules table for MySQL-based schedule management
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(10) NOT NULL,
    room_name VARCHAR(100),
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    section VARCHAR(50),
    instructor VARCHAR(100) NOT NULL,
    instructor_email VARCHAR(255),
    floor ENUM('first', 'second', 'third', 'fourth') DEFAULT 'first',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_room_day (room_id, day),
    INDEX idx_day_time (day, start_time, end_time),
    INDEX idx_instructor (instructor),
    INDEX idx_active (is_active)
);