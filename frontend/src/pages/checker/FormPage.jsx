import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarTwo from '../../components/checker/NavBarTwo';
import axios from 'axios';
import localforage from 'localforage';
import { ToastContainer, toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import { to12HourV2 } from '../../utils/timeFormat.js';

const FormPage = () => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const navigate = useNavigate();

    const [data, setData] = useState([]);

    const CACHE_KEY = "schedule-cache";
    const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes

    // Toast
    const invalidNotify = () => {
        toast.error("Invalid", {
            position: "top-center",
            autoClose: 5000,
            theme: "light",
        });
    };

    const successNotify = () => {
        toast.success('Form Added!', {
            position: "top-center",
            autoClose: 5000,
            closeOnClick: false,
            theme: "light",
        });
    };

    // Payload Format
    const [formData, setFormData] = useState({
        room_number: '',
        instructor_name: '',
        instructor_email: '',
        instructor_presence: false,
        changed_rooms: true,
        is_late: false,
        hours_late: "",       // NEW
        minutes_late: "",     // NEW
        remarks: '',
        schedule_time: '',
        photo: null,
    });

    // Handles
    const handleChange = (e) => {
        const { name, type, checked, files, value } = e.target;

        if (type === "file" && files[0]) {
            const file = files[0];

            setFormData((prevData) => ({
                ...prevData,
                [name]: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const combinedSchedule = `${to12HourV2(startTime)} - ${to12HourV2(endTime)}`;

        // Compute lateness
        let latenessValue = null;

        if (formData.is_late) {
            const hours = formData.hours_late !== "" ? formData.hours_late : 0;
            const minutes = formData.minutes_late !== "" ? formData.minutes_late : 1; // DEFAULT = 1

            latenessValue = `${hours} hour/s and ${minutes} minute/s`;
        }

        const updatedFormData = {
            ...formData,
            schedule_time: combinedSchedule,
            lateness: latenessValue,
        };

        // Remove raw lateness fields
        delete updatedFormData.hours_late;
        delete updatedFormData.minutes_late;

        const token = localStorage.getItem("token");

        const payload = new FormData();
        Object.entries(updatedFormData).forEach(([key, value]) => {
            if (value !== null) payload.append(key, value);
        });

        try {
            setLoading(true);

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/form/add`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { success, message } = data;

            if (success) {
                successNotify();
                setTimeout(() => navigate("/home"), 1500);
            } else {
                invalidNotify();
                console.error("Adding failed:", message);
                setTimeout(() => navigate("/home"), 1500);
            }
        } catch (error) {
            setLoading(false);
            console.log("Offline, saving locally...", error);

            const offlinePayload = {
                id: Date.now(),
                formData: updatedFormData,
            };

            await localforage.setItem(`pending-${offlinePayload.id}`, offlinePayload);

            // Background Sync registration
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    await reg.sync.register('sync-pending-forms');
                } catch (err) {
                    console.log('Background sync registration failed:', err);
                }
            }

            toast.info("Saved offline. Will sync when you're online.", {
                position: "top-center"
            });

            navigate("/home");
        }
    };

    // fetch data
    const fetchData = async () => {
        try {
            const cached = await localforage.getItem(CACHE_KEY);
            if (cached && cached.data) {
                setData(cached.data);
                const expired = Date.now() - cached.timestamp > CACHE_EXPIRATION;
                if (!expired) return;
            }
        } catch (error) {
            console.log("No cached schedule data", error);
            setData([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Validate time difference
    useEffect(() => {
        if (!startTime || !endTime) return;

        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);

        if (end < start) {
            toast.error("End time cannot be earlier than start time.", {
                position: "top-center",
            });
            setEndTime("");
            return;
        }

        const diffHours = (end - start) / (1000 * 60 * 60);

        if (diffHours > 5) {
            toast.error("End time cannot be more than 5 hours after start time.", {
                position: "top-center",
            });
            setEndTime("");
        }
    }, [startTime, endTime]);

    if (loading) {
        return (
            <>
                <Loading />
                <ToastContainer position="top-center" autoClose={5000} theme="light" />
            </>
        );
    }

    return (
        <>
            <NavBarTwo message="Room Change Form" />
            <div className="max-w-2xl mx-auto bg-white px-5 pt-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Room Number */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">Room Number</label>
                        <input
                            type="text"
                            list="room_list"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                        <datalist id="room_list">
                            {[...new Set(
                                data
                                    .map(item => item.room_id)
                                    .filter(room => room && room.trim() !== "")
                            )].map((room, index) => (
                                <option key={index} value={room} />
                            ))}
                        </datalist>
                    </div>

                    {/* Room Change */}
                    <div className="hidden">
                        <label className="block text-md font-medium text-gray-700">Room Change</label>
                        <div className="flex flex-row gap-3">
                            <input
                                type="checkbox"
                                name="changed_rooms"
                                checked={formData.changed_rooms}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Check this if the instructor change rooms.</span>
                        </div>
                    </div>

                    {/* Instructor Name */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">Instructor Name</label>
                        <input
                            type="text"
                            name="instructor_name"
                            value={formData.instructor_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>

                    {/* Instructor Email */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">Instructor Email</label>
                        <input
                            type="email"
                            placeholder="Optional"
                            name="instructor_email"
                            value={formData.instructor_email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>

                    {/* Schedule Time */}
                    <div className="flex flex-row gap-4">
                        <div className="w-1/2">
                            <label className="block text-md font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={startTime || ''}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-md font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                name="end_time"
                                value={endTime || ''}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    </div>

                    {/* Instructor Presence */}
                    <div>
                        <label className="block text-md font-medium text-gray-700">Instructor Presence</label>
                        <div className="flex flex-row gap-3">
                            <input
                                type="checkbox"
                                name="instructor_presence"
                                checked={formData.instructor_presence}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Check this if the instructor is present.</span>
                        </div>
                    </div>

                    {/* Instructor Lateness */}
                    <div>
                        <label className="block text-md font-medium text-gray-700">Instructor Lateness</label>
                        <div className="flex flex-row gap-3">
                            <input
                                type="checkbox"
                                name="is_late"
                                checked={formData.is_late}
                                onChange={handleChange}
                                disabled={!formData.instructor_presence}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">
                                Check this if the instructor was late.
                                <br />
                                <span className={formData.instructor_presence ? "text-green-600" : "text-red-500"}>
                                    {formData.instructor_presence ? '' : 'Only available when instructor is present.'}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Lateness Input Section */}
                    {formData.is_late && (
                        <div className="mt-2 p-3 border rounded bg-gray-50">

                            {/* Hours Late */}
                            <div className="mb-3">
                                <label className="block text-md font-medium text-gray-700 mb-1">
                                    Hour/s Late
                                </label>
                                <select
                                    name="hours_late"
                                    value={formData.hours_late}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="">Select hours</option>
                                    {[1, 2, 3, 4].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Minutes Late */}
                            <div>
                                <label className="block text-md font-medium text-gray-700 mb-1">
                                    Minute/s Late
                                </label>
                                <input
                                    type="number"
                                    name="minutes_late"
                                    value={formData.minutes_late}
                                    onChange={(e) => {
                                        if (e.target.value >= 0 && e.target.value <= 59) {
                                            handleChange(e);
                                        }
                                    }}
                                    min="1"
                                    max="59"
                                    placeholder='1'
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded"
                        ></textarea>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label
                            htmlFor="photo-upload"
                            className="bg-red-200 h-10 flex justify-center items-center w-full rounded text-md font-medium text-gray-700 mb-1"
                        >
                            Upload Photo
                        </label>
                        <input
                            type="file"
                            id="photo-upload"
                            name="photo"
                            accept="image/*"
                            capture="environment"
                            onChange={handleChange}
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            You can take a picture using your mobile device.
                        </p>

                        {preview && (
                            <img
                                src={preview}
                                alt="Selected"
                                className="mt-4 w-full max-h-64 object-contain border rounded"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-[var(--blue-logo)] fixed bottom-0 left-0 text-white font-bold py-2 px-4 h-15 text-xl"
                        >
                            Submit Form
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer />
        </>
    );
};

export default FormPage;
