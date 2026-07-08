import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiTrash2, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Gallery = () => {
  const { id: tripId } = useParams();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGallery(); }, [tripId]);

  const fetchGallery = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/gallery`);
      setMedia(res.data.data?.media || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await api.post(`/trips/${tripId}/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMedia(res.data.data?.media || []);
      toast.success('Uploaded!');
    } catch (err) { toast.error('Upload failed'); }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this media?')) return;
    try {
      const res = await api.delete(`/trips/${tripId}/gallery/${mediaId}`);
      setMedia(res.data.data?.media || []);
      toast.success('Deleted');
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div>
      <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gallery</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{media.length} photos & videos</p>
        </div>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <FiUpload className="w-4 h-4" /> Upload
          <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, idx) => (
            <motion.div key={item._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-700 aspect-square">
              {item.mediaType === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <a href={item.url} target="_blank" download className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                  <FiDownload className="w-5 h-5" />
                </a>
                <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/60 hover:bg-red-500/80 rounded-lg text-white transition-colors">
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
              {item.caption && <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs truncate">{item.caption}</p>
              </div>}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
          <p className="text-dark-500 dark:text-dark-400 mb-6">Upload photos and videos from your trip</p>
          <label className="btn-primary cursor-pointer">
            <FiUpload className="w-4 h-4 inline mr-2" /> Upload Photo
            <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
};

export default Gallery;
