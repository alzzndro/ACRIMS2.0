import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import NavBarTwo from "../../components/checker/NavBarTwo"
import Loading from "../../components/common/Loading"
import { IoArrowBack } from "react-icons/io5"

function convertTo12HourFormat(time) {
    const [hour, minute] = time.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // 0 becomes 12, 13 becomes 1, etc.
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
}

const FormUpdatePage = () => {
    const { id } = useParams(); // get :id from URL
    const [form, setForm] = useState(null);
    const [modalConfirmation, setModalConfirmation] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchForm = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/form/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setForm(response.data);
        } catch (error) {
            console.log("Error fetching form:", error);
        }
    }

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `${import.meta.env.VITE_API_URL}/form/delete/${id}`,
                { headers: { Authorization: `Bearer ${token}` }, data: form }
            );
            console.log("Form Deleted successfully!");
            navigate(-1);
        } catch (error) {
            console.log(error, "Error in deleting form.");
        }
    }

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `${import.meta.env.VITE_API_URL}/form/update/${id}`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Form updated successfully!");
            navigate(-1);
        } catch (error) {
            console.log("Error updating form:", error);
        }
    }

    if (!form) return <Loading />

    return (
        <>
            <NavBarTwo message={`Edit Form #${id}`} />

            <div className="p-4 relative">

                <div className="mb-4">
                    <label className="block mb-1">Date & Time Monitored</label>
                    <p className="opacity-40">{convertTo12HourFormat(form.time_monitored)} , {form.date_monitored}</p>
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Room Number</label>
                    <input
                        type="text"
                        value={form.room_number}
                        onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                        className="border px-2 py-1 rounded w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Instructor</label>
                    <input
                        type="text"
                        value={form.instructor_name}
                        onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
                        className="border px-2 py-1 rounded w-full"
                    />
                </div>

                {/* Instructor Presence */}
                <div className="mb-4">
                    <label className="block mb-1">Instructor Presence</label>
                    <div className="flex flex-row gap-3">
                        <input
                            type="checkbox"
                            checked={form.instructor_presence === 1}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    instructor_presence: e.target.checked ? 1 : 0,
                                })
                            }
                            className="border px-2 py-1 rounded"
                        />

                        <span className="text-sm text-gray-600">Please mark this <i>"checked"</i> if the instructor is present.</span>
                    </div>
                </div>

                {/* Lateness */}
                <div className="mb-4">
                    <label className="block mb-1">Instructor Lateness</label>
                    <div className="flex flex-row gap-3">
                        <input
                            type="checkbox"
                            checked={form.is_late === 1}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    is_late: e.target.checked ? 1 : 0,
                                })
                            }
                            disabled={!form.instructor_presence}
                            className="border px-2 py-1 rounded"
                        />
                        <span className="text-sm text-gray-600">
                            Check this if the instructor was late.
                            <br />
                            <span className={form.instructor_presence ? "text-green-600" : "text-red-500"}>
                                {form.instructor_presence ? '' : 'Only available when instructor is present.'}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Remarks</label>
                    <input
                        type="text"
                        value={form.remarks ? form.remarks : ""}
                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                        className="border px-2 py-1 rounded w-full h-20"
                    />
                </div>

                {/* ✅ Photo Preview Section */}
                <div className="mb-4">
                    <label className="block mb-1">Photo Taken</label>
                    {form.photo ? (
                        <img
                            src={
                                form.photo.startsWith("http") || form.photo.startsWith("data:")
                                    ? form.photo
                                    : `${import.meta.env.VITE_API_URL}${form.photo}`
                            }
                            alt="Uploaded"
                            className="w-full max-h-64 object-contain border rounded"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 italic">No photo available.</p>
                    )}
                    <p className="text-end italic text-xs">not editable</p>
                </div>

                <div className="">
                    <button
                        onClick={() => setModalConfirmation(prev => !prev)}
                        className="px-4 py-2 bg-[var(--red-logo)] text-white font-bold hover:bg-blue-600 w-full h-15 text-xl relative"
                    >
                        Delete Form
                    </button>
                </div>

                {modalConfirmation && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <div className="flex flex-col items-center justify-start mb-6 gap-4">
                                <div className="w-full flex justify-end">
                                    <button onClick={() => { setModalConfirmation(prev => !prev) }} className='w-10 aspect-square text-2xl  rounded-md flex justify-center items-center bg-red-400 text-white'>
                                        &times;
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold">Are you sure you want to delete?</h3>
                            </div>
                            <div className="flex flex-row justify-center gap-10">
                                <button
                                    onClick={handleDelete}
                                    className="border w-24 border-black/50 p-4 rounded-2xl focus:scale-110 bg-green-800 text-white font-bold">
                                    Yes
                                </button>
                                <button
                                    onClick={() => {
                                        setModalConfirmation(prev => !prev)
                                    }}
                                    className="border w-24 border-black/50 focus:scale-110 p-4 rounded-2xl bg-red-600 text-white font-bold">
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-15 w-full">

                </div>

                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[var(--blue-logo)] text-white font-bold hover:bg-blue-600 bottom-0 left-0 fixed w-full h-15 text-xl"
                >
                    Save Changes
                </button>
            </div>
        </>
    )
}

export default FormUpdatePage
