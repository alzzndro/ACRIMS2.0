import React, { useEffect, useState, useCallback } from 'react';
import {
    Calendar, Plus, Edit, Trash2, Search, Filter, Clock, MapPin,
    User, BookOpen, X, AlertTriangle, Mail, Upload, FileText,
    Download, FolderOpen, Trash
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';

const NEON = '#00B4FF';
const LIME = '#A8FF4A';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
    const hour = 7 + i; // 7 AM to 9 PM
    return `${hour.toString().padStart(2, '0')}:00:00`;
});

export default function ScheduleManagementPage() {
    const [schedules, setSchedules] = useState([]);
    const [jsonFiles, setJsonFiles] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dayFilter, setDayFilter] = useState('all');
    const [roomFilter, setRoomFilter] = useState('all');
    const [dataSource, setDataSource] = useState('all'); // 'all', 'mysql', 'json'

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Form states
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [deletingSchedule, setDeletingSchedule] = useState(null);
    const [newSchedule, setNewSchedule] = useState({
        room_id: '',
        room_name: '',
        day: 'Monday',
        start_time: '08:00:00',
        end_time: '09:30:00',
        subject: '',
        section: '',
        instructor: '',
        instructor_email: '',
        floor: 'first'
    });
    const [uploadFile, setUploadFile] = useState(null);

    //     const isDark = false; // Admin side is always light theme

    useEffect(() => {
        fetchData();
    }, []);

    const filterSchedules = useCallback(() => {
        let filtered = schedules;

        if (searchQuery) {
            filtered = filtered.filter(schedule =>
                schedule.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                schedule.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                schedule.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                schedule.room_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (dayFilter !== 'all') {
            filtered = filtered.filter(schedule => schedule.day === dayFilter);
        }

        if (roomFilter !== 'all') {
            filtered = filtered.filter(schedule => schedule.room_id === roomFilter);
        }

        if (dataSource !== 'all') {
            filtered = filtered.filter(schedule => schedule.source === dataSource);
        }

        setFilteredSchedules(filtered);
    }, [schedules, searchQuery, dayFilter, roomFilter, dataSource]);

    useEffect(() => {
        filterSchedules();
    }, [filterSchedules]);

    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
            // Fetch both MySQL and JSON schedules
            const [mysqlData, jsonData] = await Promise.all([
                adminService.getAllSchedules().catch(() => ({ schedules: [] })),
                adminService.getScheduleFiles().catch(() => ({ files: [] }))
            ]);

            // Process MySQL schedules
            const mysqlSchedules = (mysqlData.schedules || []).map(schedule => ({
                ...schedule,
                source: 'mysql'
            }));

            // Process JSON schedules
            const jsonSchedules = (jsonData.files || []).flatMap(file =>
                (file.schedules || []).map(schedule => ({
                    ...schedule,
                    source: 'json',
                    source_file: file.filename
                }))
            );

            // Combine both sources
            const allSchedules = [...mysqlSchedules, ...jsonSchedules];
            setSchedules(allSchedules);
            setJsonFiles(jsonData.files || []);
        } catch (err) {
            console.error('Failed to fetch schedule data:', err);
            setError('Could not fetch schedule data');
            setSchedules([]);
            setJsonFiles([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddSchedule() {
        if (!newSchedule.room_id || !newSchedule.subject || !newSchedule.instructor) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await adminService.createSchedule(newSchedule);
            setShowAddModal(false);
            setNewSchedule({
                room_id: '',
                room_name: '',
                day: 'Monday',
                start_time: '08:00:00',
                end_time: '09:30:00',
                subject: '',
                section: '',
                instructor: '',
                instructor_email: '',
                floor: 'first'
            });
            fetchData();
        } catch (err) {
            console.error('Error adding schedule:', err);
            alert('Error adding schedule: ' + (err.response?.data?.message || err.message));
        }
    }

    async function handleEditSchedule() {
        if (!editingSchedule.room_id || !editingSchedule.subject || !editingSchedule.instructor) {
            alert('Please fill in all required fields');
            return;
        }

        // Only MySQL schedules can be edited
        if (editingSchedule.source !== 'mysql') {
            alert('JSON schedules are read-only. To modify, please update the JSON file and re-upload.');
            setShowEditModal(false);
            setEditingSchedule(null);
            return;
        }

        try {
            await adminService.updateSchedule(editingSchedule.id, editingSchedule);
            setShowEditModal(false);
            setEditingSchedule(null);
            fetchData();
        } catch (err) {
            console.error('Error updating schedule:', err);
            alert('Error updating schedule: ' + (err.response?.data?.message || err.message));
        }
    }

    async function handleDeleteSchedule() {
        try {
            // Only MySQL schedules can be deleted
            if (deletingSchedule.source === 'mysql') {
                await adminService.deleteSchedule(deletingSchedule.id);
                setShowDeleteModal(false);
                setDeletingSchedule(null);
                fetchData();
            } else {
                alert('JSON schedules are read-only. To modify, please update the JSON file and re-upload.');
            }
        } catch (err) {
            console.error('Error deleting schedule:', err);
            alert('Error deleting schedule: ' + (err.response?.data?.message || err.message));
        }
    }

    // JSON File Management Functions

    async function handleDeleteJsonFile(filename) {
        if (!confirm(`Are you sure you want to delete ${filename}? This will delete all schedules in this file.`)) {
            return;
        }

        try {
            await adminService.deleteScheduleFile(filename);
            fetchData();
        } catch (err) {
            console.error('Error deleting JSON file:', err);
            alert('Error deleting JSON file: ' + (err.response?.data?.message || err.message));
        }
    }

    async function handleUploadJsonFile() {
        if (!uploadFile) {
            alert('Please select a file to upload');
            return;
        }

        try {
            await adminService.uploadScheduleFile(uploadFile);
            setShowUploadModal(false);
            setUploadFile(null);
            fetchData();
        } catch (err) {
            console.error('Error uploading JSON file:', err);
            alert('Error uploading JSON file: ' + (err.response?.data?.message || err.message));
        }
    }

    // Get unique rooms for filter
    const rooms = [...new Set(schedules.map(s => s.room_id))].sort();

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon to-lime bg-clip-text text-black">
                            Schedule Management
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Manage class schedules in the database. JSON files are read-only for schedule data.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                        >
                            <Upload size={20} />
                            Upload JSON
                        </button>
                        <button
                            onClick={() => setShowJsonModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-colors"
                        >
                            <FileText size={20} />
                            Manage Files
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                        >
                            <Plus size={20} />
                            Add Schedule
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search schedules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                        />
                    </div>

                    <select
                        value={dayFilter}
                        onChange={(e) => setDayFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                    >
                        <option value="all">All Days</option>
                        {DAYS.map(day => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>

                    <select
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                    >
                        <option value="all">All Rooms</option>
                        {rooms.map(room => (
                            <option key={room} value={room}>Room {room}</option>
                        ))}
                    </select>

                    <select
                        value={dataSource}
                        onChange={(e) => setDataSource(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                    >
                        <option value="all">All Sources</option>
                        <option value="mysql">MySQL Only</option>
                        <option value="json">JSON Only</option>
                    </select>

                    <button
                        onClick={fetchData}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar size={16} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Schedules</p>
                                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                            </div>
                            <Calendar className="text-neon" size={24} />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">JSON Files</p>
                                <p className="text-2xl font-bold text-gray-900">{jsonFiles.length}</p>
                            </div>
                            <FileText className="text-purple-400" size={24} />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unique Rooms</p>
                                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                            </div>
                            <MapPin className="text-yellow-400" size={24} />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Filtered Results</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredSchedules.length}</p>
                            </div>
                            <Filter className="text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                {/* JSON Files Management */}
                {jsonFiles.length > 0 && (
                    <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">JSON Schedule Files</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {jsonFiles.map((file) => (
                                    <div key={file.filename} className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{file.filename}</p>
                                                <p className="text-sm text-gray-600">
                                                    {file.schedules?.length || 0} schedules
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteJsonFile(file.filename)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedules Table */}
                <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Schedules ({filteredSchedules.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-neon border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading schedules...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Schedule</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Time</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Room</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Subject</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Instructor</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Source</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSchedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{schedule.day}</p>
                                                    <p className="text-sm text-gray-600">{schedule.section}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-700">
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-700">
                                                        {schedule.room_name || `Room ${schedule.room_id}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {schedule.subject}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-gray-400" />
                                                        <span className="text-sm text-gray-700">
                                                            {schedule.instructor}
                                                        </span>
                                                    </div>
                                                    {schedule.instructor_email && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Mail size={14} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {schedule.instructor_email}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.source === 'mysql'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {schedule.source === 'mysql' ? 'MySQL' : schedule.source_file}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {schedule.source === 'mysql' ? (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingSchedule({ ...schedule });
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                                title="Edit Schedule"
                                                            >
                                                                <Edit size={16} className="text-gray-500 hover:text-neon" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeletingSchedule(schedule);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                                title="Delete Schedule"
                                                            >
                                                                <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">
                                                            Read-only (JSON)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredSchedules.length === 0 && !loading && (
                                <div className="p-8 text-center">
                                    <Calendar className="mx-auto mb-2 text-gray-400" size={48} />
                                    <p className="text-gray-600">No schedules found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Schedule Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Add New Schedule</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Room ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSchedule.room_id}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, room_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                        placeholder="e.g., 101"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Room Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newSchedule.room_name}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, room_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                        placeholder="e.g., 101 Classroom"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Day *
                                    </label>
                                    <select
                                        value={newSchedule.day}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        {DAYS.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Floor
                                    </label>
                                    <select
                                        value={newSchedule.floor}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, floor: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        <option value="first">First Floor</option>
                                        <option value="second">Second Floor</option>
                                        <option value="third">Third Floor</option>
                                        <option value="fourth">Fourth Floor</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Start Time *
                                    </label>
                                    <select
                                        value={newSchedule.start_time}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        End Time *
                                    </label>
                                    <select
                                        value={newSchedule.end_time}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSchedule.subject}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, subject: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                        placeholder="e.g., Mathematics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Section
                                    </label>
                                    <input
                                        type="text"
                                        value={newSchedule.section}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, section: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                        placeholder="e.g., Grade 10-A"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Instructor *
                                    </label>
                                    <input
                                        type="text"
                                        value={newSchedule.instructor}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, instructor: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                        placeholder="e.g., Prof. Smith"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Instructor Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newSchedule.instructor_email}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, instructor_email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                        placeholder="e.g., smith@asiancollege.edu.ph"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSchedule}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Add Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Schedule Modal */}
                {showEditModal && editingSchedule && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Edit Schedule</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Room ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingSchedule.room_id}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, room_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Room Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editingSchedule.room_name}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, room_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Day *
                                    </label>
                                    <select
                                        value={editingSchedule.day}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, day: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        {DAYS.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Floor
                                    </label>
                                    <select
                                        value={editingSchedule.floor}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, floor: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        <option value="first">First Floor</option>
                                        <option value="second">Second Floor</option>
                                        <option value="third">Third Floor</option>
                                        <option value="fourth">Fourth Floor</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Start Time *
                                    </label>
                                    <select
                                        value={editingSchedule.start_time}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, start_time: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        End Time *
                                    </label>
                                    <select
                                        value={editingSchedule.end_time}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, end_time: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    >
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingSchedule.subject}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, subject: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Section
                                    </label>
                                    <input
                                        type="text"
                                        value={editingSchedule.section}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, section: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Instructor *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingSchedule.instructor}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, instructor: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                        Instructor Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingSchedule.instructor_email}
                                        onChange={(e) => setEditingSchedule({ ...editingSchedule, instructor_email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSchedule}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deletingSchedule && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-red-600">Delete Schedule</h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="text-red-400" size={24} />
                                <p className="text-gray-700">
                                    Are you sure you want to delete this schedule?
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-gray-100 mb-6">
                                <p className="font-medium text-gray-900">
                                    {deletingSchedule.subject} - {deletingSchedule.section}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {deletingSchedule.day} {deletingSchedule.start_time} - {deletingSchedule.end_time}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Room {deletingSchedule.room_id} • {deletingSchedule.instructor}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteSchedule}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-semibold text-white"
                                >
                                    Delete Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* JSON File Management Modal */}
                {showJsonModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Manage JSON Files</h3>
                                <button
                                    onClick={() => setShowJsonModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <h4 className="text-lg font-medium text-gray-900">JSON Schedule Files</h4>
                                {jsonFiles.length === 0 ? (
                                    <p className="text-gray-600">No JSON files found. Upload a JSON file to get started.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {jsonFiles.map(file => (
                                            <li key={file.filename} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                                                <div>
                                                    <span className="text-gray-900 font-medium">{file.filename}</span>
                                                    <p className="text-sm text-gray-600">
                                                        {file.schedules?.length || 0} schedules
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteJsonFile(file.filename)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash size={16} className="text-red-400" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload JSON Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Upload JSON File</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-600">Upload a JSON file containing schedule data. The file should contain an array of schedule objects.</p>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-neon/50 focus:outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                                />
                                <p className="text-xs text-gray-500">
                                    Only JSON files are allowed. Maximum size: 10MB
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadJsonFile}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Upload File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}