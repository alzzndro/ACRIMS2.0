import { useEffect, useState } from "react"
import localforage from "localforage"
import NavBarTwo from "../../components/checker/NavBarTwo"


const PendingPage = () => {
    const [pendingForms, setPendingForms] = useState([]);

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        const keys = await localforage.keys();
        const forms = [];

        for (const key of keys) {
            if (key.startsWith("pending-")) {
                const data = await localforage.getItem(key);
                forms.push(data);
            }
        }

        setPendingForms(forms);
    }

    return (
        <>
            <NavBarTwo />
            <div className="p-4">
                <h1 className="text-lg font-bold mb-4">Pending Forms</h1>
                {pendingForms.length === 0 ? (
                    <p>No pending formss</p>
                ) : (
                    pendingForms.map((form) => (
                        <div
                            key={form.id}
                            className="p-4 mb-2 border rounded flex justify-between"
                        >
                            <div>
                                <p><b>Room: </b>{form.formData.room_number}</p>
                                <p><b>Instructor: </b>{form.formData.instructor_name}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default PendingPage