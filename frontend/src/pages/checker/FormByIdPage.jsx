import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarTwo from "../../components/checker/NavBarTwo";
import localforage from "localforage";
import Loading from "../../components/common/Loading";
import { ToastContainer, toast } from "react-toastify";
import { to12Hour } from "../../utils/timeFormat.js";

const FormByIdPage = () => {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const navigate = useNavigate();

    const CACHE_KEY = "schedule-cache";
    const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes


    // Fetch schedule (MYSQL → fallback JSON)
    useEffect(() => {
        fetchSchedule();
    }, [id]);

    const fetchSchedule = async () => {
        try {
            const token = localStorage.getItem("token");

            // --- PRIMARY: MYSQL API ---
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/schedules/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSchedule(response.data);
            return;

        } catch (error1) {
            console.warn("MySQL failed, trying JSON...", error1);
        }

        try {
            const token = localStorage.getItem("token");

            // --- SECOND: JSON API ---
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/schedules/json/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSchedule(response.data);
            return;

        } catch (error2) {
            console.warn("JSON API failed, loading from cache...", error2);
        }

        // --- THIRD: LOCALFORAGE CACHE (your data structure) ---
        try {
            const cached = await localforage.getItem(CACHE_KEY);

            if (!cached || !cached.data) {
                console.error("No valid cached data.");
                return;
            }

            // Find matching schedule inside cached.data
            const offlineFound = cached.data.find(
                (item) => String(item.id) === String(id)
            );

            if (!offlineFound) {
                console.error("Schedule ID not found in cached data");
                return;
            }

            console.log("Loaded schedule from cache:", offlineFound);

            // Wrap to match API structure (so UI code still works)
            setSchedule({ schedule: offlineFound });

        } catch (err) {
            console.error("Cache fallback failed:", err);
        }
    };


    // Prefill form when schedule arrives
    useEffect(() => {
        if (schedule && schedule.schedule) {
            const { room_id, instructor, instructor_email, start_time, end_time } = schedule.schedule;

            setFormData((prevData) => ({
                ...prevData,
                room_number: room_id?.replace(/\s*\(.*?\)/g, "") || "",
                instructor_email: instructor_email || "",
                instructor_name: instructor || "",
                schedule_time: to12Hour(start_time) + " - " + to12Hour(end_time) || '',
            }));
        }
    }, [schedule]);

    // FORM DATA
    const [formData, setFormData] = useState({
        room_number: "",
        instructor_name: "",
        instructor_email: "",
        instructor_presence: false,
        remarks: "",
        schedule_time: "",
        photo: null
    });

    // Input changes
    const handleChange = (e) => {
        const { name, type, checked, files, value } = e.target;

        if (type === "file" && files[0]) {
            const file = files[0];

            setFormData((prevData) => ({
                ...prevData,
                [name]: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            return;
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ---------------------------
    // SUBMIT HANDLER (ONLINE + OFFLINE)
    // ---------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("token");

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) payload.append(key, value);
        });

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/form/add`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { success } = data;

            if (success) {
                toast.success("Form submitted successfully!");
            } else {
                toast.error("Failed to add");
            }

            navigate("/home");
        } catch (err) {
            console.log("Offline, saving to pending:", err.message);

            toast.info("No internet — form saved to pending!");

            const offlinePayload = {
                id: Date.now(),
                formData: JSON.parse(JSON.stringify(formData)), // clone safely
            };

            await localforage.setItem(`pending-${offlinePayload.id}`, offlinePayload);

            navigate("/home");
        } finally {
            setLoading(false);
        }
    };

    if (!schedule) return <Loading />;
    if (loading) return <Loading />;

    return (
        <>
            <NavBarTwo message={`${schedule.schedule?.room_id ?? ""}`} />

            <div className="max-w-2xl mx-auto bg-white px-5 pt-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Room Number */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                            Room Name
                        </label>
                        <input
                            type="text"
                            name="room_number"
                            value={schedule.schedule.room_id}
                            disabled
                            className="w-full px-3 py-2 border rounded border-gray-300 text-lg"
                            required
                        />
                    </div>

                    {/* Instructor Name */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                            Instructor Name
                        </label>
                        <input
                            type="text"
                            name="instructor_name"
                            value={schedule.schedule.instructor}
                            disabled
                            className="w-full px-3 py-2 border rounded border-gray-300 text-lg"
                        />
                    </div>

                    {/* Instructor Presence */}
                    <div>
                        <label className="block text-md font-medium text-gray-700">
                            Instructor Presence
                        </label>
                        <div className="flex flex-row gap-3">
                            <input
                                type="checkbox"
                                name="instructor_presence"
                                checked={formData.instructor_presence}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-600">
                                Check this if the instructor is present.
                            </span>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded"
                        ></textarea>
                    </div>

                    {/* Photo */}
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
                            You can take a picture using your device.
                        </p>

                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-4 w-full max-h-64 object-contain border rounded"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-[var(--blue-logo)] fixed bottom-0 left-0 h-15 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xl"
                        >
                            Submit Form
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-center" theme="light" />
        </>
    );
};

export default FormByIdPage;
