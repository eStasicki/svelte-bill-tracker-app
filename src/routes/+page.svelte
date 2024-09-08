<script lang="ts">
	import BillForm from '$components/BillForm.svelte';
	import BillAccordion from '$components/BillAccordion.svelte';
	import type { Bill } from '$lib/types';

	let bills: Bill[] = [];
	let nextId = 1;

	function handleAddBills(event: CustomEvent<Omit<Bill, 'id'>[]>) {
		const newBills = event.detail.map((bill) => ({ ...bill, id: nextId++ }));
		bills = [...newBills, ...bills];
		console.log('New bills added:', newBills);
		console.log('All bills:', bills);
	}

	function handleUpdateBills(event: CustomEvent<Bill[]>) {
		bills = event.detail;
		console.log('Bills updated:', bills);
	}
</script>

<main class="container p-4 mx-auto">
	<h1 class="mb-4 text-3xl font-bold">Home Budget Tracker</h1>
	<div class="flex flex-col gap-8 md:flex-row">
		<div class="w-full md:w-1/2">
			<BillForm on:addBills={handleAddBills} />
		</div>
		<div class="w-full md:w-1/2">
			<BillAccordion {bills} on:updateBills={handleUpdateBills} />
		</div>
	</div>
</main>
