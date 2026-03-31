import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { CreateBill } from './pages/CreateBill';
import { BillDetail } from './pages/BillDetail';
import { PaymentCapture } from './pages/PaymentCapture';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateBill />} />
          <Route path="/bill/:id" element={<BillDetail />} />
          <Route path="/bill/:id/payments" element={<PaymentCapture />} />
          <Route path="*" element={<div className="p-8 text-center text-gray-400">404 - Page Not Found</div>} />
        </Routes>
      </main>

      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
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
