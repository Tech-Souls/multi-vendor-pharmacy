import { useState, useEffect } from 'react';
import { BiCloudUpload, BiTrash } from 'react-icons/bi';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";

const MediaManager = () => {
  const [mediaList, setMediaList] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('gallery');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('image');

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/media`);
      setMediaList(res.data);
    } catch (err) {
      console.error("Error loading media:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPreviewType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a file first.');

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('caption', caption);
    formData.append('image', selectedFile);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/media/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle(''); setType('gallery');
      setCaption(''); setSelectedFile(null); setPreviewUrl('');
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploadLoading(false);
    }
  };

const handleDelete = async (id) => {
  const confirmed = await new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex items-center justify-between gap-6 px-4 py-3 bg-white rounded-2xl shadow-lg min-w-[360px]">
          <div>
            <p className="text-sm font-bold text-gray-800">Delete Media?</p>
            <p className="text-xs text-gray-400 mt-0.5">Cannot undo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-4 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: { background: "transparent", boxShadow: "none", padding: 0 },
      }
    );
  });

  if (!confirmed) return;
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/media/${id}`);
    fetchMedia();
    toast.success("Media deleted");
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete media");
  }
};

  const getMediaUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${filePath.replace(/\\/g, '/')}` ;
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Media Manager</h1>
      </div>

      {/* Main Container - Vertical Stack */}
      <div className="flex flex-col gap-8">
        
        {/* Upload Form Section - Now at the Top */}
        <form onSubmit={handleMediaSubmit}
          className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 w-full">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Upload New Media
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              File (Image or Video)
            </label>
            <div className="relative border-2 border-dashed border-gray-200 hover:border-teal-400 transition-colors rounded-2xl h-44 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden">
              <input type="file" accept="image/*,video/*" onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {previewUrl ? (
                previewType === 'video'
                  ? <video src={previewUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  : <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <BiCloudUpload className="mx-auto text-gray-400" size={36} />
                  <p className="text-xs font-medium text-gray-500 mt-2">Click or drag file here</p>
                  <p className="text-[10px] text-gray-400 mt-1">Images & Videos supported</p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={uploadLoading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50">
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {/* Media List Section - Below Upload */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {mediaList.length} Items
          </h2>

          <div className="space-y-3 w-full">
            {mediaList.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No media found.</p>
            ) : mediaList.map((item) => (
              <div key={item._id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl border shrink-0 overflow-hidden bg-gray-50">
                    {item.mediaType === 'video'
                      ? <video src={getMediaUrl(item.image)} className="w-full h-full object-cover" muted />
                      : <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                    }
                  </div>

                  <div className="min-w-0 truncate">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {item.title || 'Untitled'}
                    </p>
                    {item.caption && (
                      <p className="text-xs text-gray-400 truncate max-w-[150px] sm:max-w-xs">{item.caption}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 rounded uppercase text-gray-500">
                        {item.type}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.mediaType === 'video'
                          ? 'bg-teal-50 text-teal-600 border border-teal-100'
                          : 'bg-blue-50 text-blue-400'
                      }`}>
                        {item.mediaType}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleDelete(item._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <BiTrash size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaManager;