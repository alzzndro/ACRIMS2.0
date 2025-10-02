import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b1e3a] to-[#162c54] text-white px-6">
            {/* Icon */}
            <div className="mb-6">
                <div className="bg-red-600 rounded-full p-5 shadow-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.918-.816 1.995-1.85L21 5.85A2 2 0 0019.15 4H4.85A2 2 0 003 5.85l.087 12.3c.077 1.034.94 1.85 1.995 1.85z"
                        />
                    </svg>
                </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-3 text-center">
                Unauthorized Access
            </h1>

            {/* Message */}
            <p className="text-lg md:text-xl text-gray-300 mb-6 text-center max-w-lg">
                You do not have permission to view this page. Please return to a safe location.
            </p>

            {/* Button to go back */}
            <div className="flex flex-row gap-15">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-[#ff2e2e] hover:bg-[#e02525] active:bg-[#b31b1b] text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition duration-300 focus:outline-none focus:ring-4 focus:ring-[#ff2e2e]/50"
                    aria-label="Go back"
                >
                    Go Back
                </button>

                <button
                    onClick={() => navigate("/logout")}
                    className="bg-[#ff2e2e] hover:bg-[#e02525] active:bg-[#b31b1b] text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition duration-300 focus:outline-none focus:ring-4 focus:ring-[#ff2e2e]/50"
                    aria-label="Logout"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
