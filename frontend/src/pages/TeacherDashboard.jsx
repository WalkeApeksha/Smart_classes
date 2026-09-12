import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  CalendarCheck,
  FileText,
  Video,
  Plus,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TeacherDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [students, setStudents] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Homework modal
  const [showHwModal, setShowHwModal] = useState(false);
  const [newHw, setNewHw] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    class: '10-A',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Online class modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClass, setNewClass] = useState({
    title: 'Trigonometry Deep Dive & Numerical Problem Solving',
    subject: 'Mathematics',
    class: '10-A',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 45,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    description: 'Class 10 Board exam question sets discussion'
  });

  // Study note modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    class: '10-A',
    fileUrl: 'https://sampledocs.kashvi.edu/notes_algebra.pdf',
    fileName: 'Quadratic_Equations_Formulas.pdf'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, hwRes, classRes, noteRes] = await Promise.all([
        api.get('/teacher/my-students'),
        api.get('/teacher/homework'),
        api.get('/online-classes'),
        api.get('/notes')
      ]);
      const stuList = stuRes.data?.students || [];
      setStudents(stuList);
      setHomeworkList(hwRes.data?.homework || []);
      setOnlineClasses(classRes.data?.onlineClasses || []);
      setStudyMaterials(noteRes.data?.materials || []);

      // Default attendance records
      const initialAttendance = {};
      stuList.forEach((s) => {
        initialAttendance[s._id] = 'present';
      });
      setAttendanceRecords(initialAttendance);
    } catch (err) {
      toast.error('Failed to load teacher workspace');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = 'present';
    });
    setAttendanceRecords(updated);
    toast.success('Marked all students as Present');
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        studentName: s.name,
        status: attendanceRecords[s._id] || 'present'
      }));

      const res = await api.post('/teacher/attendance/mark', {
        class: selectedClass,
        date: attendanceDate,
        records,
        subject: 'Mathematics'
      });

      if (res.data?.success) {
        toast.success(`Attendance marked successfully for ${records.length} students!`);
      }
    } catch (err) {
      toast.error('Failed to submit attendance');
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teacher/homework', newHw);
      if (res.data?.success) {
        toast.success('Homework assigned successfully!');
        setShowHwModal(false);
        setNewHw({
          title: '',
          description: '',
          subject: 'Mathematics',
          class: '10-A',
          dueDate: new Date().toISOString().split('T')[0]
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create homework');
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/online-classes', newClass);
      if (res.data?.success) {
        toast.success('Live class scheduled!');
        setShowClassModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule class');
    }
  };

  const handleUploadNote = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/notes', newNote);
      if (res.data?.success) {
        toast.success('Study material published successfully!');
        setShowNoteModal(false);
        setNewNote({
          title: '',
          description: '',
          subject: 'Mathematics',
          class: '10-A',
          fileUrl: 'https://sampledocs.kashvi.edu/notes_algebra.pdf',
          fileName: 'Revision_Notes.pdf'
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload study note');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-white">
              {path.includes('/attendance')
                ? 'Daily Attendance Register'
                : path.includes('/homework')
                ? 'Homework Hub & Submissions'
                : path.includes('/classes')
                ? 'Live Virtual Classrooms'
                : path.includes('/notes')
                ? 'Curriculum Study Materials'
                : 'Faculty Dashboard'}
            </h2>
            <p className="text-xs text-slate-400">Classroom Management & Instruction Console</p>
          </div>

          <div className="flex gap-2">
            {path.includes('/homework') && (
              <button
                onClick={() => setShowHwModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Homework</span>
              </button>
            )}
            {path.includes('/classes') && (
              <button
                onClick={() => setShowClassModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Video className="h-4 w-4" />
                <span>Schedule Live Class</span>
              </button>
            )}
            {path.includes('/notes') && (
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Material</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. OVERVIEW (Default) */}
        {(path === '/dashboard/teacher' || path === '/dashboard/teacher/') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Assigned Students</span>
                  <Users className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{students.length || 24}</h3>
                <p className="mt-1 text-[11px] text-indigo-400">Classes: 10-A, 9-B, 8-A</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Active Homework</span>
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{homeworkList.length}</h3>
                <p className="mt-1 text-[11px] text-emerald-400">Open for Submissions</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Live Sessions</span>
                  <Video className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{onlineClasses.length}</h3>
                <p className="mt-1 text-[11px] text-indigo-400">Scheduled Sessions</p>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-bold text-white">Recent Homework Tasks</h3>
                <div className="space-y-3">
                  {homeworkList.slice(0, 4).map((h) => (
                    <div key={h._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{h.title}</p>
                        <p className="text-[11px] text-slate-400">Class {h.class} • Due {new Date(h.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                        {h.submissions?.length || 0} Submitted
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-bold text-white">Upcoming Live Classes</h3>
                <div className="space-y-3">
                  {onlineClasses.slice(0, 4).map((c) => (
                    <div key={c._id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{c.title}</p>
                        <p className="text-[11px] text-slate-400">Class {c.class} • {new Date(c.scheduledAt).toLocaleString()}</p>
                      </div>
                      <a
                        href={c.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        Launch
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE VIEW (Bug B5) */}
        {(path.includes('/attendance') || path === '/dashboard/teacher/attendance') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">Class Batch</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="mt-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {['10-A', '10-B', '9-A', '9-B', '8-A'].map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="mt-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                >
                  Save & Submit Register
                </button>
              </div>
            </div>

            {/* Students Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Student Name</th>
                    <th className="pb-3 font-semibold">Roll No. / ID</th>
                    <th className="pb-3 font-semibold">Class</th>
                    <th className="pb-3 text-right font-semibold">Status Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((s) => {
                    const status = attendanceRecords[s._id] || 'present';
                    return (
                      <tr key={s._id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-bold text-white">{s.name}</td>
                        <td className="py-3 font-mono text-slate-400">{s.uniqueId || s.rollNumber || 'STU-100'}</td>
                        <td className="py-3 text-slate-300">{s.class || selectedClass}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
                            {['present', 'absent', 'late'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleAttendanceStatusChange(s._id, st)}
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                                  status === st
                                    ? st === 'present'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'absent'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-amber-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. HOMEWORK HUB (Bug B5 & C5) */}
        {path.includes('/homework') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {homeworkList.map((h) => (
                <div key={h._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                        Class {h.class} • {h.subject}
                      </span>
                      <span className="text-[10px] text-rose-400 font-semibold">
                        Due {new Date(h.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-white">{h.title}</h4>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-3">{h.description}</p>
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">
                      {h.submissions?.length || 0} Submissions
                    </span>
                    <span className="text-[11px] text-slate-500">Active Task</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LIVE CLASSES (Bug B6 & G1-G2) */}
        {path.includes('/classes') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onlineClasses.map((c) => (
              <div key={c._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                    Class {c.class} • {c.subject}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {c.duration} mins
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">{c.title}</h4>
                <p className="mt-1 text-xs text-slate-400">{c.description || 'Live interactive session.'}</p>
                <div className="mt-4 border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.scheduledAt).toLocaleString()}
                  </span>
                  <a
                    href={c.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Start Class →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. STUDY MATERIALS (Bug B7 & F1) */}
        {path.includes('/notes') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studyMaterials.map((n) => (
              <div key={n._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                    Class {n.class} • {n.subject}
                  </span>
                  <span className="text-[10px] text-slate-500">{n.fileSize || '1.5 MB'}</span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">{n.title}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{n.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                  <span className="text-slate-500">By {n.uploaderName}</span>
                  <a
                    href={n.fileUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Open Document →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: CREATE HOMEWORK */}
        {showHwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Assign Homework</h3>
              <p className="mt-0.5 text-xs text-slate-400">Post assignments with instructions and deadline</p>

              <form onSubmit={handleCreateHomework} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Assignment Title</label>
                  <input
                    type="text"
                    required
                    value={newHw.title}
                    onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Chapter 4 Quadratic Equations Problem Set"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newHw.class}
                      onChange={(e) => setNewHw({ ...newHw, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {['10-A', '10-B', '9-A', '9-B', '8-A'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newHw.dueDate}
                      onChange={(e) => setNewHw({ ...newHw, dueDate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Instructions / Questions</label>
                  <textarea
                    rows={3}
                    required
                    value={newHw.description}
                    onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="Complete questions 1 to 12 from textbook page 84..."
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHwModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Publish Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SCHEDULE ONLINE CLASS */}
        {showClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Schedule Live Classroom</h3>
              <p className="mt-0.5 text-xs text-slate-400">Add meeting link for interactive lecture</p>

              <form onSubmit={handleScheduleClass} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Session Topic</label>
                  <input
                    type="text"
                    required
                    value={newClass.title}
                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newClass.class}
                      onChange={(e) => setNewClass({ ...newClass, class: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {['10-A', '10-B', '9-A', '9-B', '8-A'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newClass.scheduledAt}
                      onChange={(e) => setNewClass({ ...newClass, scheduledAt: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Google Meet / Zoom URL</label>
                  <input
                    type="url"
                    required
                    value={newClass.meetingUrl}
                    onChange={(e) => setNewClass({ ...newClass, meetingUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClassModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Schedule Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: UPLOAD STUDY NOTE */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Upload Study Material</h3>
              <p className="mt-0.5 text-xs text-slate-400">Share lecture notes and revision guides</p>

              <form onSubmit={handleUploadNote} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Document Title</label>
                  <input
                    type="text"
                    required
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Trigonometry Formula Cheat Sheet"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300">Class</label>
                    <select
                      value={newNote.class}
                      onChange={(e) => setNewNote({ ...newNote, class: e.target.value })}
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
                      value={newNote.subject}
                      onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    value={newNote.description}
                    onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="Comprehensive formula sheet and derivations..."
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                  >
                    Upload & Publish
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

export default TeacherDashboard;
