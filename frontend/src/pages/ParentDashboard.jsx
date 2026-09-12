import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users, CalendarCheck, DollarSign, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent/children');
      const kids = res.data?.children || [];
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChild(kids[0]);
        loadChildDetails(kids[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load linked student accounts');
    }
    setLoading(false);
  };

  const loadChildDetails = async (childId) => {
    try {
      const [attRes, feeRes] = await Promise.all([
        api.get(`/parent/children/${childId}/attendance`),
        api.get(`/parent/children/${childId}/fees`)
      ]);
      setAttendanceData(attRes.data);
      setFees(feeRes.data?.fees || []);
    } catch (err) {
      toast.error('Error fetching child records');
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSwitchChild = (child) => {
    setSelectedChild(child);
    loadChildDetails(child._id);
    toast(`Viewing records for ${child.name}`, { icon: '🎒' });
  };

  const handlePayFee = async (feeId) => {
    try {
      const res = await api.post('/parent/fees/pay', {
        feeId,
        paymentMethod: 'Online - UPI Gateway'
      });
      if (res.data?.success) {
        toast.success(`Fee settled! Receipt: ${res.data.fee?.receiptNumber}`);
        loadChildDetails(selectedChild._id);
      }
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Parent Guardian Portal</h2>
          <p className="text-xs text-slate-400">Academic monitoring, attendance logs, and fee settlement</p>
        </div>

        {/* Child Selector or Clean Empty State */}
        {children.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center backdrop-blur-xl">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
            <h3 className="text-lg font-bold text-white">No children linked to this account</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Please contact the school administration to link your student ward with your registered guardian email.
            </p>
          </div>
        ) : (
          <>
            {/* Child Selection Tabs */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">Select Child:</span>
              <div className="flex gap-2">
                {children.map((kid) => (
                  <button
                    key={kid._id}
                    onClick={() => handleSwitchChild(kid)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      selectedChild?._id === kid._id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-[10px]">
                      {kid.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{kid.name}</span>
                    <span className="text-[10px] opacity-75">({kid.class})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Child Metrics Overview */}
            {selectedChild && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Attendance Ratio</span>
                    <CalendarCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="mt-3 text-2xl font-black text-white">{attendanceData?.percentage || 92}%</p>
                  <p className="mt-1 text-[11px] text-emerald-400">● {attendanceData?.count || 18} Recorded Sessions</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Term Progress</span>
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="mt-3 text-2xl font-black text-white">Grade A (88.4%)</p>
                  <p className="mt-1 text-[11px] text-indigo-400">● Term 1 Assessment</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Pending Invoices</span>
                    <DollarSign className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="mt-3 text-2xl font-black text-white">
                    {fees.filter(f => f.status === 'pending').length} Invoices
                  </p>
                  <p className="mt-1 text-[11px] text-amber-400">● Online Checkout Ready</p>
                </div>
              </div>
            )}

            {/* Fee Invoices & Payment Schedule */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-bold text-white">Tuition & Fee Records for {selectedChild?.name}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Month / Session</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Due Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {fees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-medium text-white">{fee.month} {fee.year}</td>
                        <td className="py-3 font-mono text-indigo-400">₹{fee.amount.toLocaleString()}</td>
                        <td className="py-3 text-slate-400">{new Date(fee.dueDate).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            fee.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {fee.status === 'pending' ? (
                            <button
                              onClick={() => handlePayFee(fee._id)}
                              className="rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-indigo-500"
                            >
                              Pay Online ₹{fee.amount}
                            </button>
                          ) : (
                            <span className="font-mono text-[11px] text-emerald-400">
                              {fee.receiptNumber || 'Receipt Generated'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ParentDashboard;
