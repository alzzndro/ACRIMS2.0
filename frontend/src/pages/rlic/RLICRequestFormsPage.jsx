import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function RLICRequestFormsPage() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const handleBackArrow = () => {
        navigate(-1);
    };

    // ✅ LOAD ONLY DPD-APPROVED BUT RLIC-PENDING FORMS
    const loadForms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/roomchange`
            );

            const filtered = response.data.filter(
                (form) =>
                    form.is_approved_head === 1 &&
                    form.is_approved_room_loading === null
            );

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
                RLIC Pending Room Change Requests
            </h2>

            {loading ? (
                <p>Loading requests...</p>
            ) : forms.length === 0 ? (
                <p>No pending RLIC requests found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...forms].reverse().map((form) => (
                        <div
                            key={form.id}
                            onClick={() => navigate(`/rlic/review/${form.id}`)}
                            className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition cursor-pointer"
                        >
                            <h3 className="font-bold text-lg text-blue-600 mb-2">
                                {form.from_room} ➜ {form.to_room}
                            </h3>

                            <p><strong>Instructor:</strong> {form.full_name}</p>
                            <p><strong>Department Name:</strong> {form.department_id === 1 ? "TVET" : form.department_id === 2 ? "CSE" : form.department_id === 3 ? "CBA" : form.department_id === 4 ? "CTHM" : form.department_id === 5 ? "GRAADE 11" : form.department_id === 6 ? "GRADE 12" : "N/A"}</p>
                            <p><strong>Date:</strong> {form.date_submitted}</p>

                            <p className="mt-2">
                                <strong>From:</strong> {form.from_day} @ {form.from_time}
                            </p>

                            <p>
                                <strong>To:</strong> {form.to_day} @ {form.to_time}
                            </p>

                            <p className="mt-2">
                                <strong>Status:</strong>{" "}
                                <span className="text-yellow-600 font-semibold">
                                    Awaiting RLIC Review
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
