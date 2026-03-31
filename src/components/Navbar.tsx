import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { connectWallet, disconnectWallet, reconnectWallet, peraWallet } from '../utils/wallet';
import { ConnectWalletModal } from './ConnectWalletModal';
import { useWalletStore } from '../store/useWalletStore';

export const Navbar = () => {
  const location = useLocation();
  const [account, setAccount] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const setGlobalAddress = useWalletStore(state => state.setAddress);

  useEffect(() => {
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

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'New Bill', path: '/create' },
  ];

  return (
    <>
      <nav 
        className="fixed top-0 w-full z-50 animate-slide-up"
        style={{ 
          backgroundColor: 'rgba(6, 6, 18, 0.75)', 
          backdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span 
              className="hidden sm:flex items-center gap-1 hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(90deg, #00D4FF, #7B2FBE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: '20px'
              }}
            >
              ⚡SplitChain
            </span>
            <span className="flex sm:hidden items-center gap-1 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent font-extrabold text-[20px]">
              ⚡
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      isActive 
                        ? 'text-white border-b-2 border-accent' 
                        : 'text-white/55 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {account ? (
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 px-4 py-1.5 cursor-default transition-all"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    borderRadius: '50px',
                    color: '#00D4FF',
                    fontFamily: 'monospace',
                    fontSize: '13px'
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full animate-pulse" 
                    style={{ background: '#00C896', boxShadow: '0 0 6px #00C896' }}
                  ></span>
                  <span>{shortAddress}</span>
                </div>
                <button onClick={handleDisconnect} className="p-2 ml-2 hover:bg-error/20 hover:text-error rounded-pill text-textSecondary transition-colors group" title="Disconnect">
                  <LogOut size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="relative rounded-pill p-[1.5px] bg-gradient-accent hover:shadow-glow-accent transition-all duration-300 hover:scale-105">
                <button onClick={() => setIsModalOpen(true)} className="bg-background hover:bg-transparent rounded-pill flex items-center gap-2 py-2 px-6 font-bold transition-colors h-full w-full">
                  <Wallet size={16} /> Connect Wallet
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-textSecondary hover:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card border-b border-white/5 px-4 pt-2 pb-6 space-y-3 shadow-glass animate-slide-up">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsMenuOpen(false)} 
                className={`block px-3 py-3 rounded-xl text-base font-semibold ${
                  location.pathname === link.path ? 'bg-accent/10 text-accent' : 'text-textSecondary hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-6 pt-6 border-t border-white/5">
              {account ? (
                <div className="flex flex-col gap-4">
                  <div className="px-3 py-3 rounded-xl bg-white/5 text-sm font-mono text-textSecondary text-center border border-white/5">
                    <span className="inline-block w-2 h-2 bg-success rounded-full mr-2"></span>
                    Connected: {shortAddress}
                  </div>
                  <button onClick={() => { handleDisconnect(); setIsMenuOpen(false); }} className="flex justify-center items-center w-full px-3 py-3 text-error hover:bg-error/10 bg-error/5 rounded-xl font-semibold">
                    <LogOut size={18} className="mr-2" /> Disconnect
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl p-[2px] bg-gradient-accent">
                  <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="w-full bg-background rounded-xl flex items-center justify-center py-3 px-4 font-bold">
                    <Wallet size={18} className="mr-2" /> Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-20 w-full" /> {/* Spacer matched to new navbar h-20 */}

      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} />
    </>
  );
};

