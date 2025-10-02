import { useEffect, useState } from "react"
import axios from "axios"

const useGetMe = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const getMe = async () => {
        const token = localStorage.getItem("token")

        if (token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setUser(response.data)
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        getMe()
    }, [])

    return { user, loading, error }
}

export default useGetMe