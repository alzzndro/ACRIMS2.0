import axios from "axios";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ExportsPage = () => {
    const [startDate, setStartDate] = useState(null);
    const [loading, setLoading] = useState(false);

    const toUpperName = (name) => name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";
    const truthyPresence = (val) => val === 1 || val === true;

    const to12Hour = (time) => {
        if (!time) return "";
        const date = new Date(`1970-01-01T${time}`);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const exportToCSV = (data, filename) => {
        if (!data || !data.length) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        if (!startDate) {
            alert("Please select a start date.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("No auth token found.");
            return;
        }

        try {
            setLoading(true);

            const endDate = new Date(); // today

            // Fetch all forms
            const formsRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/form/checker`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const forms = Array.isArray(formsRes.data) ? formsRes.data : [formsRes.data];

            // Fetch all users
            const usersRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/user`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const users = usersRes.data ?? [];

            // Frontend filter by date
            const filteredForms = forms.filter(form => {
                const formDate = new Date(form.date_monitored);
                return formDate >= startDate && formDate <= endDate;
            });

            if (!filteredForms.length) {
                alert("No records match your selected date range.");
                return;
            }

            // Join forms with checker names
            const joinedData = filteredForms.map(form => {
                const user = users.find(u => u.user_id === form.checker_id);
                return {
                    ...form,
                    checker_name: user
                        ? `${toUpperName(user.first_name)} ${toUpperName(user.last_name)}`
                        : ""
                };
            });

            // Prepare export format
            const exportData = joinedData.map(form => ({
                Date: form.date_monitored,
                Time: to12Hour(form.time_monitored),
                Room: form.room_number,
                Instructor: form.instructor_name,
                Schedule_Time: form.schedule_time,
                Present: truthyPresence(form.instructor_presence) ? "Yes" : "No",
                Late: truthyPresence(form.is_late) ? "Yes" : "No",
                Remarks: form.remarks || "",
                "Checker Name": form.checker_name
            }));

            exportToCSV(exportData, "acrims_report");

        } catch (err) {
            console.log("Export error:", err);
            alert("Error exporting data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Export ACRIMS Report</h1>

            <label className="block text-sm font-semibold mb-2">Start Date</label>
            <DatePicker
                selected={startDate}
                onChange={setStartDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                className="border p-2 w-full rounded mb-6"
            />

            <button
                onClick={handleExport}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded w-full hover:bg-green-700"
            >
                {loading ? "Exporting..." : "Export CSV"}
            </button>
        </div>
    );
};

export default ExportsPage;
