import type { Bill } from '../types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { microAlgosToAlgos } from '../utils/algorand';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface BillCardProps {
  bill: Bill;
  index: number;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, index }) => {
  const displayAmount = microAlgosToAlgos(bill.totalAmount);

  const paidMembers = bill.members.filter(m => m.status === 'paid').length;
  const totalMembers = bill.members.length;

  const createdDate = new Date(bill.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link 
      to={`/bill/${bill.id}`} 
      className="block group animate-slide-up"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <div className="glass-card p-6 flex flex-col h-full relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent/30 group-hover:shadow-[0_8px_32px_rgba(0,212,255,0.15)]">
        {/* Top Row: Title & Badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors line-clamp-1 mr-4">
            {bill.title}
          </h3>
          <div className="shrink-0">
            <StatusBadge status={bill.status} />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <div className="text-3xl font-black bg-gradient-accent bg-clip-text text-transparent flex items-baseline gap-1">
            {displayAmount} <span className="text-sm font-semibold text-accent uppercase tracking-wider">ALGO</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium text-textSecondary mb-2">
            <span>Progress</span>
            <span>{paidMembers} / {totalMembers} Paid</span>
          </div>
          <ProgressBar current={paidMembers} total={totalMembers} />
        </div>

        {/* Bottom Row */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between z-10">
          <span className="text-sm font-medium text-textSecondary">{createdDate}</span>
          <div className="text-sm font-bold text-textSecondary group-hover:text-white flex items-center gap-1 transition-colors">
            View Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

