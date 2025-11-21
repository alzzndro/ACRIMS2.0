import { useEffect, useState } from "react";
import axios from "axios";
import localforage from "localforage";
import NavBarTwo from "../../components/checker/NavBarTwo";

const PendingPage = () => {
    const [pendingForms, setPendingForms] = useState([]);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        loadPending();
    }, []);

    const tryResend = async () => {
        console.log("🔵 Try Resend triggered");

        // // BLOCK DOUBLE EXECUTION
        // if (localStorage.getItem("resend_lock")) {
        //     console.log("⛔ Resend lock detected — stopping.");
        //     return;
        // }

        localStorage.setItem("resend_lock", "true");
        setIsResending(true);

        console.log("🔄 Resend started...");

        try {
            const keys = await localforage.keys();
            console.log("📌 Keys:", keys);

            for (const key of keys) {
                if (!key.startsWith("pending-")) continue;

                const form = await localforage.getItem(key);
                console.log("📄 Processing:", key, form);

                const token = localStorage.getItem("token");

                // FIX STRUCTURE
                const raw = form.formData || form;

                const payload = new FormData();

                for (const [k, v] of Object.entries(raw)) {
                    if (k === "photo") {
                        if (v instanceof File) {
                            payload.append(k, v);
                        } else if (typeof v === "string" && v.startsWith("data:")) {
                            // base64 → File
                            const arr = v.split(",");
                            const mime = arr[0].match(/:(.*?);/)[1];
                            const bstr = atob(arr[1]);
                            let n = bstr.length;
                            const u8arr = new Uint8Array(n);
                            while (n--) u8arr[n] = bstr.charCodeAt(n);
                            const file = new File([u8arr], "photo.jpg", { type: mime });
                            payload.append(k, file);
                        }
                    } else {
                        if (v !== null && v !== undefined) {
                            payload.append(k, v);
                        }
                    }
                }

                try {
                    console.log("📡 Uploading:", key);

                    await axios.post(`${import.meta.env.VITE_API_URL}/form/add`, payload, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    console.log(`✅ Resent: ${key}`);
                    await localforage.removeItem(key);

                } catch (err) {
                    console.error(`❌ Upload failed for ${key}:`, err);
                }
            }

        } catch (err) {
            console.error("🔥 Resend crashed:", err);
        } finally {
            console.log("🧹 Cleaning up resend lock");
            localStorage.removeItem("resend_lock");
            setIsResending(false);
            loadPending();
        }

        console.log("🎉 Resend finished");
    };

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
    };

    return (
        <>
            <NavBarTwo />
            <div className="p-4">
                <h1 className="text-lg font-bold mb-4">Pending Forms</h1>

                {pendingForms.length === 0 ? (
                    <p>No pending forms</p>
                ) : (
                    pendingForms.map((form) => (
                        <div key={form.id} className="p-4 mb-2 border rounded">
                            <p><b>Room:</b> {form.formData.room_number}</p>
                            <p><b>Instructor:</b> {form.formData.instructor_name}</p>
                        </div>
                    ))
                )}

                <button
                    onClick={tryResend}
                    className="bg-red-600 text-white px-4 py-2 mt-4 rounded w-full focus:scale-105"
                >
                    {isResending ? "Resending..." : "Try Resend"}
                </button>
            </div>
        </>
    );
};

export default PendingPage;
