import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import NavBarTwo from "../../components/checker/NavBarTwo"
import Loading from "../../components/common/Loading"

function convertTo12HourFormat(time) {
    const [hour, minute] = time.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

const FormUpdatePage = () => {
    const { id } = useParams();
    const [form, setForm] = useState(null);

    // new lateness state
    const [hoursLate, setHoursLate] = useState("");
    const [minutesLate, setMinutesLate] = useState("");

    const [modalConfirmation, setModalConfirmation] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchForm();
    }, []);

    const fetchForm = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/form/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
            setForm(data);

            // parse lateness "X hour/s and Y minute/s"
            if (data.lateness) {
                const match = data.lateness.match(/(\d+)\s+hour\/s\s+and\s+(\d+)\s+minute\/s/);
                if (match) {
                    setHoursLate(match[1]);
                    setMinutesLate(match[2]);
                }
            }

        } catch (error) {
            console.log("Error fetching form:", error);
        }
    };

    const handleSave = async () => {

        let updatedLateness = null;

        if (form.is_late === 1) {
            // combine into a single string
            updatedLateness = `${hoursLate || 0} hour/s and ${minutesLate || 0} minute/s`;
        }

        const payload = {
            ...form,
            lateness: updatedLateness
        };

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${import.meta.env.VITE_API_URL}/form/update/${id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(-1);
        } catch (error) {
            console.log("Error updating form:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/form/delete/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(-1);
        } catch (error) {
            console.log("Error deleting form:", error);
        }
    };

    // if not loaded yet
    if (!form) return <Loading />;

    return (
        <>
            <NavBarTwo message={`Edit Form #${id}`} />

            <div className="p-4 relative">

                {/* Date & Time */}
                <div className="mb-4">
                    <label>Date & Time Monitored</label>
                    <p className="opacity-40">
                        {convertTo12HourFormat(form.time_monitored)} , {form.date_monitored}
                    </p>
                </div>

                {/* Room */}
                <div className="mb-4">
                    <label>Room Number</label>
                    <input
                        type="text"
                        value={form.room_number}
                        onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                        className="border px-2 py-1 rounded w-full"
                    />
                </div>

                {/* Instructor */}
                <div className="mb-4">
                    <label>Instructor</label>
                    <input
                        type="text"
                        value={form.instructor_name}
                        onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
                        className="border px-2 py-1 rounded w-full"
                    />
                </div>

                {/* Changed rooms */}
                <div className="mb-4">
                    <label>Changed Rooms?</label>
                    <div className="flex gap-3">
                        <input
                            type="checkbox"
                            checked={form.changed_rooms === 1}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    changed_rooms: e.target.checked ? 1 : 0
                                })
                            }
                        />
                        <span className="text-sm text-gray-600">
                            Mark if the instructor changed rooms.
                        </span>
                    </div>
                </div>

                {/* Presence */}
                <div className="mb-4">
                    <label>Instructor Presence</label>
                    <div className="flex gap-3">
                        <input
                            type="checkbox"
                            checked={form.instructor_presence === 1}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setForm({
                                    ...form,
                                    instructor_presence: checked ? 1 : 0,
                                    ...(checked ? {} : { is_late: 0, lateness: null })
                                });

                                if (!checked) {
                                    setHoursLate("");
                                    setMinutesLate("");
                                }
                            }}
                        />
                        <span className="text-sm text-gray-600">
                            Mark if instructor is present.
                        </span>
                    </div>
                </div>

                {/* Late */}
                <div className="mb-4">
                    <label>Instructor Lateness</label>
                    <div className="flex gap-3">
                        <input
                            type="checkbox"
                            checked={form.is_late === 1}
                            disabled={!form.instructor_presence}
                            onChange={(e) => {
                                const checked = e.target.checked;

                                setForm({
                                    ...form,
                                    is_late: checked ? 1 : 0,
                                    lateness: checked ? form.lateness : null
                                });

                                if (!checked) {
                                    setHoursLate("");
                                    setMinutesLate("");
                                }
                            }}
                        />
                        {!form.instructor_presence && (
                            <span className="text-red-500 text-sm">
                                Only available when instructor is present.
                            </span>
                        )}
                    </div>

                    {/* Hours + Minutes fields */}
                    {form.is_late === 1 && (
                        <div className="mt-3 flex gap-4">

                            <div className="flex-1">
                                <label className="block text-sm">Hours Late</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={hoursLate}
                                    onChange={(e) => setHoursLate(e.target.value)}
                                    className="border px-2 py-1 rounded w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm">Minutes Late</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutesLate}
                                    onChange={(e) => setMinutesLate(e.target.value)}
                                    className="border px-2 py-1 rounded w-full"
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* Remarks */}
                <div className="mb-4">
                    <label>Remarks</label>
                    <input
                        type="text"
                        value={form.remarks || ""}
                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                        className="border px-2 py-1 rounded w-full h-20"
                    />
                </div>

                {/* Photo */}
                <div className="mb-4">
                    <label>Photo Taken</label>
                    {form.photo ? (
                        <img
                            src={
                                form.photo.startsWith("http")
                                    ? form.photo
                                    : `${import.meta.env.VITE_API_URL}${form.photo}`
                            }
                            className="w-full max-h-64 object-contain border rounded"
                        />
                    ) : (
                        <p className="italic text-gray-500">No photo available.</p>
                    )}
                    <p className="text-xs text-end italic">not editable</p>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => setModalConfirmation(true)}
                    className="px-4 py-2 bg-[var(--red-logo)] text-white font-bold w-full h-15 text-xl"
                >
                    Delete Form
                </button>

                {/* Delete Modal */}
                {modalConfirmation && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setModalConfirmation(false)}
                                    className="w-10 aspect-square text-2xl rounded-md bg-red-400 text-white"
                                >
                                    &times;
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold mb-6 text-center">
                                Are you sure you want to delete?
                            </h3>

                            <div className="flex flex-row justify-center gap-10">
                                <button
                                    onClick={handleDelete}
                                    className="border w-24 p-4 rounded-2xl bg-green-800 text-white font-bold"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setModalConfirmation(false)}
                                    className="border w-24 p-4 rounded-2xl bg-red-600 text-white font-bold"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save button */}
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[var(--blue-logo)] text-white font-bold fixed bottom-0 left-0 w-full h-15 text-xl"
                >
                    Save Changes
                </button>

            </div>
        </>
    );
};

export default FormUpdatePage;
