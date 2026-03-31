import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AlgoRain } from './components/AlgoRain';
import { Dashboard } from './pages/Dashboard';
import { CreateBill } from './pages/CreateBill';
import { BillDetail } from './pages/BillDetail';
import { PaymentCapture } from './pages/PaymentCapture';
import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen mesh-bg text-textPrimary selection:bg-accent selection:text-background flex flex-col">
      {/* Always-on ambient rain — z-index 0 */}
      <AlgoRain />

      {/* Real content sits above rain — z-index 1+ */}
      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
        
        <main className="flex-grow">
          <div key={location.pathname} className="animate-fade-in animate-slide-up h-full">
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateBill />} />
              <Route path="/bill/:id" element={<BillDetail />} />
              <Route path="/bill/:id/payments" element={<PaymentCapture />} />
              <Route path="*" element={<div className="p-8 text-center text-textSecondary">404 - Page Not Found</div>} />
            </Routes>
          </div>
        </main>
      </div>

      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#000000',
            border: '1px solid rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#00C896',
              secondary: '#1A1A2E',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF4757',
              secondary: '#1A1A2E',
            },
          },
        }} 
      />
    </div>
  );
}

export default App;
