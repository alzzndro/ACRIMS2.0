import axios from "axios";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarTwo from "../../components/checker/NavBarTwo";

const ExportsPage = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);   // ✅ NEW
    const [loading, setLoading] = useState(false);

    const [filterType, setFilterType] = useState("none");

    const toUpperName = (name) =>
        name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

    const truthyPresence = (val) => val === 1 || val === true;

    const to12Hour = (time) => {
        if (!time) return "";
        const date = new Date(`1970-01-01T${time}`);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const exportToCSV = (data, filename) => {
        if (!data || !data.length) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header];
                        return typeof value === "string" && value.includes(",")
                            ? `"${value.replace(/"/g, '""')}"`

                            : value;
                    })
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        if (!startDate || !endDate) {
            alert("Please select BOTH start and end dates.");
            return;
        }

        if (endDate < startDate) {
            alert("End date cannot be earlier than start date.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No auth token found.");
            return;
        }

        try {
            setLoading(true);

            // Fetch Forms
            const formsRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/form/checker`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const forms = Array.isArray(formsRes.data)
                ? formsRes.data
                : [formsRes.data];

            // Fetch Users
            const usersRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/user`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const users = usersRes.data ?? [];

            // 1️⃣ Date Filtering
            const filteredForms = forms.filter((form) => {
                const formDate = new Date(form.date_monitored);
                return formDate >= startDate && formDate <= endDate;    // ✅ UPDATED
            });

            // 2️⃣ Status Filtering
            let filteredByStatus = filteredForms;

            if (filterType === "present") {
                filteredByStatus = filteredForms.filter((f) =>
                    truthyPresence(f.instructor_presence)
                );
            } else if (filterType === "late") {
                filteredByStatus = filteredForms.filter((f) =>
                    truthyPresence(f.is_late)
                );
            } else if (filterType === "absent") {
                filteredByStatus = filteredForms.filter(
                    (f) => !truthyPresence(f.instructor_presence)
                );
            } else if (filterType === "changed") {
                filteredByStatus = filteredForms.filter((f) =>
                    truthyPresence(f.changed_rooms)
                );
            }

            if (!filteredByStatus.length) {
                alert("No records match your selected filters.");
                return;
            }

            // 3️⃣ Join with Checker Name
            const joinedData = filteredByStatus.map((form) => {
                const user = users.find((u) => u.user_id === form.checker_id);
                return {
                    ...form,
                    checker_name: user
                        ? `${toUpperName(user.first_name)} ${toUpperName(
                            user.last_name
                        )}`
                        : "",
                };
            });

            // 4️⃣ Prepare CSV Data
            const exportData = joinedData.map((form) => ({
                Date: form.date_monitored,
                Time: to12Hour(form.time_monitored),
                Room: form.room_number,
                Instructor: form.instructor_name,
                Schedule_Time: form.schedule_time,
                Present: truthyPresence(form.instructor_presence) ? "Yes" : "No",
                Late: truthyPresence(form.is_late) ? "Yes" : "No",
                Time_Late: form.lateness || "N/A",
                Changed_Rooms: truthyPresence(form.changed_rooms) ? "Yes" : "No",
                Remarks: form.remarks || "-",
                Checker_Name: form.checker_name,
            }));

            const now = new Date();
            const dateString = now.toISOString().replace(/:/g, "-").replace(/\..+/, "");
            const csvFilename = `acrims_monthly_report_${dateString}`;

            exportToCSV(exportData, csvFilename);
        } catch (err) {
            console.log("Export error:", err);
            alert("Error exporting data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavBarTwo />

            <div className="p-8 max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6">Export ACRIMS Report</h1>

                {/* Start Date */}
                <label className="block text-sm font-semibold mb-2">
                    Start Date
                </label>
                <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    className="border p-2 w-full rounded mb-6"
                />

                {/* End Date */}
                <label className="block text-sm font-semibold mb-2">
                    End Date
                </label>
                <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    className="border p-2 w-full rounded mb-6"
                    minDate={startDate}   // prevent invalid dates
                />

                {/* Filters */}
                <div className="mb-6">
                    <h1 className="font-semibold mb-2">Filter by:</h1>

                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="filterType"
                                value="present"
                                checked={filterType === "present"}
                                onChange={() => setFilterType("present")}
                            />
                            Present
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="filterType"
                                value="late"
                                checked={filterType === "late"}
                                onChange={() => setFilterType("late")}
                            />
                            Late
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="filterType"
                                value="absent"
                                checked={filterType === "absent"}
                                onChange={() => setFilterType("absent")}
                            />
                            Absent
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="filterType"
                                value="changed"
                                checked={filterType === "changed"}
                                onChange={() => setFilterType("changed")}
                            />
                            Changed Rooms
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="filterType"
                                value="none"
                                checked={filterType === "none"}
                                onChange={() => setFilterType("none")}
                            />
                            None
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="bg-green-600 text-white py-2 px-4 rounded w-full hover:bg-green-700"
                >
                    {loading ? "Exporting..." : "Export CSV"}
                </button>
            </div>
        </>
    );
};

export default ExportsPage;
