import React, { useState } from 'react';
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

    const invalidNotify = () => {
        toast.error("sd", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        room_number: '',
        instructor_name: '',
        instructor_email: '',
        instructor_presence: false,
        is_late: false,
        remarks: '',
        schedule_time: '',
        photo: null,
    });

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

        const updatedFormData = {
            ...formData,
            room_number: 'Room' + ' ' + formData.room_number,
            schedule_time: combinedSchedule,
        };

        const token = localStorage.getItem("token");

        const payload = new FormData();
        Object.entries(updatedFormData).forEach(([key, value]) => {
            if (value !== null) payload.append(key, value);
        });

        try {
            setLoading(true);

            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/form/add`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { success, message } = data;

            if (success) {
                console.log(message);
                invalidNotify();
            } else {
                invalidNotify();
                console.error("Adding failed:", message);
            }

            navigate("/home");
        } catch (error) {
            setLoading(true);
            console.log("Save to local", error);

            const offlinePayload = {
                id: Date.now(),
                formData,
            };

            await localforage.setItem(`pending-${offlinePayload.id}`, offlinePayload);
            navigate("/home");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <NavBarTwo message="Form" />
            <div className="max-w-2xl mx-auto bg-white px-5 pt-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Room Number */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">Room Number</label>
                        <input
                            type="text"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
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
                            placeholder='Optional'
                            name="instructor_email"
                            value={formData.instructor_email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>

                    {/* Schedule Time */}
                    <div className='flex flex-row gap-4'>
                        <div className='w-1/2'>
                            <label className="block text-md font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={startTime || ''}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div className='w-1/2'>
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
                    <div className="">
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

                    {/* Late Presence (is_late) */}
                    <div className="">
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

                    {/* Photo Upload / Camera */}
                    <div className="">
                        <label htmlFor="photo-upload" className="bg-red-200 h-10 flex justify-center items-center w-full rounded text-md font-medium text-gray-700 mb-1">
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
                        <p className="text-xs text-gray-500 mt-1">You can take a picture using your mobile device.</p>
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

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default FormPage;
