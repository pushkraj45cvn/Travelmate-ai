import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMap, FiUserCheck, FiShield } from 'react-icons/fi';
import { BsSuitcase2 } from 'react-icons/bs';
import dashboardService from '../../services/dashboardService';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await dashboardService.getAdminDashboard();
        setData(result);
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading || !data) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  }

  const stats = [
    { label: 'Total Users', value: data.stats?.totalUsers || 0, icon: FiUsers, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Users', value: data.stats?.activeUsers || 0, icon: FiUserCheck, color: 'from-green-500 to-emerald-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Trips', value: data.stats?.totalTrips || 0, icon: BsSuitcase2, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Verified Users', value: data.stats?.verifiedUsers || 0, icon: FiShield, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  const statusChartData = {
    labels: data.tripsByStatus?.map(s => s._id) || [],
    datasets: [{ data: data.tripsByStatus?.map(s => s.count) || [], backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#6b7280'], borderWidth: 0 }],
  };

  const countryChartData = {
    labels: data.tripsByCountry?.map(c => c._id) || [],
    datasets: [{ label: 'Trips', data: data.tripsByCountry?.map(c => c.count) || [], backgroundColor: '#3b82f6' }],
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-dark-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">Trips by Status</h2>
          {data.tripsByStatus?.length > 0 ? (
            <div className="flex items-center justify-center h-64">
              <Doughnut data={statusChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
            </div>
          ) : <p className="text-dark-500 text-center py-8">No data</p>}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6">Trips by Country</h2>
          {data.tripsByCountry?.length > 0 ? (
            <div className="h-64">
              <Bar data={countryChartData} options={{
                responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, y: { grid: { display: false } } },
              }} />
            </div>
          ) : <p className="text-dark-500 text-center py-8">No data</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
