<script lang="ts">
	import { Accordion, AccordionItem, Button, Modal, Input } from 'flowbite-svelte';
	import { Trash, Pencil } from 'svelte-heros';
	import type { Bill } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	export let userId: string;
	export let bills: Bill[];

	const dispatch = createEventDispatcher<{
		updateBills: void;
	}>();

	let showDeleteModal = false;
	let showEditModal = false;
	let dateToDelete: string | null = null;
	let billToDelete: number | null = null;
	let dateToEdit: string | null = null;
	let billsToEdit: Bill[] = [];

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
	}

	function calculateTotal(bills: Bill[]): number {
		return bills.reduce(
			(sum, bill) => sum + (typeof bill.amount === 'number' ? bill.amount : 0),
			0
		);
	}

	$: groupedBills = bills.reduce(
		(acc, bill) => {
			const date = formatDate(bill.paymentDate);
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(bill);
			return acc;
		},
		{} as Record<string, Bill[]>
	);

	$: sortedDates = Object.keys(groupedBills).sort(
		(a, b) => new Date(b).getTime() - new Date(a).getTime()
	);

	function openDeleteModal(date: string, billId?: number) {
		dateToDelete = date;
		billToDelete = billId ?? null;
		showDeleteModal = true;
	}

	function formatDateForDB(dateString: string): string {
		const [day, month, year] = dateString.split('/');
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	}

	function convertDateFormat(dateString: string): string {
		const [day, month, year] = dateString.split('/');
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	}

	async function confirmDelete() {
		let deletedCount = 0;

		if (billToDelete !== null) {
			console.log(`Attempting to delete bill with id: ${billToDelete}`);
			const { error } = await supabase.from('bills').delete().eq('id', billToDelete);

			if (error) {
				console.error('Error deleting bill:', error);
				return;
			}
			deletedCount = 1;
		} else if (dateToDelete) {
			console.log(`Attempting to delete all bills for date: ${dateToDelete}`);
			const billsToDelete = groupedBills[dateToDelete];
			const ids = billsToDelete.map((bill) => bill.id);

			const { error } = await supabase.from('bills').delete().in('id', ids);

			if (error) {
				console.error('Error deleting bills:', error);
				return;
			}
			deletedCount = ids.length;
		}

		console.log(`Successfully deleted ${deletedCount} row(s)`);
		dispatch('updateBills');
		showDeleteModal = false;
		dateToDelete = null;
		billToDelete = null;
	}

	function openEditModal(date: string) {
		dateToEdit = date;
		billsToEdit = JSON.parse(JSON.stringify(groupedBills[date])); // Deep copy
		showEditModal = true;
	}

	async function confirmEdit() {
		if (dateToEdit) {
			const { error } = await supabase.from('bills').upsert(billsToEdit);

			if (error) {
				console.error('Error updating bills:', error);
				return;
			}

			dispatch('updateBills');
			showEditModal = false;
			dateToEdit = null;
		}
	}

	function addNewBillToEdit() {
		const newBill: Bill = {
			id: Math.max(0, ...bills.map((b) => b.id)) + 1,
			title: '',
			amount: 0,
			paymentDate: billsToEdit[0].paymentDate,
			user_id: userId
		};
		billsToEdit = [...billsToEdit, newBill];
	}

	function removeBillFromEdit(index: number) {
		billsToEdit = billsToEdit.filter((_, i) => i !== index);
	}

	function handleAmountChange(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const value = parseFloat(input.value);
		billsToEdit[index].amount = isNaN(value) ? 0 : value;
		billsToEdit = [...billsToEdit]; // Trigger reactivity
	}
</script>

<div class="w-full">
	<h2 class="mb-4 text-2xl font-bold">Bill History</h2>
	<Accordion flush>
		{#each sortedDates as date}
			<AccordionItem>
				<svelte:fragment slot="header">
					{date} - Total: ${calculateTotal(groupedBills[date]).toFixed(2)}
				</svelte:fragment>
				<ul class="space-y-2">
					{#each groupedBills[date] as bill}
						<li class="flex items-center justify-between">
							<span>{bill.title}</span>
							<div class="flex items-center">
								<span class="mr-2"
									>${typeof bill.amount === 'number' ? bill.amount.toFixed(2) : '0.00'}</span
								>
								<button
									class="mr-2 text-red-500 hover:text-red-700"
									on:click|stopPropagation={() => openDeleteModal(date, bill.id)}
								>
									<Trash class="w-4 h-4" />
								</button>
							</div>
						</li>
					{/each}
				</ul>
				<div class="flex justify-between mt-4">
					<Button color="blue" on:click={() => openEditModal(date)}>
						<Pencil class="w-5 h-5 mr-2" />
						Edytuj
					</Button>
					<Button color="red" on:click={() => openDeleteModal(date)}>
						<Trash class="w-5 h-5 mr-2" />
						Usuń cały wpis
					</Button>
				</div>
			</AccordionItem>
		{/each}
	</Accordion>
</div>

<Modal bind:open={showDeleteModal} autoclose>
	<div class="text-center">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			{#if billToDelete !== null}
				Are you sure you want to delete this bill?
			{:else}
				Are you sure you want to delete all bills for {dateToDelete}?
			{/if}
		</h3>
		<div class="flex justify-center gap-4">
			<Button color="red" on:click={confirmDelete}>Yes, I'm sure</Button>
			<Button color="alternative" on:click={() => (showDeleteModal = false)}>No, cancel</Button>
		</div>
	</div>
</Modal>

<Modal bind:open={showEditModal} size="lg">
	<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
		Edit Bills for {dateToEdit}
	</h3>
	{#each billsToEdit as bill, index}
		<div class="flex items-center mb-4">
			<Input type="text" placeholder="Bill title" class="mr-2" bind:value={bill.title} />
			<Input
				type="number"
				placeholder="Amount"
				class="mr-2"
				value={bill.amount}
				on:input={(e) => handleAmountChange(e, index)}
			/>
			<button class="text-red-500 hover:text-red-700" on:click={() => removeBillFromEdit(index)}>
				<Trash class="w-5 h-5" />
			</button>
		</div>
	{/each}
	<div class="mt-4">
		<Button on:click={addNewBillToEdit}>Add New Bill</Button>
	</div>
	<div class="flex justify-end mt-6 space-x-2">
		<Button color="alternative" on:click={() => (showEditModal = false)}>Cancel</Button>
		<Button color="blue" on:click={confirmEdit}>Save Changes</Button>
	</div>
</Modal>
