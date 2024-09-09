<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Button, Modal, Input } from 'flowbite-svelte';
	import { Trash } from 'svelte-heros';
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
		billsToEdit = billsToEdit.map((bill) => ({
			...bill,
			paymentDate: convertDateFormat(date) // Ensure correct date format
		}));
		showEditModal = true;
	}

	async function confirmEdit() {
		if (dateToEdit) {
			const updatePromises = billsToEdit.map(async (bill) => {
				if (bill.id) {
					// Aktualizuj istniejący wpis
					const { error } = await supabase
						.from('bills')
						.update({
							title: bill.title,
							amount: bill.amount,
							paymentDate: bill.paymentDate,
							user_id: userId
						})
						.eq('id', bill.id);

					if (error) {
						console.error('Error updating bill:', error);
						return false;
					}
					return true;
				} else {
					// Dodaj nowy wpis
					const { error } = await supabase.from('bills').insert({
						title: bill.title,
						amount: bill.amount,
						paymentDate: bill.paymentDate,
						user_id: userId
					});

					if (error) {
						console.error('Error adding new bill:', error);
						return false;
					}
					return true;
				}
			});

			const results = await Promise.all(updatePromises);

			if (results.every(Boolean)) {
				console.log('All bills updated successfully');
				dispatch('updateBills');
				showEditModal = false;
				dateToEdit = null;
			} else {
				console.error('Some bills failed to update');
			}
		}
	}

	function addNewBillToEdit() {
		const newBill: Omit<Bill, 'id'> = {
			title: '',
			amount: 0,
			paymentDate: convertDateFormat(dateToEdit || ''),
			user_id: userId
		};
		billsToEdit = [...billsToEdit, newBill as Bill];
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

	function handleDateChange(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		billsToEdit[index].paymentDate = input.value;
		billsToEdit = [...billsToEdit]; // Trigger reactivity
	}
</script>

<div class="w-full bg-[#52525B] p-4 rounded-xl">
	<h2 class="mb-4 text-xl font-bold text-white">Historia rachunków</h2>

	<div class="flex flex-col gap-3">
		{#each sortedDates as date}
			<div>
				<div
					class="flex justify-between bg-[#1380ED] text-white p-2 rounded-tl-md rounded-tr-md text-lg items-center"
				>
					<div class="font-bold">{date}</div>
					<div class="text-sm">{calculateTotal(groupedBills[date]).toFixed(2)} PLN</div>
				</div>
				<div>
					<div>
						{#each groupedBills[date] as bill, index}
							<div
								class={twMerge(
									'flex flex-col px-2 py-3 bg-[#223548] text-white text-sm',
									index > 0 && 'pt-0'
								)}
							>
								<div class="flex justify-between w-full">
									<span>{bill.title}</span>
									<div class="flex items-center">
										<span class="mr-2"
											>{typeof bill.amount === 'number' ? bill.amount.toFixed(2) : '0.00'}</span
										>
										<button
											class=" text-red-500 hover:text-red-700"
											on:click|stopPropagation={() => openDeleteModal(date, bill.id)}
										>
											<Trash class="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
					<div
						class="flex justify-between w-full text-sm py-3 px-2 border-t border-white border-opacity-30 bg-[#223548] bg-opacity-50 text-white rounded-br-md rounded-bl-md"
					>
						<button on:click={() => openEditModal(date)}>Edytuj miesiąc</button>
						<button on:click={() => openDeleteModal(date)}>Usuń miesiąc</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<Modal bind:open={showDeleteModal} autoclose>
	<div class="text-center">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			{#if billToDelete !== null}
				Jesteś pewny że chcesz usunąć ten rachunek?
			{:else}
				Jesteś pewny usunięcia całego rachunku dla dnia {dateToDelete}?
			{/if}
		</h3>
		<div class="flex justify-center gap-4">
			<Button color="red" on:click={confirmDelete}>Tak, usuń to</Button>
			<Button color="alternative" on:click={() => (showDeleteModal = false)}>Nie, anuluj</Button>
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
			<Input
				type="date"
				class="mr-2"
				value={bill.paymentDate}
				on:input={(e) => handleDateChange(e, index)}
			/>
			<button class="text-red-500 hover:text-red-700" on:click={() => removeBillFromEdit(index)}>
				<Trash class="w-5 h-5" />
			</button>
		</div>
	{/each}
	<div class="mt-4">
		<Button on:click={addNewBillToEdit}>Dodaj</Button>
	</div>
	<div class="flex justify-end mt-6 space-x-2">
		<Button color="alternative" on:click={() => (showEditModal = false)}>Anuluj</Button>
		<Button color="blue" on:click={confirmEdit}>Zapisz zmiany</Button>
	</div>
</Modal>
