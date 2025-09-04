import { PaymentTransaction, PaymentStatus } from '@/types/payment';

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
class TransactionStore {
  private transactions = new Map<string, PaymentTransaction>();

  // Create a new transaction
  createTransaction(
    id: string,
    upiId: string,
    amount: number,
    description?: string
  ): PaymentTransaction {
    const transaction: PaymentTransaction = {
      id,
      upiId,
      amount,
      status: 'initiated' as PaymentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      description,
      merchantName: 'Demo Merchant Store',
    };

    this.transactions.set(id, transaction);
    return transaction;
  }

  // Get transaction by ID
  getTransaction(id: string): PaymentTransaction | null {
    return this.transactions.get(id) || null;
  }

  // Update transaction status
  updateTransactionStatus(
    id: string,
    status: PaymentStatus
  ): PaymentTransaction | null {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      return null;
    }

    transaction.status = status;
    transaction.updatedAt = new Date();
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Get all transactions (for admin purposes)
  getAllTransactions(): PaymentTransaction[] {
    return Array.from(this.transactions.values());
  }

  // Delete transaction
  deleteTransaction(id: string): boolean {
    return this.transactions.delete(id);
  }

  // Get transactions by UPI ID
  getTransactionsByUpiId(upiId: string): PaymentTransaction[] {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.upiId === upiId
    );
  }

  // Auto-expire old pending transactions (older than 10 minutes)
  expireOldTransactions(): void {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    for (const [id, transaction] of this.transactions.entries()) {
      if (
        (transaction.status === 'initiated' || transaction.status === 'pending') &&
        transaction.createdAt < tenMinutesAgo
      ) {
        this.updateTransactionStatus(id, 'expired');
      }
    }
  }
}

// Export singleton instance
export const transactionStore = new TransactionStore();

// Auto-expire transactions every minute
if (typeof window === 'undefined') {
  // Only run on server side
  setInterval(() => {
    transactionStore.expireOldTransactions();
  }, 60000); // Check every minute
}