import axios from 'axios';

// Create a singleton service for admin data management
class AdminService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.pendingRequests = new Map();
    }

    // Get API base URL
    getBaseURL() {
        return import.meta.env.VITE_API_URL || 'http://localhost:3000';
    }

    // Get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Cache management
    getCacheKey(url, params = {}) {
        return `${url}_${JSON.stringify(params)}`;
    }

    isValidCache(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (!cached) return false;
        return (Date.now() - cached.timestamp) < this.cacheTimeout;
    }

    setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    getCache(cacheKey) {
        const cached = this.cache.get(cacheKey);
        return cached ? cached.data : null;
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // Generic API call with caching and deduplication
    async apiCall(endpoint, options = {}) {
        const { useCache = true, params = {}, method = 'GET', data = null } = options;
        const url = `${this.getBaseURL()}${endpoint}`;
        const cacheKey = this.getCacheKey(url, params);

        // Check cache for GET requests
        if (method === 'GET' && useCache && this.isValidCache(cacheKey)) {
            return this.getCache(cacheKey);
        }

        // Check for pending requests to avoid duplicates
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Make the request
        const requestPromise = axios({
            method,
            url,
            headers: this.getAuthHeaders(),
            params: method === 'GET' ? params : undefined,
            data: method !== 'GET' ? data : undefined,
            timeout: 10000 // 10 second timeout
        }).then(response => {
            // Cache successful GET requests
            if (method === 'GET' && useCache) {
                this.setCache(cacheKey, response.data);
            }

            // Clear related cache on mutations
            if (method !== 'GET') {
                this.clearCache(endpoint.split('/')[1]); // Clear cache for the resource type
            }

            return response.data;
        }).catch(error => {
            console.error(`API Error (${method} ${endpoint}):`, error);
            throw error;
        }).finally(() => {
            this.pendingRequests.delete(cacheKey);
        });

        // Store pending request
        this.pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }

    // Forms API
    async getForms(useCache = true) {
        try {
            const data = await this.apiCall('/form', { useCache });
            // Handle different response formats
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.forms)) return data.forms;
            return Array.isArray(data) ? data : (data ? [data] : []);
        } catch (err) {
            console.warn('Failed to fetch forms, using demo data:', err.message);
            return this.getDemoForms();
        }
    }

    async getFormById(id) {
        return this.apiCall(`/form/${id}`);
    }

    async addForm(formData) {
        return this.apiCall('/form/add', {
            method: 'POST',
            data: formData
        });
    }

    async updateForm(id, formData) {
        return this.apiCall(`/form/${id}`, {
            method: 'PUT',
            data: formData
        });
    }

    async deleteForm(id) {
        return this.apiCall(`/form/delete/${id}`, {
            method: 'DELETE'
        });
    }

    // Users API
    async getUsers(useCache = true) {
        try {
            const data = await this.apiCall('/user', { useCache });
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.warn('Failed to fetch users, using demo data:', err.message);
            return this.getDemoUsers();
        }
    }

    async getUserById(id) {
        return this.apiCall(`/user/${id}`);
    }

    async getCurrentUser() {
        return this.apiCall('/user/me', { useCache: true });
    }

    async addUser(userData) {
        return this.apiCall('/user/register', {
            method: 'POST',
            data: userData
        });
    }

    async updateUser(userData) {
        return this.apiCall('/user/edit/details', {
            method: 'PUT',
            data: userData
        });
    }

    async deleteUser(id) {
        return this.apiCall(`/user/${id}`, {
            method: 'DELETE'
        });
    }

    async updateUserPassword(id, password) {
        return this.apiCall(`/user/edit/password/${id}`, {
            method: 'PUT',
            data: { password }
        });
    }

    // Batch operations for better performance
    async getAdminData(useCache = true) {
        try {
            // Use Promise.all but with error handling for each request
            const [formsResult, usersResult] = await Promise.allSettled([
                this.getForms(useCache),
                this.getUsers(useCache)
            ]);

            return {
                forms: formsResult.status === 'fulfilled' ? formsResult.value : this.getDemoForms(),
                users: usersResult.status === 'fulfilled' ? usersResult.value : this.getDemoUsers(),
                errors: {
                    forms: formsResult.status === 'rejected' ? formsResult.reason : null,
                    users: usersResult.status === 'rejected' ? usersResult.reason : null
                }
            };
        } catch (error) {
            console.error('Error fetching admin data:', error);
            return {
                forms: this.getDemoForms(),
                users: this.getDemoUsers(),
                errors: { general: error }
            };
        }
    }

    // Demo data fallbacks
    getDemoForms() {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        return [
            { form_id: 1, date_monitored: today, time_monitored: '08:15:00', room_number: '101', instructor_name: 'Prof. Cruz', instructor_presence: 1, remarks: 'On time', checker_id: 1 },
            { form_id: 2, date_monitored: today, time_monitored: '08:40:00', room_number: '201', instructor_name: 'Ms. Reyes', instructor_presence: 0, remarks: 'Absent', checker_id: 2 },
            { form_id: 3, date_monitored: yesterday, time_monitored: '09:00:00', room_number: '101', instructor_name: 'Dr. Smith', instructor_presence: 1, remarks: 'Present', checker_id: 1 },
            { form_id: 4, date_monitored: yesterday, time_monitored: '10:30:00', room_number: '301', instructor_name: 'Prof. Johnson', instructor_presence: 0, remarks: 'Late', checker_id: 3 }
        ];
    }

    getDemoUsers() {
        return [
            { user_id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', user_role: 'checker', created_at: '2024-01-15' },
            { user_id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', user_role: 'admin', created_at: '2024-01-10' },
            { user_id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', user_role: 'checker', created_at: '2024-02-01' },
            { user_id: 4, first_name: 'Sarah', last_name: 'Wilson', email: 'sarah@example.com', user_role: 'checker', created_at: '2024-01-20' }
        ];
    }

    // Utility methods
    refreshData() {
        this.clearCache();
        return this.getAdminData(false);
    }

    // Schedule Management API (MySQL-based)
    async getAllSchedules(useCache = true) {
        try {
            const data = await this.apiCall('/schedules', { useCache });
            return data;
        } catch (error) {
            console.warn('Failed to fetch schedules:', error.message);
            return { schedules: [], totalSchedules: 0 };
        }
    }

    async getCurrentSchedules(useCache = true) {
        try {
            const data = await this.apiCall('/schedules/current', { useCache });
            return data;
        } catch (error) {
            console.warn('Failed to fetch current schedules:', error.message);
            return { schedules: [] };
        }
    }

    async getScheduleStats(useCache = true) {
        try {
            const data = await this.apiCall('/schedules/stats', { useCache });
            return data;
        } catch (error) {
            console.warn('Failed to fetch schedule stats:', error.message);
            return { stats: {} };
        }
    }

    async getScheduleById(id) {
        try {
            const data = await this.apiCall(`/schedules/${id}`);
            return data;
        } catch (error) {
            console.warn('Failed to fetch schedule:', error.message);
            throw error;
        }
    }

    async createSchedule(scheduleData) {
        return this.apiCall('/schedules', {
            method: 'POST',
            data: scheduleData
        });
    }

    async updateSchedule(id, scheduleData) {
        return this.apiCall(`/schedules/${id}`, {
            method: 'PUT',
            data: scheduleData
        });
    }

    async deleteSchedule(id) {
        return this.apiCall(`/schedules/${id}`, {
            method: 'DELETE'
        });
    }

    // Legacy JSON schedule methods (kept for backward compatibility)
    async getScheduleFiles(useCache = true) {
        try {
            const data = await this.apiCall('/schedules/json', { useCache });
            return data;
        } catch (error) {
            console.warn('Failed to fetch schedule files:', error.message);
            return { files: [] };
        }
    }

    async createScheduleFile(filename) {
        return this.apiCall('/schedules/files', {
            method: 'POST',
            data: { filename }
        });
    }

    async deleteScheduleFile(filename) {
        return this.apiCall(`/schedules/files/${filename}`, {
            method: 'DELETE'
        });
    }

    async uploadScheduleFile(file) {
        const formData = new FormData();
        formData.append('scheduleFile', file);

        return this.apiCall('/schedules/upload', {
            method: 'POST',
            data: formData
        });
    }

    // Export data
    exportToCSV(data, filename) {
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
    }
}

// Create and export singleton instance
const adminService = new AdminService();
export default adminService;
