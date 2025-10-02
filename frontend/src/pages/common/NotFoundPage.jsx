import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0b1e3a] to-[#162c54] px-6 text-center text-white">

            {/* SVG Illustration */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-56 h-56 mb-10"
                viewBox="0 0 100 100"
                fill="none"
            >
                {/* Circle background */}
                <circle cx="50" cy="50" r="48" stroke="#ff2e2e" strokeWidth="4" />
                {/* Cross X */}
                <line x1="30" y1="30" x2="70" y2="70" stroke="#ff2e2e" strokeWidth="6" strokeLinecap="round" />
                <line x1="70" y1="30" x2="30" y2="70" stroke="#ff2e2e" strokeWidth="6" strokeLinecap="round" />
            </svg>

            <h1 className="text-7xl font-extrabold mb-4 tracking-wide" style={{ color: "#ff2e2e" }}>
                404
            </h1>

            <p className="text-lg md:text-2xl mb-8 max-w-md">
                Sorry, the page you’re looking for doesn’t exist or has been moved.
            </p>

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

export default NotFoundPage;
