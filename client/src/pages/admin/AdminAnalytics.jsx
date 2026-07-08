import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMap, FiDollarSign } from 'react-icons/fi';
import { BsSuitcase2 } from 'react-icons/bs';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data.data);
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading || !data) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  }

  const overviewCards = [
    { label: 'Total Users', value: data.overview?.totalUsers || 0, icon: FiUsers, color: 'text-blue-500' },
    { label: 'Total Trips', value: data.overview?.totalTrips || 0, icon: BsSuitcase2, color: 'text-purple-500' },
    { label: 'Total Expenses', value: formatCurrency(data.overview?.totalExpenses || 0), icon: FiDollarSign, color: 'text-green-500' },
  ];

  const usersChartData = {
    labels: data.usersByMonth?.map(u => u._id) || [],
    datasets: [{ label: 'New Users', data: data.usersByMonth?.map(u => u.count) || [], backgroundColor: '#3b82f6', borderRadius: 8 }],
  };

  const expenseChartData = {
    labels: data.expensesByCategory?.map(e => e._id) || [],
    datasets: [{ data: data.expensesByCategory?.map(e => e.total) || [], backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#f97316', '#6b7280'], borderWidth: 0 }],
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card p-6">
              <div className="flex items-center gap-4">
                <Icon className={`w-8 h-8 ${card.color}`} />
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-dark-500">{card.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">User Registrations (Monthly)</h2>
          {data.usersByMonth?.length > 0 ? (
            <div className="h-64">
              <Bar data={usersChartData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
              }} />
            </div>
          ) : <p className="text-dark-500 text-center py-8">No data</p>}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">Expenses by Category</h2>
          {data.expensesByCategory?.length > 0 ? (
            <div className="flex items-center justify-center h-64">
              <Doughnut data={expenseChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
            </div>
          ) : <p className="text-dark-500 text-center py-8">No data</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
