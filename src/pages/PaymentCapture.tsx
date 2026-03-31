import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { peraWallet } from '../utils/wallet';
import { getAlgodClient } from '../utils/algorand';
import { waitForConfirmation } from '../utils/algonode';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TxProofBadge } from '../components/TxProofBadge';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import algosdk from 'algosdk';
import toast from 'react-hot-toast';

export const PaymentCapture = () => {
  const { id } = useParams<{ id: string }>();
  const bill = useBillStore(state => state.bills.find(b => b.id === id));
  const updateMemberPayment = useBillStore(state => state.updateMemberPayment);
  const connectedAccount = useWalletStore(state => state.address);

  const [isPaying, setIsPaying] = useState(false);
  const [pollingTxId, setPollingTxId] = useState<string | null>(null);

  const member = bill?.members.find(m => m.address === connectedAccount);
  const isPaid = member?.status === 'paid';

  useEffect(() => {
    if (pollingTxId) {
      const poll = async () => {
        try {
          const confirmation = await waitForConfirmation(pollingTxId, 10);
          if (confirmation) {
            updateMemberPayment(bill!.id, connectedAccount!, pollingTxId);
            toast.success("Payment confirmed on-chain!");
            setPollingTxId(null);
          }
        } catch (e: any) {
          toast.error("Error confirming payment: " + e.message);
          setPollingTxId(null);
        }
      };
      poll();
    }
  }, [pollingTxId, bill, connectedAccount, updateMemberPayment]);

  if (!bill || !member) {
    return <div className="p-8 text-center text-gray-400">You are not a member of this bill or bill not found.</div>;
  }

  const handlePayShare = async () => {
    if (!connectedAccount) return toast.error("Connect wallet first");

    setIsPaying(true);
    try {
      const algodClient = getAlgodClient();
      const params = await algodClient.getTransactionParams().do();

      const paymentAmount = member.shareAmount; // ALGO/ASA amount required

      const noteParam = new TextEncoder().encode(`pay_share:${bill.id}`);

      const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: connectedAccount,
        receiver: bill.creator,
        amount: paymentAmount,
        note: noteParam,
        suggestedParams: params,
      });

      const txnsToSign = [
        { txn: ptxn, signers: [connectedAccount] }
      ];

      const signedTxns = await peraWallet.signTransaction([txnsToSign]);
      const sendRes = await algodClient.sendRawTransaction(signedTxns).do() as any;
      const txId = sendRes.txid || sendRes.txId;

      toast.success("Transaction sent! Waiting for confirmation...");
      setPollingTxId(txId);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Payment transaction failed");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 animate-in slide-in-from-bottom-8 duration-500">
      <Link to={`/bill/${bill.id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Bill
      </Link>

      <div className="glass-card shadow-2xl shadow-accent/10 border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-secondary"></div>

        <div className="p-8 text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-2">Pay Your Share</h1>
          <p className="text-gray-400 mb-8 max-w-sm">
            {bill.title} was created by {bill.creator.substring(0, 6)}...{bill.creator.substring(bill.creator.length - 4)}
          </p>

          <div className="w-full bg-background rounded-2xl p-6 border border-white/5 mb-8">
            <div className="text-sm text-gray-400 font-medium mb-1">Amount Due</div>
            <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              {member.shareAmount / 1e6} ALGO
            </div>
            {isPaid && (
              <div className="inline-flex items-center gap-1.5 text-success bg-success/10 px-3 py-1 rounded-full text-sm font-bold mt-2">
                <CheckCircle2 size={16} /> PAID
              </div>
            )}
          </div>

          {!isPaid ? (
            <button
              onClick={handlePayShare}
              disabled={isPaying || !!pollingTxId}
              className="w-full btn-primary py-4 text-lg font-bold shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
            >
              {isPaying ? "Signing..." : pollingTxId ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size={18} /> Verifying...</span> : "Pay Now"}
            </button>
          ) : (
            <div className="w-full flex justify-center">
              <TxProofBadge txId={member.paymentTxId || "error-no-txid"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
