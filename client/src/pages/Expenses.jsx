import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import { formatCurrency, formatDate, getCategoryIcon } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { toast } from 'react-toastify';
import Modal from '../components/common/Modal';

ChartJS.register(ArcElement, Tooltip, Legend);

const Expenses = () => {
  const { id: tripId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0], notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        api.get(`/trips/${tripId}/expenses`),
        api.get(`/trips/${tripId}/expenses/summary`),
      ]);
      setExpenses(expRes.data.data || []);
      setSummary(sumRes.data.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${tripId}/expenses`, formData);
      toast.success('Expense added');
      setShowModal(false);
      setFormData({ amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const chartData = {
    labels: summary?.byCategory?.map(c => c._id) || [],
    datasets: [{
      data: summary?.byCategory?.map(c => c.total) || [],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#f97316', '#6b7280'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-6 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Track your spending</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Spent', value: formatCurrency(summary?.total || 0), color: 'text-red-500' },
          { label: 'Budget', value: formatCurrency(summary?.budget || 0), color: 'text-blue-500' },
          { label: 'Remaining', value: formatCurrency(summary?.remaining || 0), color: summary?.remaining >= 0 ? 'text-green-500' : 'text-red-500' },
        ].map((item, idx) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card p-4 text-center">
            <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="card p-6 flex items-center justify-center">
          {summary?.byCategory?.length > 0 ? (
            <div className="w-48 h-48">
              <Doughnut data={chartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
            </div>
          ) : (
            <p className="text-dark-500">No expenses yet</p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold mb-4">By Category</h2>
          {summary?.byCategory?.length > 0 ? (
            <div className="space-y-3">
              {summary.byCategory.map((cat) => {
                const catInfo = EXPENSE_CATEGORIES.find(c => c.value === cat._id);
                const percentage = summary.total > 0 ? ((cat.total / summary.total) * 100).toFixed(1) : 0;
                return (
                  <div key={cat._id} className="flex items-center gap-4">
                    <span className="text-lg">{getCategoryIcon(cat._id)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{cat._id}</span>
                        <span>{formatCurrency(cat.total)} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-dark-500 text-center py-8">No categories yet</p>
          )}
        </div>
      </div>

      {/* Expense List */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">All Expenses</h2>
        {expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.map((expense, idx) => (
              <motion.div key={expense._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-700 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expense.description || expense.category}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{formatDate(expense.date)} · {expense.paidBy?.name || 'You'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{formatCurrency(expense.amount, expense.currency)}</span>
                  <button onClick={() => handleDelete(expense._id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-dark-500 text-center py-8">No expenses recorded yet</p>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" placeholder="What was this for?" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full">Add Expense</button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
