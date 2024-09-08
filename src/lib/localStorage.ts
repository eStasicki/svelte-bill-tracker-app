// src/lib/localStorage.ts

import type { Bill } from './types';

const BILLS_STORAGE_KEY = 'savedBills';

export function saveBillsToLocalStorage(bills: Bill[]): void {
	localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
}

export function getBillsFromLocalStorage(): Bill[] {
	const savedBills = localStorage.getItem(BILLS_STORAGE_KEY);
	return savedBills ? JSON.parse(savedBills) : [];
}
