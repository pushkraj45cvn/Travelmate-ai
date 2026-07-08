import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Navbar from '../components/common/Navbar';
import { useState } from 'react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} isAdmin />
        <main className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
