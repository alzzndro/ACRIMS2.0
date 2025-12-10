import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

export default function CheckerReviewRoomChangeForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(true); // ✅ SHOW MODAL FIRST
    const [submitting, setSubmitting] = useState(false);

    // ✅ LOAD FORM BY ID
    useEffect(() => {
        const loadForm = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/roomchange/${id}`
                );

                setFormData(res.data);
            } catch (error) {
                console.log("Failed to load form:", error);
                alert("Failed to load form data");
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [id]);

    const handleBackArrow = () => {
        navigate(-1);
    };

    // ✅ ✅ AUTO NOTE FORM (NO DECISION)
    const handleProceedNote = async () => {
        try {
            setSubmitting(true);

            const payload = {
                ...formData, // ✅ PREVENT WIPEOUT
                is_noted_by_checker: 1, // ✅ AUTO NOTE
            };

            await axios.put(
                `${import.meta.env.VITE_API_URL}/roomchange/update/${id}`,
                payload
            );

            setShowModal(false); // ✅ HIDE MODAL

        } catch (error) {
            console.log(error);
            alert("Failed to note request");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="p-6">Loading request...</p>;
    if (!formData) return <p className="p-6">Form not found.</p>;

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

            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
                Checker Review Room Change Request
            </h2>

            {/* ✅ MODAL FIRST */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 text-center space-y-6">

                        <h3 className="text-xl font-bold text-gray-800">
                            Confirm Action
                        </h3>

                        <p className="text-gray-600">
                            By proceeding, you are officially acknowledging and noting this
                            room change request.
                        </p>

                        <button
                            onClick={handleProceedNote}
                            disabled={submitting}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : "Proceed"}
                        </button>

                    </div>
                </div>
            )}

            {/* ✅ FORM DETAILS (READ ONLY) */}
            <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto space-y-6">

                <Detail label="Instructor" value={formData.full_name} />

                <Detail
                    label="Department Name"
                    value={
                        formData.department_id === 1 ? "TVET" :
                            formData.department_id === 2 ? "CSE" :
                                formData.department_id === 3 ? "CBA" :
                                    formData.department_id === 4 ? "CTHM" :
                                        formData.department_id === 5 ? "GRADE 11" :
                                            formData.department_id === 6 ? "GRADE 12" :
                                                "N/A"
                    }
                />

                <Detail label="From Room" value={formData.from_room} />
                <Detail label="To Room" value={formData.to_room} />
                <Detail label="From Day" value={formData.from_day} />
                <Detail label="To Day" value={formData.to_day} />
                <Detail label="From Time" value={formData.from_time} />
                <Detail label="To Time" value={formData.to_time} />
                <Detail label="Schedule Number" value={formData.schedule_number} />
                <Detail label="Approved by" value={formData.approved_by} />

                <div>
                    <label className="text-gray-700 font-medium">Reason of Change</label>
                    <p className="border p-3 rounded-md bg-gray-50 mt-1">
                        {formData.reason_of_change}
                    </p>
                </div>

            </div>
        </div>
    );
}

/* ✅ SMALL REUSABLE DISPLAY COMPONENT */
function Detail({ label, value }) {
    return (
        <p>
            <strong>{label}:</strong> {value}
        </p>
    );
}
