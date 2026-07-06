import { BiCheck } from 'react-icons/bi';
import {
  MdTrendingUp,
  MdWarning,
  MdInventory,
  MdAttachMoney,
  MdPercent,
  MdOutlineLayers,
  MdNotificationsNone,
  MdHistory
} from 'react-icons/md';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import { usePrescriberDashboard } from '../hooks/Useprescriberdata';

const fmt = (n) => `£${parseFloat(n || 0).toLocaleString('en-GB', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})}`;

const statusBadge = {
  pending:   'bg-amber-50 text-amber-600 border border-amber-200',
  approved:  'bg-green-50 text-green-600 border border-green-200',
  rejected:  'bg-red-50 text-red-500 border border-red-200',
  default:   'bg-slate-50 text-slate-600 border border-slate-200',
};

const PrescriberDashboard = () => {
  const { data, loading, error } = usePrescriberDashboard();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">Something went wrong</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
      </div>
    </div>
  );

  const onePort = data?.threePot || {};
  const orders  = data?.orders   || {};
  const stock   = data?.stock    || {};
  const alerts  = data?.alerts   || { count: 0, items: [] };
  const recentPrescriptions = data?.recentPrescriptions || [];

  const stats = [
    {
      icon:   <MdAttachMoney size={22} />,
      value:  fmt(orders.totalRevenue),
      label:  'Total Revenue',
      sub:    `${orders.totalOrders || 0} orders total`,
      accent: 'border-l-slate-400',
    },
    {
      icon:   <MdPercent size={22} />,
      value:  fmt(orders.totalCommission),
      label:  'My Commission',
      sub:    `${orders.pendingOrders || 0} pending`,
      accent: 'border-l-slate-400',
    },
    {
      icon:   <MdOutlineLayers size={22} />,
      value:  stock.totalProducts || 0,
      label:  'Stock Products',
      sub:    `${stock.totalUnits || 0} units available`,
      accent: 'border-l-slate-400',
    },
    {
      icon:   <MdNotificationsNone size={22} />,
      value:  alerts.count || 0,
      label:  'Unread Alerts',
      sub:    alerts.count > 0 ? 'Action required' : 'All clear',
      accent: alerts.count > 0 ? 'border-l-red-300' : 'border-l-slate-400',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-700 antialiased">
      <PrescriberHeader title="Dashboard" alertCount={alerts.count || 0} />

      <div className="p-4 sm:p-5 md:p-8 max-w-[1400px] mx-auto space-y-6">

        {/* ── Alert Banner ── */}
        {onePort.equilibriumStatus === 'red' && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 shadow-sm">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <MdWarning className="text-slate-700" size={16} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Financial alert: your pot is in breach — contact support.
            </p>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <div key={idx}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 border-l-4 ${stat.accent} hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                  {stat.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400">{stat.sub}</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight mb-1">{stat.value}</p>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Prescriptions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdHistory size={14} className="sm:text-[15px] text-slate-600" />
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700">Recent Prescriptions</h2>
              <span className="ml-auto text-[10px] sm:text-xs text-slate-400 font-medium">
                {recentPrescriptions.length} records
              </span>
            </div>

            {recentPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <MdHistory size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">No prescriptions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 sm:px-5 py-2.5 sm:py-3">Patient</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 sm:px-5 py-2.5 sm:py-3">Treatment</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 sm:px-5 py-2.5 sm:py-3">Date</th>
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 sm:px-5 py-2.5 sm:py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentPrescriptions.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3 font-medium text-slate-700 text-[11px] sm:text-xs">
                          {p.user?.firstName || p.patientDetails?.firstName || '—'}{' '}
                          {p.user?.lastName  || p.patientDetails?.lastName  || ''}
                        </td>
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-slate-500 text-[11px] sm:text-xs">
                          {p.method || '—'}
                        </td>
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-slate-400 text-[11px] sm:text-xs">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short'
                              })
                            : '—'}
                        </td>
                        <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full capitalize ${
                            statusBadge[p.status] || statusBadge.default
                          }`}>
                            {p.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdNotificationsNone size={14} className="sm:text-[15px] text-slate-600" />
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700">Alerts</h2>
              {alerts.count > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-500 border border-red-200 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {alerts.count} new
                </span>
              )}
            </div>

            {alerts.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <MdNotificationsNone size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">No active alerts</p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-2 max-h-[260px] overflow-y-auto">
                {alerts.items.map((alert, idx) => (
                  <div key={idx}
                    className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MdWarning className="shrink-0 mt-0.5 text-amber-500" size={13} />
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Stock Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdInventory size={14} className="sm:text-[15px] text-slate-600" />
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700">Stock Summary</h2>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { label: 'Total Products', value: stock.totalProducts || 0 },
                { label: 'Total Units',    value: stock.totalUnits    || 0 },
                { label: 'Low Stock',      value: stock.lowStockCount || 0 },
                { label: 'Expired',        value: stock.expiredCount  || 0 },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100">
                  <p className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">{item.value}</p>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OnePort Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-50">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <MdTrendingUp size={14} className="sm:text-[15px] text-slate-600" />
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-700">OnePort Status</h2>
              <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${
                onePort.equilibriumStatus === 'green' ? 'bg-green-50 text-green-600 border-green-200' :
                onePort.equilibriumStatus === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-red-50 text-red-500 border-red-200'
              }`}>
                {onePort.equilibriumStatus === 'green' ? '✓ Equilibrium' :
                 onePort.equilibriumStatus === 'amber' ? '⚠ Near Limit'  : '✗ Breach'}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Commission Earned
                    </p>
                    <p className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
                      {fmt(onePort.pot3Commission)}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <MdPercent size={16} className="sm:text-[17px] text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Stock Value
                    </p>
                    <p className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
                      {fmt(onePort.pot1StockValue)}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <MdInventory size={16} className="sm:text-[17px] text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriberDashboard;