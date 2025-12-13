import { Link } from 'react-router-dom';
import '../../assets/css/common/variables.css';
import NavBarOne from '../../components/checker/NavBarOne';
import { FaDoorClosed } from "react-icons/fa";
import { FaRegSquarePlus } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import { FaExchangeAlt } from "react-icons/fa";
import useGetMe from '../../hooks/useGetMe';
import Loading from '../../components/common/Loading';
import axios from 'axios';
import { useState, useEffect } from 'react';
import localforage from 'localforage';

const HomePage = () => {
    const { user, error, loading } = useGetMe();
    const [data, setData] = useState([]);

    const CACHE_KEY = "schedule-cache";
    const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes

    const profileImageUrl = user?.profile_image_path
        ? `${import.meta.env.VITE_API_URL}${user.profile_image_path}`
        : "/default-avatar.png";

    const toTitleCase = (str) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .split(" ")
            .map(name => name.charAt(0).toUpperCase() + name.slice(1))
            .join(" ");
    }

    // fetch data
    const fetchData = async () => {
        try {
            // 1️⃣ Try to load from cache first
            const cached = await localforage.getItem(CACHE_KEY);
            if (cached && cached.data) {
                setData(cached.data);
                const expired = Date.now() - cached.timestamp > CACHE_EXPIRATION;
                if (!expired) return; // cache valid, skip API
            }

            // Getting token
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You need to log in first!");
                return;
            }

            // Fetch fresh data from API (remove MySQL request)
            const jsonResponse = await axios.get(`${import.meta.env.VITE_API_URL}/schedules/json`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { files: [] } })); // fallback

            const jsonSchedules = (jsonResponse.data.files || []).flatMap(file =>
                (file.schedules || []).map(schedule => ({
                    ...schedule,
                    source: 'json',
                    source_file: file.filename
                }))
            );

            // Save fresh data to cache
            await localforage.setItem(CACHE_KEY, { timestamp: Date.now(), data: jsonSchedules });
            console.log("schedule cached");

            setData(jsonSchedules);

            console.log("Total schedules loaded:", jsonSchedules.length);

        } catch (error) {
            console.log("Error fetching schedules:", error);
            setData([]); // fallback empty array
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (data.length === 0) {
            return;
        }
    }, [data]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            <div className='h-svh relative @container/Home overflow-scroll'>
                {/* Blue Container */}
                <div className="h-52 w-full bg-[var(--blue-logo)] overflow-hidden">
                    <NavBarOne position="end" visibility="hidden" />
                    <div className='w-full h-[calc(12.5rem-3.75rem)] p-2 flex flex-col items-center gap-2'>
                        <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="bg-gray-100 w-20 aspect-square rounded-full object-cover shadow-md shadow-gray-800"
                        />
                        <p className='text-gray-100 font-medium'>{user.first_name !== null ? toTitleCase(user.first_name) : "Edit your name"} {user.last_name !== null ? toTitleCase(user.last_name) : ""}</p>
                    </div>
                </div>
                {/* Body */}
                <div className='p-5 flex flex-wrap gap-5 justify-center @[414px]/Home:gap-10 rounded-2xl bg-white mt-[-1rem]'>
                    <Link to="/rooms" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-2xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaDoorClosed size={50} />
                        <p className=''>Automated Forms</p>
                    </Link>
                    <Link to="/form/new" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaRegSquarePlus size={50} />
                        <p className=''>Add Form</p>
                    </Link>
                    <Link to="/schedules" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaCalendarAlt size={50} />
                        <p className=''>Schedules</p>
                    </Link>
                    <Link to="/mylist" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <CiViewList size={50} />
                        <p className=''>My Forms</p>
                    </Link>
                    <Link to="/requests" className='w-36 aspect-square bg-[var(--bg-gray)] text-center shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaExchangeAlt size={50} />
                        <p className=''>Changed Rooms Requests</p>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default HomePage;
