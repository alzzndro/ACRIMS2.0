import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { to24HourNow } from "../../utils/timeFormat";

export default function AddRoomChangeForm() {
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

    const [users, setUsers] = useState([]);      // store ALL users
    const [dpdEmails, setDpdEmails] = useState([]); // emails that match selected department

    const navigate = useNavigate();
    const currentTimeIn24Hour = to24HourNow();

    const handleBackArrow = () => navigate(-1);

    /* ----------------------------------------
       Fetch ALL users ONCE
    ---------------------------------------- */
    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/uzers`
            );

            setUsers(res.data);

        } catch (error) {
            console.log("Failed to load users data:", error);
            alert("Failed to load users data");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    /* ----------------------------------------
       When department_id changes → update emails
    ---------------------------------------- */
    useEffect(() => {
        if (!formData.department_id) {
            setDpdEmails([]);
            return;
        }

        const selectedDept = Number(formData.department_id);

        const emails = users
            .filter(u => u.department_id === selectedDept)
            .map(u => u.email);

        setDpdEmails(emails);
    }, [formData.department_id, users]);

    /* ----------------------------------------
       Handle Form Inputs
    ---------------------------------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]:
                name === "department_id" || name === "schedule_number"
                    ? Number(value)
                    : value
        }));
    };

    /* ----------------------------------------
       Submit Form
    ---------------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let storedUser = localStorage.getItem("user");

            if (!storedUser) {
                alert("User not found in local storage.");
                return;
            }

            storedUser = JSON.parse(storedUser);

            const now = new Date();
            const isoDate = now.toISOString().slice(0, 10);

            const updatedFormData = {
                ...formData,
                full_name: storedUser.name,
                email: storedUser.email,
                date_submitted: isoDate,
                time_submitted: currentTimeIn24Hour,
                dpd_emails: dpdEmails,  // 🔥 now correct
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/roomchange/add`,
                updatedFormData
            );

            alert("Form submitted successfully!");
            navigate("/instructor/home");

        } catch (error) {
            console.log(error);
            alert("Failed to submit form");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* Back Button */}
            <button
                onClick={handleBackArrow}
                className="flex items-center text-red-700 mb-6 hover:text-red-500 transition"
            >
                <IoArrowBack size={26} />
                <span className="ml-2 font-medium">Back</span>
            </button>

            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
                Add Room Change Form
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
                        className="border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
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

                {/* From / To Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="From Room" name="from_room" value={formData.from_room} onChange={handleChange} />
                    <FormInput label="To Room" name="to_room" value={formData.to_room} onChange={handleChange} />
                </div>

                {/* From / To Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="From Day"
                        type="date"
                        name="from_day"
                        value={formData.from_day}
                        onChange={handleChange}
                    />
                    <FormInput
                        label="To Day"
                        type="date"
                        name="to_day"
                        value={formData.to_day}
                        onChange={handleChange}
                    />
                </div>

                {/* From / To Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="From Time"
                        type="time"
                        name="from_time"
                        value={formData.from_time}
                        onChange={handleChange}
                    />
                    <FormInput
                        label="To Time"
                        type="time"
                        name="to_time"
                        value={formData.to_time}
                        onChange={handleChange}
                    />
                </div>

                {/* Schedule Number */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                        Schedule Number
                    </label>
                    <select
                        name="schedule_number"
                        value={formData.schedule_number}
                        onChange={handleChange}
                        className="border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Select Schedule Number</option>
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

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg"
                >
                    Submit Form
                </button>
            </form>
        </div>
    );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */

function FormInput({ label, type = "text", ...props }) {
    return (
        <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">{label}</label>
            <input
                type={type}
                {...props}
                className="border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
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
                className="border p-2 rounded-md bg-gray-50 h-28 resize-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
    );
}
