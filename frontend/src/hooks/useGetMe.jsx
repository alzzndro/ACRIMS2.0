import { useEffect, useState } from "react";
import axios from "axios";

let cachedUser = null; // 🔹 module-level cache

const useGetMe = () => {
    const [user, setUser] = useState(cachedUser);
    const [loading, setLoading] = useState(!cachedUser);
    const [error, setError] = useState(null);

    const getMe = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            cachedUser = response.data;
            setUser(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!cachedUser) {
            getMe();
        }
    }, []);

    return { user, loading, error };
};

// 🔹 export a helper to clear the cache
export const clearGetMeCache = () => {
    cachedUser = null;
};

export default useGetMe;
