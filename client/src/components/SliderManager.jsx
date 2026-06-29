import React, { useState, useEffect } from "react";
import { Trash2, PlusCircle, Link, Image as ImageIcon, FileText, Type, Upload } from "lucide-react";
import Header from "./Header";
import { toast } from "react-hot-toast";


const SliderManager = () => {
  // Form input field state management (Removed imageUrl string state)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "Learn More",
    buttonLink: "/",
  });

  // Track the actual binary file and its temporary local preview URL
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Server data array storage state
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Base API configuration pointer
  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/sliders`;

  // Fetch all active slider records from the database
  const fetchSliders = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (res.ok) {
        setSliders(data);
      } else {
        console.error("Failed to load sliders:", data.message);
      }
    } catch (err) {
      console.error("Network communication error fetching slides:", err);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Handle controlled input element adjustments
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file selection and generate preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Creates a local temporary URL for previewing
    }
  };

  // Submit banner payload to the database engine using FormData
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setError("Please select or drop an image file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData instance to send file stream over multipart/form-data
      const multipartData = new FormData();
      multipartData.append("title", formData.title);
      multipartData.append("description", formData.description);
      multipartData.append("buttonText", formData.buttonText);
      multipartData.append("buttonLink", formData.buttonLink);
      multipartData.append("image", imageFile); // Matches upload.single("image") on your backend route

      const res = await fetch(API_URL, {
        method: "POST",
        body: multipartData, // Explicitly omit headers; the browser will set the multi-part boundaries automatically
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save data record configuration.");
      }

      setSuccess("Slide added and file uploaded successfully!");
      
      // Reset text inputs and file states safely
      setFormData({
        title: "",
        description: "",
        buttonText: "Learn More",
        buttonLink: "/",
      });
      setImageFile(null);
      setImagePreview("");
      
      // Synchronize list feed view state updates
      fetchSliders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

// Permanently drop a canvas record row entry point
const handleDelete = (id) => {
  // Show confirmation toast
  toast(
    (t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Delete this slide permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(id);
            }}
            className="bg-red-500 text-white text-xs px-3 py-1 rounded"
          >
            Yes, delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-xs px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: Infinity } // Won't auto-dismiss
  );
};

const confirmDelete = async (id) => {
  const toastId = toast.loading("Deleting slide...");

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (res.ok) {
      setSliders(sliders.filter((slide) => slide._id !== id));
      toast.success("Slide deleted.", { id: toastId });
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to delete slide.", { id: toastId });
    }
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Something went wrong.", { id: toastId });
  }
};

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Dynamic Main Nav Header Element */}
      <Header title="Homepage Slider" />
      
      <div className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto">
        {/* Professional Title Block Section */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <h1 className="text-lg sm:text-xl font-bold border-b border-slate-100 pb-2 inline-block text-slate-900">
            Slider Management Console
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs mt-1">
            Configure promotional displays, target links, and imagery mapped to the application hero slider track.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-5 md:mt-6">
          {/* LEFT COMPONENT: Creation Interface Pane */}
          <div className="lg:col-span-1 bg-slate-50 p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
              <PlusCircle size={16} className="text-blue-600" /> Setup Banner Segment
            </h2>

            {error && <div className="p-2 sm:p-3 mb-3 sm:mb-4 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium">{error}</div>}
            {success && <div className="p-2 sm:p-3 mb-3 sm:mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-medium">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" encType="multipart/form-data">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Slide Title</label>
                <div className="relative">
                  <Type className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Premium Clinical Distribution"
                    className="w-full bg-white pl-10 pr-3 sm:pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <textarea
                    name="description"
                    required
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide details about this promotional offer or application notice..."
                    className="w-full bg-white pl-10 pr-3 sm:pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* ── DRAG & DROP / INTERACTIVE FILE UPLOADER TRACK ── */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Slide Image File</label>
                <div className="group relative border-2 border-dashed border-slate-300 rounded-lg bg-white p-3 sm:p-4 text-center hover:bg-slate-100/50 hover:border-slate-400 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px]">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  
                  {imagePreview ? (
                    <div className="w-full">
                      <img 
                        src={imagePreview} 
                        alt="Preview Window" 
                        className="h-20 sm:h-24 md:h-28 w-full object-cover rounded-md border border-slate-200" 
                      />
                      <p className="text-[10px] text-blue-600 font-medium mt-2 truncate max-w-full">
                        Selected: {imageFile?.name} (Click or drag to swap)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="mx-auto h-5 sm:h-6 w-5 sm:w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                        Click to upload or drag image here
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400">Supports PNG, JPG, JPEG, or WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Button Link</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleChange}
                      className="w-full bg-white pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition duration-150 disabled:bg-blue-400 disabled:cursor-not-allowed mt-2 shadow-sm"
              >
                {loading ? "Publishing Changes..." : "Publish Banner Slide"}
              </button>
            </form>
          </div>

          {/* RIGHT COMPONENT: Interactive Realtime Visual Feed Layer */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Live Banners Track ({sliders.length})</h2>
            
            {sliders.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 sm:p-10 md:p-12 text-center rounded-xl text-slate-400 text-sm font-medium">
                No active slider records configured. Generate one using the setup form configuration panel.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {sliders.map((slide) => {
                  // Resolve dynamic URLs: formats back-slashes or missing domain headers automatically
                  const formattedImageUrl = slide.imageUrl?.startsWith("http")
                    ? slide.imageUrl
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${slide.imageUrl?.replace(/\\/g, "/")}`;

                  return (
                    <div key={slide._id} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center shadow-sm relative group hover:border-slate-300 transition-all">
                      
                      {/* Aspect Card Preview Block Container Element */}
                      <img 
                        src={formattedImageUrl} 
                        alt={slide.title} 
                        className="w-full sm:w-32 md:w-40 lg:w-44 h-20 sm:h-24 md:h-24 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                        onError={(e) => { e.target.src = "https://placehold.co/600x400/f1f5f9/0f172a?text=Image+Not+Found"; }}
                      />

                      {/* Context Block Layout Elements */}
                      <div className="flex-1 min-w-0 self-start sm:self-center">
                        <h3 className="font-bold text-sm sm:text-base truncate text-slate-900">{slide.title}</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1">{slide.description}</p>
                        
                        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-[9px] sm:text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 sm:px-2.5 py-0.5 rounded border border-slate-200">
                            Action: {slide.buttonText}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 truncate max-w-[140px] sm:max-w-[200px] md:max-w-[240px]">
                            Path: {slide.buttonLink}
                          </span>
                        </div>
                      </div>

                      {/* Delete Trigger Action Interface Node */}
                      <button
                        onClick={() => handleDelete(slide._id)}
                        className="absolute top-3 right-3 sm:static p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition duration-150 self-center shadow-sm"
                        title="Remove banner slide"
                      >
                        <Trash2 size={14} className="sm:w-[15px] sm:h-[15px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderManager;