<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { PlusCircle } from 'lucide-svelte';
	import type { Bill } from '$lib/types';

	const dispatch = createEventDispatcher<{ addBill: Omit<Bill, 'id'> }>();

	let bills: Omit<Bill, 'id'>[] = [
		{ title: '', amount: 0, paymentDate: new Date().toISOString().split('T')[0] }
	];

	function addBillField() {
		bills = [
			...bills,
			{ title: '', amount: 0, paymentDate: new Date().toISOString().split('T')[0] }
		];
	}

	function submitForm() {
		bills.forEach((bill) => {
			if (bill.title && bill.amount > 0 && bill.paymentDate) {
				dispatch('addBill', bill);
			}
		});
		bills = [{ title: '', amount: 0, paymentDate: new Date().toISOString().split('T')[0] }];
	}
</script>

<form on:submit|preventDefault={submitForm} class="mb-8">
	{#each bills as bill, index}
		<div class="flex items-center mb-4">
			<input
				type="text"
				bind:value={bill.title}
				placeholder="Bill title"
				class="p-2 mr-2 border rounded"
				required
			/>
			<input
				type="number"
				bind:value={bill.amount}
				placeholder="Amount"
				class="p-2 mr-2 border rounded"
				min="0"
				step="0.01"
				required
			/>
			<input type="date" bind:value={bill.paymentDate} class="p-2 mr-2 border rounded" required />
			<button type="button" on:click={addBillField} class="text-blue-500">
				<PlusCircle size={24} />
			</button>
		</div>
	{/each}
	<button type="submit" class="px-4 py-2 text-white bg-blue-500 rounded">Add Bills</button>
</form>
