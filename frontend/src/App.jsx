import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="font-semibold text-slate-300">Loading Kashvi SmartClass...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/timetable" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/fees" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/notes" element={<AdminDashboard />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/attendance" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/homework" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/classes" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/notes" element={<TeacherDashboard />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/student/attendance" element={<StudentDashboard />} />
          <Route path="/dashboard/student/homework" element={<StudentDashboard />} />
          <Route path="/dashboard/student/leaderboard" element={<StudentDashboard />} />
          <Route path="/dashboard/student/ai-plan" element={<StudentDashboard />} />
          <Route path="/dashboard/student/classes" element={<StudentDashboard />} />
        </Route>

        {/* Protected Parent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} />}>
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/attendance" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/fees" element={<ParentDashboard />} />
          <Route path="/dashboard/parent/reports" element={<ParentDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
