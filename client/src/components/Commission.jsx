import { useState, useEffect } from 'react';
import Header from './Header';
import API from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  `£${parseFloat(n || 0).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Commission = () => {
  const [summary, setSummary]       = useState([]);
  const [monthly, setMonthly]       = useState([]);
  const [pots, setPots]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [payoutForm, setPayoutForm] = useState({ prescriberId: '', month: '', amount: '', invoiceNumber: '' });
  const [saving, setSaving]         = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, potsRes] = await Promise.all([
        API.get('/orders/admin/commission-summary'),
        API.get('/port/admin/all'),
      ]);

      setSummary(summaryRes.data.summary || []);
      setPots(potsRes.data.ports || []); // Updated to match /port/admin/all structure

      const ordersRes = await API.get('/orders/admin/all');
      const orders    = ordersRes.data.orders || [];

      const grouped = {};
      orders.forEach(o => {
        const d     = new Date(o.createdAt);
        const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = { month: key, revenue: 0, cogs: 0, packaging: 0, delivery: 0, paymentFee: 0, commission: 0, vat: 0, count: 0 };
        grouped[key].revenue   += o.financials?.revenueExVat       || 0;
        grouped[key].cogs        += o.financials?.cogsExVat          || 0;
        grouped[key].packaging   += o.financials?.packagingCostExVat || 0;
        grouped[key].delivery    += o.financials?.deliveryCostExVat  || 0;
        grouped[key].paymentFee  += o.financials?.paymentFee         || 0;
        grouped[key].commission  += o.financials?.commissionExVat    || 0;
        grouped[key].vat         += o.financials?.outputVat          || 0;
        grouped[key].count       += 1;
      });

      setMonthly(Object.values(grouped).sort((a, b) => b.month.localeCompare(a.month)));
    } catch (err) {
      toast.error('failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayout = async () => {
    const { prescriberId, month, amount, invoiceNumber } = payoutForm;
    if (!prescriberId || !month || !amount) {
      toast.error('fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await API.post(`/port/admin/${prescriberId}/record-payout`, {
        month,
        amountExVat:   Number(amount),
        invoiceNumber,
      });
      toast.success('payout recorded successfully');
      setPayoutForm({ prescriberId: '', month: '', amount: '', invoiceNumber: '' });
      fetchData();
    } catch (err) {
      toast.error('failed to record payout');
    } finally {
      setSaving(false);
    }
  };

  const totalRevenue    = monthly.reduce((s, m) => s + m.revenue,    0);
  const totalCommission = monthly.reduce((s, m) => s + m.commission, 0);
  const pendingComm     = summary.reduce((s, p) => s + (p.totalCommission || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black">
      <Header title="Commission" />
      <div className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto">

        {/* title */}
        <div className="mb-4 sm:mb-5 md:mb-6 border-b border-slate-100 pb-3 sm:pb-4">
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            Commission Tracker
          </h1>
          <p className="text-slate-500 text-sm sm:text-md mt-1">
            revenue – costs = commission. OnePort pharmacy <br className="hidden sm:inline" /> profit model.
          </p>
        </div>

        {/* rule banner */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
          <p className="text-slate-700 text-[12px] sm:text-[13px] leading-relaxed">
            <span className="font-bold mr-2 tracking-tight">OnePort rule:</span> 
            pharmacy is reimbursed exact costs only (drug, packaging, delivery ex-vat). 
            no dispensing fees or profit shares are applied.
          </p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'total commission', value: fmt(totalCommission) },
            { label: 'pharmacy net', value: '£0.00' },
            { label: 'margin retention', value: '100%' },
            { label: 'pending payouts', value: fmt(pendingComm) },
          ].map((stat, idx) => (
            <div key={idx} className="border border-slate-100 p-3 sm:p-4 rounded-xl">
              <p className="text-[11px] sm:text-[13px] font-bold tracking-tight text-slate-400 mb-1">{stat.label}</p>
              <p className="text-base sm:text-lg font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* pending breakdown */}
        {summary.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <h3 className="text-sm sm:text-md font-bold tracking-tight text-slate-500 mb-3 sm:mb-4">pending by prescriber</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {summary.map((s, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-2.5 sm:p-3 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <p className="text-sm sm:text-md font-bold">{s._id}</p>
                    <p className="text-[11px] sm:text-[13px] font-bold text-slate-400">{s.orderCount} orders</p>
                  </div>
                  <p className="text-sm sm:text-md font-bold text-black">{fmt(s.totalCommission)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* monthly table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-8 sm:mb-10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[11px] sm:text-[13px] font-bold tracking-wider">
                  <th className="py-2 sm:py-3 px-3 sm:px-4">month</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4">orders</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">revenue</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">costs</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 text-right">commission</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-4 text-center">pharmacy profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthly.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-bold text-slate-500 text-xs sm:text-sm">{row.month}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-slate-500 font-bold text-xs sm:text-sm">{row.count}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-bold text-slate-500 text-xs sm:text-sm">{fmt(row.revenue)}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-slate-500 font-bold text-xs sm:text-sm">{fmt(row.cogs + row.packaging + row.delivery)}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-slate-500 font-bold text-xs sm:text-sm">{fmt(row.commission)}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-center text-slate-500 font-bold text-xs sm:text-sm">£0.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* record payout form */}
        <div className="border border-slate-100 rounded-xl p-4 sm:p-5 md:p-6 bg-slate-50/20">
          <h3 className="text-sm sm:text-md font-bold mb-3 sm:mb-4 text-black">record commission payout</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'prescriber', type: 'select', key: 'prescriberId' },
              { label: 'month', type: 'month', key: 'month' },
              { label: 'amount (£)', type: 'number', key: 'amount' },
              { label: 'invoice #', type: 'text', key: 'invoiceNumber' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[11px] sm:text-[13px] font-bold text-slate-400 mb-1 block">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={payoutForm[field.key]}
                    onChange={e => setPayoutForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-black transition-colors"
                  >
                    <option value="">select...</option>
                    {pots.map(p => (
                      <option key={p.prescriberId} value={p.prescriberId}>
                        {p.prescriberName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={payoutForm[field.key]}
                    onChange={e => setPayoutForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-black transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handlePayout}
            disabled={saving}
            className="mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg text-[11px] sm:text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {saving ? 'processing...' : 'confirm payout'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Commission;