import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Search } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';

const statusConfig = {
  pending:    { label: 'Pending',    color: 'bg-amber-50 text-amber-600 border-amber-200',   icon: Clock       },
  verified:   { label: 'Verified',   color: 'bg-blue-50 text-blue-600 border-blue-200',      icon: CheckCircle  },
  dispensing: { label: 'Dispensing', color: 'bg-purple-50 text-purple-600 border-purple-200',icon: Package      },
  dispatched: { label: 'Dispatched', color: 'bg-cyan-50 text-cyan-600 border-cyan-200',      icon: Truck        },
  delivered:  { label: 'Delivered',  color: 'bg-green-50 text-green-600 border-green-200',   icon: CheckCircle  },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-500 border-red-200',         icon: XCircle      },
};

const fmt = (n) => `£${parseFloat(n || 0).toFixed(2)}`;

// Per-unit selling price is stored in `unitRevenueExVat`.
const getUnitPrice = (item) => Number(item.unitRevenueExVat ?? item.price ?? 0);

// Order total: use financials.revenueExVat, else sum the line items.
const getOrderTotal = (order) => {
  if (order.financials?.revenueExVat != null) return Number(order.financials.revenueExVat);
  return (order.items || []).reduce((a, i) => a + getUnitPrice(i) * (i.quantity || 1), 0);
};

const PrescriberOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/orders/my')
      .then(res => {
        const data = res.data.orders || (Array.isArray(res.data) ? res.data : []);
        setOrders(data);
      })
      .catch(err => console.error('Failed to fetch orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['all', 'pending', 'verified', 'dispensing', 'dispatched', 'delivered', 'cancelled'];

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const searchLower = search.toLowerCase();
    const matchSearch = !search ||
      o._id?.toLowerCase().includes(searchLower) ||
      o.items?.some(i => (i.productName || i.name || '').toLowerCase().includes(searchLower));
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="My Orders" />
      <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8 space-y-6">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by order ID or product name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors shadow-sm"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize flex-shrink-0 ${
                  filter === s ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
              <Package size={30} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">No orders found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const Icon = cfg.icon;
              const total = getOrderTotal(order);

              return (
                <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.color.split(' ')[0]}`}>
                        <Icon size={18} className={cfg.color.split(' ')[1]} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 font-mono">#{order._id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border capitalize ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{fmt(total)}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  {order.items?.length > 0 && (
                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-50 space-y-2">
                      {order.items.map((item, idx) => {
                        const unit = getUnitPrice(item);
                        const qty  = item.quantity || 1;
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 font-medium truncate pr-2 sm:pr-4">
                              <span className="block sm:inline">
                                {item.productName || item.name || item.medicineId?.name || 'Unknown Item'}
                              </span>
                              <span className="text-slate-400 ml-1 sm:ml-2">×{qty}</span>
                            </span>
                            <span className="text-slate-700 font-semibold tabular-nums whitespace-nowrap">
                              {fmt(unit * qty)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriberOrders;