import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Bell, Search, Home, FileText, Users, BarChart2, Settings } from 'lucide-react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import useGetMe from '../../hooks/useGetMe';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';

const NEON = '#00B4FF';
const LIME = '#A8FF4A';

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

export default function DashboardPage() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    // const { user } = useGetMe();

    const navigate = useNavigate();

    useEffect(() => {
        fetchForms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchForms() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) navigate("/logout");

            const formsList = await adminService.getForms();
            setForms(formsList);
        } catch (err) {
            console.error('Failed to fetch forms:', err);
            setError('Could not fetch forms — using demo data.');
            setForms(adminService.getDemoForms());
        } finally {
            setLoading(false);
        }
    }

    // Derived analytics
    const total = forms.length;
    const presentCount = forms.filter(f => truthyPresence(f.instructor_presence)).length;
    const presentPct = total ? Math.round((presentCount / total) * 100) : 0;

    // Top rooms
    const roomCounts = forms.reduce((acc, f) => {
        const rn = f.room_number || '—';
        acc[rn] = (acc[rn] || 0) + 1;
        return acc;
    }, {});
    const topRooms = Object.entries(roomCounts).map(([room, checks]) => ({ room, checks })).sort((a, b) => b.checks - a.checks).slice(0, 6);

    // Last 7 days visitors
    const last7 = lastNDates(7);
    const visitors = last7.map(date => {
        const count = forms.filter(f => f.date_monitored === date).length;
        const d = new Date(date);
        const short = d.toLocaleDateString(undefined, { weekday: 'short' });
        return { name: short, uv: count };
    });

    // Presence distribution
    const distribution = [
        { name: 'Present', value: presentCount },
        { name: 'Absent', value: total - presentCount }
    ];

    const filtered = forms.filter(f =>
        (f.room_number || '').toLowerCase().includes(query.toLowerCase()) ||
        (f.instructor_name || '').toLowerCase().includes(query.toLowerCase())
    );

    if (error) {
        return <h1>Error..</h1>
    }

    return (
        <AdminLayout>
            <div>
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon to-lime bg-clip-text text-black">
                                Main Dashboard
                            </h1>
                            <p className="text-slate-400 mt-2">Real-time monitoring and form management</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search room or instructor..."
                                    className="py-2 pl-10 pr-4 rounded-xl bg-transparent border border-white/10 focus:border-neon/50 focus:outline-none w-64"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* GRID TILES */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Left column */}
                    <section className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Profile / stats */}
                        <div className="p-5 rounded-2xl glass">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl" style={{ background: `linear-gradient(135deg, ${NEON}, ${LIME})` }}></div>
                                <div>
                                    <div className="text-lg font-semibold">Monitoring Team</div>
                                    <div className="text-xs text-slate-400">Campus checks & reporting</div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-2xl font-bold">{total}</div>
                                    <div className="text-xs text-slate-400">Forms</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{presentPct}%</div>
                                    <div className="text-xs text-slate-400">Present</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{Object.values(roomCounts).reduce((a, b) => a + b, 0)}</div>
                                    <div className="text-xs text-slate-400">Checks</div>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button className="py-2 px-4 rounded-md bg-gradient-to-r from-neon to-lime text-black font-semibold">Scan</button>
                            </div>
                        </div>

                        {/* Recent activity */}
                        <div className="p-4 rounded-2xl glass">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold">Recent Activity</div>
                                <div className="text-xs text-slate-400">Today</div>
                            </div>

                            <div className="space-y-3">
                                {loading && <div className="text-sm text-slate-400">Loading…</div>}
                                {forms.slice(-6).reverse().map(f => (
                                    <div key={f.form_id} className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center glass">{f.room_number}</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{f.instructor_name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-400">{f.remarks || '—'} · {f.time_monitored || ''}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-md ${truthyPresence(f.instructor_presence) ? 'bg-[#00ff7a20] text-black' : 'bg-[#ff4d6d20] text-pink-300'}`}>
                                            {truthyPresence(f.instructor_presence) ? 'Present' : 'Absent'}
                                        </div>
                                    </div>
                                ))}
                                {!forms.length && !loading && <div className="text-slate-400 text-sm">No activity yet.</div>}
                            </div>
                        </div>
                    </section>

                    {/* Right column */}
                    <section className="col-span-12 lg:col-span-8 space-y-6">
                        {/* Analytics */}
                        <div className="p-5 rounded-2xl glass">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-lg font-semibold">Attendance — Last 7 days</div>
                                    <div className="text-xs text-slate-400">Room checks & presence</div>
                                </div>
                                <div className="text-sm text-slate-400">Export · Filter</div>
                            </div>

                            <div style={{ height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={visitors}>
                                        <defs>
                                            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={NEON} stopOpacity={0.6} />
                                                <stop offset="100%" stopColor={LIME} stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                                        <YAxis tick={{ fill: '#9CA3AF' }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="uv" stroke={NEON} fill="url(#g1)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 md:col-span-4 p-4 rounded-2xl glass">
                                <div className="text-sm font-semibold mb-3">Presence Distribution</div>
                                <div style={{ height: 160 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={distribution} dataKey="value" innerRadius={36} outerRadius={60} paddingAngle={3}>
                                                {distribution.map((entry, i) => <Cell key={i} fill={i === 0 ? NEON : LIME} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="mt-3 text-xs text-slate-400 flex justify-between">
                                        <div><span style={{ color: NEON }} className="font-semibold">●</span> Present</div>
                                        <div><span style={{ color: LIME }} className="font-semibold">●</span> Absent</div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-8 p-4 rounded-2xl glass">
                                <div className="text-sm font-semibold mb-3">Top Rooms by Checks</div>
                                <div style={{ height: 160 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topRooms} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="room" tick={{ fill: '#9CA3AF' }} />
                                            <Tooltip />
                                            <Bar dataKey="checks" barSize={12} radius={[6, 6, 6, 6]} fill={NEON} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="p-4 rounded-2xl glass">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold">Recent Forms</div>
                                <div className="text-xs text-slate-400">{filtered.length} items</div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-400">
                                        <tr>
                                            <th className="pb-3">ID</th>
                                            <th className="pb-3">Date</th>
                                            <th className="pb-3">Time</th>
                                            <th className="pb-3">Room</th>
                                            <th className="pb-3">Instructor</th>
                                            <th className="pb-3">Presence</th>
                                            <th className="pb-3">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/6">
                                        {filtered.reverse().map(f => (
                                            <tr key={f.form_id} className="hover:bg-white/2 transition-colors">
                                                <td className="py-3">{f.form_id}</td>
                                                <td className="py-3">{f.date_monitored}</td>
                                                <td className="py-3">{f.time_monitored}</td>
                                                <td className="py-3">{f.room_number}</td>
                                                <td className="py-3">{f.instructor_name}</td>
                                                <td className="py-3">{truthyPresence(f.instructor_presence) ? 'Present' : 'Absent'}</td>
                                                <td className="py-3">{f.remarks || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!filtered.length && <div className="text-slate-400 text-sm py-3">No items found.</div>}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}

