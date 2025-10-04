import React, { useEffect, useState } from 'react';
import {
    Users, Plus, Edit, Trash2, Search, Filter, MoreVertical,
    Mail, Shield, User, Calendar, Eye, EyeOff, Save, X
} from 'lucide-react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useGetMe from '../../hooks/useGetMe';
import AdminLayout from '../../components/admin/AdminLayout';
import adminService from '../../services/adminService';

const NEON = '#00B4FF';
const LIME = '#A8FF4A';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const { user: currentUser } = useGetMe();
    const navigate = useNavigate();

    const [newUser, setNewUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        user_role: 'checker'
    });

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, searchQuery, roleFilter]);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) navigate("/logout");

            const usersList = await adminService.getUsers();
            setUsers(usersList);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Could not fetch users - using demo data');
            setUsers(adminService.getDemoUsers());
        } finally {
            setLoading(false);
        }
    }

    function filterUsers() {
        let filtered = users;

        if (searchQuery) {
            filtered = filtered.filter(user =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.user_role === roleFilter);
        }

        setFilteredUsers(filtered);
    }

    async function handleAddUser() {
        if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            await adminService.addUser(newUser);
            setShowAddModal(false);
            setNewUser({ first_name: '', last_name: '', email: '', password: '', user_role: 'checker' });
            fetchUsers();
        } catch (err) {
            console.error('Error adding user:', err);
            alert('Error adding user: ' + (err.response?.data || err.message));
        }
    }

    async function handleEditUser() {
        if (!editingUser.first_name || !editingUser.last_name || !editingUser.email) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await adminService.updateUser({
                user_id: editingUser.user_id,
                first_name: editingUser.first_name,
                last_name: editingUser.last_name
            });

            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Error updating user: ' + (err.response?.data || err.message));
        }
    }

    async function handleDeleteUser() {
        try {
            await adminService.deleteUser(deletingUser.user_id);
            setShowDeleteModal(false);
            setDeletingUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Cannot Delete Own Account');
        }
    }

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-red-500/20 text-red-900 border-black/50',
            checker: 'bg-blue-500/20 text-blue-900 border-black/50'
        };
        return styles[role] || styles.checker;
    };

    if (error) {
        return <div><h1>Error</h1></div>
    }

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-neon to-lime bg-clip-text text-black">
                        User Management
                    </h1>
                    <p className="text-slate-400 mt-2">Manage system users and their permissions</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border border-white/10 focus:border-neon/50 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={20} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-white border border-white/10 focus:border-neon/50 focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="checker">Checkers</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Users</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                        <Users className="text-neon" size={24} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Admins</p>
                            <p className="text-2xl font-bold">{users.filter(u => u.user_role === 'admin').length}</p>
                        </div>
                        <Shield className="text-red-400" size={24} />
                    </div>
                </div>

                <div className="p-6 rounded-2xl glass">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Checkers</p>
                            <p className="text-2xl font-bold">{users.filter(u => u.user_role === 'checker').length}</p>
                        </div>
                        <User className="text-lime" size={24} />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl glass overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-neon border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-slate-400 mt-2">Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-white">User</th>
                                    <th className="text-left p-4 text-sm font-medium text-white">Email</th>
                                    <th className="text-left p-4 text-sm font-medium text-white">Role</th>
                                    <th className="text-left p-4 text-sm font-medium text-white">Joined</th>
                                    <th className="text-left p-4 text-sm font-medium text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-white/2 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon/30 to-lime/20 flex items-center justify-center text-black font-bold">
                                                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)}
                                                        {' '}
                                                        {user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1)}
                                                    </p>
                                                    <p className="text-sm text-slate-400">ID: {user.user_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-slate-400" />
                                                <span className="text-sm">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.user_role)}`}>
                                                {user.user_role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span className="text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser({ ...user });
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                    disabled={user.user_id === currentUser?.id}
                                                >
                                                    <Edit size={16} className="text-slate-400 hover:text-neon" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeletingUser(user);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                    disabled={user.user_id === currentUser?.id}
                                                >
                                                    <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="p-8 text-center">
                                <Users className="mx-auto text-slate-400 mb-2" size={48} />
                                <p className="text-slate-400">No users found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Add New User</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={newUser.first_name}
                                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={newUser.last_name}
                                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                                <select
                                    value={newUser.user_role}
                                    onChange={(e) => setNewUser({ ...newUser, user_role: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                >
                                    <option value="checker">Checker</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Edit User</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">ID</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={editingUser.user_id}
                                        onChange={(e) => setEditingUser({ ...editingUser, user_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                    />
                                </div>
                                <b />
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.first_name}
                                        onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.last_name}
                                        onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-black focus:border-neon/50 focus:outline-none"
                                    disabled
                                />
                                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditUser}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-neon to-lime text-black font-semibold hover:opacity-90 transition-opacity"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-red-400">Delete User</h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-black mb-6">
                            Are you sure you want to delete <strong>{deletingUser.first_name} {deletingUser.last_name}</strong>?
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-black hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

