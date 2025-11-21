import NavBarOne from "../../components/checker/NavBarOne";
import useGetMe from "../../hooks/useGetMe";
import Loading from "../../components/common/Loading";
import { useEffect, useState, useCallback } from "react";
import { IoIosCamera } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImg } from '../../utils/cropImage.js';
import { IoPencil } from "react-icons/io5";
import Modal from "react-modal"; // you can replace with your modal component

const ProfilePage = () => {
    const { user, loading, error } = useGetMe();
    const [todayChecked, setTodayChecked] = useState("0");
    const [totalChecked, setTotalChecked] = useState("0");
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const [fullName, setFullName] = useState({
        first_name: '',
        last_name: ''
    });

    const profileImageUrl = user?.profile_image_path
        ? `${import.meta.env.VITE_API_URL}${user.profile_image_path} `
        : "/default-avatar.png";

    const toTitleCase = (str) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .split(" ")
            .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
            .join(" ");
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) navigate("/logout");

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/form/checker`,
                { headers: { Authorization: `Bearer ${token} ` } }
            );

            const result = response?.data ?? [];
            const date = new Date();
            const formattedDate = date.toISOString().slice(0, 10);

            const filteredResults = result.filter(
                (form) => form.date_monitored?.slice(0, 10) === formattedDate
            );

            setTodayChecked(filteredResults.length);
            setTotalChecked(result.length);
        } catch (error) {
            console.log(error);
            setTodayChecked("0");
            setTotalChecked("0");
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageSrc(reader.result);
                setIsCropping(true);
            };
        }
    };

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            const blob = await (await fetch(croppedImage)).blob();
            const formData = new FormData();
            formData.append("image", blob, "profile.jpg");

            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL}/user/edit/image`, formData, {
                headers: {
                    Authorization: `Bearer ${token} `,
                    "Content-Type": "multipart/form-data",
                },
            });

            setIsCropping(false);
            window.location.reload(); // reload to show updated profile image
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const handleNameChange = (e) => {
        const { name, value } = e.target;

        setFullName((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const handleSaveName = async () => {
        const token = localStorage.getItem("token");

        const payload = {
            first_name: fullName.first_name,
            last_name: fullName.last_name,
        };

        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/user/edit/details`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const { success, message } = data;

            if (success) {
                console.log(message);
            } else {
                console.error("Adding failed:", message);
            }

            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }

    if (loading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <>
            <div className="h-screen">
                {/* Blue Container */}
                <div className="h-52 w-full bg-[var(--blue-logo)] overflow-hidden">
                    <NavBarOne position="between" visibility="block" />
                    <div className="w-full h-[calc(12.5rem-3.75rem)] p-2 flex flex-col items-center gap-2">
                        <div className="relative">
                            <label htmlFor="fileInput">
                                <img
                                    src={profileImageUrl}
                                    alt="Profile"
                                    className="bg-gray-100 shadow-md shadow-gray-800 w-20 aspect-square rounded-full object-cover cursor-pointer"
                                />
                                <div className="absolute w-5 h-5 bg-white bottom-0 right-1 rounded-full flex justify-center items-center">
                                    <IoIosCamera />
                                </div>
                            </label>
                            <input
                                type="file"
                                id="fileInput"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="flex flex-row gap-3" onClick={() => {
                            setFullName({
                                first_name: user.first_name || "",
                                last_name: user.last_name || ""
                            });
                            setIsEditing(true);
                        }}>

                            <p className="text-gray-100 font-medium">
                                {user.first_name !== null
                                    ? toTitleCase(user.first_name)
                                    : "Edit your name"}{" "}
                                {user.last_name !== null ? toTitleCase(user.last_name) : ""}
                            </p>
                            <div className="bg-white w-5 h-5 rounded-full flex justify-center items-center">
                                <IoPencil />
                            </div>

                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="bg-gray-100 mt-[-1rem] p-10 w-full h-[calc(100vh-13rem)] rounded-2xl">
                    <div className="flex flex-row justify-around">
                        <div className="w-30 h-32 flex flex-col gap-1.5 justify-center items-center rounded-xl shadow-md bg-white">
                            <h1 className="font-bold text-3xl">{todayChecked}</h1>
                            <p className="text-gray-500 italic text-center">Submitted Form/s Today</p>
                        </div>
                        <div className="w-30 h-32 flex flex-col gap-1.5 justify-center items-center rounded-xl shadow-md bg-white">
                            <h1 className="font-bold text-3xl">{totalChecked}</h1>
                            <p className="text-gray-500 italic text-center">Total Submitted Form/s </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cropper Modal */}
            <Modal isOpen={isCropping} onRequestClose={() => setIsCropping(false)} ariaHideApp={false}>
                <div className="flex flex-col items-center gap-4 p-4">
                    <div className="relative w-[300px] h-[300px] bg-gray-200">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="bg-gray-300 px-4 py-2 rounded"
                            onClick={() => setIsCropping(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Name Modal */}
            <Modal
                isOpen={isEditing}
                onRequestClose={() => setIsEditing(false)} ariaHideApp={false}
                style={{
                    content: {
                        width: '70%',
                        height: '43%',
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                    },
                }}
            >
                <div className="flex flex-col items-center gap-4 p-2">

                    <div className="">
                        <label htmlFor="firstNameEdit" className="font-semibold">Set New First Name:</label>
                        <div className="">
                            <input
                                type="text"
                                name="first_name"
                                id="firstNameEdit"
                                value={fullName.first_name}
                                onChange={handleNameChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="">
                        <label htmlFor="lastNameEdit" className="font-semibold">Set New Last Name:</label>
                        <div className="">
                            <input
                                type="text"
                                name="last_name"
                                id="lastNameEdit"
                                value={fullName.last_name}
                                onChange={handleNameChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="bg-gray-300 px-4 py-2 rounded"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={handleSaveName}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );

};

export default ProfilePage;
