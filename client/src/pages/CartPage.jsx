import { useEffect, useState } from "react";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, removeFromCart, refreshCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [removing, setRemoving]         = useState(null);
  const [mounted, setMounted]           = useState(false);
  const [checkingOut, setCheckingOut]   = useState(false);
  const [prescribers, setPrescribers]   = useState([]);
  const [prescriberId, setPrescriberId] = useState('');
  const [deliveryAddress, setDelivery]  = useState({ line1: '', city: '', postcode: '' });

  const items     = cart?.items || [];
  const subtotal  = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    refreshCart();
    setTimeout(() => setMounted(true), 100);
    fetchPrescribers();
  }, []);

  const fetchPrescribers = async () => {
    try {
      const { data } = await API.get('/prescriber/active-links');
      const links = Array.isArray(data) ? data : data.links || [];
      setPrescribers(links);

      if (links.length === 1) {
        const customId = links[0].prescriberId?.prescriberId || '';
        setPrescriberId(customId);
      }
    } catch (err) {
      console.error('Failed to fetch prescribers:', err);
    }
  };

  const handleRemove = async (productId) => {
    setRemoving(productId);
    await removeFromCart(productId);
    setRemoving(null);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }
    if (!prescriberId) {
      toast.error('Please select a prescriber');
      return;
    }
    if (!deliveryAddress.line1 || !deliveryAddress.city || !deliveryAddress.postcode) {
      toast.error('Please enter your delivery address');
      return;
    }

    setCheckingOut(true);
    try {
      const orderItems = items.map(item => ({
        medicineId: item.productId,
        quantity:   item.quantity,
      }));

      await API.post('/orders', {
        prescriberId,
        items: orderItems,
        deliveryAddress,
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/home');
    } catch (err) {
      const message = err.response?.data?.message || 'Server connection error';
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-8 md:px-10 py-4 flex flex-wrap items-center gap-2">
        <Link to="/home" className="text-slate-500 hover:text-slate-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors bg-gray-200 px-4 py-2 rounded-full">
          <ArrowLeft size={14} /> Back to Shop
        </Link>
        <span className="text-slate-300">•</span>
        
        {itemCount > 0 && (
          <span className="ml-auto text-xs bg-black text-white px-2.5 py-0.5 rounded-full">
            {itemCount} items
          </span>
        )}
      </div>

      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Title */}
        <div className={`mb-6 sm:mb-9 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Shopping Cart</h1>
          <p className="text-sm text-slate-400">
            {items.length === 0 ? 'Your cart is empty' : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          /* ── Empty Cart ── */
          <div className="text-center py-16 sm:py-20 px-4 bg-white rounded-2xl border border-slate-200">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
            <Link to="/home" className="mt-5 inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          /* ── Cart Content ── */
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-4 lg:gap-6">

            {/* ── Cart Items ── */}
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.productId} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-sm sm:text-base text-slate-900">£{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removing === item.productId}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {removing === item.productId ? '...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Summary ── */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 h-fit sticky top-4">
              <h2 className="text-base font-bold text-slate-900 mb-4">Summary</h2>

              {/* Prescriber */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Linked Prescriber
                </label>
                {prescribers.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No links found. <Link to="/prescriberLink" className="font-bold text-amber-900 underline">Link now →</Link>
                  </div>
                ) : (
                  <select
                    value={prescriberId}
                    onChange={e => setPrescriberId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors bg-white"
                  >
                    <option value="">Select a prescriber</option>
                    {prescribers.map((p, idx) => {
                      const customId = p.prescriberId?.prescriberId || '';
                      const fullName = p.prescriberId?.name ||
                        `${p.prescriberId?.firstName || ''} ${p.prescriberId?.lastName || ''}`.trim();
                      return (
                        <option key={idx} value={customId}>
                          {fullName || 'Unnamed Prescriber'}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Delivery Address */}
              <div className="mb-5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Delivery Address
                </label>
                <input
                  placeholder="Address Line 1"
                  value={deliveryAddress.line1}
                  onChange={e => setDelivery({ ...deliveryAddress, line1: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors mb-2"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChange={e => setDelivery({ ...deliveryAddress, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors"
                  />
                  <input
                    placeholder="Postcode"
                    value={deliveryAddress.postcode}
                    onChange={e => setDelivery({ ...deliveryAddress, postcode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="text-slate-900">£5.00</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-extrabold text-lg text-slate-900">£{(subtotal + 5).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {checkingOut ? 'Processing...' : 'Place Order'}
              </button>

              {/* Login hint on mobile */}
              {!isLoggedIn && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  Please <Link to="/login" className="text-slate-900 font-semibold underline">log in</Link> to checkout
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;