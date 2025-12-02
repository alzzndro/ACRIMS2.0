import { IoMenu, IoArrowBack } from "react-icons/io5";
import '../../assets/css/common/variables.css';
import { LuDownload } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Drawer from "./Drawer";

const NavBarOne = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const navigate = useNavigate();

    const handleBackArrow = () => {
        navigate('/home');
    };

    // Capture PWA install prompt
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    // Trigger install
    const handleInstallPWA = async () => {
        if (!deferredPrompt) {
            alert("PWA install is not available right now.");
            return;
        }

        deferredPrompt.prompt();

        const result = await deferredPrompt.userChoice;

        if (result.outcome === "accepted") {
            console.log("User accepted install");
        } else {
            console.log("User dismissed install");
        }

        setDeferredPrompt(null);
    };

    return (
        <>
            {/* Top Navbar */}
            <div className={`w-full h-15 p-2 flex flex-row justify-${props.position}`}>
                <button
                    onClick={handleBackArrow}
                    className={`h-full ${props.visibility} w-12 flex justify-center items-center rounded-2xl focus:bg-gray-500 focus:text-red-200`}
                >
                    <IoArrowBack size={30} className="text-white" />
                </button>

                <div className="flex flex-row gap-4">

                    {/* PWA Install Button */}
                    <button
                        onClick={handleInstallPWA}
                        className="h-full w-12 flex justify-center items-center rounded-2xl focus:bg-gray-500 focus:text-red-200"
                    >
                        <LuDownload size={25} className="text-white" />
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
