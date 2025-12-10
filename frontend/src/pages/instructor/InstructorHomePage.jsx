import { useNavigate } from "react-router-dom";

export default function InstructorHomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear auth data if you use localStorage/sessionStorage
        localStorage.clear();
        navigate("/logout");
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">

            {/* Top Navbar */}
            <div className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">
                    Instructor Dashboard
                </h1>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10">

                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                        Room Change Request
                    </h2>

                    <div className="space-y-6">

                        {/* Add Form */}
                        <button
                            onClick={() => navigate("/instructor/roomchange/add")}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"
                        >
                            ➕ Add Room Change Form
                        </button>

                        {/* View My Submitted Forms */}
                        <button
                            onClick={() => navigate("/instructor/roomchange/myforms")}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition"
                        >
                            📑 View My Submitted Forms
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
