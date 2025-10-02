import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import axios from 'axios'
import UnauthorizedPage from "../../pages/common/UnauthorizedPage"
import Loading from "./Loading"

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verify = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) { // if no token fetched, set authority to false and would navigate back to the landing page
                return (
                    setLoading(false),
                    setAuthorized(false)
                )
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/verify`, { // fetching the verify API to verify if the user is authenticated, if not, navigate back to the landing page. this prevent users with unauthorized access go through some end points
                    headers: { Authorization: `Bearer ${token}` } // verify if the token is the same in the authMiddleware
                })

                const userRole = response.data.user.role
                const isAllowed = !allowedRoles || allowedRoles.includes(userRole);

                setLoading(false);
                setAuthorized(isAllowed);
            } catch {
                localStorage.removeItem("token");
                setLoading(false)
                setAuthorized(false)
            }
        }

        verify()
    }, [])

    if (loading) return <Loading />

    return authorized ? children : <UnauthorizedPage />
}

export default ProtectedRoute