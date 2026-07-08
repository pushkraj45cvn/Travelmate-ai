import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowRight, FiCalendar, FiDollarSign, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';
import { BsSuitcase2, BsThreeDots } from 'react-icons/bs';
import dashboardService from '../services/dashboardService';
import Card from '../components/common/Card';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatCurrency, formatDate, getRelativeTime, getDaysBetween } from '../utils/formatters';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await dashboardService.getDashboard();
        setData(result);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const expenseChartData = {
    labels: data?.categoryBreakdown?.map(c => c._id) || [],
    datasets: [{
      data: data?.categoryBreakdown?.map(c => c.total) || [],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#06b6d4', '#f97316', '#6b7280'],
      borderWidth: 0,
    }],
  };

  const monthlyChartData = {
    labels: data?.monthlyExpenses?.map(m => m._id) || [],
    datasets: [{
      label: 'Monthly Expenses',
      data: data?.monthlyExpenses?.map(m => m.total) || [],
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4,
    }],
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Your travel overview</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> New Trip
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Trips', value: stats.totalTrips || 0, icon: BsSuitcase2, color: 'from-primary-500 to-blue-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
          { label: 'Completed', value: stats.completedTrips || 0, icon: FiCheckSquare, color: 'from-green-500 to-emerald-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Total Budget', value: formatCurrency(stats.totalBudget), icon: FiDollarSign, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: 'Packing Progress', value: `${stats.packingProgress || 0}%`, icon: FiTrendingUp, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Trips */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Upcoming Trips</h2>
            <Link to="/trips" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data?.upcomingTrips?.length > 0 ? (
            <div className="space-y-4">
              {data.upcomingTrips.map((trip) => (
                <Link key={trip._id} to={`/trips/${trip._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center text-xl">
                    {trip.destination?.charAt(0) || '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{trip.title}</p>
                    <p className="text-xs text-dark-500">{trip.destination} · {getDaysBetween(trip.startDate, trip.endDate)} days</p>
                  </div>
                  <span className="text-xs text-dark-400">{formatDate(trip.startDate)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-dark-500 mb-4">No upcoming trips</p>
              <Link to="/trips/new" className="btn-primary text-sm">Plan a Trip</Link>
            </div>
          )}
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">Expense Breakdown</h2>
          {data?.categoryBreakdown?.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                <Doughnut data={expenseChartData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
              </div>
              <div className="flex-1 space-y-2">
                {data.categoryBreakdown.slice(0, 5).map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between text-sm">
                    <span className="text-dark-600 dark:text-dark-400 capitalize">{cat._id}</span>
                    <span className="font-medium">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-dark-500 text-center py-8">No expenses yet</p>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <Card>
          <h2 className="text-lg font-semibold mb-6">Monthly Spending</h2>
          {data?.monthlyExpenses?.length > 0 ? (
            <div className="h-64">
              <Line data={monthlyChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
              }} />
            </div>
          ) : (
            <p className="text-dark-500 text-center py-8">No data yet</p>
          )}
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <FiCalendar className="w-5 h-5 text-dark-400" />
          </div>
          {data?.upcomingEvents?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingEvents.map((event) => (
                <div key={event._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary-500">{new Date(event.startDate).getDate()}</p>
                    <p className="text-xs text-dark-500">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-dark-500">{event.destination}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-center py-8">No upcoming events</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
