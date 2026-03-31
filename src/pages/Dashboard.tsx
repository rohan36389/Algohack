import React, { useState } from 'react';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { BillCard } from '../components/BillCard';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';

type FilterType = 'all' | 'active' | 'settled' | 'created';
type SortType = 'date' | 'amount' | 'status';

export const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('date');

  const connectedAccount = useWalletStore(state => state.address) || '';
  const getBillsByUser = useBillStore(state => state.getBillsByUser);
  const userBills = getBillsByUser(connectedAccount);

  // Filter bills
  const filteredBills = userBills.filter(bill => {
    if (activeFilter === 'active') return bill.status !== 'settled';
    if (activeFilter === 'settled') return bill.status === 'settled';
    if (activeFilter === 'created') return bill.creator === connectedAccount;
    return true; // 'all'
  });

  // Sort bills
  const sortedBills = [...filteredBills].sort((a, b) => {
    if (activeSort === 'date') return b.createdAt - a.createdAt;
    if (activeSort === 'amount') return b.totalAmount - a.totalAmount;
    if (activeSort === 'status') {
      const statusWeight = { active: 1, partial: 2, settled: 3 };
      return statusWeight[a.status] - statusWeight[b.status];
    }
    return 0;
  });

  if (!connectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(123,47,190,0.4)]">
          <span className="text-4xl font-black text-background">S</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to SplitChain</h1>
        <p className="text-gray-400 max-w-lg mb-8 text-lg">
          Decentralized bill settlement. Create groups, split expenses, and settle instantly on the Algorand blockchain.
        </p>
        <p className="text-warning font-medium">Please connect your Pera Wallet to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Your Bills</h1>
          <p className="text-gray-400">Manage and track your shared expenses</p>
        </div>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Bill
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >All</button>
          <button 
            onClick={() => setActiveFilter('active')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'active' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >Active</button>
          <button 
            onClick={() => setActiveFilter('settled')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'settled' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >Settled</button>
          <button 
            onClick={() => setActiveFilter('created')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'created' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >Created by me</button>
        </div>

        <div className="flex items-center gap-3 md:ml-auto bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortType)}
          >
            <option value="date" className="bg-card">Sort by Date</option>
            <option value="amount" className="bg-card">Sort by Amount</option>
            <option value="status" className="bg-card">Sort by Status</option>
          </select>
        </div>
      </div>

      {sortedBills.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <h3 className="text-xl font-bold mb-2">No bills found</h3>
          <p className="text-gray-400 mb-6">You don't have any bills matching this filter.</p>
          <Link to="/create" className="btn-secondary inline-flex items-center gap-2">
            <Plus size={18} /> Create Your First Bill
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBills.map(bill => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  );
};
