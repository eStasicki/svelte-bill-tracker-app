<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { signInWithGoogle, signOut } from '$lib/supabaseClient';
	import type { User } from '@supabase/supabase-js';
	import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-svelte';
	import { twMerge } from 'tailwind-merge';

	export let user: User | null;
	export let customClass = '';
	export let buttonCustomClass = '';

	const dispatch = createEventDispatcher();

	export async function handleSignIn() {
		try {
			await signInWithGoogle();
		} catch (error) {
			console.error('Error signing in:', error);
		}
	}

	export async function handleSignOut() {
		const { error } = await signOut();
		if (error) {
			console.error('Error signing out:', error);
		} else {
			dispatch('signOut');
		}
	}
</script>

<div class={twMerge('hidden md:flex items-center justify-between px-3', customClass)}>
	{#if user}
		<Avatar
			id="user-drop"
			src={user.user_metadata.avatar_url}
			class="cursor-pointer"
			dot={{ color: 'green' }}
		/>
		<Dropdown triggeredBy="#user-drop">
			<DropdownHeader>
				<span class="block text-sm">{user.user_metadata.name}</span>
				<span class="block truncate text-sm font-medium">{user.email}</span>
			</DropdownHeader>
			<DropdownDivider />
			<DropdownItem on:click={handleSignOut}>Wyloguj się</DropdownItem>
		</Dropdown>
	{:else}
		<button
			on:click={handleSignIn}
			class={twMerge('px-4 py-2 text-white bg-blue-500 rounded', buttonCustomClass)}
			>Zaloguj się</button
		>
	{/if}
</div>
