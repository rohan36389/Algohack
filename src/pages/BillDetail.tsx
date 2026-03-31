import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { QRCodeModal } from '../components/QRCodeModal';
import { MemberRow } from '../components/MemberRow';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowRight, Activity, Wallet } from 'lucide-react';
import { microAlgosToAlgos } from '../utils/algorand';
import { getTransactionsByPrefix } from '../utils/algonode';
import toast from 'react-hot-toast';

export const BillDetail = () => {
  const { id } = useParams<{ id: string }>();
  const bill = useBillStore(state => state.bills.find(b => b.id === id));
  const updateBillStatus = useBillStore(state => state.updateBillStatus);
  const connectedAccount = useWalletStore(state => state.address);

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    if (bill) {
      const paid = bill.members.filter(m => m.status === 'paid').length;
      const total = bill.members.length;
      // Trigger CSS animation slightly after mount
      setTimeout(() => setFillWidth((paid / total) * 100), 100);
    }
  }, [bill]);

  const isCreator = connectedAccount === bill?.creator;
  const isSettleable = isCreator && bill?.status !== 'settled' && bill?.members.every(m => m.status === 'paid');
  const updateMemberPayment = useBillStore(state => state.updateMemberPayment);

  useEffect(() => {
    if (!bill) return;

    const hasPending = bill.members.some(m => m.status !== 'paid');
    if (!hasPending) return;

    const checkOnChainPayments = async () => {
      try {
        const data = await getTransactionsByPrefix(bill.creator, `pay_share`);
        if (data && data.transactions) {
          data.transactions.forEach((tx: any) => {
            const sender = tx.sender;
            const txId = tx.id;
            
            if (!tx.note) return;
            const noteStr = atob(tx.note);
            
            if (noteStr.includes(bill.id)) {
              const member = bill.members.find(m => m.address === sender);
              if (member && member.status !== 'paid') {
                updateMemberPayment(bill.id, sender, txId);
                toast.success(`Payment confirmed from ${sender.substring(0, 6)}!`);
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to query indexer", err);
      }
    };

    checkOnChainPayments();
    const intervalId = setInterval(checkOnChainPayments, 5000);
    return () => clearInterval(intervalId);
  }, [bill, updateMemberPayment]);

  if (!bill) {
    return <div className="p-8 text-center text-textSecondary animate-fade-in">Bill not found</div>;
  }

  const handleRequestPayment = (amount: number) => {
    const note = encodeURIComponent(`pay_share:${bill.id}`);
    const url = `algorand://${bill.creator}?amount=${amount}&note=${note}`;
    setQrDataUrl(url);
    setIsQrOpen(true);
  };

  const handleMarkSettled = () => {
    updateBillStatus(bill.id, 'settled', 'mock-settled-tx-id');
    toast.success("Bill marked as settled on-chain!");
  };

  const displayTotal = microAlgosToAlgos(bill.totalAmount);
  const paidCount = bill.members.filter(m => m.status === 'paid').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-5xl font-extrabold text-white tracking-tight">{bill.title}</h1>
            <div className={`shrink-0 ${bill.status === 'settled' ? 'animate-pulse-glow rounded-pill' : ''}`}>
               <StatusBadge status={bill.status} />
            </div>
          </div>
          <div className="text-4xl font-black bg-gradient-accent bg-clip-text text-transparent flex items-baseline gap-2 mb-4">
            {displayTotal} <span className="text-lg font-bold text-accent uppercase tracking-widest">ALGO</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-pill text-sm font-mono text-textSecondary">
             <Wallet size={14} className="text-accent" />
             Creator: <span className="text-white">{bill.creator.substring(0, 8)}...{bill.creator.substring(bill.creator.length - 8)}</span>
          </div>
        </div>

        {isSettleable && (
          <button onClick={handleMarkSettled} className="btn-primary flex items-center gap-2 animate-bounce hover:animate-none">
            <Activity size={18} /> Mark as Settled On-Chain
          </button>
        )}
      </div>

      {/* PROGRESS SECTION */}
      <div className="mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex justify-between items-end mb-2">
            <h3 className="text-lg font-bold text-white">Settlement Progress</h3>
            <span className="text-sm font-bold text-accent">{paidCount} of {bill.members.length} paid</span>
        </div>
        <div className="h-4 w-full bg-white/5 rounded-pill overflow-hidden border border-white/5 shadow-inner">
            <div 
                className="h-full bg-gradient-to-r from-accent to-success transition-all duration-1000 ease-out shadow-glow-accent relative"
                style={{ width: `${fillWidth}%` }}
            >
               <div className="absolute inset-0 bg-white/20 w-full animate-shimmer" />
            </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* MEMBERS SECTION CTA */}
        <Link 
            to={`/bill/${bill.id}/payments`} 
            className="block p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-secondary/20 hover:from-accent/30 hover:to-secondary/30 transition-colors border-b border-white/10 flex justify-between items-center group cursor-pointer"
        >
            <div>
                <h2 className="text-lg font-bold text-white group-hover:text-accent transition-colors">Group Split Directory</h2>
                <p className="text-sm text-textSecondary mt-1">Manage individual payments and view transaction proofs</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-accent group-hover:text-background transition-all shadow-glow-accent">
                 <ArrowRight size={20} />
            </div>
        </Link>
        
        <div className="divide-y divide-white/5 p-4 sm:p-6 space-y-4">
          {bill.members.map((member, idx) => (
            <MemberRow
              key={member.address}
              member={member}
              isCreator={isCreator}
              isConnectUser={member.address === connectedAccount}
              index={idx}
              onRequestPayment={() => handleRequestPayment(member.shareAmount)}
              onPayShare={() => window.location.assign(`/bill/${bill.id}/payments`)}
            />
          ))}
        </div>
      </div>

      <QRCodeModal 
        isOpen={isQrOpen} 
        onClose={() => setIsQrOpen(false)} 
        dataUrl={qrDataUrl} 
      />
    </div>
  );
};
