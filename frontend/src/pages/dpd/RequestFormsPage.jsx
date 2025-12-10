import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function RequestFormsPage() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // ✅ Get logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userDepartmentId = user?.department_id;

    const handleBackArrow = () => {
        navigate(-1);
    };

    // ✅ Fetch + Filter Forms
    const loadForms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/roomchange`
            );

            const filtered = response.data.filter((form) => {
                return (
                    form.is_approved_head === null && // ✅ Not yet reviewed
                    form.department_id === userDepartmentId // ✅ Same department only
                );
            });

            setForms(filtered);
        } catch (err) {
            console.log("Error fetching forms:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForms();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* ✅ Back Button */}
            <button
                onClick={handleBackArrow}
                className="flex items-center text-red-700 mb-6 hover:text-red-500 transition"
            >
                <IoArrowBack size={26} />
                <span className="ml-2 font-medium">Back</span>
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Pending Room Change Requests
            </h2>

            {/* ✅ Loading State */}
            {loading ? (
                <p>Loading request forms...</p>
            ) : forms.length === 0 ? (
                <p>No pending request forms for your department.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forms.map((form) => (
                        <div
                            key={form.id}
                            onClick={() => navigate(`/dpd/review/${form.id}`)}
                            className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition"
                        >
                            <h3 className="font-bold text-lg text-blue-600 mb-2">
                                {form.from_room} ➜ {form.to_room}
                            </h3>

                            <p>
                                <strong>Instructor:</strong> {form.full_name}
                            </p>

                            <p>
                                <strong>Date:</strong> {form.date_submitted}
                            </p>

                            <p>
                                <strong>From:</strong> {form.from_day} @ {form.from_time}
                            </p>

                            <p>
                                <strong>To:</strong> {form.to_day} @ {form.to_time}
                            </p>

                            <p className="mt-2">
                                <strong>Reason:</strong>
                                <br />
                                <span className="text-gray-600">
                                    {form.reason_of_change}
                                </span>
                            </p>

                            <p className="mt-3">
                                <strong>Status: </strong>
                                <span className="text-yellow-600 font-semibold">
                                    Pending Review
                                </span>
                            </p>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
