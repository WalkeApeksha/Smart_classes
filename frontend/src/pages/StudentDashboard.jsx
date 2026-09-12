import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  Sparkles,
  Trophy,
  CalendarCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Award,
  Video,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [stats, setStats] = useState(null);
  const [homework, setHomework] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Homework submission modal state (Bugs C1, C2, C3)
  const [selectedHw, setSelectedHw] = useState(null);
  const [solutionText, setSolutionText] = useState('');
  const [solutionFileUrl, setSolutionFileUrl] = useState('');
  const [submittingHw, setSubmittingHw] = useState(false);

  // AI Study Plan State (Bugs D1-D7)
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [targetExam, setTargetExam] = useState('Term Board Examination');
  const [studyHoursDaily, setStudyHoursDaily] = useState(3);
  const [weakSubjects, setWeakSubjects] = useState(['Mathematics', 'Science']);

  // Online Quiz State
  const [quizQuestions] = useState([
    { q: 'What is the value of x if 2x + 8 = 20?', options: ['A) 4', 'B) 6', 'C) 8', 'D) 10'], correct: 1 },
    { q: 'Which law of motion is known as Law of Inertia?', options: ['A) First Law', 'B) Second Law', 'C) Third Law', 'D) Universal Gravitation'], correct: 0 },
    { q: 'What is the chemical formula for Calcium Carbonate?', options: ['A) CaO', 'B) Ca(OH)2', 'C) CaCO3', 'D) CaCl2'], correct: 2 },
    { q: 'If sin(θ) = 1/2, what is the value of θ in standard acute degrees?', options: ['A) 45°', 'B) 30°', 'C) 60°', 'D) 90°'], correct: 1 },
    { q: 'Which organelle is the powerhouse of the cell?', options: ['A) Ribosome', 'B) Mitochondria', 'C) Golgi apparatus', 'D) Endoplasmic Reticulum'], correct: 1 }
  ]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, hwRes, lbRes, classRes, planRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/homework'),
        api.get('/student/leaderboard'),
        api.get('/online-classes'),
        api.get('/student/study-plan').catch(() => ({ data: { plan: null } }))
      ]);
      setStats(dashRes.data?.stats);
      setHomework(hwRes.data?.homework || []);
      setLeaderboard(lbRes.data?.leaderboard || []);
      setOnlineClasses(classRes.data?.onlineClasses || []);
      if (planRes.data?.plan) {
        setAiPlan(planRes.data.plan);
      }
    } catch (err) {
      toast.error('Failed to load student workspace');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateAIPlan = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/student/study-plan', {
        targetExam,
        studyHoursDaily: Number(studyHoursDaily),
        weakSubjects
      });
      if (res.data?.success) {
        setAiPlan(res.data.plan);
        toast.success('AI Study Plan generated & saved to your profile!', { icon: '✨' });
      }
    } catch (err) {
      toast.error('AI Study plan generation failed. Please try again.');
    }
    setAiLoading(false);
  };

  const handleOpenSubmitModal = (hw) => {
    setSelectedHw(hw);
    setSolutionText('');
    setSolutionFileUrl(`https://kashvi-uploads.edu/solutions/${hw._id}_solution.pdf`);
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!selectedHw) return;
    setSubmittingHw(true);
    try {
      const res = await api.post(`/student/homework/${selectedHw._id}/submit`, {
        fileUrl: solutionFileUrl,
        feedback: solutionText || 'Completed assignment submission'
      });
      if (res.data?.success) {
        toast.success('Solution submitted successfully!');
        setSelectedHw(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting homework');
    }
    setSubmittingHw(false);
  };

  const handleSelectOption = (optIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQIndex]: optIndex
    });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    quizQuestions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans !== undefined && ans === q.correct) {
        score += 1;
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = ((score / quizQuestions.length) * 100).toFixed(0);
    setQuizResult({ score, total: quizQuestions.length, percentage, correctCount, wrongCount });
    setQuizSubmitted(true);
    toast.success(`Assessment Completed! You scored ${score}/${quizQuestions.length}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-white">
              {path.includes('/attendance')
                ? 'Attendance Analytics'
                : path.includes('/homework')
                ? 'Homework & Submissions'
                : path.includes('/leaderboard')
                ? 'Academic Leaderboard'
                : path.includes('/ai-plan')
                ? 'AI Personalized Study Plan'
                : path.includes('/classes')
                ? 'Live Virtual Classes'
                : 'Student Learning Workspace'}
            </h2>
            <p className="text-xs text-slate-400">Class 10-A Academic Portal & AI Study Companion</p>
          </div>
        </div>

        {/* 1. OVERVIEW VIEW */}
        {(path === '/dashboard/student' || path === '/dashboard/student/') && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Attendance Rate</span>
                  <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-white">{stats?.attendancePercentage || '94.2'}%</h3>
                  <p className="mt-1 text-[11px] text-emerald-400">Excellent Standing (Target &gt; 85%)</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Pending Tasks</span>
                  <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-white">{homework.length}</h3>
                  <p className="mt-1 text-[11px] text-amber-400">Assignments Due This Week</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Batch Rank</span>
                  <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-white">#1 in Class 10-A</h3>
                  <p className="mt-1 text-[11px] text-emerald-400">Top 5% Academic Percentile</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">AI Study Engine</span>
                  <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-indigo-400">Active</h3>
                  <p className="mt-1 text-[11px] text-slate-400">Gemini-Powered Optimizer</p>
                </div>
              </div>
            </div>

            {/* Quick Practice Test Assessment Widget */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-6 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-indigo-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-600 p-2 text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Daily SmartClass Knowledge Booster</h3>
                    <p className="text-xs text-indigo-300">Physics & Mathematics Concept Retention</p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-mono font-bold text-indigo-300">
                  Question {currentQIndex + 1} of {quizQuestions.length}
                </span>
              </div>

              {!quizSubmitted ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-200">
                    {quizQuestions[currentQIndex].q}
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {quizQuestions[currentQIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`rounded-xl p-3 text-left text-xs font-medium transition-all ${
                          selectedAnswers[currentQIndex] === idx
                            ? 'border border-indigo-500 bg-indigo-600/30 text-white shadow-md shadow-indigo-500/20'
                            : 'border border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex(currentQIndex - 1)}
                      className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                    >
                      Previous
                    </button>

                    {currentQIndex < quizQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQIndex(currentQIndex + 1)}
                        className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500"
                      >
                        Submit Assessment
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-950/80 p-5 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Assessment Complete!</h4>
                  <p className="mt-1 text-sm text-slate-300">
                    You answered <span className="font-bold text-emerald-400">{quizResult?.score}</span> out of{' '}
                    <span className="font-bold text-white">{quizResult?.total}</span> questions correctly ({quizResult?.percentage}%).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                      setCurrentQIndex(0);
                    }}
                    className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20"
                  >
                    Retake Practice
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE ANALYTICS (Bug B8) */}
        {path.includes('/attendance') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly Attendance Summary</h3>
                <p className="text-xs text-slate-400">Class 10-A Session 2024-2025</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                94.2% Overall Presence
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-xs text-slate-400">Present Days</span>
                <h4 className="mt-1 text-2xl font-black text-emerald-400">38 Days</h4>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-xs text-slate-400">Absent Days</span>
                <h4 className="mt-1 text-2xl font-black text-rose-400">2 Days</h4>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-xs text-slate-400">Leave / Excused</span>
                <h4 className="mt-1 text-2xl font-black text-amber-400">1 Day</h4>
              </div>
            </div>
          </div>
        )}

        {/* 3. HOMEWORK & SUBMISSIONS (Bugs B8, C1, C2, C3, C4) */}
        {path.includes('/homework') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homework.map((hw) => {
              const mySub = hw.submissions?.find((s) => s.studentId);
              return (
                <div key={hw._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                        {hw.subject}
                      </span>
                      <span className="text-[10px] text-rose-400 font-semibold">
                        Due {new Date(hw.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-white">{hw.title}</h4>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-3">{hw.description}</p>
                  </div>

                  <div className="mt-5 border-t border-slate-800 pt-3">
                    {mySub ? (
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Submitted
                        </span>
                        <button
                          onClick={() => handleOpenSubmitModal(hw)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          Update File
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmitModal(hw)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Submit Solution</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. LEADERBOARD (Bugs B9, F2) */}
        {path.includes('/leaderboard') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Class 10-A Academic Leaderboard</h3>
                <p className="text-xs text-slate-400">Calculated from weighted test scores and attendance consistency</p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                Live Rankings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Rank</th>
                    <th className="pb-3 font-semibold">Student Name</th>
                    <th className="pb-3 font-semibold">Average Score</th>
                    <th className="pb-3 font-semibold">Attendance</th>
                    <th className="pb-3 text-right font-semibold">Performance Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((student, idx) => (
                    <tr key={student._id || idx} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                            idx === 0
                              ? 'bg-amber-500/20 text-amber-400 font-black'
                              : idx === 1
                              ? 'bg-slate-300/20 text-slate-300'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white">{student.name}</td>
                      <td className="py-3 font-semibold text-emerald-400">{student.averageScore || 92.5}%</td>
                      <td className="py-3 text-slate-300">{student.attendanceRate || 96}%</td>
                      <td className="py-3 text-right">
                        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                          {idx === 0 ? '🏆 Batch Topper' : idx < 3 ? '⭐ Honor Roll' : '🌟 Scholar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. AI STUDY PLAN GENERATOR (Bugs B10, D1-D7) */}
        {path.includes('/ai-plan') && (
          <div className="space-y-6">
            {/* Input Controls Panel */}
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Personalized AI Academic Planner</h3>
                  <p className="text-xs text-slate-400">
                    Engineered with adaptive syllabus modeling & Gemini AI optimization
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Target Examination</label>
                  <input
                    type="text"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="e.g. CBSE 10th Board Pre-Finals"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Daily Study Hours: {studyHoursDaily} hrs</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={studyHoursDaily}
                    onChange={(e) => setStudyHoursDaily(e.target.value)}
                    className="mt-3 w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateAIPlan}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{aiLoading ? 'Generating with Gemini AI...' : 'Generate / Refresh AI Plan'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Plan Render */}
            {aiPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-900/60 p-4 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-white">Active Plan: {aiPlan.targetGoal || targetExam}</span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400">{aiPlan.provider || 'SmartAI Engine'}</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {aiPlan.weeklySchedule?.map((slot, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-indigo-400">{slot.day}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            slot.priority === 'High' || slot.priority === 'Urgent'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}
                        >
                          {slot.priority}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-white">{slot.subject}</h4>
                      <p className="mt-1 text-xs text-slate-400">{slot.topic}</p>
                      <div className="mt-3 border-t border-slate-800 pt-2 text-[11px] text-slate-500">
                        Duration: {slot.duration}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {aiPlan.recommendations && aiPlan.recommendations.length > 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                      Academic Tutor Recommendations
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiPlan.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-400">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center backdrop-blur-xl">
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-400">Click &quot;Generate AI Plan&quot; above to create your structured study timetable.</p>
              </div>
            )}
          </div>
        )}

        {/* 6. ONLINE CLASSES (Bugs B11, G1-G2) */}
        {path.includes('/classes') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onlineClasses.map((c) => (
              <div key={c._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                    {c.subject}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {c.duration} mins
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">{c.title}</h4>
                <p className="mt-1 text-xs text-slate-400">{c.description || 'Live virtual lecture.'}</p>
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
                    Join Session →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT HOMEWORK MODAL (Bugs C1, C2) */}
        {selectedHw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Submit Homework Solution</h3>
              <p className="mt-0.5 text-xs text-slate-400">{selectedHw.title} ({selectedHw.subject})</p>

              <form onSubmit={handleSubmitSolution} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">File Attachment URL / Link</label>
                  <input
                    type="url"
                    required
                    value={solutionFileUrl}
                    onChange={(e) => setSolutionFileUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="https://cloud.kashvi.edu/uploads/my_solution.pdf"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Student Comments / Notes</label>
                  <textarea
                    rows={3}
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="Completed all derivations and problem sets on pages 4-8..."
                  />
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedHw(null)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingHw}
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {submittingHw ? 'Submitting...' : 'Upload & Submit'}
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

export default StudentDashboard;
