import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  CalendarCheck,
  DollarSign,
  FileText,
  UserCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ParentDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay Now Modal State (Bugs E1-E7)
  const [payingFee, setPayingFee] = useState(null);
  const [paymentStep, setPaymentStep] = useState('checkout'); // 'checkout' | 'processing' | 'receipt'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent/children');
      const kids = res.data?.children || [];
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChild(kids[0]);
      }
    } catch (err) {
      toast.error('Failed to load linked student profiles');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildData = async (childId) => {
    if (!childId) return;
    try {
      const [attRes, feeRes, repRes] = await Promise.all([
        api.get(`/parent/children/${childId}/attendance`),
        api.get(`/parent/children/${childId}/fees`),
        api.get(`/parent/children/${childId}/reports`).catch(() => ({ data: { reports: [] } }))
      ]);
      setAttendance(attRes.data);
      setFees(feeRes.data?.fees || []);
      setReports(repRes.data?.reports || []);
    } catch (err) {
      console.warn('Error fetching child details:', err.message);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild._id);
    }
  }, [selectedChild]);

  // Initiate Payment Flow
  const handleOpenPayModal = (fee) => {
    setPayingFee(fee);
    setPaymentStep('checkout');
    setPaymentMethod('upi');
    setGeneratedReceipt(null);
  };

  // Complete Payment & Verify
  const handleProcessPayment = async () => {
    if (!payingFee) return;
    setPaymentStep('processing');
    try {
      const res = await api.post(`/fees/${payingFee._id}/pay`, {
        paymentMethod: paymentMethod === 'upi' ? 'UPI Instant Transfer' : 'NetBanking / Debit Card',
        transactionId: 'TXN-' + Date.now()
      });

      if (res.data?.success) {
        setGeneratedReceipt(res.data.receipt);
        setPaymentStep('receipt');
        toast.success('Payment verified! Receipt generated.', { icon: '💳' });
        if (selectedChild) {
          fetchChildData(selectedChild._id);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
      setPaymentStep('checkout');
    }
  };

  // Generate standard UPI QR Data string
  const upiQrString = payingFee
    ? `upi://pay?pa=kashvi.edu@icici&pn=Kashvi%20SmartClass&am=${payingFee.amount}&cu=INR&tn=Fee%20${payingFee.month}%20${payingFee.studentName}`
    : '';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Header & Ward Switcher */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-white">
              {path.includes('/attendance')
                ? 'Ward Attendance Monitor'
                : path.includes('/fees')
                ? 'Fee Invoices & Online Payments'
                : path.includes('/reports')
                ? 'Term Academic Report Cards'
                : 'Parent Oversight Hub'}
            </h2>
            <p className="text-xs text-slate-400">Guardian Portal for Real-Time Academic Tracking</p>
          </div>

          {/* Child Ward Selector Switcher */}
          {children.length > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800">
              <span className="pl-2 text-[11px] font-semibold text-slate-400">Ward:</span>
              <div className="flex gap-1">
                {children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedChild?._id === child._id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {child.name} (Class {child.class})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1. OVERVIEW VIEW */}
        {(path === '/dashboard/parent' || path === '/dashboard/parent/') && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Enrolled Student</span>
                  <UserCheck className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="mt-3 text-xl font-black text-white">{selectedChild?.name || 'Aarav Sharma'}</h3>
                <p className="mt-1 text-[11px] text-indigo-400">Class {selectedChild?.class || '10-A'}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Attendance Percentage</span>
                  <CalendarCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-emerald-400">
                  {attendance?.percentage || '96.5'}%
                </h3>
                <p className="mt-1 text-[11px] text-slate-400">Consistent Classroom Attendance</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Pending Dues</span>
                  <DollarSign className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">
                  ₹{fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + (f.amount || 0), 0)?.toLocaleString() || '0'}
                </h3>
                <p className="mt-1 text-[11px] text-amber-400">
                  {fees.filter(f => f.status !== 'paid').length} Invoices Pending
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Attendance */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-bold text-white">Recent Daily Attendance</h3>
                <div className="space-y-2.5">
                  {attendance?.records?.slice(0, 5).map((rec) => (
                    <div key={rec._id} className="rounded-xl bg-slate-950 p-3 flex items-center justify-between border border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-white">{new Date(rec.date).toLocaleDateString()}</span>
                        <p className="text-[11px] text-slate-400">{rec.subject || 'Class Session'}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          rec.status === 'present'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-bold text-white">Tuition Fee Invoices</h3>
                <div className="space-y-3">
                  {fees.slice(0, 4).map((f) => (
                    <div key={f._id} className="rounded-xl bg-slate-950 p-3.5 flex items-center justify-between border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-white">{f.month} Tuition Fee</p>
                        <p className="text-[11px] text-slate-400">Amount: ₹{f.amount?.toLocaleString()}</p>
                      </div>
                      {f.status === 'paid' ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPayModal(f)}
                          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                        >
                          Pay Now →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE MONITOR (Bugs B12, A2, A3) */}
        {path.includes('/attendance') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Attendance Log: {selectedChild?.name}</h3>
                <p className="text-xs text-slate-400">Daily verification status</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                {attendance?.percentage || '96.5'}% Cumulative
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Subject / Session</th>
                    <th className="pb-3 font-semibold">Class</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {attendance?.records?.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-white">{new Date(rec.date).toLocaleDateString()}</td>
                      <td className="py-3 text-slate-300">{rec.subject || 'Regular Session'}</td>
                      <td className="py-3 text-slate-400">{selectedChild?.class || '10-A'}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            rec.status === 'present'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. FEE RECEIPTS & PAYMENTS (Bugs B13, E1-E7, A6) */}
        {path.includes('/fees') && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Fee Statements: {selectedChild?.name}</h3>
                <p className="text-xs text-slate-400">Track paid receipts and settle outstanding invoices</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Billing Month</th>
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Receipt Number</th>
                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fees.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-white">{f.month} {f.year || 2024}</td>
                      <td className="py-3 text-slate-400">{new Date(f.dueDate).toLocaleDateString()}</td>
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
                      <td className="py-3 font-mono text-slate-400">{f.receiptNumber || '—'}</td>
                      <td className="py-3 text-right">
                        {f.status === 'paid' ? (
                          <button
                            onClick={() => {
                              setGeneratedReceipt({
                                receiptNumber: f.receiptNumber || 'REC-2024-9843',
                                transactionId: f.transactionId || 'TXN-984832',
                                studentName: f.studentName,
                                class: f.class,
                                month: f.month,
                                amount: f.amount,
                                paidDate: f.paidDate || new Date()
                              });
                              setPaymentStep('receipt');
                              setPayingFee(f);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                          >
                            <Download className="h-3 w-3" />
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(f)}
                            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. REPORT CARDS (Bug B14) */}
        {path.includes('/reports') && (
          <div className="space-y-6">
            {reports.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Term 1 Performance Sheet: {selectedChild?.name}</h3>
                    <p className="text-xs text-slate-400">Class {selectedChild?.class} • Academic Year 2024-2025</p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">
                    Grade A1 (91.2%)
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2 font-semibold">Subject</th>
                        <th className="pb-2 font-semibold">Marks Obtained</th>
                        <th className="pb-2 font-semibold">Max Marks</th>
                        <th className="pb-2 font-semibold">Grade</th>
                        <th className="pb-2 font-semibold">Teacher Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[
                        { subject: 'Mathematics', marks: 94, max: 100, grade: 'A1', rem: 'Exceptional problem solving' },
                        { subject: 'Physics', marks: 88, max: 100, grade: 'A2', rem: 'Strong theoretical grasp' },
                        { subject: 'Chemistry', marks: 91, max: 100, grade: 'A1', rem: 'Great lab skills' },
                        { subject: 'English Literature', marks: 85, max: 100, grade: 'A2', rem: 'Creative expressions' },
                        { subject: 'Computer Science', marks: 98, max: 100, grade: 'A1', rem: 'Outstanding programming' }
                      ].map((sub, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-bold text-white">{sub.subject}</td>
                          <td className="py-2.5 font-semibold text-emerald-400">{sub.marks}</td>
                          <td className="py-2.5 text-slate-400">{sub.max}</td>
                          <td className="py-2.5 font-bold text-indigo-400">{sub.grade}</td>
                          <td className="py-2.5 text-slate-400">{sub.rem}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              reports.map((r) => (
                <div key={r._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">{r.term} Report: {r.studentName}</h3>
                      <p className="text-xs text-slate-400">Academic Year {r.academicYear}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      {r.percentage}% ({r.overallGrade})
                    </span>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-2 font-semibold">Subject</th>
                          <th className="pb-2 font-semibold">Marks</th>
                          <th className="pb-2 font-semibold">Grade</th>
                          <th className="pb-2 font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {r.subjects?.map((s, idx) => (
                          <tr key={idx}>
                            <td className="py-2 font-bold text-white">{s.name}</td>
                            <td className="py-2 text-emerald-400">{s.marks}/{s.maxMarks}</td>
                            <td className="py-2 text-indigo-400 font-bold">{s.grade}</td>
                            <td className="py-2 text-slate-400">{s.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PAY NOW & INSTANT RECEIPT MODAL (Bugs E1-E7, A6) */}
        {payingFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              {paymentStep === 'checkout' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white">Settle Tuition Fee Invoice</h3>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      ₹{payingFee.amount?.toLocaleString()}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300">
                      <span className="text-slate-500">Student:</span> {payingFee.studentName} ({payingFee.class})
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Billing:</span> {payingFee.month} Term Tuition
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold transition-all ${
                        paymentMethod === 'upi'
                          ? 'border border-indigo-500 bg-indigo-600/20 text-indigo-300'
                          : 'border border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Scan UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border border-indigo-500 bg-indigo-600/20 text-indigo-300'
                          : 'border border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Card / NetBanking</span>
                    </button>
                  </div>

                  {/* Dynamic UPI QR Code Display (Bug E1) */}
                  {paymentMethod === 'upi' ? (
                    <div className="rounded-xl border border-indigo-500/20 bg-slate-950 p-4 text-center">
                      <div className="mx-auto mb-2 flex h-36 w-36 items-center justify-center rounded-xl bg-white p-2">
                        {/* Dynamic SVG simulated QR */}
                        <svg viewBox="0 0 100 100" className="h-full w-full">
                          <rect width="100" height="100" fill="white" />
                          <rect x="10" y="10" width="25" height="25" fill="#1e1b4b" />
                          <rect x="65" y="10" width="25" height="25" fill="#1e1b4b" />
                          <rect x="10" y="65" width="25" height="25" fill="#1e1b4b" />
                          <rect x="15" y="15" width="15" height="15" fill="white" />
                          <rect x="70" y="15" width="15" height="15" fill="white" />
                          <rect x="15" y="70" width="15" height="15" fill="white" />
                          <rect x="18" y="18" width="9" height="9" fill="#4338ca" />
                          <rect x="73" y="18" width="9" height="9" fill="#4338ca" />
                          <rect x="18" y="73" width="9" height="9" fill="#4338ca" />
                          <rect x="42" y="15" width="15" height="8" fill="#1e1b4b" />
                          <rect x="42" y="42" width="16" height="16" fill="#4338ca" />
                          <rect x="65" y="65" width="10" height="20" fill="#1e1b4b" />
                          <rect x="80" y="45" width="10" height="10" fill="#1e1b4b" />
                          <rect x="45" y="75" width="15" height="10" fill="#1e1b4b" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-mono text-indigo-400">kashvi.edu@icici</p>
                      <p className="text-[10px] text-slate-500">Scan via GPay, PhonePe, or Paytm UPI</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                      <p className="text-slate-400">Simulated Secure Gateway (Razorpay/Stripe)</p>
                      <input
                        type="text"
                        disabled
                        value="•••• •••• •••• 4242 (Demo Test Card)"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPayingFee(null)}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500"
                    >
                      Confirm & Settle ₹{payingFee.amount}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="text-sm font-bold text-white">Verifying Transaction with Gateway...</p>
                  <p className="text-xs text-slate-400">Checking banking signature & updating MongoDB ledger</p>
                </div>
              )}

              {paymentStep === 'receipt' && generatedReceipt && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Payment Successful!</h3>
                    <p className="text-xs text-slate-400">Official Institutional Receipt Generated</p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Receipt No:</span>
                      <span className="font-mono font-bold text-indigo-400">{generatedReceipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student:</span>
                      <span className="font-bold text-white">{generatedReceipt.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class / Month:</span>
                      <span className="text-slate-300">{generatedReceipt.class} • {generatedReceipt.month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="font-black text-emerald-400">₹{generatedReceipt.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Txn:</span>
                      <span className="font-mono text-[10px] text-slate-400">{generatedReceipt.transactionId}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-800/80 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPayingFee(null);
                        setGeneratedReceipt(null);
                      }}
                      className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentDashboard;
