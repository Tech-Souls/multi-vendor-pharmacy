import { useEffect, useState } from "react";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingBag, Trash2, MapPin, User } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, removeFromCart, refreshCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [removing, setRemoving] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [prescribers, setPrescribers] = useState([]);
  const [prescriberId, setPrescriberId] = useState('');
  const [deliveryAddress, setDelivery] = useState({
    line1: '', city: '', postcode: ''
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = 5;
  const total = subtotal + shipping;

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
        // Use the actual ID field (handling nested structure)
       const id = links[0].prescriberId?.prescriberId || '';
        setPrescriberId(id);
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
        // Ensure this key matches what your backend API expects (e.g., medicineId or productId)
        medicineId: item.productId,
        quantity: item.quantity,
      }));

      // DEBUG LOG: Check if data is correct before it reaches the server
      console.log("DEBUG: Checkout Payload:", { prescriberId, items: orderItems, deliveryAddress });

      await API.post('/orders', {
        prescriberId,
        items: orderItems,
        deliveryAddress,
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/');
    } catch (err) {
      // DEBUG LOG: Check exactly why the server rejected the order
      console.error("DEBUG: Order Error Response:", err.response?.data);
      toast.error(err.response?.data?.message || 'Server connection error');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-10">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-10 text-sm font-medium group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Continue Shopping
        </button>

        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black tracking-tight text-center ">Your Cart</h1>
            
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <ShoppingBag size={28} className="text-gray-200" />
              </div>
              <p className="text-sm font-medium text-gray-400">Your cart is empty</p>
              <Link to="/"
                className="mt-2 text-sm font-semibold text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

              {/* ── Cart Items ── */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-4">
                  Items ({items.length})
                </p>

                {items.map((item) => (
                  <div key={item.productId}
                    className="flex items-center gap-4 py-4 border-b border-gray-50 group">

                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center">
                      {item.image
                        ? <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        : <Package size={18} className="text-gray-200" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        £{item.price?.toFixed(2)} × {item.quantity}
                      </p>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <p className="text-sm font-bold text-black">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={removing === item.productId}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        {removing === item.productId
                          ? <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Subtotal row */}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xs text-gray-400">Subtotal</span>
                  <span className="text-sm font-semibold text-black">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Shipping</span>
                  <span className="text-sm font-semibold text-black">£{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-black">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* ── Order Summary / Checkout ── */}
              <div className="space-y-6">

                {/* Prescriber */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    <User size={11} /> Linked Prescriber
                  </label>
                  <select
                    value={prescriberId}
                    onChange={e => setPrescriberId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-colors bg-white text-black">
                    <option value="">Select a prescriber</option>
                    {prescribers.map((p, idx) => {
                      const id = p.prescriberId?.prescriberId || '';
                      const name = p.prescriberId?.name || `${p.prescriberId?.firstName || ''} ${p.prescriberId?.lastName || ''}`.trim();
                      return (
                        <option key={idx} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    <MapPin size={11} /> Delivery Address
                  </label>
                  <div className="space-y-2">
                    <input
                      placeholder="Address Line 1"
                      value={deliveryAddress.line1}
                      onChange={e => setDelivery({ ...deliveryAddress, line1: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-colors" />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="City"
                        value={deliveryAddress.city}
                        onChange={e => setDelivery({ ...deliveryAddress, city: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-colors" />
                      <input
                        placeholder="Postcode"
                        value={deliveryAddress.postcode}
                        onChange={e => setDelivery({ ...deliveryAddress, postcode: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Place Order */}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {checkingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : 'Place Order'}
                </button>

                <p className="text-[10px] text-gray-300 text-center leading-relaxed">
                  By placing your order you agree to our terms. Prescription items require valid Rx before dispatch.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;