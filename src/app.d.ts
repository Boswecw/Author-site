// src/app.d.ts - TypeScript declarations for the app

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
	  // interface Error {}
	  // interface Locals {}
	  // interface PageData {}
	  // interface Platform {}
	  interface PageData {
		featured?: import('$lib/types').Book;
		upcoming?: import('$lib/types').Book[];
		books?: import('$lib/types').Book[];
		posts?: import('$lib/types').Post[];
	  }
	}
  }
  
  // Declare Svelte component modules
  declare module '$lib/components/*.svelte' {
	import type { ComponentType } from 'svelte';
	const component: ComponentType;
	export default component;
  }
  
  export {};