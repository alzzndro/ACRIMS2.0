import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBarTwo from "../../components/checker/NavBarTwo";
import { FaDoorClosed } from "react-icons/fa";

export default function SchedulePage() {
    const [scheduleData, setScheduleData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [floorFilter, setFloorFilter] = useState("");

    const navigate = useNavigate();

    const handleClick = (id) => {
        navigate(`/schedules/timetable/${id}`);
    }

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) navigate("/logout");

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

            setScheduleData(jsonSchedules);
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtered and sorted list of unique room/floor combinations
    const filteredRooms = [...new Set(
        scheduleData
            .filter(s => s.room_id && s.floor)
            .filter(s => {
                const matchesSearch = s.room_id.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFloor = floorFilter === "" || s.floor.toLowerCase() === floorFilter.toLowerCase();
                return matchesSearch && matchesFloor;
            })
            .map(s => JSON.stringify({ room_id: s.room_id, floor: s.floor }))
    )]
        .map(str => JSON.parse(str))
        .sort((a, b) => {
            if (a.floor === b.floor) {
                return a.room_id.localeCompare(b.room_id);
            }
            return a.floor.localeCompare(b.floor);
        });

    return (
        <>
            <NavBarTwo message="Select Room" />

            {/* Search and Filter Section */}
            <div className="w-full py-2 px-4 flex justify-between items-center">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by Room ID"
                    className="h-8 px-2 w-2/5 bg-gray-300 rounded-2xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Floor Filter Dropdown */}
                <select
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    className="h-8 px-2 w-32 bg-gray-300 rounded-2xl ml-4"
                >
                    <option value="">All Floors</option>
                    <option value="first">First Floor</option>
                    <option value="second">Second Floor</option>
                    <option value="third">Third Floor</option>
                </select>
            </div>

            {/* Room Cards */}
            <div className="flex flex-row w-full flex-wrap gap-8 p-4 justify-evenly">
                {filteredRooms.map((room, index) => (
                    <div
                        key={index}
                        onClick={() => { handleClick(room.room_id) }}
                        className="overflow-x-auto bg-blue-950 text-white shadow-xl shadow-gray-400 rounded-3xl"
                    >
                        <div className="w-36 aspect-square p-2 rounded-3xl flex flex-col justify-center items-center gap-1">
                            <FaDoorClosed
                                size={60}
                                className={`p-2 rounded-full ${room.floor.toLowerCase() === "first" ? "text-white" :
                                    room.floor.toLowerCase() === "second" ? "text-yellow-300" :
                                        room.floor.toLowerCase() === "third" ? "text-red-500" :
                                            "bg-gray-300" // fallback
                                    }`}
                            />
                            <h1 className="text-4xl font-bold">{room.room_id}</h1>
                        </div>
                    </div>
                ))}

                {filteredRooms.length === 0 && (
                    <p className="text-gray-500 mt-4">No rooms found.</p>
                )}
            </div>
        </>
    );
}
