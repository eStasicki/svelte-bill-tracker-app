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
			class="block w-full mt-1 rounded-md bg-white bg-opacity-20 text-white"
			required
		/>
	</div>

	{#each bills as bill, index}
		<div
			class="items-center flex-col md:flex-row mb-4 bg-white p-3 rounded-md bg-opacity-15 flex gap-2"
		>
			<div class="flex flex-col w-full gap-2">
				<label for="" class="block md:hidden text-white">Tytuł płatności:</label>
				<input
					type="text"
					bind:value={bill.title}
					placeholder="Tytuł płatności"
					class="flex-grow p-2 border rounded"
					required
				/>
			</div>
			<div class="flex flex-col w-full gap-2">
				<label for="" class="block md:hidden text-white">Wartość</label>
				<input
					type="number"
					bind:value={bill.amount}
					placeholder="Wartość"
					class="w-full p-2 border rounded"
					min="0"
					step="0.01"
					required
				/>
			</div>
			{#if index > 0}
				<button type="button" on:click={() => removeBillField(index)} class=" text-red-500">
					<MinusCircle size={24} />
				</button>
			{/if}
			{#if index === bills.length - 1}
				<button type="button" on:click={addBillField} class="text-white">
					<PlusCircle size={24} />
				</button>
			{/if}
		</div>
	{/each}

	<button
		type="submit"
		class="px-4 py-2 md:py-4 md:text-2xl font-light text-white bg-green-500 md:hover:bg-green-600 rounded w-full md:transition-colors"
		>Dodaj</button
	>
</form>

<style>
	::-webkit-calendar-picker-indicator {
		filter: invert(1);
		cursor: pointer;
	}
</style>
