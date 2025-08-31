<script lang="ts">
  let email = '';
  let isSubmitted = false;
  let isLoading = false;
  
  function handleSubmit() {
    if (!email) return;
    
    isLoading = true;
    // Simulate form submission
    setTimeout(() => {
      isLoading = false;
      isSubmitted = true;
      email = '';
    }, 1000);
  }
</script>

<div class="bg-white rounded-lg shadow-lg p-8">
  <h3 class="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
  <p class="text-gray-600 mb-6">
    Get exclusive updates on new releases, behind-the-scenes stories from my firefighting days, 
    and early access to upcoming books.
  </p>
  
  {#if isSubmitted}
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <p class="text-green-700 font-medium">Thanks for subscribing! Check your email for confirmation.</p>
      </div>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="sr-only">Email address</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          placeholder="Enter your email address"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !email}
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Subscribing...
        {:else}
          Subscribe to Newsletter
        {/if}
      </button>
      
      <p class="text-sm text-gray-500">
        No spam, unsubscribe at any time. I respect your privacy.
      </p>
    </form>
  {/if}
</div>