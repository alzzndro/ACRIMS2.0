import { useNavigate } from "react-router-dom";

export default function RLICPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/logout");
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-indigo-50 to-gray-100 flex flex-col">

            {/* ✅ Top Navbar */}
            <div className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">
                    Room Loading In-Charge (RLIC) Dashboard
                </h1>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                    Logout
                </button>
            </div>

            {/* ✅ Main Content */}
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10">

                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                        Room Change Requests (RLIC)
                    </h2>

                    <div className="space-y-6">

                        {/* ✅ View Request Forms */}
                        <button
                            onClick={() => navigate("/rlic/requests")}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"
                        >
                            📂 View Request Forms
                        </button>

                        {/* ✅ Reviewed Request Forms */}
                        <button
                            onClick={() => navigate("/rlic/reviewed")}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition"
                        >
                            ✅ Reviewed Request Forms
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
