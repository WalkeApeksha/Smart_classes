import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  TrendingUp,
  FileText,
  BookOpen,
  Trophy,
  Video,
  Sparkles,
  DollarSign,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || 'student';

  const roleNavItems = {
    admin: [
      { label: 'Admin Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'User Directory', path: '/dashboard/admin/users', icon: Users },
      { label: 'Timetable', path: '/dashboard/admin/timetable', icon: CalendarCheck },
      { label: 'Fee Invoices', path: '/dashboard/admin/fees', icon: DollarSign },
      { label: 'Study Notes', path: '/dashboard/admin/notes', icon: BookOpen }
    ],
    teacher: [
      { label: 'Teacher Dashboard', path: '/dashboard/teacher', icon: LayoutDashboard },
      { label: 'Take Attendance', path: '/dashboard/teacher/attendance', icon: CalendarCheck },
      { label: 'Homework Hub', path: '/dashboard/teacher/homework', icon: FileText },
      { label: 'Live Classes', path: '/dashboard/teacher/classes', icon: Video },
      { label: 'Study Materials', path: '/dashboard/teacher/notes', icon: BookOpen }
    ],
    student: [
      { label: 'Student Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
      { label: 'My Attendance', path: '/dashboard/student/attendance', icon: CalendarCheck },
      { label: 'Homework', path: '/dashboard/student/homework', icon: FileText },
      { label: 'Leaderboard', path: '/dashboard/student/leaderboard', icon: Trophy },
      { label: 'AI Study Plan', path: '/dashboard/student/ai-plan', icon: Sparkles },
      { label: 'Online Classes', path: '/dashboard/student/classes', icon: Video }
    ],
    parent: [
      { label: 'Parent Dashboard', path: '/dashboard/parent', icon: LayoutDashboard },
      { label: 'Child Attendance', path: '/dashboard/parent/attendance', icon: CalendarCheck },
      { label: 'Fee Receipts', path: '/dashboard/parent/fees', icon: DollarSign },
      { label: 'Report Cards', path: '/dashboard/parent/reports', icon: FileText }
    ]
  };

  const currentNav = roleNavItems[role] || roleNavItems.student;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold shadow-lg shadow-indigo-500/30">
            K
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Kashvi SmartClass</h1>
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">{role} Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-800/50 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 font-bold text-xs text-indigo-400">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-200">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="font-bold text-white">Kashvi SmartClass</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Institutional Session Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700/60">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-medium text-slate-300">
                {user?.uniqueId || user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
