import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: PageLoad = async ({ url }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('Error exchanging code for session:', error);
		}
	}

	throw redirect(303, '/');
};
