import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!url) return;

        const controller = new AbortController();

        const fetchData = async (url) => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate('/logout');
                    return;
                }

                const response = await axios.get(
                    url,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    }
                );

                setData(response.data);

            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request Cancelled ", error.message);
                } else {
                    setError(error);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        return () => {
            controller.abort();
        }
    }, [url, navigate]);

    return { data, loading, error };
}

export default useFetch;