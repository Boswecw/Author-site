<script lang="ts">
    let email = '';
    let isSubmitted = false;
    let isLoading = false;
  
    async function handleSubmit() {
      isLoading = true;
      
      // Simulate API call - replace with your actual newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      isSubmitted = true;
      isLoading = false;
      email = '';
    }
  </script>
  
  <div class="bg-gray-900 text-white section-padding">
    <div class="container-width">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">Stay Connected</h2>
        <p class="text-xl text-gray-300 mb-8">
          Get updates on new books, behind-the-scenes stories, and exclusive content.
        </p>
  
        {#if isSubmitted}
          <div class="bg-green-600 text-white px-6 py-4 rounded-lg">
            <p class="text-lg font-semibold">Thank you for subscribing!</p>
            <p class="text-sm opacity-90">You'll hear from us soon with exclusive updates.</p>
          </div>
        {:else}
          <form on:submit|preventDefault={handleSubmit} class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              bind:value={email}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              class="flex-1 px-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              class="btn-primary whitespace-nowrap {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p class="text-sm text-gray-400 mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        {/if}
      </div>
    </div>
  </div>