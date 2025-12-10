import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

export default function ReviewRoomChangeForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [formData, setFormData] = useState(null);
    const [decision, setDecision] = useState(""); // approved | rejected
    const [loading, setLoading] = useState(true);

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

    // ✅ SUBMIT REVIEW ONLY (NO FORM EDITING)
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!decision) {
            alert("Please select Approve or Reject.");
            return;
        }

        try {
            const payload = {
                ...formData,
                approved_by: user.name, // ✅ SET APPROVER NAME
                is_approved_head: decision === "approved" ? 1 : 0,
            };

            await axios.put(
                `${import.meta.env.VITE_API_URL}/roomchange/update/${id}`,
                payload
            );

            alert("Review submitted successfully!");
            navigate("/dpd/home");

        } catch (error) {
            console.log(error);
            alert("Failed to submit review");
        }
    };

    if (loading) return <p className="p-6">Loading request...</p>;
    if (!formData) return <p className="p-6">Form not found.</p>;

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
                Review Room Change Request
            </h2>

            <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto space-y-6">

                {/* ✅ READ-ONLY DETAILS */}
                <Detail label="Instructor" value={formData.full_name} />
                <Detail label="Department Name" value={formData.department_id === 1 ? "TVET" : formData.department_id === 2 ? "CSE" : formData.department_id === 3 ? "CBA" : formData.department_id === 4 ? "CTHM" : formData.department_id === 5 ? "GRAADE 11" : formData.department_id === 6 ? "GRADE 12" : "N/A"} />
                <Detail label="From Room" value={formData.from_room} />
                <Detail label="To Room" value={formData.to_room} />
                <Detail label="From Day" value={formData.from_day} />
                <Detail label="To Day" value={formData.to_day} />
                <Detail label="From Time" value={formData.from_time} />
                <Detail label="To Time" value={formData.to_time} />
                <Detail label="Schedule Number" value={formData.schedule_number} />

                <div>
                    <label className="text-gray-700 font-medium">Reason of Change</label>
                    <p className="border p-3 rounded-md bg-gray-50 mt-1">
                        {formData.reason_of_change}
                    </p>
                </div>

                {/* ✅ REVIEW CONTROLS */}
                <form onSubmit={handleSubmitReview} className="space-y-6">

                    <div className="flex flex-col">
                        <label className="text-gray-700 font-medium mb-2">
                            Decision
                        </label>
                        <select
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                            className="border p-2 rounded-md bg-gray-50"
                            required
                        >
                            <option value="">Select Decision</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                        Submit Review
                    </button>
                </form>
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
