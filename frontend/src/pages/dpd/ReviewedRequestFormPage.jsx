import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function ReviewedRequestFormsPage() {
    const [forms, setForms] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name;

    const handleBackArrow = () => {
        navigate(-1);
    };

    // ✅ FETCH ALL FORMS → FILTER BY APPROVED_BY = USER NAME
    const loadReviewedForms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/roomchange`
            );

            const filtered = response.data.filter(
                (form) => form.approved_by === userName
            );

            setForms(filtered);
        } catch (err) {
            console.log("Error fetching reviewed forms:", err);
        }
    };

    useEffect(() => {
        loadReviewedForms();
    }, []);

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

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                My Reviewed Room Change Requests
            </h2>

            {forms.length === 0 ? (
                <p className="text-gray-600">
                    You have not reviewed any requests yet.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...forms].reverse().map((form) => (
                        <div
                            key={form.id}
                            className="bg-white p-5 rounded-xl shadow-md border"
                        >

                            <h3 className="font-bold text-lg text-blue-600 mb-2">
                                {form.from_room} ➜ {form.to_room}
                            </h3>

                            <p><strong>Instructor:</strong> {form.full_name}</p>
                            <p><strong>Department Name:</strong> {form.department_id === 1 ? "TVET" : form.department_id === 2 ? "CSE" : form.department_id === 3 ? "CBA" : form.department_id === 4 ? "CTHM" : form.department_id === 5 ? "GRAADE 11" : form.department_id === 6 ? "GRADE 12" : "N/A"}</p>

                            <p><strong>From:</strong> {form.from_day} @ {form.from_time}</p>
                            <p><strong>To:</strong> {form.to_day} @ {form.to_time}</p>

                            <p className="mt-2">
                                <strong>Reason:</strong><br />
                                <span className="text-gray-600">{form.reason_of_change}</span>
                            </p>

                            <p className="mt-3">
                                <strong>Reviewed By:</strong>{" "}
                                <span className="text-blue-700 font-semibold">
                                    {form.approved_by}
                                </span>
                            </p>

                            <p className="mt-1">
                                <strong>Status: </strong>
                                {form.is_approved_head === 1 ? (
                                    <span className="text-green-600 font-semibold">
                                        Approved
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-semibold">
                                        Rejected
                                    </span>
                                )}
                            </p>

                            {form.time_reviewed && (
                                <p className="mt-1 text-sm text-gray-500">
                                    <strong>Reviewed At:</strong> {form.time_reviewed}
                                </p>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
