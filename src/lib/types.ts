export interface Bill {
	id: number;
	title: string;
	amount: number;
	paymentDate: string;
	user_id: string;
}

export interface BankTransaction {
	id: string;
	date: string;
	amount: number;
	description: string;
}
