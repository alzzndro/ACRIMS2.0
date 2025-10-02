import localforage from "localforage"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Logout = () => {
    const navigate = useNavigate()

    const deleteCached = async () => {
        // localforage
        const keys = await localforage.keys();
        for (const key of keys) {
            if (key.startsWith("pending-")) {
                try {
                    await localforage.removeItem(key)
                } catch (error) {
                    console.log("Cannot delete cached forms. ", error)
                }
            }
        }
    }

    useEffect(() => {
        localStorage.removeItem("token")
        deleteCached()
        navigate("/", { replace: true })
    }, [navigate])

    return null
}

export default Logout