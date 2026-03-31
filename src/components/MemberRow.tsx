import type { Member } from '../types';
import { StatusBadge } from './StatusBadge';
import { TxProofBadge } from './TxProofBadge';
import { QrCode, CreditCard } from 'lucide-react';
import { microAlgosToAlgos } from '../utils/algorand';

interface MemberRowProps {
  member: Member;
  isCreator: boolean;
  isConnectUser: boolean;
  onRequestPayment?: () => void;
  onPayShare?: () => void;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  member,
  isCreator,
  isConnectUser,
  onRequestPayment,
  onPayShare
}) => {
  const shortAddress = `${member.address.substring(0, 8)}...${member.address.substring(member.address.length - 8)}`;

  const displayAmount = `${microAlgosToAlgos(member.shareAmount)} ALGO`;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 rounded-xl border border-white/5 gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-gray-300">{shortAddress}</span>
          {isConnectUser && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">You</span>}
        </div>
        <div className="text-xl font-bold">{displayAmount}</div>
        {member.paymentTxId && <TxProofBadge txId={member.paymentTxId} />}
      </div>

      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        <StatusBadge status={member.status} />

        {member.status !== 'paid' && (
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {isCreator && !isConnectUser && (
              <button
                onClick={onRequestPayment}
                className="flex flex-1 sm:flex-auto items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <QrCode size={14} /> Request
              </button>
            )}

            {isConnectUser && (
              <button
                onClick={onPayShare}
                className="flex flex-1 sm:flex-auto items-center justify-center gap-1.5 px-4 py-1.5 text-sm bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg transition-colors shadow-lg shadow-accent/20"
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
