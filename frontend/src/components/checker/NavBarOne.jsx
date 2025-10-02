import { IoMenu, IoNotifications } from "react-icons/io5";
import '../../assets/css/common/variables.css';
import { Link } from "react-router-dom";
import { useState } from "react";
import Drawer from "./Drawer";
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from "react-router-dom";

const NavBarOne = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    const handleBackArrow = () => {
        navigate(-1);
    }

    return (
        <>
            {/* Top Navbar */}
            <div className={`w-full h-15 p-2 flex flex-row justify-${props.position}`}>
                <button onClick={handleBackArrow} className={`h-full ${props.visibility} w-12 flex justify-center items-center rounded-2xl focus:bg-gray-500 focus:text-red-200`}>
                    <IoArrowBack size={30} className="text-white" />
                </button>
                <div className="flex flex-row">
                    <button className="h-full w-12 flex justify-center items-center rounded-2xl focus:bg-gray-500 focus:text-red-200">
                        <IoNotifications size={25} className="text-white" />
                    </button>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="h-full w-12 flex justify-center items-center rounded-2xl focus:bg-gray-500 focus:text-red-200"
                    >
                        <IoMenu size={35} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <Drawer draw={isOpen} btnClck={() => setIsOpen(false)} />
        </>
    );
};

export default NavBarOne;
