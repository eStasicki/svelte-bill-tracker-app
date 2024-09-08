<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { PlusCircle, MinusCircle } from 'lucide-svelte';
	import type { Bill } from '$lib/types';

	const dispatch = createEventDispatcher<{ addBills: Omit<Bill, 'id'>[] }>();

	let bills: Array<{ title: string; amount: number }> = [{ title: '', amount: 0 }];
	let paymentDate = new Date().toISOString().split('T')[0];

	function addBillField() {
		bills = [...bills, { title: '', amount: 0 }];
	}

	function removeBillField(index: number) {
		if (index > 0) {
			bills = bills.filter((_, i) => i !== index);
		}
	}

	function formatDateForDisplay(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
	}

	function submitForm() {
		const validBills = bills.filter((bill) => bill.title && bill.amount > 0);
		if (validBills.length > 0) {
			const formattedDate = formatDateForDisplay(paymentDate);
			dispatch(
				'addBills',
				validBills.map((bill) => ({ ...bill, paymentDate: formattedDate, user_id: '' }))
			);
			bills = [{ title: '', amount: 0 }];
			paymentDate = new Date().toISOString().split('T')[0];
		}
	}
</script>

<form on:submit|preventDefault={submitForm}>
	<div class="mb-4">
		<input
			id="paymentDate"
			type="date"
			bind:value={paymentDate}
			class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
			required
		/>
	</div>

	{#each bills as bill, index}
		<div class="flex items-center mb-4">
			<input
				type="text"
				bind:value={bill.title}
				placeholder="Bill title"
				class="flex-grow p-2 mr-2 border rounded"
				required
			/>
			<input
				type="number"
				bind:value={bill.amount}
				placeholder="Amount"
				class="w-24 p-2 mr-2 border rounded"
				min="0"
				step="0.01"
				required
			/>
			{#if index > 0}
				<button type="button" on:click={() => removeBillField(index)} class="mr-2 text-red-500">
					<MinusCircle size={24} />
				</button>
			{/if}
			{#if index === bills.length - 1}
				<button type="button" on:click={addBillField} class="text-blue-500">
					<PlusCircle size={24} />
				</button>
			{/if}
		</div>
	{/each}

	<button type="submit" class="px-4 py-2 text-white bg-blue-500 rounded">Add Bills</button>
</form>
