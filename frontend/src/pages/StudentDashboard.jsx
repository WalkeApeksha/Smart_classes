import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Sparkles, Trophy, CalendarCheck, FileText, Upload, CheckCircle2, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [homework, setHomework] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // AI Study Plan State
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, hwRes, lbRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/homework'),
        api.get('/student/leaderboard')
      ]);
      setStats(dashRes.data?.stats);
      setHomework(hwRes.data?.homework || []);
      setLeaderboard(lbRes.data?.leaderboard || []);
    } catch (err) {
      toast.error('Failed to load student dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

    const percentage = Number(((score / quizQuestions.length) * 100).toFixed(1));
    const resultObj = {
      score,
      totalQuestions: quizQuestions.length,
      correctCount,
      wrongCount,
      percentage,
      isPassed: score >= 3
    };

    setQuizResult(resultObj);
    setQuizSubmitted(true);
    toast.success(`Quiz Completed! Score: ${score}/${quizQuestions.length} (${percentage}%)`);
  };

  const handleGenerateAIPlan = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/study-plan', {
        targetExam: 'Term-1 Board Prep',
        studyHoursDaily: 3,
        weakSubjects: ['Mathematics', 'Physics']
      });
      if (res.data?.plan) {
        setAiPlan(res.data.plan);
        toast.success('Personalized AI study plan generated!');
      } else if (res.data?.fallbackPlan) {
        setAiPlan(res.data.fallbackPlan);
        toast(res.data.message || 'Heuristic plan generated', { icon: '🤖' });
      }
    } catch (err) {
      toast.error('Could not generate AI study plan');
    }
    setAiLoading(false);
  };

  const handleHomeworkSubmit = async (hwId) => {
    try {
      const res = await api.post(`/student/homework/${hwId}/submit`, {
        fileUrl: 'https://sampledocs.kashvi.edu/submission.pdf'
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchData();
      }
    } catch (err) {
      toast.error('Error submitting homework');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Student Academic Hub</h2>
          <p className="text-xs text-slate-400">Class 10-A • Personal learning roadmap, attendance, and online quizzes</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Attendance Log</span>
              <CalendarCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{stats?.attendancePercentage || 94.5}%</p>
            <p className="mt-1 text-[11px] text-emerald-400">● {stats?.totalAttendanceDays || 22} Days Present</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Pending Homework</span>
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">{homework.length}</p>
            <p className="mt-1 text-[11px] text-indigo-400">● Due This Week</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Academic Standing</span>
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-3 text-2xl font-black text-white">Top 5%</p>
            <p className="mt-1 text-[11px] text-amber-400">● Gold Honor Roll</p>
          </div>
        </div>

        {/* Dynamic Quiz Runner Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">🧪 Interactive Online Assessment</h3>
              <p className="text-xs text-slate-400">Auto-graded quiz with instant dynamic score evaluation</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 font-mono text-xs text-indigo-400">
              <Clock className="h-3.5 w-3.5" />
              <span>29:45</span>
            </div>
          </div>

          {!quizSubmitted ? (
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-400">Question {currentQIndex + 1} of {quizQuestions.length}</span>
                <span>Mathematics / Science Core</span>
              </div>
              <p className="text-sm font-bold text-white">{quizQuestions[currentQIndex].q}</p>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
                {quizQuestions[currentQIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(currentQIndex - 1)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-30"
                >
                  Previous
                </button>
                {currentQIndex < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(currentQIndex + 1)}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    Submit Test & Evaluate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-400" />
              <h4 className="text-lg font-bold text-white">Assessment Evaluated Successfully!</h4>
              <p className="mt-1 text-xs text-slate-300">
                Score: <strong className="text-emerald-400 text-base">{quizResult.score} / {quizResult.totalQuestions}</strong> ({quizResult.percentage}%)
              </p>
              <div className="mt-4 flex justify-center gap-4 text-xs">
                <span className="rounded-md bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-300">
                  ✅ {quizResult.correctCount} Correct
                </span>
                <span className="rounded-md bg-rose-500/20 px-3 py-1 font-semibold text-rose-300">
                  ❌ {quizResult.wrongCount} Incorrect
                </span>
              </div>
              <button
                onClick={() => { setQuizSubmitted(false); setSelectedAnswers({}); setCurrentQIndex(0); }}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                Retake Assessment
              </button>
            </div>
          )}
        </div>

        {/* AI Study Plan Generator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">🤖 Adaptive AI Study Plan</h3>
              <p className="text-xs text-slate-400">Generate a personalized 7-day high-yield study schedule</p>
            </div>
            <button
              onClick={handleGenerateAIPlan}
              disabled={aiLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:opacity-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{aiLoading ? 'Generating Roadmap...' : 'Generate AI Plan'}</span>
            </button>
          </div>

          {aiPlan && (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">7-Day Study Matrix:</h4>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {aiPlan.weeklySchedule?.map((dayPlan, i) => (
                  <div key={i} className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-white">{dayPlan.day}</span>
                      <span className="text-indigo-400">{dayPlan.duration}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-200">{dayPlan.subject}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{dayPlan.topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Leaderboard & Active Homework */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Dynamic Leaderboard */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-base font-bold text-white">🏆 Class 10-A Leaderboard</h3>
            <div className="space-y-2.5">
              {leaderboard.slice(0, 5).map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      idx === 1 ? 'bg-slate-300/20 text-slate-200' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'text-slate-500'
                    }`}>
                      {item.rank || idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400">Class {item.class}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">{item.points} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Homework Submissions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-base font-bold text-white">📝 Active Homework Tasks</h3>
            <div className="space-y-3">
              {homework.map((hw) => (
                <div key={hw._id} className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{hw.title}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold">{hw.subject}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{hw.description}</p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleHomeworkSubmit(hw._id)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-indigo-500"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Submit Solution</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
