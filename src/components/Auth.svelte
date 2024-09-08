<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { signInWithGoogle, signOut } from '$lib/supabaseClient';
	import type { User } from '@supabase/supabase-js';

	export let user: User | null;

	const dispatch = createEventDispatcher();

	async function handleSignIn() {
		try {
			await signInWithGoogle();
		} catch (error) {
			console.error('Error signing in:', error);
		}
	}

	async function handleSignOut() {
		const { error } = await signOut();
		if (error) {
			console.error('Error signing out:', error);
		} else {
			dispatch('signOut');
		}
	}
</script>

<div>
	{#if user}
		<p class="text-white">Zalogowano jako: {user.email}</p>
		<button on:click|preventDefault={handleSignOut} class="px-4 py-2 text-white bg-red-500 rounded"
			>Wyloguj się</button
		>
	{:else}
		<button on:click={handleSignIn} class="px-4 py-2 text-white bg-blue-500 rounded"
			>Zaloguj się przez Google</button
		>
	{/if}
</div>
