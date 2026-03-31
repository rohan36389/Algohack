import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { peraWallet } from '../utils/wallet';
import { getAlgodClient, algosToMicroAlgos, isValidAddress } from '../utils/algorand';
import algosdk from 'algosdk';
import toast from 'react-hot-toast';

export const CreateBill = () => {
  const navigate = useNavigate();
  const addBill = useBillStore(state => state.addBill);
  const connectedAccount = useWalletStore(state => state.address);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [amountInr, setAmountInr] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'percentage'>('equal');
  const [members, setMembers] = useState([{ address: '', share: 50 }, { address: '', share: 50 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversionRate, setConversionRate] = useState(8.07);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=inr')
      .then(r => r.json())
      .then(data => {
        if (data?.algorand?.inr) {
          setConversionRate(data.algorand.inr);
        }
      })
      .catch(console.error);
  }, []);

  // App ID from deployment. In a real hackathon, this would be an env var. 
  // Let's assume a hardcoded or configured App ID for the deployed smart contract.
  const APP_ID = 12345678; // Mock Testnet App ID

  if (!connectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(123,47,190,0.4)]">
          <span className="text-4xl font-black text-background">S</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to SplitChain</h1>
        <p className="text-gray-400 max-w-lg mb-8 text-lg">
          Decentralized bill settlement. Create groups, split expenses, and settle instantly on the Algorand blockchain.
        </p>
        <p className="text-warning font-medium">Please connect your Pera Wallet to create a new bill.</p>
      </div>
    );
  }

  const handleAddMember = () => {
    setMembers([...members, { address: '', share: 0 }]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length <= 2) return toast.error("A bill must have at least 2 members");
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, field: 'address' | 'share', value: string) => {
    const newMembers = [...members];
    if (field === 'share') {
        newMembers[idx].share = parseFloat(value) || 0;
    } else {
        newMembers[idx].address = value;
    }
    setMembers(newMembers);
  };

  const validateForm = () => {
    if (!title.trim() || !amount) {
      toast.error("Please fill all required fields");
      return false;
    }
    for (const member of members) {
      if (!isValidAddress(member.address)) {
        toast.error(`Invalid address: ${member.address}`);
        return false;
      }
    }
    if (splitType === 'percentage') {
      const totalPercentage = members.reduce((sum, m) => sum + m.share, 0);
      if (Math.abs(totalPercentage - 100) > 0.1) {
        toast.error("Percentages must sum to 100%");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAccount) return toast.error("Wallet not connected");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const algodClient = getAlgodClient();
      const params = await algodClient.getTransactionParams().do();
      
      const billId = `bill-${Date.now()}`;
      const totalAmountNum = parseFloat(amount);
      const totalMicroAmount = algosToMicroAlgos(totalAmountNum);

      // Smart Contract Call (create_bill)
      // Call create_bill(bill_id, total_amount, asset_id, member_count)
      const enc = new TextEncoder();
      // For MVP/Hackathon: If we don't have a real deployed APP_ID, we simulate the state
      // insertion by sending a 0 ALGO transaction to ourselves containing the payload in the note.
      const notePayload = enc.encode(`create_bill:${billId}`);
      
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: connectedAccount,
        receiver: connectedAccount,
        amount: 0,
        note: notePayload,
        suggestedParams: params,
      });

      const txns = [{ txn, signers: [connectedAccount] }];
      const signedTxnGroup = await peraWallet.signTransaction([txns]);
      const sendRes = await algodClient.sendRawTransaction(signedTxnGroup[0]).do() as any;
      const txId = sendRes.txid || sendRes.txId;
      
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Bill Created!</span>
          <a href={`https://lora.algonode.network/testnet/transaction/${txId}`} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline break-all">
            View on Lora Testnet
          </a>
        </div>,
        { duration: 5000 }
      );
      
      // Save locally
      const billMembers = members.map(m => {
        let shareAmt = 0;
        if (splitType === 'equal') {
            shareAmt = totalMicroAmount / members.length;
        } else {
            shareAmt = (totalMicroAmount * m.share) / 100;
        }
        return {
          address: m.address,
          share: splitType === 'equal' ? (100 / members.length) : m.share,
          shareAmount: Math.floor(shareAmt),
          status: m.address === connectedAccount ? 'paid' : 'pending' // Creator pays implicitly or will pay later? Usually pending for all until paid. Let's make everyone pending initially.
        } as const;
      });

      addBill({
        id: billId,
        title,
        totalAmount: totalMicroAmount,
        creator: connectedAccount,
        members: billMembers,
        splitType,
        status: 'active',
        createdAt: Date.now(),
        onChainAppId: APP_ID,
      });

      navigate(`/bill/${billId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [step, setStep] = useState(1);

  // Review step calculations

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">Create New Bill</h1>
        <p className="text-textSecondary text-lg">Initialize an on-chain smart contract settlement.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-accent rounded-full z-0 transition-all duration-500 shadow-glow-accent" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {['Details', 'Members', 'Review'].map((label, idx) => {
           const stepNum = idx + 1;
           const isActive = step >= stepNum;
           return (
             <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive ? 'bg-gradient-accent text-white shadow-glow-accent scale-110' : 'bg-card text-textSecondary border border-white/10'
                 }`}>
                     {stepNum}
                 </div>
                 <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-accent' : 'text-textSecondary'}`}>{label}</span>
             </div>
           );
        })}
      </div>

      <div className="relative overflow-hidden glass-card p-6 sm:p-10 mb-6 min-h-[400px]">
        <div className="transition-all duration-500 ease-in-out h-full flex flex-col justify-between" style={{ transform: `translateX(-${(step - 1) * 100}%)`, width: '100%', display: step === 1 ? 'block' : 'none' }}>
           <h2 className="text-2xl font-bold text-white mb-6">1. Bill Details</h2>
           <div className="space-y-6 flex-grow">
             <div>
               <label className="block text-sm font-semibold text-textSecondary mb-2 uppercase tracking-wide">Title</label>
               <input type="text" className="glass-input w-full text-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Goa Trip 🌴" required />
             </div>
             
             <div className="flex flex-col sm:flex-row gap-6">
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-textSecondary mb-2 uppercase tracking-wide">Amount (INR)</label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="text-accent font-bold">₹</span>
                   </div>
                   <input type="number" step="0.01" className="glass-input w-full font-mono pl-10 text-lg group-hover:border-accent/50" value={amountInr} onChange={e => {
                     const inr = e.target.value;
                     setAmountInr(inr);
                     if (inr) setAmount(String((parseFloat(inr) / conversionRate).toFixed(6)));
                     else setAmount('');
                   }} placeholder="0.00" />
                 </div>
               </div>
               
               <div className="flex items-center justify-center sm:pt-8 text-white/20">
                 <ArrowRight className="hidden sm:block rotate-0" size={24} />
                 <ArrowRight className="block sm:hidden rotate-90 my-2" size={24} />
               </div>

               <div className="flex-1">
                 <label className="block text-sm font-semibold text-textSecondary mb-2 uppercase tracking-wide">Amount (ALGO)</label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="text-accent font-bold text-sm">A</span>
                   </div>
                   <input type="number" step="0.000001" className="glass-input w-full font-mono pl-10 text-lg group-hover:border-accent/50" value={amount} onChange={e => {
                     const algo = e.target.value;
                     setAmount(algo);
                     if (algo) setAmountInr(String((parseFloat(algo) * conversionRate).toFixed(2)));
                     else setAmountInr('');
                   }} placeholder="0.0" required />
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mt-8 flex justify-end">
               <button type="button" onClick={() => {
                   if (!title.trim() || !amount) { toast.error("Title and Amount required"); return; }
                   setStep(2);
               }} className="btn-primary flex items-center gap-2">
                   Next Step <ArrowRight size={18} />
               </button>
           </div>
        </div>

        <div className="transition-all duration-500 ease-in-out h-full flex flex-col justify-between" style={{ display: step === 2 ? 'block' : 'none' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white">2. Add Members</h2>
            <div className="flex bg-white/5 border border-white/10 rounded-pill p-1">
              <button type="button" onClick={() => setSplitType('equal')} className={`px-5 py-2 rounded-pill text-sm font-bold transition-all ${splitType === 'equal' ? 'bg-gradient-accent text-white shadow-glow-accent' : 'text-textSecondary hover:text-white'}`}>Equal Split</button>
              <button type="button" onClick={() => setSplitType('percentage')} className={`px-5 py-2 rounded-pill text-sm font-bold transition-all ${splitType === 'percentage' ? 'bg-gradient-accent text-white shadow-glow-accent' : 'text-textSecondary hover:text-white'}`}>Percentage</button>
            </div>
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {members.map((member, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-accent/30 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-full sm:flex-1">
                  <label className="block text-xs font-semibold text-textSecondary mb-1 uppercase tracking-wider">Wallet Address</label>
                  <input type="text" className="glass-input w-full font-mono text-sm py-2.5" value={member.address} onChange={e => handleMemberChange(idx, 'address', e.target.value)} placeholder="Algo address..." required />
                </div>
                
                {splitType === 'percentage' && (
                  <div className="w-full sm:w-28 shrink-0">
                    <label className="block text-xs font-semibold text-textSecondary mb-1 uppercase tracking-wider">Share (%)</label>
                    <input type="number" min="0" max="100" step="0.1" className="glass-input w-full text-center py-2.5 font-bold text-accent" value={member.share} onChange={e => handleMemberChange(idx, 'share', e.target.value)} required={splitType === 'percentage'} />
                  </div>
                )}

                <button type="button" onClick={() => handleRemoveMember(idx)} className="p-3 text-textSecondary hover:text-error hover:bg-error/10 rounded-xl transition-colors mt-2 sm:mt-0" title="Remove">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddMember} className="mt-4 w-full flex items-center justify-center gap-2 text-accent hover:text-white hover:bg-accent/10 border border-dashed border-accent/30 rounded-xl text-sm font-bold transition-colors py-4">
               <Plus size={18} /> Add Another Member
            </button>
          </div>

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/10">
               <button type="button" onClick={() => setStep(1)} className="btn-ghost text-textSecondary hover:text-white">
                   Back
               </button>
               <button type="button" onClick={() => {
                   for (const m of members) if (!isValidAddress(m.address)) { toast.error("Invalid member address detected"); return; }
                   if (splitType === 'percentage' && Math.abs(members.reduce((a,b)=>a+b.share,0)-100) > 0.1) { toast.error("Percentages must sum to 100%"); return; }
                   setStep(3);
               }} className="btn-primary flex items-center gap-2">
                   Review <ArrowRight size={18} />
               </button>
          </div>
        </div>

        <div className="transition-all duration-500 ease-in-out h-full flex flex-col justify-between animate-fade-in" style={{ display: step === 3 ? 'block' : 'none' }}>
           <h2 className="text-2xl font-bold text-white mb-6">3. Review & Deploy</h2>
           
           <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                    <div className="text-sm text-textSecondary">Smart Contract Settlement</div>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-black bg-gradient-accent bg-clip-text text-transparent">{amount} ALGO</div>
                    <div className="text-sm font-medium text-textSecondary">~ ₹{amountInr}</div>
                 </div>
              </div>

              <div>
                  <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Split Breakdown ({splitType})</h4>
                  <div className="space-y-3">
                      {members.map((m, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                              <div className="font-mono text-textSecondary bg-background/50 px-2 py-1 rounded">{m.address.substring(0,8)}...{m.address.substring(m.address.length-4)}</div>
                              <div className="font-bold text-accent">
                                  {splitType === 'equal' 
                                      ? `${(amount ? parseFloat(amount) / members.length : 0).toFixed(4)} ALGO` 
                                      : `${m.share}%`}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
           </div>

           <div className="mt-auto flex justify-between items-center">
               <button type="button" onClick={() => setStep(2)} className="btn-ghost text-textSecondary hover:text-white">
                   Back
               </button>
               <button type="button" onClick={handleSubmit} disabled={isSubmitting || !connectedAccount} className="btn-primary py-3 px-8 text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.4)] animate-pulse hover:animate-none">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">Deploying... <span className="animate-spin text-xl">⏳</span></span>
                  ) : (
                    <>Deploy Bill 🚀</>
                  )}
               </button>
           </div>
        </div>

      </div>
    </div>
  );
};
