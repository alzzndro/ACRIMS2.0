import { useState, useEffect } from "react";
import NavBarTwo from "../../components/checker/NavBarTwo";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { div } from "framer-motion/client";
import { X } from 'lucide-react';
import { IoArrowBack } from 'react-icons/io5';

const RoomsPage = () => {
    const [scheduleNumber, setScheduleNumber] = useState();
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");  // To store the search query
    const [floorFilter, setFloorFilter] = useState("");  // To store the selected floor filter
    const [modalSchedule, setModalSchedule] = useState(true);
    const navigate = useNavigate();

    // Filter the schedule for the current time schedule of the day
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // get today's name of the week
    const currentTime = new Date();

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const currentFormattedTime = new Intl.DateTimeFormat('en-US', options).format(currentTime); // 24-hour format

    // Current Schedules
    const currentSchedules = data.filter(schedule => {
        const matchesDay = schedule.day === dayName && currentFormattedTime <= schedule.end_time;
        const aboveStartTime = schedule.start_time <= currentFormattedTime;
        const matchesFloor = floorFilter ? schedule.floor === floorFilter : true;
        const matchesSearch = schedule.room_id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesDay && aboveStartTime && matchesFloor && matchesSearch;
    });

    // Filtered Data based on schedule number
    const filteredSchedules = currentSchedules.filter(schedule => {

        if (scheduleNumber === 3) {
            return schedule;
        }
        const numberMatches = schedule.schedule_number === scheduleNumber;

        return numberMatches;
    });

    // Methods
    const handleBackArrow = () => {
        navigate(-1);
    }

    // fetch data
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You need to log in first!");
                return;
            }

            // Fetch schedules from both sources
            const [jsonResponse, mysqlResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/schedules/json`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch((error) => {
                    console.log("JSON schedules error:", error);
                    return { data: { files: [] } }; // Fallback to empty files array
                }),

                axios.get(`${import.meta.env.VITE_API_URL}/schedules/current`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch((error) => {
                    console.log("MySQL schedules error:", error);
                    return { data: { schedules: [] } }; // Fallback to empty schedules array
                })
            ]);

            // Flatten schedules from JSON files
            const jsonSchedules = (jsonResponse.data.files || []).flatMap(file =>
                (file.schedules || []).map(schedule => ({
                    ...schedule,
                    source: 'json',
                    source_file: file.filename
                }))
            );

            // Get MySQL schedules
            const mysqlSchedules = (mysqlResponse.data.schedules || []).map(schedule => ({
                ...schedule,
                source: 'mysql'
            }));

            // Combine both sources
            const allSchedules = [...jsonSchedules, ...mysqlSchedules];
            console.log("Total schedules loaded:", allSchedules.length, "(JSON:", jsonSchedules.length, "MySQL:", mysqlSchedules.length, ")");
            setData(allSchedules);

        } catch (error) {
            console.log("Error sa pag fetch", error);
            setData([]); // Set empty array on error
        }
    };


    // convert to 12 Hour
    const convertTo12HourFormat = (time) => {
        const [hour, minute] = time.split(":").map(Number);
        const suffix = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12; // 0 becomes 12, 13 becomes 1, etc.
        return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
    };

    // handle click
    const handleIdClick = (id) => {
        navigate(`/form/schedule/${id}`);
    };

    // Use Effects -------------------------------------------------------------------
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {/* Nav */}
            <div className="fixed w-full bg-white">
                <NavBarTwo message="Rooms" />
            </div>
            <div className="w-full h-15"></div>

            {/* Search and Filter Section */}
            <div className="w-full py-2 px-4 flex justify-between items-center">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by Room ID"
                    className="h-6 px-2 w-2/5 bg-gray-300 rounded-2xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                />
                {/* Floor Filter Dropdown */}
                <select
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    className="h-6 px-2 w-28 bg-gray-300 rounded-2xl ml-4"
                >
                    <option value="">All Floors</option>
                    <option value="first">First Floor</option>
                    <option value="second">Second Floor</option>
                    <option value="third">Third Floor</option>
                </select>
            </div>

            {/* Body */}
            <div className="flex flex-row w-full flex-wrap gap-8 p-4 justify-evenly">
                {filteredSchedules.map((schedule, index) => (
                    <div key={index} className="overflow-x-auto bg-blue-950 text-white shadow-xl shadow-gray-400 rounded-3xl" onClick={() => { handleIdClick(schedule.id) }}>
                        <div className="w-36 aspect-square shadow-2xs p-2 rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110">
                            <h1 className="text-2xl font-bold">{schedule.room_id.replace(/\s*\(.*?\)/g, '')}</h1>
                            <p className="text-sm font-light">{convertTo12HourFormat(schedule.start_time)} - {convertTo12HourFormat(schedule.end_time)}</p>
                            <p>{schedule?.instructor?.slice(0, 11) + '...'}</p>
                        </div>
                    </div>
                ))}
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

export default RoomsPage;
