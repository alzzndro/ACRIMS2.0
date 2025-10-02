import { useState, useEffect } from "react";
import NavBarTwo from "../../components/checker/NavBarTwo";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RoomsPage = () => {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");  // To store the search query
    const [floorFilter, setFloorFilter] = useState("");  // To store the selected floor filter
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
        const matchesFloor = floorFilter ? schedule.floor === floorFilter : true;
        const matchesSearch = schedule.room_id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesDay && matchesFloor && matchesSearch;
    });

    // Methods
    // fetch data
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You need to log in first!");
                return;
            }

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/schedules`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Log the response to inspect the structure
            console.log("Response Data:", response.data);

            // If response.data is an array, use flatMap
            if (Array.isArray(response.data)) {
                const allSchedules = response.data.flatMap(file => file.schedules || []);
                setData(allSchedules);

            } else if (response.data.schedules) {
                // If response.data is an object with a 'schedules' property
                const allSchedules = response.data.schedules || [];
                setData(allSchedules);

            } else {
                // If the structure is neither an array nor contains 'schedules'
                console.error("Unexpected response structure:", response.data);
                setData([]);
            }

        } catch (error) {
            console.log("Error sa pag fetch", error);
            setData([]); // Set empty array in case of error
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
                {currentSchedules.map((schedule, index) => (
                    <div key={index} className="overflow-x-auto bg-blue-900 text-white shadow-xl shadow-gray-400 rounded-3xl" onClick={() => { handleIdClick(schedule.id) }}>
                        <div className="w-36 aspect-square shadow-2xs p-2 rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110">
                            <h1 className="text-2xl font-bold">{schedule.room_id}</h1>
                            <p className="text-sm font-light">{convertTo12HourFormat(schedule.start_time)} - {convertTo12HourFormat(schedule.end_time)}</p>
                            <p>{schedule.instructor}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default RoomsPage;
