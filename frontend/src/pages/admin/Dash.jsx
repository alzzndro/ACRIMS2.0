import axios from "axios";
import { useEffect } from "react";

const Dash = () => {

    const fetchForm = async () => {

        const token = localStorage.getItem("token");

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/form`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(response);

    }

    useEffect(() => {
        fetchForm();
    }, [])

    return (
        <>
            <p>Hello</p>
        </>
    )
}

export default Dash;