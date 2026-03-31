import React from 'react';
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const TxProofBadge: React.FC<{ txId: string }> = ({ txId }) => {
  const shortTx = `${txId.substring(0, 6)}...${txId.substring(txId.length - 6)}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(txId);
    toast.success("Transaction ID copied!");
  };

  return (
    <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-1.5 w-fit">
      <CheckCircle2 size={14} className="text-success" />
      <span className="text-xs text-success font-mono">{shortTx}</span>
      <button onClick={handleCopy} className="p-1 hover:bg-success/20 rounded text-success transition-colors" title="Copy">
        <Copy size={12} />
      </button>
      <a 
        href={`https://testnet.algoexplorer.io/tx/${txId}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-1 hover:bg-success/20 rounded text-success transition-colors"
        title="View on Explorer"
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
};
