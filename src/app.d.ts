// src/app.d.ts

/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
	  // interface Error {}
	  // interface Locals {}
	  // interface Platform {}
  
	  interface PageData {
		featured?: import('$lib/types').Book;
		upcoming?: import('$lib/types').Book[];
		books?: import('$lib/types').Book[];
		posts?: import('$lib/types').Post[];   // ✅ use Post (singular)
		drafts?: import('$lib/types').Book[];  // optional draft list
	  }
	}
  }
  
  export {};
  