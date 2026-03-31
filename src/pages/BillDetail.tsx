import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { QRCodeModal } from '../components/QRCodeModal';
import { MemberRow } from '../components/MemberRow';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowRight } from 'lucide-react';
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

  if (!bill) {
    return <div className="p-8 text-center text-gray-400">Bill not found</div>;
  }

  const isCreator = connectedAccount === bill.creator;
  const isSettleable = isCreator && bill.status !== 'settled' && bill.members.every(m => m.status === 'paid');

  const updateMemberPayment = useBillStore(state => state.updateMemberPayment);

  useEffect(() => {
    if (!bill) return;

    // We only need to check if there are pending members
    const hasPending = bill.members.some(m => m.status !== 'paid');
    if (!hasPending) return;

    let intervalId: ReturnType<typeof setInterval>;
    
    const checkOnChainPayments = async () => {
      try {
        // Query by general prefix to avoid Pera Wallet's %3A url-encoding quirks
        const data = await getTransactionsByPrefix(bill.creator, `pay_share`);
        if (data && data.transactions) {
          data.transactions.forEach((tx: any) => {
            const sender = tx.sender;
            const txId = tx.id;
            
            if (!tx.note) return;
            const noteStr = atob(tx.note);
            
            // Check if it belongs to this bill (handles both ":" and "%3A")
            if (noteStr.includes(bill.id)) {
              const member = bill.members.find(m => m.address === sender);
              if (member && member.status !== 'paid') {
                updateMemberPayment(bill.id, sender, txId);
                toast.success(`Payment picked up from ${sender.substring(0, 6)}!`);
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to query indexer", err);
      }
    };

    // Check immediately then poll every 5s
    checkOnChainPayments();
    intervalId = setInterval(checkOnChainPayments, 5000);

    return () => clearInterval(intervalId);
  }, [bill, updateMemberPayment]);

  const handleRequestPayment = (amount: number) => {
    // algorand://[member_address]?amount=[share]&note=pay_share:[bill_id]
    const note = encodeURIComponent(`pay_share:${bill.id}`);
    const url = `algorand://${bill.creator}?amount=${amount}&note=${note}`;
    setQrDataUrl(url);
    setIsQrOpen(true);
  };

  const handleMarkSettled = () => {
    // Ideally this calls `mark_settled()` on chain.
    updateBillStatus(bill.id, 'settled', 'mock-settled-tx-id');
    toast.success("Bill marked as settled!");
  };

  const displayTotal = `${microAlgosToAlgos(bill.totalAmount)} ALGO`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{bill.title}</h1>
            <StatusBadge status={bill.status} />
          </div>
          <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
            {displayTotal}
          </div>
          <div className="mt-2 text-sm text-gray-400 font-mono">
             Creator: {bill.creator.substring(0, 10)}...{bill.creator.substring(bill.creator.length - 4)}
          </div>
        </div>

        {isSettleable && (
          <button onClick={handleMarkSettled} className="btn-primary animate-pulse shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            Mark as Settled On-Chain
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="p-4 sm:p-6 border-b border-white/5 flex gap-4 bg-white/5 justify-between">
            <h2 className="text-lg font-bold">Members & Shares</h2>
            <Link to={`/bill/${bill.id}/payments`} className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                 Go to Payment Capture <ArrowRight size={16} />
            </Link>
        </div>
        
        <div className="divide-y divide-white/5 p-4 sm:p-6 space-y-4">
          {bill.members.map(member => (
            <MemberRow
              key={member.address}
              member={member}
              isCreator={isCreator}
              isConnectUser={member.address === connectedAccount}
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
