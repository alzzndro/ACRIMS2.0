import { useContext, createContext } from "react"
import useGetMe from "../../hooks/useGetMe"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const { data, loading, error } = useGetMe()

    return (
        <AuthContext.Provider value={{ user: data, loading, error }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
}