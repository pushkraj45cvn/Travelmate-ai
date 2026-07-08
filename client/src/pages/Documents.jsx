import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiTrash2, FiFile, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Documents = () => {
  const { id: tripId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDocuments(); }, [tripId]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/documents`);
      setDocuments(res.data.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    const type = prompt('Document type (passport, visa, flight_ticket, hotel_booking, insurance, other):') || 'other';
    formData.append('type', type);
    formData.append('title', file.name);
    try {
      await api.post(`/trips/${tripId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      fetchDocuments();
    } catch (err) { toast.error('Upload failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Deleted');
      fetchDocuments();
    } catch (err) { toast.error('Delete failed'); }
  };

  const docIcons = { passport: '🛂', visa: '📜', flight_ticket: '✈️', hotel_booking: '🏨', insurance: '🛡️', other: '📄' };

  return (
    <div>
      <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">{documents.length} documents</p>
        </div>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <FiUpload className="w-4 h-4" /> Upload
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <motion.div key={doc._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{docIcons[doc.type] || '📄'}</span>
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400 capitalize">{doc.type.replace('_', ' ')} · {formatDate(doc.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                  <FiDownload className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(doc._id)} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">No Documents</h3>
          <p className="text-dark-500 dark:text-dark-400 mb-6">Upload your travel documents securely</p>
          <label className="btn-primary cursor-pointer">
            <FiUpload className="w-4 h-4 inline mr-2" /> Upload Document
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
};

export default Documents;
