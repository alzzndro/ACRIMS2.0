import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import {
    Bell, Search, Home, FileText, Users, BarChart2, Settings,
    TrendingUp, Activity, Clock, AlertTriangle, CheckCircle, XCircle
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

export default function OverviewPage() {
    const [forms, setForms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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

    // Calculate metrics
    const totalForms = forms.length;
    const totalUsers = users.length;
    const checkers = users.filter(u => u.user_role === 'checker').length;
    const admins = users.filter(u => u.user_role === 'admin').length;
    const presentCount = forms.filter(f => truthyPresence(f.instructor_presence)).length;
    const absentCount = totalForms - presentCount;
    const presentRate = totalForms ? Math.round((presentCount / totalForms) * 100) : 0;

    // Today's activity
    const today = new Date().toISOString().slice(0, 10);
    const todayForms = forms.filter(f => f.date_monitored === today);
    const todayPresent = todayForms.filter(f => truthyPresence(f.instructor_presence)).length;
    const todayAbsent = todayForms.length - todayPresent;

    // Last 30 days trend
    const last30 = lastNDates(30);
    const trendData = last30.map(date => {
        const dayForms = forms.filter(f => f.date_monitored === date);
        const present = dayForms.filter(f => truthyPresence(f.instructor_presence)).length;
        const absent = dayForms.length - present;
        return {
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            present,
            absent,
            total: dayForms.length
        };
    });

    // Room utilization
    const roomCounts = forms.reduce((acc, f) => {
        const room = f.room_number || 'Unknown';
        acc[room] = (acc[room] || 0) + 1;
        return acc;
    }, {});

    const topRooms = Object.entries(roomCounts)
        .map(([room, count]) => ({ room, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Activity by hour
    const hourlyActivity = forms.reduce((acc, f) => {
        if (f.time_monitored) {
            const hour = parseInt(f.time_monitored.split(':')[0]);
            acc[hour] = (acc[hour] || 0) + 1;
        }
        return acc;
    }, {});

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i < 10 ? `0${i}:00` : `${i}:00`,
        count: hourlyActivity[i] || 0
    }));

    if (loading) {
        return <div>Loading!!!</div>
    }

    if (error) return <div>Error!!</div>

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon to-lime bg-clip-text text-black">
                            System Overview
                        </h1>
                        <p className="text-slate-400 mt-2">Comprehensive monitoring dashboard and analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded-xl glass hover:bg-white/5 transition-colors">
                            Export Report
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon to-lime text-black font-semibold">
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Forms</p>
                            <p className="text-2xl font-bold text-black">{totalForms}</p>
                            <p className="text-xs text-green-400 mt-1">↑ All time</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon/20 to-lime/10 flex items-center justify-center">
                            <FileText className="text-neon" size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Active Users</p>
                            <p className="text-2xl font-bold text-black">{totalUsers}</p>
                            <p className="text-xs text-slate-400 mt-1">{checkers} checkers, {admins} admins</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon/20 to-lime/10 flex items-center justify-center">
                            <Users className="text-lime" size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Present Rate</p>
                            <p className="text-2xl font-bold text-black">{presentRate}%</p>
                            <p className="text-xs text-green-400 mt-1">{presentCount} present, {absentCount} absent</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green/20 to-lime/10 flex items-center justify-center">
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Today's Activity</p>
                            <p className="text-2xl font-bold text-black">{todayForms.length}</p>
                            <p className="text-xs text-slate-400 mt-1">{todayPresent} present, {todayAbsent} absent</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon/20 to-lime/10 flex items-center justify-center">
                            <Activity className="text-neon" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Trend Chart */}
                <div className="col-span-12 lg:col-span-8 p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">30-Day Monitoring Trend</h3>
                            <p className="text-sm text-slate-400">Daily presence vs absence tracking</p>
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
                        </div>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
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
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Room Usage */}
                <div className="col-span-12 lg:col-span-4 p-6 rounded-2xl glass">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold">Top Monitored Rooms</h3>
                        <p className="text-sm text-slate-400">Most active monitoring locations</p>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRooms} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="room" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={60} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="count" fill={NEON} radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Activity Heatmap */}
            <div className="p-6 rounded-2xl glass mb-8">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold">Daily Activity Pattern</h3>
                    <p className="text-sm text-slate-400">Monitoring activity by hour of day</p>
                </div>
                <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="hour"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                interval={1}
                            />
                            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill={LIME}
                                radius={[4, 4, 0, 0]}
                                opacity={0.8}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">System Health</h3>
                        <CheckCircle className="text-green-400" size={24} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Database</span>
                            <span className="text-green-400 text-sm">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">API Status</span>
                            <span className="text-green-400 text-sm">Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Last Sync</span>
                            <span className="text-slate-300 text-sm">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Quick Stats</h3>
                        <TrendingUp className="text-neon" size={24} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Avg. Daily Forms</span>
                            <span className="text-black text-sm">{Math.round(totalForms / 30)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Peak Hour</span>
                            <span className="text-black text-sm">
                                {hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: '08:00', count: 0 }).hour}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Most Active Room</span>
                            <span className="text-black text-sm">{topRooms[0]?.room || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Alerts</h3>
                        <AlertTriangle className="text-yellow-400" size={24} />
                    </div>
                    <div className="space-y-3">
                        {absentCount > 0 && (
                            <div className="flex items-start gap-3">
                                <XCircle className="text-red-400 mt-0.5" size={16} />
                                <div>
                                    <p className="text-sm text-black">{absentCount} Absences Today</p>
                                    <p className="text-xs text-slate-500">Requires attention</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <CheckCircle className="text-green-400 mt-0.5" size={16} />
                            <div>
                                <p className="text-sm text-black">System Operational</p>
                                <p className="text-xs text-slate-500">All services running</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
