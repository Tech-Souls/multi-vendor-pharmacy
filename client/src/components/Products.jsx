import { useState, useEffect } from "react";
import API from "../api/axios";
import Header from "./Header";
import { ImagePlus, Trash2, Edit, ShoppingCart, FileText, X, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SUBCATEGORIES = {
  Injectables: ["Toxins", "HA Fillers", "Skin Boosters", "Polynucleotides"],
  Skincare:    ["Skincare", "Hair", "Make Up"],
};

// ─── Helper: Build image URL ───
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  try {
    // Fix backslashes (Windows issue)
    let cleanPath = imagePath.replace(/\\/g, '/');
    
    // Remove leading slash (avoid double slashes)
    cleanPath = cleanPath.replace(/^\//, '');
    
    // Clean base URL
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    
    // If it's already a full URL
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath;
    }
    
    // If it's from public folder (starts with /)
    if (cleanPath.startsWith('/')) {
      return cleanPath;
    }
    
    // Build full URL
    return `${baseUrl}/${cleanPath}`;
  } catch (error) {
    console.error('Error building image URL:', error);
    return null;
  }
};

// ─── Image Component with proper error handling ───
const ProductImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset when src changes
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
        <Package size={16} className="text-gray-200" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || 'Product'}
      className={className || "w-full h-full object-cover"}
      onError={(e) => {
        console.error('❌ Image failed to load:', imgSrc);
        setHasError(true);
        // Hide the broken image
        e.target.style.display = 'none';
      }}
      onLoad={() => {
        console.log('✅ Image loaded successfully:', imgSrc);
      }}
    />
  );
};

