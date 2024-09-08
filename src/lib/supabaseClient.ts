import { createClient, type Session } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export async function testSupabaseConnection() {
	try {
		const { data, error } = await supabase.from('bills').select('count').single();
		if (error) throw error;
		console.log('Successful connection to Supabase. Number of bills:', data.count);
		return true;
	} catch (error) {
		console.error('Error connecting to Supabase:', error);
		return false;
	}
}

export async function signInWithGoogle() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: window.location.origin + '/auth/callback'
		}
	});
	return { data, error };
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

export function getUser() {
	return supabase.auth.getUser();
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
	return supabase.auth.onAuthStateChange(callback);
}
