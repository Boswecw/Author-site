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
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        isSubmitted = false;
      }, 5000);
    }, 1000);
  }
</script>

<div class="bg-white rounded-lg shadow-lg p-8">
  <div class="text-center mb-6">
    <h3 class="text-2xl font-bold text-gray-900 mb-2">Stay Connected</h3>
    <p class="text-gray-600">
      Get exclusive updates on new releases, behind-the-scenes stories from the fireline, 
      and early access to upcoming books.
    </p>
  </div>
  
  {#if isSubmitted}
    <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <div class="flex items-center justify-center mb-2">
        <svg class="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h4 class="text-green-800 font-semibold">Successfully Subscribed!</h4>
      </div>
      <p class="text-green-700">
        Thanks for joining! Check your email for confirmation and watch for updates about 
        <strong>Faith in a FireStorm</strong> coming Fall 2025.
      </p>
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
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !email}
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {#if isLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Subscribing...
        {:else}
          Subscribe to Newsletter
        {/if}
      </button>
      
      <div class="text-center">
        <p class="text-sm text-gray-500">
          No spam, unsubscribe at any time. I respect your privacy.
        </p>
      </div>
    </form>
  {/if}

  <!-- Features -->
  <div class="mt-8 pt-6 border-t border-gray-200">
    <h4 class="font-semibold text-gray-900 mb-4 text-center">What you'll get:</h4>
    <ul class="space-y-2 text-sm text-gray-600">
      <li class="flex items-center">
        <svg class="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Early access to new book announcements
      </li>
      <li class="flex items-center">
        <svg class="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Behind-the-scenes stories from firefighting days
      </li>
      <li class="flex items-center">
        <svg class="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Writing insights and military/fantasy connections
      </li>
      <li class="flex items-center">
        <svg class="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Exclusive previews and character insights
      </li>
    </ul>
  </div>
</div>