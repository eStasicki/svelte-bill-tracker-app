<script lang="ts">
	import { onMount } from 'svelte';
	import BillForm from '$components/BillForm.svelte';
	import BillAccordion from '$components/BillAccordion.svelte';
	import type { Bill } from '$lib/types';
	import { saveBillsToLocalStorage, getBillsFromLocalStorage } from '$lib/localStorage';

	let bills: Bill[] = [];
	let nextId = 1;

	onMount(() => {
		const savedBills = getBillsFromLocalStorage();
		if (savedBills.length > 0) {
			bills = savedBills;
			nextId = Math.max(...bills.map((bill) => bill.id)) + 1;
		}
	});

	function handleAddBills(event: CustomEvent<Omit<Bill, 'id'>[]>) {
		const newBills = event.detail.map((bill) => ({ ...bill, id: nextId++ }));
		bills = [...newBills, ...bills];
		saveBillsToLocalStorage(bills);
		console.log('New bills added:', newBills);
		console.log('All bills:', bills);
	}

	function handleUpdateBills(event: CustomEvent<Bill[]>) {
		bills = event.detail;
		saveBillsToLocalStorage(bills);
		console.log('Bills updated:', bills);
	}
</script>

<main class="container p-4 mx-auto lg:max-w-4xl bg-[#3F3F45] rounded-xl">
	<h1 class="mb-4 text-3xl font-bold bg-[#52525B] rounded-xl text-white p-3">
		Home Budget Tracker
	</h1>
	<div class="flex flex-col gap-8 md:flex-row">
		<div class="w-full md:w-1/2 bg-[#52525B] rounded-xl p-4">
			<BillForm on:addBills={handleAddBills} />
		</div>
		<div class="w-full md:w-1/2">
			<BillAccordion {bills} on:updateBills={handleUpdateBills} />
		</div>
	</div>
</main>
