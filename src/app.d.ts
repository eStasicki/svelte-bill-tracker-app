/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	interface ImportMetaEnv {
		VITE_SUPABASE_URL: string;
		VITE_SUPABASE_ANON_KEY: string;
	}
}

export {};
