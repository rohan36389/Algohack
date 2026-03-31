import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { connectWallet, disconnectWallet, reconnectWallet, peraWallet } from '../utils/wallet';
import { ConnectWalletModal } from './ConnectWalletModal';
import { useWalletStore } from '../store/useWalletStore';

export const Navbar = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const setGlobalAddress = useWalletStore(state => state.setAddress);

  useEffect(() => {
    // Check if there is an active session
    reconnectWallet().then((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setGlobalAddress(accounts[0]);
      }
    });

    peraWallet.connector?.on("disconnect", () => {
      setAccount(null);
      setGlobalAddress(null);
    });
  }, [setGlobalAddress]);

  const handleConnect = async () => {
    const accounts = await connectWallet();
    if (accounts.length) {
      setAccount(accounts[0]);
      setGlobalAddress(accounts[0]);
      setIsModalOpen(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setAccount(null);
    setGlobalAddress(null);
  };

  const shortAddress = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-background font-black text-xl shadow-[0_0_15px_rgba(0,212,255,0.5)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.8)] transition-shadow">
              S
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">SplitChain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/create" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">New Bill</Link>

            {account ? (
              <div className="flex items-center gap-3">
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="flex w-2 h-2 bg-success rounded-full animate-pulse"></span>
                  <span className="text-sm font-mono text-gray-200">{shortAddress}</span>
                </div>
                <button onClick={handleDisconnect} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-error transition-colors" title="Disconnect">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 py-2 px-4 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                <Wallet size={16} /> Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-300 hover:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card border-b border-white/10 px-4 pt-2 pb-4 space-y-3 shadow-2xl">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Dashboard</Link>
            <Link to="/create" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">New Bill</Link>
            <div className="mt-4 pt-4 border-t border-white/10">
              {account ? (
                <div className="flex flex-col gap-3">
                  <div className="px-3 py-2 text-sm font-mono text-gray-400">Connected: {shortAddress}</div>
                  <button onClick={() => { handleDisconnect(); setIsMenuOpen(false); }} className="flex items-center w-full px-3 py-2 text-error hover:bg-error/10 rounded-md">
                    <LogOut size={16} className="mr-2" /> Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="w-full btn-primary flex items-center justify-center py-2 px-4">
                  <Wallet size={16} className="mr-2" /> Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-16 w-full" /> {/* Spacer */}

      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} />
    </>
  );
};
