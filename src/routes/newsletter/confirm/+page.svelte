/ src/routes/newsletter/confirm/+page.svelte
// Confirmation page UI
/*
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<svelte:head>
  <title>Newsletter Confirmation - Charles W. Boswell</title>
  <meta name="description" content="Newsletter subscription confirmation" />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      
      {#if data.confirmed}
        <!-- Successfully confirmed -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome to the Newsletter!</h2>
          
          <p class="text-gray-600 mb-6">
            {#if data.name}
              Hi {data.name}! 
            {/if}
            Your subscription to Charles W. Boswell's newsletter has been confirmed.
          </p>
          
          <div class="space-y-4">
            <a href="/" 
               class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-block text-center">
              Visit Website
            </a>
            
            <a href="/blog" 
               class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors inline-block text-center">
              Read the Blog
            </a>
          </div>
        </div>
        
      {:else if data.alreadyConfirmed}
        <!-- Already confirmed -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Already Confirmed</h2>
          
          <p class="text-gray-600 mb-6">
            {#if data.name}
              Hi {data.name}! 
            {/if}
            Your email is already confirmed for the newsletter.
          </p>
          
          <a href="/" 
             class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-block text-center">
            Visit Website
          </a>
        </div>
        
      {:else}
        <!-- Error state -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h2>
          
          <p class="text-gray-600 mb-6">
            We couldn't confirm your newsletter subscription. The link may be invalid or expired.
          </p>
          
          <div class="space-y-4">
            <a href="/newsletter/resend" 
               class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-block text-center">
              Resend Confirmation
            </a>
            
            <a href="/" 
               class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors inline-block text-center">
              Visit Website
            </a>
          </div>
        </div>
      {/if}
      
    </div>
  </div>
</div>