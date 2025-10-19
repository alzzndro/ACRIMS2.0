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
            <div className="h-[calc(100vh-120px)] w-1/2 tracer p-5">
                <p>{data?.form_id || "Guest"}</p>
            </div>
            <div className="h-[calc(100vh-120px)] w-1/2 tracer p-5">
                <p>Photo Taken</p>
                <img src={data?.photo} className="h-full w-full" alt="" />
            </div>
        </div>

    );
}

export default RecentFormByIdPage;