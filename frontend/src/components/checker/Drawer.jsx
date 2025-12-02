// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Drawer = (props) => {
    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: props.draw ? "0%" : "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-[#0b1e3a] to-[#162c54] shadow-2xl z-50 p-6 flex flex-col"
        >
            {/* Close Button */}
            <div className="w-full flex justify-end mb-8">
                <button
                    onClick={props.btnClck}
                    aria-label="Close drawer"
                    className="text-[#ff2e2e] hover:text-red-500 text-3xl font-bold focus:outline-none transition-colors bg-white w-8 h-8 flex justify-center items-center rounded-lg"
                >
                    &times;
                </button>
            </div>

            {/* Menu Items */}
            <ul className="flex flex-col gap-4 text-white font-semibold text-lg">
                <Link to="/users/me" onClick={props.btnClck}>
                    <li className="px-4 bg-amber-900 py-3 rounded-lg cursor-pointer hover:bg-[#ff2e2e] hover:text-white transition-colors">
                        Profile
                    </li>
                </Link>
                <Link to="/form/pending" onClick={props.btnClck}>
                    <li className="px-4 bg-amber-900 py-3 rounded-lg cursor-pointer hover:bg-[#ff2e2e] hover:text-white transition-colors">
                        Pending Forms
                    </li>
                </Link>
                <Link to="/form/export" onClick={props.btnClck}>
                    <li className="px-4 bg-amber-900 py-3 rounded-lg cursor-pointer hover:bg-[#ff2e2e] hover:text-white transition-colors">
                        Export to CSV
                    </li>
                </Link>
                {/* <Link to="/form/export" onClick={props.btnClck}>
                    <li className="px-4 bg-amber-900 py-3 rounded-lg cursor-pointer hover:bg-[#ff2e2e] hover:text-white transition-colors">
                        History
                    </li>
                </Link> */}
                <Link to="/logout" onClick={props.btnClck}>
                    <li className="px-4 bg-amber-900 py-3 rounded-lg cursor-pointer hover:bg-[#ff2e2e] hover:text-white transition-colors">
                        Logout
                    </li>
                </Link>
            </ul>
        </motion.div>
    );
};

export default Drawer;
