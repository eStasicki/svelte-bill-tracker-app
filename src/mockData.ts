import type { Bill, BankTransaction } from './lib/types';

export const mockBills: Bill[] = [
	{ id: 1, title: 'Rent', amount: 1500, paymentDate: '2023-05-01' },
	{ id: 2, title: 'Electricity', amount: 250, paymentDate: '2023-05-15' },
	{ id: 3, title: 'Internet', amount: 80, paymentDate: '2023-05-20' }
];

export const mockBankTransactions: BankTransaction[] = [
	{ id: 't1', date: '2023-05-01', amount: 1500, description: 'Rent payment' },
	{ id: 't2', date: '2023-05-15', amount: 250, description: 'Electricity bill' },
	{ id: 't3', date: '2023-05-20', amount: 80, description: 'Internet subscription' }
];
