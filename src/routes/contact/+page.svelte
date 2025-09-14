<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ContactActionData } from '$lib/types';

  // ✅ FIXED: Proper props interface and destructuring
  interface Props {
    form: ContactActionData;
  }

  let { form }: Props = $props();

  // ✅ FIXED: Proper state management with runes
  let isSubmitting = $state(false);
  let showToast = $state(false);

  // ✅ FIXED: Derived reactive values
  let hasFieldErrors = $derived(Boolean(form?.fieldErrors));
  let submitMessage = $derived(() => {
    if (form?.success) {
      return 'Message sent successfully!';
    } else if (form?.error) {
      return form.error;
    } else if (hasFieldErrors) {
      return 'Please fix the errors below.';
    }
    return '';
  });

  // ✅ FIXED: Functions for toast management
  function hideToast() {
    showToast = false;
  }

  // ✅ FIXED: Effect for handling form responses
  $effect(() => {
    if (form?.success || form?.error || hasFieldErrors) {
      showToast = true;
      // Auto-hide success messages after 5 seconds
      if (form?.success) {
        setTimeout(() => {
          showToast = false;
        }, 5000);
      }
    }
  });

  // ✅ FIXED: Enhanced form submission handling
  function handleSubmit() {
    return async ({ update }) => {
      isSubmitting = true;
      await update();
      isSubmitting = false;
    };
  }
</script>

<svelte:head>
  <title>Contact - Charles W. Boswell</title>
  <meta name="description" content="Get in touch with Charles Boswell - Fantasy author, Navy veteran, and wildland firefighter. Send a message about his books, writing, or speaking opportunities." />
</svelte:head>

<!-- Toast notification -->
{#if showToast && submitMessage}
  <div class="fixed top-4 right-4 z-50 max-w-sm w-full">
    <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center justify-between">
      <div class="flex items-center">
        {#if form?.success}
          <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        {:else}
          <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        {/if}
        <span class="text-sm text-gray-700">{submitMessage}</span>
      </div>
      <button 
        onclick={hideToast}
        class="text-gray-400 hover:text-gray-600 ml-2"
        aria-label="Close"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
      <p class="text-xl text-gray-600">
        I'd love to hear from you about my books, writing, or speaking opportunities.
      </p>
    </div>

    <!-- Contact Form -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-8">
        <form 
          method="POST" 
          use:enhance={handleSubmit}
          class="space-y-6"
        >
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={form?.values?.name || ''}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 {form?.fieldErrors?.name ? 'border-red-300' : ''}"
              placeholder="Your full name"
            />
            {#if form?.fieldErrors?.name}
              <p class="mt-1 text-sm text-red-600">{form.fieldErrors.name}</p>
            {/if}
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={form?.values?.email || ''}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 {form?.fieldErrors?.email ? 'border-red-300' : ''}"
              placeholder="your.email@example.com"
            />
            {#if form?.fieldErrors?.email}
              <p class="mt-1 text-sm text-red-600">{form.fieldErrors.email}</p>
            {/if}
          </div>

          <!-- Subject Field -->
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={form?.values?.subject || ''}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 {form?.fieldErrors?.subject ? 'border-red-300' : ''}"
              placeholder="What would you like to discuss?"
            />
            {#if form?.fieldErrors?.subject}
              <p class="mt-1 text-sm text-red-600">{form.fieldErrors.subject}</p>
            {/if}
          </div>

          <!-- Message Field -->
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              required
              value={form?.values?.message || ''}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 {form?.fieldErrors?.message ? 'border-red-300' : ''}"
              placeholder="Tell me about your thoughts, questions, or ideas..."
            ></textarea>
            {#if form?.fieldErrors?.message}
              <p class="mt-1 text-sm text-red-600">{form.fieldErrors.message}</p>
            {/if}
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              {:else}
                Send Message
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="mt-12 text-center">
      <p class="text-gray-600 mb-4">
        You can also connect with me on social media or through my newsletter.
      </p>
      <div class="flex justify-center space-x-6">
        <a 
          href="#" 
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Twitter"
        >
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
          </svg>
        </a>
        <a 
          href="#" 
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Facebook"
        >
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</div>