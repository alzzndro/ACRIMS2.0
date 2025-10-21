import { useState, useEffect } from "react";
import NavBarTwo from "../../components/checker/NavBarTwo";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from 'react-icons/io5';

const ScheduleTimetablePage = () => {
    const { id } = useParams();
    const [schedules, setSchedules] = useState([]);
    const [modalSchedule, setModalSchedule] = useState(true);
    const [scheduleNumber, setScheduleNumber] = useState();

    const navigate = useNavigate();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleBackArrow = () => {
        navigate(-1);
    }

    // Group and SORT schedules per day
    const groupedSchedules = days.map(day => {
        const classes = schedules
            .filter(s => s.day === day)
            .filter(s => s.room_id === id)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
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

    const filteredSchedules = groupedSchedules.map(({ day, classes }) => {
        // Show all if "All Schedules" selected (scheduleNumber === 3)
        if (scheduleNumber === 3) {
            return { day, classes };
        }

        // Filter each class by schedule_number
        const filteredClasses = classes.filter(cls => cls.schedule_number === scheduleNumber);

        return { day, classes: filteredClasses };
    });

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
                            {filteredSchedules.map(({ day, classes }) => (
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

            {/* Modal Schedule Number */}
            {modalSchedule && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex flex-row items-center justify-start mb-6">
                            <button onClick={handleBackArrow} className='h-full w-12 flex justify-center items-center rounded-4xl focus:bg-gray-200 focus:text-red-500 text-red-400'><IoArrowBack size={30} /></button>
                            <h3 className="text-lg font-semibold">Select Schedule Number</h3>
                        </div>
                        <div className="flex flex-row justify-around flex-wrap gap-4">
                            <button
                                onClick={() => {
                                    setModalSchedule(false)
                                    setScheduleNumber(1);
                                }}
                                className="border border-black/50 p-4 rounded-2xl focus:scale-110 bg-red-800 text-white font-bold">
                                Schedule 1
                            </button>
                            <button
                                onClick={() => {
                                    setModalSchedule(false)
                                    setScheduleNumber(2);
                                }}
                                className="border border-black/50 focus:scale-110 p-4 rounded-2xl bg-red-800 text-white font-bold">
                                Schedule 2
                            </button>
                            <button
                                onClick={() => {
                                    setModalSchedule(false)
                                    setScheduleNumber(3);
                                }}
                                className="border border-black/50 focus:scale-110 p-4 rounded-2xl bg-blue-800 text-white font-bold">
                                All Schedules
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScheduleTimetablePage;
