import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/common/LoginPage';
import HomePage from './pages/checker/HomePage';
import RoomsPage from './pages/checker/RoomsPage';
import MyListPage from './pages/checker/MyListPage';
import NotFoundPage from './pages/common/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import Logout from './pages/common/Logout';
import FormPage from './pages/checker/FormPage';
import PendingPage from './pages/checker/PendingPage';
import FormByIdPage from './pages/checker/FormByIdPage';
import { useEffect, useState } from 'react';
import localforage from 'localforage';
import axios from 'axios';
import FormUpdatePage from './pages/checker/FormUpdatePage';
import DashboardPage from './pages/admin/DashboardPage';
import ProfilePage from './pages/checker/ProfilePage';
import Dash from './pages/admin/Dash';
import OverviewPage from './pages/admin/OverviewPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import ScheduleManagementPage from './pages/admin/ScheduleManagementPage';
import SchedulePage from './pages/checker/SchedulePage';
import ScheduleTimetablePage from './pages/checker/ScheduleTimetablePage';
import RecentFormByIdPage from './pages/admin/RecentFormByIdPage';

function usePendingResend() {
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const tryResend = async () => {
      if (localStorage.getItem("resend_lock")) {
        return;
      }

      // ✅ acquire lock
      localStorage.setItem("resend_lock", "true");
      setIsResending(true);

      const keys = await localforage.keys();

      for (const key of keys) {
        if (key.startsWith("pending-")) {
          const form = await localforage.getItem(key);
          const token = localStorage.getItem("token");
          const payload = new FormData();

          Object.entries(form.formData).forEach(([k, v]) => {
            if (v !== null) payload.append(k, v);
          })

          try {
            await axios.post(`${import.meta.env.VITE_API_URL}/form/add`, payload, {
              headers: { Authorization: `Bearer ${token}` },
            })

            await localforage.removeItem(key);
            console.log(`✅ Resent form ${key} successfully`);
          } catch (error) {
            console.log(`❌ Failed to resend ${key}`, error.message);
          }
        }
      }

      // ✅ release lock
      setIsResending(false)
      localStorage.removeItem("resend_lock");
    };

    if (navigator.onLine) {
      tryResend();
    };

    const handleOnline = () => {
      tryResend();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isResending]);
}

// APP _____________________________________________________________________________________________

function App() {
  usePendingResend()

  return (
    <Router>
      <Routes>

        <Route
          path='/'
          element={
            <LoginPage />
          }
        />

        <Route
          path='/logout'
          element={
            <Logout />
          }
        />

        <Route
          path='/home'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/rooms'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <RoomsPage />
            </ProtectedRoute>
          } />

        <Route
          path='/mylist'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <MyListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/form/new'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <FormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/form/pending'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <PendingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/users/me'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/form/data/:id'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <FormUpdatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/form/schedule/:id'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <FormByIdPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/schedules'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/schedules/timetable/:id'
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <ScheduleTimetablePage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/dashboard'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/dashboard/:id'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RecentFormByIdPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/dash'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dash />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/overview'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OverviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/user-management'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/reports'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin/schedules'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ScheduleManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='*'
          element={
            <NotFoundPage />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
