import type { Member } from '../types';
import { StatusBadge } from './StatusBadge';
import { TxProofBadge } from './TxProofBadge';
import { QrCode, CreditCard } from 'lucide-react';
import { microAlgosToAlgos } from '../utils/algorand';

interface MemberRowProps {
  member: Member;
  isCreator: boolean;
  isConnectUser: boolean;
  index: number;
  onRequestPayment?: () => void;
  onPayShare?: () => void;
}

// Helper to generate a consistent color gradient based on address string
const getAvatarGradient = (address: string) => {
  const sum = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = sum % 360;
  const hue2 = (sum * 2) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 40%))`;
};

export const MemberRow: React.FC<MemberRowProps> = ({
  member,
  isCreator,
  isConnectUser,
  index,
  onRequestPayment,
  onPayShare
}) => {
  const shortAddress = `${member.address.substring(0, 6)}...${member.address.substring(member.address.length - 4)}`;
  const displayAmount = microAlgosToAlgos(member.shareAmount);
  const avatarStyle = { background: getAvatarGradient(member.address) };

  return (
    <div 
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 rounded-xl border border-transparent hover:border-l-2 hover:border-l-accent hover:bg-white/10 transition-all duration-300 gap-4 group animate-slide-up opacity-0"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-4">
        {/* Mock Avatar */}
        <div className="w-12 h-12 rounded-full shadow-lg group-hover:scale-110 transition-transform shrink-0 border-2 border-background" style={avatarStyle} />
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-white">{shortAddress}</span>
            {isConnectUser && <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-pill border border-accent/20">You</span>}
          </div>
          <div className="text-xl font-bold text-white flex items-baseline gap-1">
             {displayAmount} <span className="text-xs font-medium text-textSecondary uppercase">ALGO</span>
          </div>
          {member.paymentTxId && <TxProofBadge txId={member.paymentTxId} />}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <StatusBadge status={member.status} />

        {member.status !== 'paid' && (
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {isCreator && !isConnectUser && (
              <button
                onClick={onRequestPayment}
                className="flex flex-1 sm:flex-auto items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-pill transition-all"
              >
                <QrCode size={14} /> Request
              </button>
            )}

            {isConnectUser && (
              <button
                onClick={onPayShare}
                className="btn-primary flex flex-1 sm:flex-auto items-center justify-center gap-1.5 px-5 py-2 text-sm shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-glow-accent"
              >
                <CreditCard size={14} /> Pay Share
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
