export interface Bill {
	id: number;
	title: string;
	amount: number;
	paymentDate: string;
	bankTransactionId?: string;
}

export interface BankTransaction {
	id: string;
	date: string;
	amount: number;
	description: string;
}
