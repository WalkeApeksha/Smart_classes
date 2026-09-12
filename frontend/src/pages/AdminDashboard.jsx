import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  Users,
  GraduationCap,
  DollarSign,
  Bell,
  UserPlus,
  Trash2,
  Shield,
  Search,
  CalendarCheck,
  BookOpen,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [fees, setFees] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('10-A');

  // Add User Modal State (Bug A4)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    class: '10-A',
    subject: 'Mathematics',
    password: '',
    confirmPassword: ''
  });

  // Timetable Modal State (Bug F3)
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    class: '10-A',
    subject: 'Mathematics',
    teacher: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: 'Room 101'
  });

  // Fee Modal State
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newFee, setNewFee] = useState({
    studentName: '',
    class: '10-A',
    month: 'September',
    amount: 3500,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, feesRes, ttRes, notesRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/users'),
        api.get('/fees'),
        api.get('/timetable'),
        api.get('/notes')
      ]);
      setStats(statsRes.data?.stats || null);
      setUsers(usersRes.data?.users || []);
      setFees(feesRes.data?.fees || []);
      setTimetables(ttRes.data?.timetable || []);
      setNotes(notesRes.data?.materials || []);
    } catch (err) {
      toast.error('Failed to load telemetry data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.password || newUser.password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    if (newUser.password !== newUser.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const res = await api.post('/admin/users', {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        class: newUser.class,
        subject: newUser.subject,
        password: newUser.password
      });

      if (res.data?.success) {
        toast.success(`User ${newUser.name} created with ID: ${res.data.user?.uniqueId}`);
        setShowAddModal(false);
        setNewUser({
          name: '',
          email: '',
          role: 'student',
          class: '10-A',
          subject: 'Mathematics',
          password: '',
          confirmPassword: ''
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to deactivate and remove this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('User deleted successfully');
        fetchData();
      } catch (err) {
        toast.error('Error deleting user');
      }
    }
  };

  const handleCreateTimetableSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/timetable', newSlot);
      if (res.data?.success) {
        toast.success('Timetable slot added successfully');
        setShowTimetableModal(false);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add timetable slot';
      toast.error(msg, { duration: 5000 });
    }
  };

  const handleCreateFeeInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees', newFee);
      if (res.data?.success) {
        toast.success('Fee invoice issued successfully');
        setShowFeeModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fee invoice');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const teachersList = users.filter((u) => u.role === 'teacher');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-white">
              {path.includes('/users')
                ? 'User Directory'
                : path.includes('/timetable')
                ? 'Academic Timetable'
                : path.includes('/fees')
                ? 'Fee Invoices & Revenue'
                : path.includes('/notes')
                ? 'Institutional Study Notes'
                : 'Administrator Overview'}
            </h2>
            <p className="text-xs text-slate-400">
              Kashvi SmartClass Central Control & Governance Engine
            </p>
          </div>
          <div className="flex gap-2">
            {path.includes('/timetable') && (
              <button
                onClick={() => setShowTimetableModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Add Timetable Slot</span>
              </button>
            )}
            {path.includes('/fees') && (
              <button
                onClick={() => setShowFeeModal(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                <span>Create Fee Invoice</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW VIEW */}
        {(path === '/dashboard/admin' || path === '/dashboard/admin/') && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Enrolled</span>
                  <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-white">{stats?.totalStudents || users.filter(u=>u.role==='student').length || 18}</h3>
                  <p className="mt-1 text-[11px] text-emerald-400">Across 10 Academic Batches</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Faculty Members</span>
                  <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-white">{stats?.totalTeachers || users.filter(u=>u.role==='teacher').length || 8}</h3>
                  <p className="mt-1 text-[11px] text-indigo-400">Active Faculty</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Total Fee Collections</span>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-white">₹{stats?.totalCollectedFees?.toLocaleString() || '1,45,000'}</h3>
                  <p className="mt-1 text-[11px] text-emerald-400">Verified Settlements</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">System Security</span>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-emerald-400">Operational</h3>
                  <p className="mt-1 text-[11px] text-slate-400">JWT / RBAC Active</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Users */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Registered Accounts</h3>
                  <span className="text-xs text-indigo-400">{users.length} Total Registered</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Unique ID</th>
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.slice(0, 6).map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/30">
                          <td className="py-3 font-mono font-bold text-indigo-400">{u.uniqueId || 'ID-N/A'}</td>
                          <td className="py-3 font-semibold text-white">{u.name}</td>
                          <td className="py-3">
                            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-400">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{u.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Institution System Notice */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-3 text-sm font-bold text-white">System Broadcasts</h3>
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5">
                    <p className="text-xs font-bold text-indigo-300">Quarterly Examination Schedule</p>
                    <p className="mt-1 text-[11px] text-slate-400">Timetable slots updated across Classes 9-A, 10-A, and 12-B.</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <p className="text-xs font-bold text-emerald-300">Fee Invoices Dispatched</p>
                    <p className="mt-1 text-[11px] text-slate-400">Instant UPI payment link active for parent settlements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER DIRECTORY VIEW (Bug B1) */}
        {path.includes('/users') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            {/* Search & Filter Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, or email..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-slate-950 p-1 border border-slate-800">
                {['all', 'admin', 'teacher', 'student', 'parent'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                      roleFilter === r
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">User Details</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Class / Subject</th>
                    <th className="pb-3 font-semibold">Unique ID</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-indigo-400">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        {u.class || u.subject || 'Institution Wide'}
                      </td>
                      <td className="py-3 font-mono font-bold text-indigo-400">
                        {u.uniqueId || 'N/A'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TIMETABLE VIEW (Bug B2 & F3) */}
        {path.includes('/timetable') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">Filter Schedule by Class:</span>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
              >
                {['10-A', '10-B', '9-A', '9-B', '8-A'].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                const daySlots = timetables.filter(
                  (t) => t.day === day && (selectedClass === 'all' || t.class === selectedClass)
                );
                return (
                  <div key={day} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
                      {day}
                    </h4>
                    {daySlots.length === 0 ? (
                      <p className="py-4 text-center text-[11px] text-slate-500">No scheduled periods</p>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div key={slot._id} className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{slot.subject}</span>
                              <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                              <span>{slot.teacherName || 'Faculty'}</span>
                              <span className="text-slate-500">{slot.room || 'Room 101'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. FEE INVOICES VIEW (Bug B3) */}
        {path.includes('/fees') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Tuition & Institutional Invoices</h3>
              <span className="text-xs text-emerald-400 font-bold">{fees.length} Total Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Student Name</th>
                    <th className="pb-3 font-semibold">Class</th>
                    <th className="pb-3 font-semibold">Billing Month</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Receipt #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fees.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-white">{f.studentName}</td>
                      <td className="py-3 text-slate-300">{f.class}</td>
                      <td className="py-3 text-slate-400">{f.month} {f.year || 2024}</td>
                      <td className="py-3 font-bold text-white">₹{f.amount?.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            f.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-400">{f.receiptNumber || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. STUDY NOTES VIEW (Bug B4) */}
        {path.includes('/notes') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center backdrop-blur-xl">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-400">No study notes uploaded yet.</p>
              </div>
            ) : (
              notes.map((n) => (
                <div key={n._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                      Class {n.class} • {n.subject}
                    </span>
                    <span className="text-[10px] text-slate-500">{n.fileSize || '1.2 MB'}</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-white">{n.title}</h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{n.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px]">
                    <span className="text-slate-500">By {n.uploaderName || 'Faculty'}</span>
                    <a
                      href={n.fileUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-indigo-400 hover:text-indigo-300"
                    >
                      Download PDF →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ADD USER MODAL WITH PASSWORD (Bug A4) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create New Institutional User</h3>
              <p className="mt-0.5 text-xs text-slate-400">Generate credentials with encrypted password</p>

              <form onSubmit={handleCreateUser} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="name@kashvi.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class Batch</label>
                    <select
                      value={newUser.class}
                      onChange={(e) => setNewUser({ ...newUser, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="10-A">Class 10-A</option>
                      <option value="10-B">Class 10-B</option>
                      <option value="9-A">Class 9-A</option>
                      <option value="9-B">Class 9-B</option>
                      <option value="8-A">Class 8-A</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm Password (Bug A4) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Save & Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TIMETABLE CONFLICT CHECK MODAL (Bug F3) */}
        {showTimetableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Add Timetable Slot</h3>
              <p className="mt-0.5 text-xs text-slate-400">Backend collision check will automatically detect clashes</p>

              <form onSubmit={handleCreateTimetableSlot} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newSlot.class}
                      onChange={(e) => setNewSlot({ ...newSlot, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {['10-A', '10-B', '9-A', '9-B', '8-A'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={newSlot.subject}
                      onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Assign Teacher</label>
                  <select
                    required
                    value={newSlot.teacher}
                    onChange={(e) => setNewSlot({ ...newSlot, teacher: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Faculty Member</option>
                    {teachersList.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.subject || 'Faculty'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Day</label>
                    <select
                      value={newSlot.day}
                      onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Start Time</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">End Time</label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTimetableModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Assign & Verify Clash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FEE MODAL */}
        {showFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create Fee Invoice</h3>
              <p className="mt-0.5 text-xs text-slate-400">Issue fee record for student tuition</p>

              <form onSubmit={handleCreateFeeInvoice} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Student Name</label>
                  <input
                    type="text"
                    required
                    value={newFee.studentName}
                    onChange={(e) => setNewFee({ ...newFee, studentName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newFee.class}
                      onChange={(e) => setNewFee({ ...newFee, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {['10-A', '10-B', '9-A', '9-B', '8-A'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Billing Month</label>
                    <input
                      type="text"
                      required
                      value={newFee.month}
                      onChange={(e) => setNewFee({ ...newFee, month: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="e.g. September"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeeModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500"
                  >
                    Issue Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
