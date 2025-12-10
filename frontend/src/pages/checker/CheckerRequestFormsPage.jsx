import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarTwo from "../../components/checker/NavBarTwo";

export default function CheckerRequestFormsPage() {
    const [forms, setForms] = useState([]);
    const navigate = useNavigate();

    // ✅ LOAD ALL FORMS → FILTER FOR CHECKER STAGE
    const loadForms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/roomchange`
            );

            const filtered = response.data.filter(
                (form) => form.is_approved_room_loading === 1
            );

            setForms(filtered);
        } catch (err) {
            console.log("Error fetching checker forms:", err);
        }
    };

    useEffect(() => {
        loadForms();
    }, []);

    return (
        <>
            <NavBarTwo />

            <div className="min-h-screen bg-gray-100 p-6">

                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Checker Room Change Requests
                </h2>

                {forms.length === 0 ? (
                    <p className="text-gray-600">
                        No requests available.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...forms].reverse().map((form) => (
                            <div
                                key={form.id}
                                className="bg-white p-6 rounded-xl shadow-md border flex flex-col justify-between"
                            >

                                <div>
                                    <h3 className="font-bold text-lg text-blue-600 mb-2">
                                        {form.from_room} ➜ {form.to_room}
                                    </h3>

                                    <p><strong>Instructor:</strong> {form.full_name}</p>

                                    <p>
                                        <strong>Department:</strong>{" "}
                                        {form.department_id === 1 ? "TVET" :
                                            form.department_id === 2 ? "CSE" :
                                                form.department_id === 3 ? "CBA" :
                                                    form.department_id === 4 ? "CTHM" :
                                                        form.department_id === 5 ? "GRADE 11" :
                                                            form.department_id === 6 ? "GRADE 12" :
                                                                "N/A"}
                                    </p>

                                    <p><strong>From:</strong> {form.from_day} @ {form.from_time}</p>
                                    <p><strong>To:</strong> {form.to_day} @ {form.to_time}</p>

                                    <p className="mt-2"><strong>Approved by:</strong> {form.approved_by}</p>

                                    <p className="mt-2">
                                        <strong>Reason:</strong><br />
                                        <span className="text-gray-600">
                                            {form.reason_of_change}
                                        </span>
                                    </p>
                                </div>

                                {/* ✅ DYNAMIC REVIEW BUTTON */}
                                <button
                                    onClick={() => {
                                        if (form.is_noted_by_checker !== 1) {
                                            navigate(`/review/${form.id}`);
                                        }
                                    }}
                                    disabled={form.is_noted_by_checker === 1}
                                    className={`mt-5 w-full py-3 rounded-lg transition font-semibold text-white
                                        ${form.is_noted_by_checker === 1
                                            ? "bg-green-600 cursor-not-allowed"
                                            : "bg-purple-600 hover:bg-purple-700"
                                        }`}
                                >
                                    {form.is_noted_by_checker === 1
                                        ? "✅ Noted"
                                        : "Review & Note"}
                                </button>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
