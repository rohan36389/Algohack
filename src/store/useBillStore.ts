import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bill } from '../types';

interface BillState {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBillStatus: (billId: string, status: Bill['status'], txId?: string) => void;
  updateMemberPayment: (billId: string, memberAddress: string, txId: string) => void;
  getBillsByUser: (address: string) => Bill[];
}

export const useBillStore = create<BillState>()(
  persist(
    (set, get) => ({
      bills: [],
      addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),
      updateBillStatus: (billId, status, txId) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === billId ? { ...b, status, ...(txId ? { settledTxId: txId } : {}) } : b
          ),
        })),
      updateMemberPayment: (billId, memberAddress, txId) =>
        set((state) => {
          const updatedBills = state.bills.map((b) => {
            if (b.id !== billId) return b;
            const updatedMembers = b.members.map((m) =>
              m.address === memberAddress
                ? { ...m, status: 'paid' as const, paymentTxId: txId, paidAt: Date.now() }
                : m
            );

            // Check if all members paid to update bill status to settled
            const allPaid = updatedMembers.every((m) => m.status === 'paid');
            return {
              ...b,
              members: updatedMembers,
              status: allPaid ? 'settled' as const : 'partial' as const,
            };
          });
          return { bills: updatedBills as Bill[] };
        }),
      getBillsByUser: (address) => {
        const { bills } = get();
        return bills.filter(
          (b) => b.creator === address || b.members.some((m) => m.address === address)
        );
      },
    }),
    {
      name: 'splitchain-storage',
    }
  )
);
