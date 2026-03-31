export interface Bill {
  id: string;
  title: string;
  totalAmount: number;
  creator: string; // wallet address
  members: Member[];
  splitType: 'equal' | 'percentage';
  status: 'active' | 'partial' | 'settled';
  createdAt: number; // unix timestamp
  deadline?: number;
  onChainAppId?: number;
  settledTxId?: string;
}

export interface Member {
  address: string;
  share: number; // percentage (0-100) or amount if equal, wait the type says share is percentage, shareAmount is actual
  shareAmount: number; // actual ALGO amount
  status: 'pending' | 'paid' | 'overdue';
  paymentTxId?: string;
  paidAt?: number;
}

export interface PaymentProof {
  billId: string;
  memberAddress: string;
  txId: string;
  amount: number;
  timestamp: number;
  confirmedRound: number;
}
