import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PrescriberSidebar from '../components/prescriber/PrescriberSidebar';

// ── Real page imports ─────────────────────────────────────────
import PrescriberDashboard from './Prescriberdashboard';
import PrescriberCommission from './PrescriberCommission';
import MediaManager from '../components/MediaManager';
import FooterSetting from './FooterSettings';
import PrescriberOrders from './Prescriberorders';
import PrescriberStock from './Prescriberstock';
import PrescriberPatient from './Prescriberpatients';
import PrescriberPrescriptions from './PrescriberPrescriptions';
import PrescriberAlerts from './PrescriberAlerts';
import PrescriberSettings from './PrescriberSettings';
import PrescriberOnePort from './PrescriberOnePort';
import PrescriberPosts from '../components/PrescriberPosts';
import ContactSetting from './ContactSetting';
import PrescriberData from './PrescriberData';
import PrescriptionDetail from '../components/prescriber/PrescriptionDetail'; // 👈 ADD THIS

// ── Updated placeholder to fit the strict white & slate-600 setup ───────────────────────
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-white">
    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🚧</div>
    <h2 className="text-xl font-medium text-slate-800">{title}</h2>
    <p className="text-sm text-slate-600">This section is under construction</p>
  </div>
);

// ── Page renderer — keys must match sidebar navItems keys exactly ──
const renderPage = (activePage, prescriptionId) => {
  // If we have a prescriptionId, show the detail view
  if (activePage === 'prescriptions' && prescriptionId) {
    return <PrescriptionDetail />;
  }

  switch (activePage) {
    case 'dashboard':       return <PrescriberDashboard />;
    case 'media-manager':   return <MediaManager />;
    case 'oneport':         return <PrescriberOnePort/>;
    case 'orders':          return <PrescriberOrders />;
    case 'stock':           return <PrescriberStock/>;
    case 'patients':        return <PrescriberPatient />;
    case 'prescriptions':   return <PrescriberPrescriptions />;
    case 'commission':      return <PrescriberCommission/>;
    case 'alerts':          return <PrescriberAlerts/>;
    case 'settings':        return <PrescriberSettings />;
    case 'footer-settings': return <FooterSetting />;
    case 'posts':           return <PrescriberPosts />;
    case 'contact-setting': return <ContactSetting />;
    case 'data':            return <PrescriberData />;
    default:                return <PrescriberDashboard />;
  }
};

const PrescriberLayout = () => {
  const [searchParams] = useSearchParams();
  const [activePage, setActivePage] = useState(() => searchParams.get('page') || 'dashboard');
  const [prescriptionId, setPrescriptionId] = useState(() => searchParams.get('prescriptionId') || null);

  useEffect(() => {
    const page = searchParams.get('page') || 'dashboard';
    const id = searchParams.get('prescriptionId') || null;
    setActivePage(page);
    setPrescriptionId(id);
  }, [searchParams]);

  // Function to navigate to prescription detail
  const navigateToPrescription = (id) => {
    setPrescriptionId(id);
    // Update URL with search params
    const newUrl = `/dashboard?page=prescriptions&prescriptionId=${id}`;
    window.history.pushState({}, '', newUrl);
  };

  // Function to go back to prescriptions list
  const goBackToPrescriptions = () => {
    setPrescriptionId(null);
    const newUrl = `/dashboard?page=prescriptions`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-600">
      <PrescriberSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto bg-white">
        {renderPage(activePage, prescriptionId)}
      </main>
    </div>
  );
};

export default PrescriberLayout;