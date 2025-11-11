import localforage from "localforage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearGetMeCache } from "../../hooks/useGetMe";

const Logout = () => {
    const navigate = useNavigate();
    const CACHE_KEY = "schedule-cache";

    const deleteCached = async () => {
        // localforage
        const keys = await localforage.keys();
        for (const key of keys) {
            if (key.startsWith("pending-")) {
                try {
                    await localforage.removeItem(key);
                } catch (error) {
                    console.log("Cannot delete cached forms. ", error);
                }
            }
        }
    }

    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        clearGetMeCache();
        deleteCached();
        localforage.removeItem(CACHE_KEY);
        navigate("/", { replace: true });
    }, [navigate]);

    return null;
}

export default Logout;