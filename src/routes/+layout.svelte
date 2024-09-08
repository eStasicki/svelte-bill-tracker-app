<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	onMount(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN') {
				goto('/', { replaceState: true });
			} else if (event === 'SIGNED_OUT') {
				goto('/', { replaceState: true });
			}
		});

		return () => {
			if (authListener) authListener.subscription.unsubscribe();
		};
	});
</script>

<slot />
