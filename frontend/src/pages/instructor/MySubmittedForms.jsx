import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function MySubmittedForms() {
    const [forms, setForms] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.email;

    const navigate = useNavigate();

    const handleBackArrow = () => {
        navigate(-1);
    };

    const loadForms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/roomchange`
            );

            // ✅ Filter only user's forms
            const filtered = response.data.filter(
                (form) => form.email === userEmail
            );

            setForms(filtered);
        } catch (err) {
            console.log("Error fetching forms:", err);
        }
    };

    useEffect(() => {
        loadForms();
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
                My Submitted Forms
            </h2>

            {forms.length === 0 ? (
                <p>No submitted forms found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...forms].reverse().map((form) => {
                        // ✅ Disable card if already reviewed
                        const isDisabled = form.is_noted_by_checker !== null;

                        return (
                            <div
                                key={form.id}
                                onClick={() => {
                                    if (isDisabled) {
                                        alert(
                                            "This form can no longer be edited because it has already been reviewed."
                                        );
                                        return;
                                    }
                                    navigate(
                                        `/instructor/roomchange/edit/${form.id}`
                                    );
                                }}
                                className={`bg-white p-5 rounded-xl shadow-md border transition
                                    ${isDisabled
                                        ? "opacity-60 cursor-not-allowed"
                                        : "hover:shadow-lg cursor-pointer"
                                    }
                                `}
                            >
                                <h3 className="font-bold text-lg text-blue-600 mb-2">
                                    {form.from_room} ➜ {form.to_room}
                                </h3>

                                <p>
                                    <strong>Date:</strong>{" "}
                                    {form.date_submitted}
                                </p>
                                <p>
                                    <strong>From:</strong> {form.from_day} @{" "}
                                    {form.from_time}
                                </p>
                                <p>
                                    <strong>To:</strong> {form.to_day} @{" "}
                                    {form.to_time}
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
                                    {form.is_noted_by_checker === 1 ? (
                                        <span className="text-green-600 font-semibold">
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="text-yellow-600 font-semibold">
                                            Pending
                                        </span>
                                    )}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
