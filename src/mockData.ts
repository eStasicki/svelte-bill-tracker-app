import type { Bill } from '$lib/types';

export const mockBills: Bill[] = [
  { id: 1, title: 'Rent', amount: 1500, paymentDate: '2023-05-01', user_id: 'mock_user_id' },
  { id: 2, title: 'Electricity', amount: 250, paymentDate: '2023-05-15', user_id: 'mock_user_id' },
  { id: 3, title: 'Internet', amount: 80, paymentDate: '2023-05-20', user_id: 'mock_user_id' }
];