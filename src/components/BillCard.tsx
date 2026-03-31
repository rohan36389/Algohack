import type { Bill } from '../types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { microAlgosToAlgos } from '../utils/algorand';
import { Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BillCardProps {
  bill: Bill;
}

export const BillCard: React.FC<BillCardProps> = ({ bill }) => {
  const displayAmount = `${microAlgosToAlgos(bill.totalAmount)} ALGO`;

  const paidMembers = bill.members.filter(m => m.status === 'paid').length;
  const totalMembers = bill.members.length;

  const createdDate = new Date(bill.createdAt).toLocaleDateString();

  return (
    <Link to={`/bill/${bill.id}`} className="block group">
      <div className="glass-card hover:border-accent/30 transition-all duration-300 p-5 flex flex-col gap-4 h-full relative overflow-hidden">
        {/* Decorative background glow on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/0 to-secondary/0 opacity-0 group-hover:opacity-100 group-hover:from-accent/10 group-hover:to-secondary/10 transition-opacity duration-500 rounded-2xl blur"></div>

        <div className="flex justify-between items-start z-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent transition-colors">{bill.title}</h3>
            <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
              {displayAmount}
            </div>
          </div>
          <StatusBadge status={bill.status} />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 z-10">
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{paidMembers} / {totalMembers} paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{createdDate}</span>
          </div>
        </div>

        <div className="mt-auto z-10 pt-2">
          <ProgressBar current={paidMembers} total={totalMembers} />
        </div>
      </div>
    </Link>
  );
};
