import axios from "axios";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

const Dash = () => {
    const [data, setData] = useState([]);


    const fetchForm = async () => {

        const token = localStorage.getItem("token");

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/form/12`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data)
    }

    useEffect(() => {
        fetchForm();
    }, [])

    useEffect(() => {
        console.log(data);

        // this checks if null objects are returned as true or false.
        if (data.remarks) {
            console.log("true");
        } else {
            console.log("false");
        }

    }, [data])

    return (
        <>
            <p>{data.instructor_name ? data.instructor_name : "Guest"}</p>
        </>
    )
}

export default Dash;