<!-- src/lib/components/NewsletterSignup.svelte -->
<script lang="ts">
  import type { NewsletterSignupData } from '$lib/types';

  let email = '';
  let firstName = '';
  let isLoading = false;
  let message = '';
  let success = false;

  async function handleSubmit() {
    if (!email.trim()) {
      message = 'Email is required';
      return;
    }

    isLoading = true;
    message = '';

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() } satisfies NewsletterSignupData)
      });

      if (response.ok) {
        success = true;
        message = 'Thanks for subscribing! Check your email for confirmation.';
        email = '';
        firstName = '';
      } else {
        const error = await response.json();
        message = error.message || 'Something went wrong. Please try again.';
      }
    } catch (error) {
      message = 'Network error. Please check your connection and try again.';
      console.error('Newsletter signup error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
  <h3 class="text-2xl font-bold mb-4">Stay Updated</h3>
  <p class="text-blue-100 mb-6">
    Get notified about new releases, exclusive content, and behind-the-scenes insights.
  </p>

  {#if success}
    <div class="bg-green-500 bg-opacity-20 border border-green-300 rounded p-4 mb-4">
      <p class="text-green-100">{message}</p>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="max-w-md mx-auto space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          bind:value={firstName}
          placeholder="First Name (optional)"
          class="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading}
        />
        <input
          type="email"
          bind:value={email}
          placeholder="Your email address"
          required
          class="flex-2 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        class="w-full bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {#if isLoading}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subscribing...
          </span>
        {:else}
          Subscribe Now
        {/if}
      </button>

      {#if message && !success}
        <p class="text-red-200 text-sm mt-2">{message}</p>
      {/if}
    </form>
  {/if}

  <p class="text-blue-200 text-sm mt-4">
    No spam, unsubscribe anytime. We respect your privacy.
  </p>
</div>