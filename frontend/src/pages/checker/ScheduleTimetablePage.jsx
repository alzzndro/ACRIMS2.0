import { useState, useEffect } from "react";
import NavBarTwo from "../../components/checker/NavBarTwo";
import axios from "axios";
import { useParams } from "react-router-dom";

const ScheduleTimetablePage = () => {
    const { id } = useParams();
    const [schedules, setSchedules] = useState([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Group and SORT schedules per day
    const groupedSchedules = days.map(day => {
        const classes = schedules
            .filter(s => s.day === day)
            .filter(s => s.room_id === id)
            .sort((a, b) => a.start_time.localeCompare(b.start_time)); // 🟢 Sort by start_time
        return { day, classes };
    });

    const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const adjusted = hour % 12 === 0 ? 12 : hour % 12;
        return `${adjusted}:${m} ${ampm}`;
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("no token found");
                return;
            }

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/schedules/json`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const jsonSchedules = (response.data.files || []).flatMap(file =>
                (file.schedules || []).map(schedule => ({
                    ...schedule,
                    source: 'json',
                    source_file: file.filename
                }))
            );

            setSchedules(jsonSchedules);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <>
            <NavBarTwo />
            <div className="p-4 font-sans">
                <h1 className="text-xl font-bold text-center text-blue-700 mb-4">📅 Weekly Timetable</h1>

                {/* Scrollable container */}
                <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                        {/* Days Header */}
                        <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-800 mb-2">
                            {groupedSchedules.map(({ day }) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        {/* Timetable Content */}
                        <div className="grid grid-cols-7 gap-2">
                            {groupedSchedules.map(({ day, classes }) => (
                                <div key={day} className="flex flex-col gap-2">
                                    {classes.length === 0 ? (
                                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded text-center">
                                            Not Scheduled
                                        </div>
                                    ) : (
                                        classes.map((cls) => (
                                            <div
                                                key={cls.id}
                                                className="bg-green-50 border-l-4 border-green-500 p-2 rounded shadow text-xs"
                                            >
                                                <div className="text-green-800 font-semibold">{cls.subject}</div>
                                                <div className="text-gray-600">
                                                    {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                                </div>
                                                <div className="text-gray-500">{cls.section}</div>
                                                <div className="text-gray-400">{cls.instructor}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScheduleTimetablePage;
