<!-- src/routes/admin/newsletters/send/+page.svelte -->
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  
  const { data }: { data: PageData } = $props();
  let form: ActionData = $state(null);
  
  let testEmail = $state('');
  let isTestSending = $state(false);
  let isSending = $state(false);
  let showConfirmDialog = $state(false);

  function formatDate(date: string | Date | null) {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  }

  function formatContent(html: string) {
    // Strip HTML tags for preview
    return html.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  }

  function confirmSend() {
    showConfirmDialog = true;
  }

  function cancelSend() {
    showConfirmDialog = false;
  }

  // Handle keyboard events for modal backdrop
  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cancelSend();
    }
  }
</script>

<svelte:head>
  <title>Send Newsletter - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4">
    <!-- Header -->
    <div class="mb-8">
      <nav class="text-sm text-gray-500 mb-4">
        <a href="/admin" class="hover:text-gray-700">Admin</a>
        <span class="mx-2">→</span>
        <a href="/admin/newsletters" class="hover:text-gray-700">Newsletters</a>
        <span class="mx-2">→</span>
        <span class="text-gray-900">Send</span>
      </nav>
      
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Send Newsletter</h1>
        
        <!-- Status Badge -->
        <div class="flex items-center space-x-3">
          <span class="px-3 py-1 text-sm font-medium rounded-full
            {data.newsletter.status === 'sent' 
              ? 'bg-green-100 text-green-800' 
              : data.newsletter.status === 'ready' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }">
            {data.newsletter.status.charAt(0).toUpperCase() + data.newsletter.status.slice(1)}
          </span>
          
          {#if data.subscriberCount > 0}
            <span class="text-sm text-gray-600">
              {data.subscriberCount} subscribers
            </span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    {#if form?.success}
      <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <div class="ml-3">
            <p class="text-green-800 font-medium">{form.message}</p>
            {#if form.result}
              <p class="text-green-700 text-sm mt-1">
                Sent: {form.result.sent}, Failed: {form.result.failed}
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    {#if form?.error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <p class="ml-3 text-red-800">{form.error}</p>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Newsletter Preview -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Newsletter Preview</h2>
          
          <div class="space-y-4">
            <div>
              <span class="text-sm font-medium text-gray-700">Subject</span>
              <p class="text-lg font-medium text-gray-900">{data.newsletter.subject}</p>
            </div>
            
            {#if data.newsletter.preheader}
              <div>
                <span class="text-sm font-medium text-gray-700">Preheader</span>
                <p class="text-gray-600">{data.newsletter.preheader}</p>
              </div>
            {/if}
            
            <div>
              <span class="text-sm font-medium text-gray-700">Content Preview</span>
              <div class="bg-gray-50 rounded p-4 text-sm text-gray-700">
                {formatContent(data.newsletter.content.html)}
              </div>
            </div>
            
            <div class="flex space-x-4 text-sm text-gray-500">
              <span>Created: {formatDate(data.newsletter.createdAt)}</span>
              {#if data.newsletter.sentAt}
                <span>Sent: {formatDate(data.newsletter.sentAt)}</span>
              {/if}
            </div>

            {#if data.newsletter.googleDocUrl}
              <div>
                <a 
                  href={data.newsletter.googleDocUrl} 
                  target="_blank"
                  class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  View Original Google Doc
                </a>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Actions Panel -->
      <div class="space-y-6">
        <!-- Test Email -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Test Email</h3>
          
          <form 
            method="POST" 
            action="?/sendTest"
            use:enhance={() => {
              isTestSending = true;
              return async ({ update }) => {
                await update();
                isTestSending = false;
              };
            }}
          >
            <div class="space-y-4">
              <div>
                <label for="testEmail" class="block text-sm font-medium text-gray-700">
                  Test Email Address
                </label>
                <input
                  type="email"
                  id="testEmail"
                  name="testEmail"
                  bind:value={testEmail}
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <button
                type="submit"
                disabled={isTestSending || !testEmail}
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isTestSending}
                  <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Test...
                  </span>
                {:else}
                  Send Test Email
                {/if}
              </button>
            </div>
          </form>
        </div>

        <!-- Send Newsletter -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Send to Subscribers</h3>
          
          {#if data.newsletter.status === 'sent'}
            <div class="text-center py-4">
              <svg class="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <h4 class="mt-2 text-lg font-medium text-gray-900">Already Sent</h4>
              <p class="text-gray-500">This newsletter was sent on {formatDate(data.newsletter.sentAt)}</p>
              
              {#if data.newsletter.sentStats}
                <div class="mt-4 text-sm text-gray-600">
                  <p>Successful: {data.newsletter.sentStats.successful}</p>
                  <p>Failed: {data.newsletter.sentStats.failed}</p>
                  <p>Total: {data.newsletter.sentStats.totalSubscribers}</p>
                </div>
              {/if}
            </div>
          {:else if !data.canSend}
            <div class="text-center py-4">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <h4 class="mt-2 text-lg font-medium text-gray-900">Cannot Send</h4>
              <p class="text-gray-500">No confirmed subscribers found</p>
            </div>
          {:else}
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-medium text-blue-900">Ready to Send</h4>
                <p class="text-blue-700 text-sm">
                  This will send the newsletter to {data.subscriberCount} confirmed subscribers.
                </p>
              </div>
              
              <button
                type="button"
                onclick={confirmSend}
                disabled={isSending}
                class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Send to All Subscribers
              </button>
            </div>
          {/if}
        </div>

        <!-- Info Panel -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 class="font-medium text-yellow-800">Unsubscribe Notice</h4>
          <p class="text-yellow-700 text-sm mt-1">
            Subscribers can unsubscribe by replying to any newsletter email. All unsubscribe requests will be sent directly to your inbox for personal handling.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Confirmation Dialog -->
{#if showConfirmDialog}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div 
        class="fixed inset-0 bg-black opacity-50" 
        onclick={cancelSend}
        onkeydown={handleBackdropKeydown}
        role="button"
        tabindex="0"
        aria-label="Close modal"
      ></div>
      
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
          </div>
          
          <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
            Send Newsletter?
          </h3>
          
          <p class="text-gray-500 text-center mb-6">
            Are you sure you want to send "{data.newsletter.subject}" to {data.subscriberCount} subscribers? This action cannot be undone.
          </p>
          
          <div class="flex space-x-3">
            <button
              type="button"
              onclick={cancelSend}
              class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            
            <form 
              method="POST" 
              action="?/sendNewsletter"
              class="flex-1"
              use:enhance={() => {
                isSending = true;
                showConfirmDialog = false;
                return async ({ update }) => {
                  await update();
                  isSending = false;
                };
              }}
            >
              <button
                type="submit"
                disabled={isSending}
                class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {#if isSending}
                  <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                {:else}
                  Send Now
                {/if}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}