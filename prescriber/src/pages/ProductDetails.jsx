import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus, FileText, Shield, ChevronRight } from 'lucide-react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') { setLoading(false); return; }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/medicines/${id}`);
        const data = res.data.medicine || res.data;
        setProduct(data);
        setActiveImage(data.image || data.primaryImage);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} units available`);
      return;
    }
    setAdding(true);
    try {
      await addToCart({ ...product, quantity });
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${path.startsWith('/') ? path.substring(1) : path}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
        <p className="text-xs text-gray-300 tracking-widest uppercase font-medium">Loading</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center space-y-3">
        <Package size={40} className="text-gray-100 mx-auto" />
        <p className="text-sm text-gray-400 font-medium">Product not found</p>
        <button onClick={() => navigate(-1)} className="text-xs text-black underline underline-offset-4">Go back</button>
      </div>
    </div>
  );

  const extraImages = product.additionalImages || product.images || [];
  const allImages = [product.image || product.primaryImage, ...extraImages].filter(Boolean);
  const totalPrice = ((product.sellingPrice || product.price || 0) * quantity).toFixed(2);
  const isRx = product.prescriptionRequired;
  const price = (product.sellingPrice || product.price || 0).toFixed(2);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Breadcrumb bar ── */}
      <div className="border-b border-gray-100 px-5 md:px-10 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors font-medium group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          {product.category && (
            <>
              <ChevronRight size={12} className="text-gray-200" />
              <span className="text-gray-400">{product.category}</span>
            </>
          )}
          {product.subCategory && (
            <>
              <ChevronRight size={12} className="text-gray-200" />
              <span className="text-gray-400">{product.subCategory}</span>
            </>
          )}
          <ChevronRight size={12} className="text-gray-200" />
          <span className="text-gray-700 font-medium truncate max-w-[180px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Image ── */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center group">
              {activeImage
                ? <img src={getImageUrl(activeImage)} alt={product.name}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700" />
                : <Package size={56} className="text-gray-100" />
              }
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {allImages.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === img ? 'border-black' : 'border-transparent opacity-40 hover:opacity-70'
                      }`}>
                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="flex flex-col gap-6">

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {isRx && (
                <span className="text-[10px] font-semibold border border-gray-300 text-gray-500 px-3 py-1 rounded-full">
                  Prescription Only
                </span>
              )}
              {product.category && (
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              )}
            </div>

            {/* Name + meta */}
            <div>
              <h1 className="text-3xl font-bold text-black leading-tight tracking-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {product.brand && <span>{product.brand}</span>}
                {product.brand && product.sku && <span className="text-gray-200">·</span>}
                {product.sku && <span className="font-mono text-xs">{product.sku}</span>}
              </div>
            </div>

            {/* Price + Stock */}
            <div className="flex items-end justify-between py-5 border-y border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-1 font-medium">Price</p>
                <p className="text-4xl font-bold text-black tracking-tight leading-none">£{price}</p>
                {quantity > 1 && !isRx && (
                  <p className="text-sm text-gray-400 mt-1.5">
                    Total <span className="font-semibold text-black">£{totalPrice}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 5 ? 'bg-green-500' :
                      product.stock > 0 ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                  <span className="text-sm font-semibold text-black">
                    {product.stock > 5 ? 'In Stock' :
                      product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{product.stock} units available</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            )}

            {/* Dosage / Supplier */}
            {[
              { label: 'Dosage', value: product.dosage },
              { label: 'Supplier', value: product.supplier },
            ].filter(m => m.value).map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 -mt-3">
                <span className="text-xs text-gray-300 w-14 shrink-0">{label}</span>
                <span className="text-xs font-medium text-gray-600">{value}</span>
              </div>
            ))}

            {/* ── Rx Flow ── */}
            {isRx ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 py-3 border-t border-gray-100">
                  <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-500 leading-relaxed">
                    A valid prescription is required before this medicine can be dispensed.
                  </p>
                </div>

                {/* ✅ Goes to prescriptions page */}
                <button
                  onClick={() => navigate('/prescriptions')}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold py-4 rounded-2xl transition-all">
                  <FileText size={14} />
                  Go to Prescriptions
                </button>

                {/* ✅ Add to cart anyway — also goes to prescriptions */}
                <button
                  onClick={async () => {
                    setAdding(true);

                    try {
                      await addToCart({ ...product, quantity });

                      toast.success('Prescription is required for this product');

                      setTimeout(() => {
                        navigate('/prescriptions');
                      }, 1500);

                    } catch {
                      toast.error('Failed to add to cart');
                    } finally {
                      setAdding(false);
                    }
                  }}
                  disabled={adding || product.stock === 0}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-black py-3 border border-gray-200 hover:border-gray-400 rounded-2xl transition-all disabled:opacity-40"
                >
                  {adding ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart size={14} />
                  )}

                  Add to Cart
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                    <button onClick={() => setQuantity(p => Math.max(1, p - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all">
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-black">{quantity}</span>
                    <button onClick={() => setQuantity(p => Math.min(product.stock, p + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-300">{product.stock} available</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {adding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Safety */}
            {product.safetyInfo && (
              <div className="flex items-start gap-2 pt-3 border-t border-gray-50">
                <Shield size={13} className="text-gray-300 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">{product.safetyInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* How To Use */}
        {product.howToUse && (
          <div className="mt-14 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">How To Use</p>
              <p className="text-sm text-gray-600 leading-relaxed">{product.howToUse}</p>
            </div>
            {product.safetyInfo && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">Safety & Warnings</p>
                <p className="text-sm text-gray-600 leading-relaxed">{product.safetyInfo}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;