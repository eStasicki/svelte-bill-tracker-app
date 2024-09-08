<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase, getUser, onAuthStateChange } from '$lib/supabaseClient';
	import BillForm from '$components/BillForm.svelte';
	import BillAccordion from '$components/BillAccordion.svelte';
	import Auth from '$components/Auth.svelte';
	import type { Bill } from '$lib/types';
	import type { User } from '@supabase/supabase-js';

	let bills: Bill[] = [];
	let user: User | null = null;
	let loading = true;

	onMount(async () => {
		const {
			data: { user: currentUser }
		} = await getUser();
		user = currentUser;
		if (isUserLoggedIn()) {
			await fetchBills();
		}
		loading = false;

		onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN') {
				user = session?.user ?? null;
				if (isUserLoggedIn()) {
					fetchBills();
				}
			} else if (event === 'SIGNED_OUT') {
				user = null;
				bills = [];
			}
		});
	});

	// Type guard function
	function isUserLoggedIn(): user is User {
		return user !== null;
	}

	function formatDateForDisplay(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
	}

	function formatDateForDB(dateString: string): string {
		if (!dateString) {
			console.error('Invalid date string:', dateString);
			return new Date().toISOString().split('T')[0]; // Domyślnie zwracamy dzisiejszą datę
		}
		const parts = dateString.split('/');
		if (parts.length !== 3) {
			console.error('Invalid date format:', dateString);
			return new Date().toISOString().split('T')[0]; // Domyślnie zwracamy dzisiejszą datę
		}
		const [day, month, year] = parts;
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	}

	async function fetchBills() {
		if (!isUserLoggedIn()) return;

		const { data, error } = await supabase
			.from('bills')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching bills:', error);
		} else {
			bills =
				data?.map((bill) => ({
					...bill,
					paymentDate: formatDateForDisplay(bill.paymentDate)
				})) || [];
		}
	}

	async function handleAddBills(event: CustomEvent<Omit<Bill, 'id' | 'user_id'>[]>) {
		if (!isUserLoggedIn()) return;

		const newBills = event.detail.map((bill) => {
			const formattedDate = formatDateForDB(bill.paymentDate);
			return {
				...bill,
				user_id: user.id,
				paymentDate: formattedDate
			};
		});

		console.log('New bills to be added:', newBills); // Dodajemy log dla debugowania

		const { data, error } = await supabase.from('bills').insert(newBills);

		if (error) {
			console.error('Error adding bills:', error);
		} else {
			console.log('Successfully added bills:', data);
			await fetchBills();
		}
	}

	async function handleUpdateBills() {
		if (isUserLoggedIn()) {
			await fetchBills();
		}
	}

	function handleSignOut() {
		user = null;
		bills = [];
	}
</script>

<main class="container p-4 mx-auto lg:max-w-4xl bg-[#3F3F45] rounded-xl">
	<h1 class="mb-4 text-3xl font-bold bg-[#52525B] rounded-xl text-white p-3">
		Home Budget Tracker
	</h1>
	<Auth {user} on:signOut={handleSignOut} />

	{#if loading}
		<p class="text-white">Loading...</p>
	{:else if user}
		<div class="flex flex-col gap-8 md:flex-row">
			<div class="w-full md:w-1/2 bg-[#52525B] rounded-xl p-4">
				<BillForm on:addBills={handleAddBills} />
			</div>
			<div class="w-full md:w-1/2">
				<BillAccordion {bills} on:updateBills={handleUpdateBills} />
			</div>
		</div>
	{:else}
		<p class="text-white">Please log in to access the application.</p>
	{/if}
</main>
