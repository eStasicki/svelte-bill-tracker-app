import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function getRedirectTo() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return '/auth/callback'
}

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
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) throw error
  return data
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
