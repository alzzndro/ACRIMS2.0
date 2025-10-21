import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const RecentFormByIdPage = () => {
    const { id } = useParams();
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/form/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setData(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div className="p-15 flex flex-row justify-between">
            <div className="h-[calc(100vh-120px)] w-1/2 p-5 flex flex-col gap-4">
                <div className="flex flex-row items-center gap-4 justify-between">
                    <p className="font-bold text-2xl">Room Name: </p>
                    <div className="w-50 h-10 flex flex-row text-2xl justify-end p-3 items-center border border-black rounded-lg">
                        <p>{data?.room_number || "Guest"}</p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4 justify-between">
                    <p className="font-bold text-2xl">Assigned Instructor: </p>
                    <div className="w-50 h-10 flex flex-row text-lg justify-end p-3 items-center border border-black rounded-lg">
                        <p>{data?.instructor_name || "Guest"}</p>
                    </div>
                </div>
            </div>
            <div className="h-[calc(100vh-120px)] w-1/2 p-5">
                <p className="text-2xl">Photo Taken</p>
                <img
                    src={
                        data.photo
                            ? `${import.meta.env.VITE_API_URL}${data.photo}`
                            : "/default-avatar.png"
                    }
                    className="h-[calc(100%-4rem)]" alt="" />
            </div>
        </div>

    );
}

export default RecentFormByIdPage;