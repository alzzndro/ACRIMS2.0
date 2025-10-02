import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import {
    Download, Filter, Calendar, FileText, TrendingUp, TrendingDown,
    Clock, MapPin, User, AlertTriangle, CheckCircle, XCircle,
    BarChart3, PieChart as PieChartIcon, Activity, Search
} from 'lucide-react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import useGetMe from '../../hooks/useGetMe';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';

const NEON = '#00B4FF';
const LIME = '#A8FF4A';
const RED = '#ff4d6d';
const GREEN = '#00ff7a';
const YELLOW = '#fbbf24';

function truthyPresence(v) {
    return ["1", 1, true, "true"].includes(v) || v === 1;
}

function lastNDates(n) {
    const arr = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
}

export default function ReportsPage() {
    const [forms, setForms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30');
    const [reportType, setReportType] = useState('overview');
    const [selectedRoom, setSelectedRoom] = useState('all');
    // const { user } = useGetMe();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) navigate("/logout");

            const { forms: formsList, users: usersList, errors } = await adminService.getAdminData();

            setForms(formsList);
            setUsers(usersList);

            // Show warnings if there were errors but we have fallback data
            if (errors.forms || errors.users) {
                console.warn('Some data could not be fetched:', errors);
                setError('Some data may be outdated. Using cached/demo data.');
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Could not fetch data - using demo data');

            // Use service demo data as final fallback
            setForms(adminService.getDemoForms());
            setUsers(adminService.getDemoUsers());
        } finally {
            setLoading(false);
        }
    }

    // Filter data based on date range
    const filteredForms = forms.filter(form => {
        const formDate = new Date(form.date_monitored);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
        return formDate >= cutoffDate;
    }).filter(form => {
        if (selectedRoom === 'all') return true;
        return form.room_number === selectedRoom;
    });

    // Calculate metrics
    const totalForms = filteredForms.length;
    const presentCount = filteredForms.filter(f => truthyPresence(f.instructor_presence)).length;
    const absentCount = totalForms - presentCount;
    const presentRate = totalForms ? Math.round((presentCount / totalForms) * 100) : 0;

    // Get unique rooms for filter
    const rooms = [...new Set(forms.map(f => f.room_number))].sort();

    // Daily trend data
    const dailyTrend = lastNDates(parseInt(dateRange)).map(date => {
        const dayForms = filteredForms.filter(f => f.date_monitored === date);
        const present = dayForms.filter(f => truthyPresence(f.instructor_presence)).length;
        const absent = dayForms.length - present;
        return {
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            present,
            absent,
            total: dayForms.length,
            presentRate: dayForms.length ? Math.round((present / dayForms.length) * 100) : 0
        };
    });

    // Room performance data
    const roomPerformance = rooms.map(room => {
        const roomForms = filteredForms.filter(f => f.room_number === room);
        const present = roomForms.filter(f => truthyPresence(f.instructor_presence)).length;
        const total = roomForms.length;
        return {
            room,
            total,
            present,
            absent: total - present,
            presentRate: total ? Math.round((present / total) * 100) : 0
        };
    }).sort((a, b) => b.total - a.total);

    // Time distribution
    const timeDistribution = filteredForms.reduce((acc, form) => {
        if (form.time_monitored) {
            const hour = parseInt(form.time_monitored.split(':')[0]);
            const timeSlot = `${hour < 10 ? '0' : ''}${hour}:00`;
            if (!acc[timeSlot]) acc[timeSlot] = { time: timeSlot, count: 0, present: 0, absent: 0 };
            acc[timeSlot].count++;
            if (truthyPresence(form.instructor_presence)) {
                acc[timeSlot].present++;
            } else {
                acc[timeSlot].absent++;
            }
        }
        return acc;
    }, {});

    const timeData = Object.values(timeDistribution).sort((a, b) => a.time.localeCompare(b.time));

    // Checker performance
    const checkerPerformance = users.filter(u => u.user_role === 'checker').map(checker => {
        const checkerForms = filteredForms.filter(f => f.checker_id === checker.user_id);
        const present = checkerForms.filter(f => truthyPresence(f.instructor_presence)).length;
        return {
            name: `${checker.first_name} ${checker.last_name}`,
            total: checkerForms.length,
            present,
            absent: checkerForms.length - present,
            presentRate: checkerForms.length ? Math.round((present / checkerForms.length) * 100) : 0
        };
    }).sort((a, b) => b.total - a.total);

    // Export functions
    const exportToCSV = () => {
        const exportData = filteredForms.map(form => ({
            Date: form.date_monitored,
            Time: form.time_monitored,
            Room: form.room_number,
            Instructor: form.instructor_name,
            Present: truthyPresence(form.instructor_presence) ? 'Yes' : 'No',
            Remarks: form.remarks || '',
            'Checker ID': form.checker_id
        }));

        adminService.exportToCSV(exportData, 'acrims_report');
    };

    const exportToPDF = () => {
        // This would typically use a library like jsPDF
        alert('PDF export feature would be implemented with jsPDF library');
    };


    if (loading) {
        return <div>Loading!!!</div>
    }

    if (error) return <div>Error!!</div>

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-neon to-lime bg-clip-text text-black">
                        Reports & Analytics
                    </h1>
                    <p className="text-slate-400 mt-2">Comprehensive monitoring reports and data insights</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/5 transition-colors"
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                    >
                        <FileText size={20} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Date Range</label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-600"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Report Type</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-600"
                    >
                        <option value="overview">Overview</option>
                        <option value="detailed">Detailed</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Room Filter</label>
                    <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-600"
                    >
                        <option value="all">All Rooms</option>
                        {rooms.map(room => (
                            <option key={room} value={room}>Room {room}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={fetchData}
                        className="w-full px-4 py-2 rounded-xl glass hover:bg-white/5 transition-colors"
                    >
                        <Activity className="inline mr-2" size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Checks</p>
                            <p className="text-2xl font-bold">{totalForms}</p>
                            <p className="text-xs text-slate-400 mt-1">Last {dateRange} days</p>
                        </div>
                        <FileText className="text-neon" size={24} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Present Rate</p>
                            <p className="text-2xl font-bold text-green-400">{presentRate}%</p>
                            <p className="text-xs text-slate-400 mt-1">{presentCount} present</p>
                        </div>
                        <CheckCircle className="text-green-400" size={24} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Absent Count</p>
                            <p className="text-2xl font-bold text-red-400">{absentCount}</p>
                            <p className="text-xs text-slate-400 mt-1">{100 - presentRate}% absent</p>
                        </div>
                        <XCircle className="text-red-400" size={24} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Avg. Daily Checks</p>
                            <p className="text-2xl font-bold">{Math.round(totalForms / parseInt(dateRange))}</p>
                            <p className="text-xs text-slate-400 mt-1">Per day</p>
                        </div>
                        <BarChart3 className="text-lime" size={24} />
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Trend Chart */}
                <div className="col-span-12 lg:col-span-8 p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Attendance Trend</h3>
                            <p className="text-sm text-slate-400">Daily presence vs absence over time</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <span>Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <span>Absent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-neon"></div>
                                <span>Present Rate</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTrend}>
                                <defs>
                                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.6} />
                                        <stop offset="100%" stopColor={GREEN} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={RED} stopOpacity={0.6} />
                                        <stop offset="100%" stopColor={RED} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                                <Area type="monotone" dataKey="present" stackId="1" stroke={GREEN} fill="url(#presentGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="absent" stackId="1" stroke={RED} fill="url(#absentGradient)" strokeWidth={2} />
                                <Line type="monotone" dataKey="presentRate" stroke={NEON} strokeWidth={3} dot={{ r: 4, fill: NEON }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Room Distribution */}
                <div className="col-span-12 lg:col-span-4 p-6 rounded-2xl glass">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold">Room Distribution</h3>
                        <p className="text-sm text-slate-400">Monitoring activity by room</p>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roomPerformance.slice(0, 6)}
                                    dataKey="total"
                                    nameKey="room"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                >
                                    {roomPerformance.slice(0, 6).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={[NEON, LIME, GREEN, RED, YELLOW, '#8b5cf6'][index % 6]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {roomPerformance.slice(0, 6).map((room, index) => (
                            <div key={room.room} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: [NEON, LIME, GREEN, RED, YELLOW, '#8b5cf6'][index % 6] }}
                                    ></div>
                                    <span>Room {room.room}</span>
                                </div>
                                <span className="text-slate-400">{room.total} checks</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Time Distribution */}
            <div className="p-6 rounded-2xl glass mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Activity by Time of Day</h3>
                        <p className="text-sm text-slate-400">Monitoring activity distribution throughout the day</p>
                    </div>
                </div>
                <div style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="present" stackId="a" fill={GREEN} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="absent" stackId="a" fill={RED} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Performance Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Performance Table */}
                <div className="rounded-2xl glass overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold">Room Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Room</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Total</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Present</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {roomPerformance.map((room) => (
                                    <tr key={room.room} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-slate-400" />
                                                <span className="font-medium">Room {room.room}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{room.total}</td>
                                        <td className="p-4 text-green-400">{room.present}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-neon to-lime"
                                                        style={{ width: `${room.presentRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{room.presentRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Checker Performance Table */}
                <div className="rounded-2xl glass overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold">Checker Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Checker</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Checks</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Present</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {checkerPerformance.map((checker) => (
                                    <tr key={checker.name} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-slate-400" />
                                                <span className="font-medium">{checker.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{checker.total}</td>
                                        <td className="p-4 text-green-400">{checker.present}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-neon to-lime"
                                                        style={{ width: `${checker.presentRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{checker.presentRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
