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

-- Insert sample data
INSERT INTO schedules (room_id, room_name, day, start_time, end_time, subject, section, instructor, instructor_email, floor) VALUES
('101', '101 Classroom', 'Monday', '08:00:00', '09:30:00', 'Mathematics', 'Grade 10-A', 'Prof. Smith', 'smith@asiancollege.edu.ph', 'first'),
('102', '102 Classroom', 'Monday', '09:45:00', '11:15:00', 'English', 'Grade 10-B', 'Prof. Johnson', 'johnson@asiancollege.edu.ph', 'first'),
('201', '201 Laboratory', 'Tuesday', '08:00:00', '10:00:00', 'Computer Science', 'Grade 11-A', 'Prof. Brown', 'brown@asiancollege.edu.ph', 'second'),
('103', '103 Classroom', 'Wednesday', '13:00:00', '14:30:00', 'Physics', 'Grade 12-A', 'Prof. Davis', 'davis@asiancollege.edu.ph', 'first'),
('202', '202 Laboratory', 'Thursday', '10:00:00', '12:00:00', 'Chemistry', 'Grade 11-B', 'Prof. Wilson', 'wilson@asiancollege.edu.ph', 'second');
