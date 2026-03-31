import { useState } from 'react';
import { useBillStore } from '../store/useBillStore';
import { useWalletStore } from '../store/useWalletStore';
import { BillCard } from '../components/BillCard';
import { Link } from 'react-router-dom';
import { Plus, Receipt, CheckCircle, Clock, Rocket } from 'lucide-react';
import { microAlgosToAlgos } from '../utils/algorand';

type FilterType = 'all' | 'active' | 'settled' | 'created';
type SortType = 'date' | 'amount' | 'status';

export const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('date');

  const connectedAccount = useWalletStore(state => state.address) || '';
  const getBillsByUser = useBillStore(state => state.getBillsByUser);
  const userBills = getBillsByUser(connectedAccount);

  // Stats calculation
  const totalBillsCount = userBills.length;
  const settledCount = userBills.filter(b => b.status === 'settled').length;
  const outstandingMicroAmount = userBills
    .filter(b => b.status !== 'settled')
    .reduce((acc, bill) => {
        // Find how much the connected user owes
        const userShare = bill.members.find(m => m.address === connectedAccount);
        if (userShare && userShare.status !== 'paid') {
           return acc + userShare.shareAmount;
        }
        return acc;
    }, 0);

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
      return (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
    }
    return 0;
  });

  if (!connectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.4)]">
          <span className="text-4xl font-black text-white">⚡</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">Welcome to SplitChain</h1>
        <p className="text-textSecondary max-w-lg mb-8 text-lg">
          Decentralized bill settlement. Create groups, split expenses, and settle instantly on the Algorand blockchain.
        </p>
        <p className="text-warning font-medium">Please connect your Pera Wallet to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dashboard-content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#FFFFFF',
              background: 'linear-gradient(90deg, #fff 60%, rgba(0,212,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Your Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
            Manage and track your shared expenses
          </p>
        </div>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Bill
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <div 
          className="glass-card flex items-center justify-between"
          style={{ 
            borderTop: '2px solid #00D4FF',
            animationDelay: '0ms'
          }}
        >
            <div>
                <p style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>TOTAL BILLS</p>
                <div style={{ fontSize: '42px', fontWeight: 800, color: '#FFFFFF' }}>{totalBillsCount}</div>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.1)', borderRadius: '12px', padding: '12px', color: '#00D4FF' }}>
                <Receipt size={24} />
            </div>
        </div>
        
        {/* Card 2 */}
        <div 
          className="glass-card flex items-center justify-between"
          style={{ 
            borderTop: '2px solid #00C896',
            animationDelay: '80ms'
          }}
        >
            <div>
                <p style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>SETTLED</p>
                <div style={{ fontSize: '42px', fontWeight: 800, color: '#00C896' }}>{settledCount}</div>
            </div>
            <div style={{ background: 'rgba(0,200,150,0.1)', borderRadius: '12px', padding: '12px', color: '#00C896' }}>
                <CheckCircle size={24} />
            </div>
        </div>
        
        {/* Card 3 */}
        <div 
          className="glass-card flex items-center justify-between"
          style={{ 
            borderTop: '2px solid #FFB800',
            borderColor: outstandingMicroAmount > 0 ? 'rgba(255,184,0,0.3)' : undefined,
            animationDelay: '160ms'
          }}
        >
            <div>
                <p style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>YOU OWE</p>
                <div style={{ fontSize: '42px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    {microAlgosToAlgos(outstandingMicroAmount)} <span style={{ fontSize: '18px', color: 'rgba(255,184,0,0.8)', fontWeight: 600 }}>ALGO</span>
                </div>
            </div>
            <div style={{ background: 'rgba(255,184,0,0.1)', borderRadius: '12px', padding: '12px', color: '#FFB800' }}>
                <Clock size={24} />
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div 
          style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.07)', 
            borderRadius: '50px', 
            padding: '4px', 
            display: 'inline-flex' 
          }}
        >
          {([{id:'all', label:'All'}, {id:'active', label:'Active'}, {id:'settled', label:'Settled'}, {id:'created', label:'Created'} ] as const).map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterType)} 
                style={isActive ? {
                  background: 'linear-gradient(135deg, #00D4FF, #7B2FBE)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  boxShadow: '0 2px 12px rgba(0,212,255,0.3)',
                  borderRadius: '50px', 
                  padding: '8px 20px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                } : {
                  borderRadius: '50px', 
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3 md:ml-auto">
          <select 
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.7)',
              padding: '8px 16px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortType)}
          >
            <option value="date" style={{ background: '#060612' }}>Sort by Date</option>
            <option value="amount" style={{ background: '#060612' }}>Sort by Amount</option>
            <option value="status" style={{ background: '#060612' }}>Sort by Status</option>
          </select>
        </div>
      </div>

      {sortedBills.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center dashboard-content"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '80px 40px',
            textAlign: 'center'
          }}
        >
          <div 
            className="flex items-center justify-center animate-float mb-6"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(123,47,190,0.1) 100%)',
              borderRadius: '50%',
              width: '96px',
              height: '96px',
              color: '#00D4FF'
            }}
          >
            <Rocket size={40} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>No bills yet</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', maxWidth: '320px', marginBottom: '32px' }}>
            You don't have any split expenses matching this criteria. Start splitting effortlessly.
          </p>
          <Link 
            to="/create" 
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,212,255,0.4)',
              color: '#00D4FF',
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Create your first bill
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 dashboard-content">
          {sortedBills.map((bill, index) => (
            <BillCard key={bill.id} bill={bill} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
