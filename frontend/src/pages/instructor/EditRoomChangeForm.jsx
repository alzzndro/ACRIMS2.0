import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { to24HourNow } from "../../utils/timeFormat";

export default function EditRoomChangeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentTimeIn24Hour = to24HourNow();

    const [formData, setFormData] = useState({
        department_id: "",
        from_room: "",
        to_room: "",
        from_day: "",
        to_day: "",
        from_time: "",
        to_time: "",
        schedule_number: "",
        reason_of_change: ""
    });

    // ✅ LOAD FORM DATA BY ID
    useEffect(() => {
        const loadForm = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/roomchange/${id}`
                );

                setFormData({
                    department_id: res.data.department_id,
                    from_room: res.data.from_room,
                    to_room: res.data.to_room,
                    from_day: res.data.from_day,
                    to_day: res.data.to_day,
                    from_time: res.data.from_time,
                    to_time: res.data.to_time,
                    schedule_number: res.data.schedule_number,
                    reason_of_change: res.data.reason_of_change
                });

            } catch (error) {
                console.log("Failed to load form:", error);
                alert("Failed to load form data");
            }
        };

        loadForm();
    }, [id]);

    const handleBackArrow = () => {
        navigate(-1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "department_id" || name === "schedule_number"
                    ? Number(value)
                    : value
        }));
    };

    // ✅ UPDATE FORM
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            const updatedFormData = {
                ...formData,
                full_name: user.name,
                email: user.email,
                time_updated: currentTimeIn24Hour
            };

            await axios.put(
                `${import.meta.env.VITE_API_URL}/roomchange/update/${id}`,
                updatedFormData
            );

            alert("Form updated successfully!");
            navigate("/instructor/home");

        } catch (error) {
            console.log(error);
            alert("Failed to update form");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <button
                onClick={handleBackArrow}
                className="flex items-center text-red-700 mb-6 hover:text-red-500 transition"
            >
                <IoArrowBack size={26} />
                <span className="ml-2 font-medium">Back</span>
            </button>

            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
                Edit Room Change Form
            </h2>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto space-y-6"
            >

                {/* Department */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                        Department
                    </label>
                    <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        className="border p-2 rounded-md bg-gray-50"
                        required
                    >
                        <option value="">Select Department</option>
                        <option value={1}>TVET</option>
                        <option value={2}>CSE</option>
                        <option value={3}>CBA</option>
                        <option value={4}>CTHM</option>
                        <option value={5}>GRADE 11</option>
                        <option value={6}>GRADE 12</option>
                    </select>
                </div>

                {/* Rooms */}
                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput label="From Room" name="from_room" value={formData.from_room} onChange={handleChange} />
                    <FormInput label="To Room" name="to_room" value={formData.to_room} onChange={handleChange} />
                </div>

                {/* Days */}
                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput type="date" label="From Day" name="from_day" value={formData.from_day} onChange={handleChange} />
                    <FormInput type="date" label="To Day" name="to_day" value={formData.to_day} onChange={handleChange} />
                </div>

                {/* Times */}
                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput type="time" step="1" label="From Time" name="from_time" value={formData.from_time} onChange={handleChange} />
                    <FormInput type="time" step="1" label="To Time" name="to_time" value={formData.to_time} onChange={handleChange} />
                </div>

                {/* Schedule */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                        Schedule Number
                    </label>
                    <select
                        name="schedule_number"
                        value={formData.schedule_number}
                        onChange={handleChange}
                        className="border p-2 rounded-md bg-gray-50"
                        required
                    >
                        <option value="">Select Schedule</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                    </select>
                </div>

                {/* Reason */}
                <FormTextArea
                    label="Reason of Change"
                    name="reason_of_change"
                    value={formData.reason_of_change}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                    Update Form
                </button>
            </form>
        </div>
    );
}

/* ✅ REUSABLES */

function FormInput({ label, type = "text", ...props }) {
    return (
        <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">{label}</label>
            <input
                type={type}
                {...props}
                className="border p-2 rounded-md bg-gray-50"
                required
            />
        </div>
    );
}

function FormTextArea({ label, ...props }) {
    return (
        <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">{label}</label>
            <textarea
                {...props}
                className="border p-2 rounded-md bg-gray-50 h-28 resize-none"
            />
        </div>
    );
}
