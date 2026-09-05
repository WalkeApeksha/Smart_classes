export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

export const DEMO_CREDENTIALS = [
  { role: 'admin', label: 'Admin Portal', email: 'admin@kashvi.com', pass: 'Admin@2024', desc: 'Full Master Access & School Control' },
  { role: 'teacher', label: 'Teacher Portal', email: 'teacher@kashvi.com', pass: 'Teacher@123', desc: 'Roll Marking, Tests & Homework' },
  { role: 'student', label: 'Student Portal', email: 'student@kashvi.com', pass: 'Student@123', desc: 'Assignments, Quizzes & AI Plans' },
  { role: 'parent', label: 'Parent Portal', email: 'parent@kashvi.com', pass: 'Parent@123', desc: 'Fees, Attendance & Progress' }
];

export const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'users', label: 'User Management', icon: 'Users', roles: ['admin'] },
  { id: 'attendance', label: 'Attendance Rolls', icon: 'UserCheck', roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'homework', label: 'Homework & Tasks', icon: 'FileText', roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'tests', label: 'Online Tests & Quizzes', icon: 'Award', roles: ['admin', 'teacher', 'student'] },
  { id: 'progress', label: 'Student Progress', icon: 'TrendingUp', roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'fees', label: 'Fee Management', icon: 'CreditCard', roles: ['admin', 'parent'] },
  { id: 'announcements', label: 'Announcements', icon: 'Bell', roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'timetable', label: 'Class Timetable', icon: 'Calendar', roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'live-classes', label: 'Live Virtual Class', icon: 'Video', roles: ['admin', 'teacher', 'student'] },
  { id: 'ai-plans', label: 'AI Study Plans', icon: 'Sparkles', roles: ['admin', 'student'] },
  { id: 'leaderboard', label: 'Class Leaderboard', icon: 'Trophy', roles: ['admin', 'teacher', 'student'] },
  { id: 'settings', label: 'System & Security', icon: 'Settings', roles: ['admin', 'teacher', 'student', 'parent'] }
];
