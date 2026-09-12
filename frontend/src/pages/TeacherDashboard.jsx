import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { CalendarCheck, FileText, Video, Plus, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, hwRes] = await Promise.all([
        api.get('/teacher/my-students'),
        api.get('/teacher/homework')
      ]);
      const stuList = stuRes.data?.students || [];
      setStudents(stuList);
      setHomeworkList(hwRes.data?.homework || []);

      // Default attendance to present for all
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
        subject: 'General'
      });

      if (res.data?.success) {
        toast.success(`Attendance submitted for Class ${selectedClass}!`);
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
        setNewHw({ title: '', description: '', subject: 'Mathematics', class: '10-A', dueDate: new Date().toISOString().split('T')[0] });
        fetchData();
      }
    } catch (err) {
      toast.error('Error creating homework');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Teacher Command Center</h2>
          <p className="text-xs text-slate-400">Classroom attendance rolls, curriculum homework, and student rosters</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Assigned Students</span>
              <CalendarCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{students.length}</p>
            <p className="mt-1 text-[11px] text-emerald-400">● Active Enrollment</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Homework Tasks</span>
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{homeworkList.length}</p>
            <p className="mt-1 text-[11px] text-purple-400">● Open for Submissions</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Class Roll</span>
              <Video className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{selectedClass}</p>
            <p className="mt-1 text-[11px] text-emerald-400">● Primary Section</p>
          </div>
        </div>

        {/* Attendance Marking Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">Daily Attendance Register</h3>
              <p className="text-xs text-slate-400">Mark Present, Absent, or Leave for class roll</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllPresent}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
              >
                Mark All Present ✅
              </button>
              <button
                onClick={handleSubmitAttendance}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                Save Attendance
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Roll No</th>
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Class</th>
                  <th className="pb-3 font-semibold text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {students.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-400">{s.rollNumber || (idx + 1).toString().padStart(2, '0')}</td>
                    <td className="py-3 font-medium text-white">{s.name}</td>
                    <td className="py-3 text-slate-400">{s.class || selectedClass}</td>
                    <td className="py-3 text-right">
                      <select
                        value={attendanceRecords[s._id] || 'present'}
                        onChange={(e) => handleAttendanceStatusChange(s._id, e.target.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize outline-none ${
                          attendanceRecords[s._id] === 'present'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : attendanceRecords[s._id] === 'absent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <option value="present" className="bg-slate-900 text-emerald-400">Present</option>
                        <option value="absent" className="bg-slate-900 text-rose-400">Absent</option>
                        <option value="leave" className="bg-slate-900 text-amber-400">Leave</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Homework Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Assigned Homework Tasks</h3>
              <p className="text-xs text-slate-400">Manage tasks and review student submissions</p>
            </div>
            <button
              onClick={() => setShowHwModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Create Homework</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeworkList.map((hw) => (
              <div key={hw._id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">{hw.subject}</span>
                  <span className="text-[11px] text-slate-400">Class {hw.class}</span>
                </div>
                <h4 className="mt-2.5 font-bold text-white text-sm">{hw.title}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{hw.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2.5">
                  <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  <span className="text-emerald-400 font-semibold">{hw.submissions?.length || 0} Submitted</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Homework Modal */}
        {showHwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="mb-4 text-base font-bold text-white">Create Homework Assignment</h3>
              <form onSubmit={handleCreateHomework} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Title</label>
                  <input
                    type="text"
                    required
                    value={newHw.title}
                    onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. Quadratic Equations Exercise 4.2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Instructions / Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newHw.description}
                    onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="Solve problems 1 to 15 on notebook and attach PDF."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={newHw.subject}
                      onChange={(e) => setNewHw({ ...newHw, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newHw.dueDate}
                      onChange={(e) => setNewHw({ ...newHw, dueDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHwModal(false)}
                    className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Assign Homework
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
