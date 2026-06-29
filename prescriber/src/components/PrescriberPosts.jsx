import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { BiCloudUpload, BiTrash } from 'react-icons/bi';
import toast, { Toaster } from "react-hot-toast";


const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default.png';
  if (imagePath.startsWith('http')) return imagePath;
  const clean = imagePath.replace(/\\/g, '/');
  return `${BASE_URL}/${clean}`;
};

const PrescriberPosts = () => {
  const [posts, setPosts]       = useState([]);
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState('');
  const [loading, setLoading]   = useState(false);
  const fileRef                 = useRef();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert('Please select an image');

    const formData = new FormData();
    // Using a default title as the backend requires it, or you can adjust your schema
    formData.append('title', 'Untitled Post'); 
    formData.append('image', image);

    setLoading(true);
    try {
      await api.post('/posts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(null);
      setPreview('');
      if (fileRef.current) fileRef.current.value = '';
      fetchPosts();
    } catch (err) {
      console.error('Upload Error:', err);
      alert(err.response?.data?.message || 'Failed to upload');
    } finally {
      setLoading(false);
    }
  };

 const handleDelete = async (id) => {
  const confirmed = await new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex items-center justify-between gap-6 px-4 py-3 bg-white rounded-2xl shadow-lg min-w-[360px]">
          <div>
            <p className="text-sm font-bold text-gray-800">Delete Post?</p>
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
    await api.delete(`/posts/${id}`);
    fetchPosts();
    toast.success("Post deleted");
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Failed to delete post");
  }
};

  return (
    <div className="p-8 max-w-5xl">

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manage Posts</h1>
        <p className="text-sm text-gray-400 mt-0.5">Upload and manage images shown on the home page</p>
      </div>

      {/* Changed layout wrapper to space components vertically in a single column */}
      <div className="flex flex-col gap-8">

        {/* ── Upload Form ── */}
        <form onSubmit={handleUpload}
          className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 w-full">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Uploads Posts</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image</label>
            <div className="relative border-2 border-dashed border-gray-200 hover:border-teal-400 transition-colors rounded-2xl h-44 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden">
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 pointer-events-none">
                  <BiCloudUpload className="mx-auto text-gray-400" size={36} />
                  <p className="text-xs font-medium text-gray-500 mt-2">Click or drag image here</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        {/* ── Posts List (Now flows natively directly underneath the layout wrapper) ── */}
        <div className="space-y-3 w-full pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {posts.length} Images
          </h2>

          {posts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No images yet.</p>
          ) : (
            posts.map((p) => (
              <div key={p._id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getImageUrl(p.image)}
                    alt="Post"
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                    onError={(e) => { e.target.src = '/default.png'; }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 truncate max-w-xs md:max-w-xl">{p.image}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleDelete(p._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <BiTrash size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriberPosts;