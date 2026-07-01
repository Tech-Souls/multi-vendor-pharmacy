import { useState, useEffect } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// ── Admin Components ───────────────────────────────────────────
import Sidebar from './components/Sidebar';
import HomeHeader from './pages/HomeHeader';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Orders from './components/Orders';
import Prescriptions from './components/Prescriptions';
import Products from './components/Products';
import Customers from './components/Customers';
import Onepot from './components/Onepot';
import Invoices from './components/Invoices';
import Commission from './components/Commission';
import StockAllocation from './components/StockAllocation';
import Setting from './components/Setting';
import SliderManager from './components/SliderManager';

// ── Pages ──────────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import TrendPro from './pages/TrendPro';
import CartPage from './pages/CartPage';
import ProductDetails from './pages/ProductDetails';
import PrescriptionForm from './pages/Prescription-form';
import PrescriberLink from './pages/PrescriberLink';
import PrescriptionDetailed from './pages/PrescriptionDetialed';
import HowItWorks from './pages/HowItWorks';
import AboutUs from './pages/About';
import ContactUs from './pages/Contact';

import './App.css';


// ── Header wrapper ─────────────────────────────────────────────
// Only hides on /admin — prescriber now has its own separate app
const HeaderWrapper = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin');
  return !isDashboard ? <HomeHeader /> : null;
};

// ── Admin Dashboard layout ─────────────────────────────────────
const DashboardLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const location = useLocation();

  const pages = {
    dashboard:     <Dashboard />,
    analytics:     <Analytics />,
    orders:        <Orders />,
    prescriptions: <Prescriptions />,
    products:      <Products />,
    customers:     <Customers />,
    onepot:      <Onepot/>,
    stock:         <StockAllocation />,
    invoices:      <Invoices />,
    commission:    <Commission />,
    settings:      <Setting />,
    sliders:       <SliderManager />, // 💡 FIX: Updated key from 'slider' to 'sliders' to match the sidebar component state ID mapping
    livesite:      <div className="p-8"><h1 className="text-2xl font-semibold">Live Site</h1></div>,
  };

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'admin' && pages[path]) {
      setActivePage(path);
    }
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto">{pages[activePage]}</main>
    </div>
  );
};

// ── Route guards ───────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/home" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

// ── App ────────────────────────────────────────────────────────
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <HeaderWrapper />

          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* ── Public Routes ── */}
            <Route path="/home"                   element={<Home />} />
            <Route path="/medicine/:id"           element={<ProductDetails />} />
            <Route path="/product/:id"            element={<ProductDetails />} />
            <Route path="/trendpro"               element={<TrendPro />} />
            <Route path="/login"                  element={<Login />} />
            <Route path="/register"               element={<Register />} />
            <Route path="/forgot-password"        element={<ForgotPassword />} />
            <Route path="/reset-password/:token"  element={<ResetPassword />} />
            <Route path="/how-it-works"           element={<HowItWorks />} />
            <Route path="/about"                  element={<AboutUs />} />
            <Route path="/contact"                element={<ContactUs />} />

            {/* ── Cart ── */}
            <Route path="/cart" element={
              <UserRoute><CartPage /></UserRoute>
            } />

            {/* ── Prescription routes ── */}
            <Route path="/" element={
              <UserRoute><PrescriptionDetailed /></UserRoute>
            }>
              <Route
                path="prescriptionDetialed"
                element={<Navigate to="/prescription-form" replace />}
              />
              <Route path="prescription-form"     element={<PrescriptionForm />} />
              <Route path="prescriberLink"        element={<PrescriberLink />} />
              
            </Route>

            {/* ── Admin Routes ── */}
            <Route path="/admin/*" element={
              <AdminRoute><DashboardLayout /></AdminRoute>
            } />

            {/* ── Catch All ── */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;