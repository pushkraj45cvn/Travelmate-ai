import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import { PACKING_CATEGORIES } from '../utils/constants';
import { toast } from 'react-toastify';

const Packing = () => {
  const { id: tripId } = useParams();
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', category: 'clothes', quantity: 1, priority: 'medium' });

  useEffect(() => { fetchData(); }, [tripId]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/packing`);
      setPackingList(res.data.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    try {
      const res = await api.post(`/trips/${tripId}/packing/items`, newItem);
      setPackingList(res.data.data);
      setNewItem({ name: '', category: 'clothes', quantity: 1, priority: 'medium' });
      toast.success('Item added');
    } catch (err) { toast.error('Failed to add item'); }
  };

  const toggleItem = async (itemId) => {
    try {
      const res = await api.put(`/trips/${tripId}/packing/items/${itemId}/toggle`);
      setPackingList(res.data.data);
    } catch (err) { toast.error('Failed to toggle'); }
  };

  const deleteItem = async (itemId) => {
    try {
      const res = await api.delete(`/trips/${tripId}/packing/items/${itemId}`);
      setPackingList(res.data.data);
      toast.success('Item removed');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const items = packingList?.items || [];
  const itemLimit = packingList?.itemLimit || 20;
  const total = items.length;
  const checked = items.filter(i => i.isChecked).length;
  const limitProgress = Math.min(Math.round((total / itemLimit) * 100), 100);
  const isOverLimit = total > itemLimit;

  return (
    <div>
      <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Packing List</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            {total}/{itemLimit} items
            {checked > 0 && <span className="text-dark-400"> ({checked} packed)</span>}
          </p>
        </div>
        <div className="text-right">
          <button
            onClick={async () => {
              const newLimit = prompt('Set item limit:', itemLimit);
              if (newLimit && parseInt(newLimit) > 0) {
                try {
                  const res = await api.put(`/trips/${tripId}/packing`, { itemLimit: parseInt(newLimit) });
                  setPackingList(res.data.data);
                  toast.success('Item limit updated');
                } catch (err) { toast.error('Failed to update limit'); }
              }
            }}
            className="text-xs text-primary-500 hover:text-primary-600 font-medium"
          >
            Change limit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Packing Progress</span>
          <span className="text-sm font-bold text-primary-500">{limitProgress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(limitProgress, 100)}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
          />
        </div>
        {isOverLimit && (
          <p className="text-xs text-red-500 mt-2">⚠️ {total - itemLimit} item(s) over the limit</p>
        )}
      </div>

      {/* Add Item */}
      <form onSubmit={addItem} className="card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add Item</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="input-field" placeholder="Item name" required />
          <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="input-field">
            {PACKING_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
          <input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} min={1} className="input-field" />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            <FiPlus className="w-4 h-4" /> Add
          </button>
        </div>
      </form>

      {/* Items by Category */}
      <div className="space-y-6">
        {PACKING_CATEGORIES.map((cat) => {
          const catItems = items.filter(i => i.category === cat.value);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.value} className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.label}
                <span className="text-sm font-normal text-dark-500">({catItems.filter(i => i.isChecked).length}/{catItems.length})</span>
              </h3>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div key={item._id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${item.isChecked ? 'bg-green-50 dark:bg-green-900/10 line-through opacity-60' : 'bg-gray-50 dark:bg-dark-700'}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleItem(item._id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-dark-500'}`}>
                        {item.isChecked && <FiCheck className="w-4 h-4" />}
                      </button>
                      <div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-xs text-dark-400 ml-2">x{item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.priority === 'high' && <span className="text-xs text-red-500 font-medium">High</span>}
                      <button onClick={() => deleteItem(item._id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Packing List Empty</h3>
            <p className="text-dark-500 dark:text-dark-400">Add items to start packing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packing;
