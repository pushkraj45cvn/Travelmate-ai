import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { lazy, Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trips = lazy(() => import('./pages/Trips'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));
const EditTrip = lazy(() => import('./pages/EditTrip'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Packing = lazy(() => import('./pages/Packing'));
const Chat = lazy(() => import('./pages/Chat'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Documents = lazy(() => import('./pages/Documents'));
const Destinations = lazy(() => import('./pages/Destinations'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Invitations = lazy(() => import('./pages/Invitations'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTrips = lazy(() => import('./pages/admin/AdminTrips'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthLayout />}
        >
          <Route index element={<Navigate to="/auth/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/new" element={<CreateTrip />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/trips/:id/edit" element={<EditTrip />} />
          <Route path="/trips/:id/itinerary" element={<Itinerary />} />
          <Route path="/trips/:id/expenses" element={<Expenses />} />
          <Route path="/trips/:id/packing" element={<Packing />} />
          <Route path="/trips/:id/chat" element={<Chat />} />
          <Route path="/trips/:id/gallery" element={<Gallery />} />
          <Route path="/trips/:id/documents" element={<Documents />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/invitations" element={<Invitations />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/trips" element={<AdminTrips />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
