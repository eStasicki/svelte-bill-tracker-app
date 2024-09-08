<script lang="ts">
	import BillForm from '$components/BillForm.svelte';
	import type { Bill } from '$lib/types';

	let bills: Bill[] = [];
	let nextId = 1;

	function handleAddBill(event: CustomEvent<Omit<Bill, 'id'>>) {
		const newBill: Bill = { ...event.detail, id: nextId++ };
		bills = [...bills, newBill];
		console.log('New bill added:', newBill);
		console.log('Current bills:', bills);
	}
</script>

<main class="container p-4 mx-auto">
	<h1 class="mb-4 text-3xl font-bold">Home Budget Tracker</h1>
	<BillForm on:addBill={handleAddBill} />

	{#if bills.length > 0}
		<h2 class="mt-8 mb-4 text-2xl font-bold">Added Bills:</h2>
		<ul>
			{#each bills as bill}
				<li class="mb-2">
					{bill.title}: ${bill.amount} (Due: {new Date(bill.paymentDate).toLocaleDateString()})
				</li>
			{/each}
		</ul>
	{/if}
</main>