const Products = () => {
  const { addToCart } = useCart();
  const navigate      = useNavigate();

  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId,  setSelectedId]  = useState(null);
  const [addingToCart,setAddingToCart]= useState(null);
  const [selectedCategory,    setSelectedCategory]    = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [imageFile,            setImageFile]           = useState(null);
  const [previewUrl,           setPreviewUrl]          = useState(null);
  const [additionalImages,     setAdditionalImages]    = useState([]);
  const [additionalPreviews,   setAdditionalPreviews]  = useState([]);

  const categories = [
    "Botulinum Toxins","Dermal Fillers","Skin Boosters",
    "Fat Dissolvers","Mesotherapy","Anesthetics",
    "Skincare","Consumables","Injectables",
  ];

  const [formData, setFormData] = useState({
    name:"", brand:"", category:"Botulinum Toxins", subCategory:"",
    description:"", howToUse:"", safetyInfo:"",
    prescriptionRequired: false, unitPrice:"", dispensedBy:"",
    dosage:"", buyingPrice:"", sellingPrice:"", stock:"",
    expiryDate:"", sku:"", supplier:""
  });

  const fetchProducts = async () => {
    try {
      const res  = await API.get("/medicines");
      const data = Array.isArray(res.data) ? res.data : (res.data.medicines || []);
      
      // Log to verify image paths
      console.log('✅ Products fetched:', data.length);
      if (data.length > 0) {
        console.log('📸 Sample image path:', data[0].image);
        console.log('📸 Full URL would be:', buildImageUrl(data[0].image));
      }
      
      setProducts(data);
    } catch (err) {
      console.error("error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const getSubcategoryKey = (catName) => {
    if (!catName) return null;
    return Object.keys(SUBCATEGORIES).find(k => k.toLowerCase() === catName.toLowerCase());
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === "all" ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const subKey   = getSubcategoryKey(selectedCategory);
    const matchSub = !subKey || selectedSubCategory === "all" ||
      (p.subCategory && p.subCategory.toLowerCase() === selectedSubCategory.toLowerCase());
    return matchCat && matchSub;
  });

  const handleAddToCart = async (product) => {
    if (!product._id) { toast.error("Invalid product."); return; }
    if (product.prescriptionRequired) {
      toast('Prescription required — redirecting...', { icon: '📋' });
      setTimeout(() => navigate('/prescription-form'), 800);
      return;
    }
    if (addingToCart === product._id) return;
    setAddingToCart(product._id);
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart.");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleEdit = (product) => {
    setSelectedId(product._id);
    setFormData({
      name:                product.name                || "",
      brand:               product.brand               || "",
      category:            product.category            || "Botulinum Toxins",
      subCategory:         product.subCategory         || "",
      description:         product.description         || "",
      howToUse:            product.howToUse            || "",
      safetyInfo:          product.safetyInfo          || "",
      prescriptionRequired:product.prescriptionRequired|| false,
      unitPrice:           product.unitPrice           || product.sellingPrice || "",
      dispensedBy:         product.dispensedBy         || "",
      dosage:              product.dosage              || "",
      buyingPrice:         product.buyingPrice         || "",
      sellingPrice:        product.sellingPrice        || product.price || "",
      stock:               product.stock               || "",
      expiryDate:          product.expiryDate          ? product.expiryDate.split('T')[0] : "",
      sku:                 product.sku                 || "",
      supplier:            product.supplier            || "",
    });
    if (product.image) {
      const url = buildImageUrl(product.image);
      console.log('🖼️ Setting preview URL:', url);
      setPreviewUrl(url);
    }
    if (product.additionalImages?.length) {
      const urls = product.additionalImages.map(img => buildImageUrl(img));
      setAdditionalPreviews(urls);
    } else {
      setAdditionalPreviews([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this product?")) return;
    try {
      await API.delete(`/medicines/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product removed");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'category') {
      setFormData({ ...formData, category: value, subCategory: '' });
      return;
    }
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { 
      setImageFile(file); 
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleAdditionalFiles = (e) => {
    const files = Array.from(e.target.files);
    if (additionalPreviews.length + files.length > 3) {
      toast.error("Max 3 additional images"); 
      return;
    }
    setAdditionalImages(prev => [...prev, ...files]);
    setAdditionalPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImages(prev  => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data   = new FormData();
    const subKey = getSubcategoryKey(formData.category);
    Object.keys(formData).forEach(key => {
      if (key === "subCategory") {
        data.append("subCategory", subKey ? formData.subCategory : "");
      } else {
        data.append(key, formData[key]);
      }
    });
    data.set("buyingPrice",  Number(formData.buyingPrice));
    data.set("sellingPrice", Number(formData.sellingPrice));
    data.set("price",        Number(formData.sellingPrice));
    data.set("unitPrice",    Number(formData.unitPrice));
    data.set("stock",        Number(formData.stock));
    if (imageFile) data.append("image", imageFile);
    additionalImages.forEach(file => data.append("additionalImages", file));

    try {
      const token  = localStorage.getItem("token");
      const config = { headers: { "content-type": "multipart/form-data", authorization: `bearer ${token}` } };
      if (selectedId) {
        const res     = await API.put(`/medicines/${selectedId}`, data, config);
        const updated = res.data.medicine || res.data;
        setProducts(products.map(p => p._id === selectedId ? updated : p));
        toast.success("Product updated");
      } else {
        const res = await API.post("/medicines", data, config);
        setProducts(prev => [...prev, res.data.medicine || res.data]);
        toast.success("Product added");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.status === 401 ? "Unauthorized" : "Error saving product");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setSelectedId(null);
    setImageFile(null);    setPreviewUrl(null);
    setAdditionalImages([]); setAdditionalPreviews([]);
    setFormData({
      name:"", brand:"", category:"Botulinum Toxins", subCategory:"",
      description:"", howToUse:"", safetyInfo:"", prescriptionRequired: false,
      unitPrice:"", dispensedBy:"", dosage:"", buyingPrice:"",
      sellingPrice:"", stock:"", expiryDate:"", sku:"", supplier:""
    });
  };

  const calculateMargin = () => {
    if (!formData.buyingPrice || !formData.sellingPrice) return 0;
    return (((formData.sellingPrice - formData.buyingPrice) / formData.sellingPrice) * 100).toFixed(1);
  };

  const activeSubcategoryKey = getSubcategoryKey(selectedCategory);
  const activeSubcategories  = activeSubcategoryKey ? SUBCATEGORIES[activeSubcategoryKey] : [];
  const formSubcategoryKey   = getSubcategoryKey(formData.category);

  return (
    <div className="bg-white min-h-screen text-black">
      <Header title="Products" />
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto">

        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-black">Inventory Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{products.length} products listed</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all">
            <span className="text-base leading-none">+</span> Add Product
          </button>
        </div>

        {/* ── Category Filters ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          <button
            onClick={() => { setSelectedCategory("all"); setSelectedSubCategory("all"); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? 'bg-black text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
            }`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => { setSelectedCategory(cat); setSelectedSubCategory("all"); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Subcategory Filters ── */}
        {activeSubcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
            <button
              onClick={() => setSelectedSubCategory("all")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubCategory === "all"
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}>
              All {selectedCategory}
            </button>
            {activeSubcategories.map(sub => (
              <button key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubCategory === sub
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}>
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price / Unit</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Rx</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-gray-300">Loading inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Package size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">No products found</p>
                  </td>
                </tr>
              ) : filteredProducts.map(item => {
                // Build the image URL
                const imageUrl = buildImageUrl(item.image);
                
                return (
                <tr key={item._id} className="hover:bg-gray-50/60 transition-all">

                  {/* Product */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                        {imageUrl ? (
                          <ProductImage 
                            src={imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{item.name}</p>
                        <p className="text-[10px] text-gray-300 font-mono">{item.sku || '—'}</p>
                        {item.brand && (
                          <p className="text-[10px] text-gray-300">{item.brand}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg w-fit">
                        {item.category}
                      </span>
                      {item.subCategory && (
                        <span className="text-[10px] font-semibold bg-gray-50 text-gray-400 border border-gray-100 px-2 py-0.5 rounded-lg w-fit">
                          {item.subCategory}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price / Unit */}
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-black">
                      £{(item.sellingPrice || item.price || 0).toFixed ? (item.sellingPrice || item.price || 0).toFixed(2) : (item.sellingPrice || item.price || 0)}
                    </p>
                    {item.unitPrice && (
                      <p className="text-[10px] text-gray-400">unit: £{item.unitPrice}</p>
                    )}
                    <p className="text-[10px] text-gray-300">cost: £{item.buyingPrice || 0}</p>
                    {item.buyingPrice && item.sellingPrice && (
                      <p className="text-[10px] text-green-500 font-semibold">
                        {(((item.sellingPrice - item.buyingPrice) / item.sellingPrice) * 100).toFixed(0)}% margin
                      </p>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.stock > 5  ? 'bg-green-50 text-green-600' :
                      item.stock > 0  ? 'bg-amber-50 text-amber-600'  :
                                        'bg-red-50 text-red-500'
                    }`}>
                      {item.stock > 0 ? `${item.stock} units` : 'Out of stock'}
                    </span>
                  </td>

                  {/* Rx */}
                  <td className="py-4 px-6">
                    {item.prescriptionRequired ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded-full">
                        <FileText size={9} /> Rx
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full block w-fit">
                        OTC
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart === item._id}
                        title={item.prescriptionRequired ? 'Prescription required' : 'Add to cart'}
                        className={`p-2 rounded-lg transition-all ${
                          item.prescriptionRequired
                            ? 'text-red-300 hover:text-red-500 hover:bg-red-50'
                            : addingToCart === item._id
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-green-500 hover:bg-green-50'
                        }`}>
                        {addingToCart === item._id
                          ? <div className="w-3.5 h-3.5 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                          : item.prescriptionRequired
                          ? <FileText size={15} />
                          : <ShoppingCart size={15} />}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl p-8 shadow-2xl overflow-y-auto max-h-[95vh]">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-black">
                {selectedId ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

              {/* ── Left: Images + Descriptions ── */}
              <div className="w-full lg:w-5/12 space-y-4">

                {/* Main Image */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Main Image
                  </label>
                  <div
                    onClick={() => document.getElementById('imageInput').click()}
                    className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-black transition-all cursor-pointer overflow-hidden group">
                    {previewUrl
                      ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                      : <div className="text-center">
                          <ImagePlus size={36} className="text-gray-200 group-hover:text-black transition-colors mx-auto mb-2" />
                          <span className="text-xs text-gray-300">Click to upload</span>
                        </div>}
                    <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Additional Images (max 3)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {additionalPreviews.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removeAdditionalImage(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {additionalPreviews.length < 3 && (
                      <button type="button"
                        onClick={() => document.getElementById('additionalImagesInput').click()}
                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-black transition-all text-gray-200 hover:text-black">
                        <ImagePlus size={18} />
                        <input id="additionalImagesInput" type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalFiles} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Text fields */}
                {[
                  { name: 'description', label: 'Description',  rows: 3, ph: 'Product details...'    },
                  { name: 'howToUse',    label: 'How To Use',   rows: 2, ph: 'Usage instructions...' },
                  { name: 'safetyInfo',  label: 'Safety Info',  rows: 2, ph: 'Warnings...'           },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                      {f.label}
                    </label>
                    <textarea
                      name={f.name} rows={f.rows}
                      value={formData[f.name]} onChange={handleChange}
                      placeholder={f.ph}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all resize-none" />
                  </div>
                ))}
              </div>

              {/* ── Right: Specs + Pricing ── */}
              <div className="w-full lg:w-7/12 space-y-4">

                {/* Specifications */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Specifications
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Name</label>
                      <input name="name" required value={formData.name} onChange={handleChange}
                        placeholder="Product name"
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">SKU</label>
                      <input name="sku" required value={formData.sku} onChange={handleChange}
                        placeholder="BATCH-001"
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Category</label>
                      <select name="category" required value={formData.category} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    {formSubcategoryKey ? (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Sub Category</label>
                        <select name="subCategory" value={formData.subCategory} onChange={handleChange}
                          className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all">
                          <option value="">Select...</option>
                          {SUBCATEGORIES[formSubcategoryKey].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Dosage</label>
                        <input name="dosage" value={formData.dosage} onChange={handleChange}
                          placeholder="e.g. 100 units"
                          className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Brand</label>
                      <input name="brand" required value={formData.brand} onChange={handleChange}
                        placeholder="Manufacturer"
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Supplier</label>
                      <input name="supplier" value={formData.supplier} onChange={handleChange}
                        placeholder="Wholesaler name"
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Stock</label>
                      <input name="stock" type="number" required value={formData.stock} onChange={handleChange}
                        placeholder="Units available"
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Expiry Date</label>
                      <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                  </div>

                  {/* Prescription Toggle */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-red-400" />
                      <span className="text-sm font-medium text-black">Prescription Required</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox" name="prescriptionRequired"
                        checked={formData.prescriptionRequired} onChange={handleChange}
                        className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-red-500 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pricing</p>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                        Unit Price (£)
                      </label>
                      <input name="unitPrice" type="number" step="0.01" value={formData.unitPrice} onChange={handleChange}
                        placeholder="0.00"
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                        Cost (£)
                      </label>
                      <input name="buyingPrice" type="number" step="0.01" required value={formData.buyingPrice} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                        Sell (£)
                      </label>
                      <input name="sellingPrice" type="number" step="0.01" required value={formData.sellingPrice} onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-black rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                    </div>
                  </div>

                  {/* Margin display */}
                  <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Profit Margin
                    </span>
                    <span className={`text-sm font-bold ${Number(calculateMargin()) > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                      {calculateMargin()}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-3 text-gray-400 text-sm font-medium hover:text-black transition-all">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-[2] py-3 bg-black text-white text-sm font-semibold rounded-2xl hover:bg-gray-900 transition-all">
                    {selectedId ? "Save Changes" : "Add to Inventory"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;