import React, { useEffect } from 'react';
import { Wallet, X } from 'lucide-react';
import { cn } from '../utils/classnames';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
  required?: boolean;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose, onConnect, required }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={required ? undefined : onClose} />
      
      <div className={cn(
        "relative glass-card w-full max-w-md p-6 overflow-hidden flex flex-col items-center text-center transform transition-all",
        "animate-in fade-in zoom-in-95 duration-200"
      )}>
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
        
        {!required && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}

        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 mt-2">
          <Wallet size={32} className="text-accent" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
        <p className="text-gray-400 mb-8 text-sm">
          {required ? "You need to connect your Pera Wallet to access this page." : "Connect to Algorand Testnet with Pera Wallet to continue."}
        </p>

        <button 
          onClick={async () => {
            try { await onConnect(); } catch(e) {}
          }}
          className="w-full flex items-center justify-center gap-3 bg-[#FFEA00] hover:bg-[#D4C300] text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,234,0,0.3)] hover:shadow-[0_0_30px_rgba(255,234,0,0.5)] active:scale-95"
        >
          <img src="https://perawallet.app/assets/images/favicon.ico" alt="Pera" className="w-5 h-5 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          Pera Wallet
        </button>
      </div>
    </div>
  );
};
