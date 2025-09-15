// src/routes/admin/newsletters/test/+page.svelte - Email testing interface
export const pageComponent = `
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  
  const { data }: { data: PageData } = $props();
  let form: ActionData = $state(null);
  
  let testEmail = $state('');
  let isTesting = $state(false);

  function getStatusIcon(valid: boolean) {
    return valid 
      ? '<svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
      : '<svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  }
</script>

<svelte:head>
  <title>Test Email System - Admin</title>
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
        <span class="text-gray-900">Test Email System</span>
      </nav>
      
      <h1 class="text-3xl font-bold text-gray-900">Email System Test</h1>
      <p class="text-gray-600 mt-2">
        Verify your email configuration and test newsletter delivery.
      </p>
    </div>

    <!-- Success/Error Messages -->
    {#if form?.success}
      <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <p class="ml-3 text-green-800 font-medium">{form.message}</p>
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Configuration Status -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Email Configuration</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Email System</span>
            <div class="flex items-center">
              {@html getStatusIcon(data.emailConfig.valid)}
              <span class="ml-2 text-sm {data.emailConfig.valid ? 'text-green-600' : 'text-red-600'}">
                {data.emailConfig.valid ? 'Configured' : 'Missing Config'}
              </span>
            </div>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">SMTP Settings</span>
            <div class="flex items-center">
              {@html getStatusIcon(data.environment.smtpConfigured)}
              <span class="ml-2 text-sm {data.environment.smtpConfigured ? 'text-green-600' : 'text-red-600'}">
                {data.environment.smtpConfigured ? 'Ready' : 'Not Configured'}
              </span>
            </div>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Environment</span>
            <span class="text-sm text-gray-600 capitalize">{data.environment.nodeEnv}</span>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm font-medium text-gray-700">Author Email</span>
            <span class="text-sm text-gray-600">{data.environment.authorEmail}</span>
          </div>
          
          <div class="flex items-center justify-between py-2">
            <span class="text-sm font-medium text-gray-700">From Email</span>
            <span class="text-sm text-gray-600">{data.environment.fromEmail}</span>
          </div>
        </div>

        {#if !data.emailConfig.valid && data.emailConfig.missing.length > 0}
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 class="text-sm font-medium text-red-800">Missing Configuration:</h4>
            <ul class="mt-1 text-sm text-red-700">
              {#each data.emailConfig.missing as missing}
                <li>• {missing}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Test Email -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Send Test Email</h2>
        
        <form 
          method="POST" 
          action="?/testEmail"
          use:enhance={() => {
            isTesting = true;
            return async ({ update }) => {
              await update();
              isTesting = false;
            };
          }}
          class="space-y-4"
        >
          <div>
            <label for="testEmail" class="block text-sm font-medium text-gray-700 mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              id="testEmail"
              name="testEmail"
              bind:value={testEmail}
              required
              placeholder="your@email.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              We'll send a test email to verify your email system is working.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isTesting || !testEmail || !data.emailConfig.valid}
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isTesting}
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
        </form>
      </div>
    </div>

    <!-- Subscriber Stats -->
    <div class="mt-8 bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Subscriber Statistics</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{data.subscriberStats.total}</div>
          <div class="text-sm text-blue-800">Total</div>
        </div>
        
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{data.subscriberStats.confirmed}</div>
          <div class="text-sm text-green-800">Confirmed</div>
        </div>
        
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600">{data.subscriberStats.pending}</div>
          <div class="text-sm text-yellow-800">Pending</div>
        </div>
        
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{data.subscriberStats.newThisWeek}</div>
          <div class="text-sm text-purple-800">This Week</div>
        </div>
        
        <div class="text-center p-4 bg-indigo-50 rounded-lg">
          <div class="text-2xl font-bold text-indigo-600">{data.subscriberStats.newThisMonth}</div>
          <div class="text-sm text-indigo-800">This Month</div>
        </div>
      </div>
    </div>

    <!-- Documentation -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-blue-900 mb-3">Email System Setup</h3>
      
      <div class="prose text-blue-800 text-sm space-y-2">
        <p>To configure your email system, set these environment variables:</p>
        
        <ul class="list-disc list-inside space-y-1">
          <li><code class="bg-blue-100 px-1 rounded">SMTP_HOST</code> - Your SMTP server (e.g., smtp.gmail.com)</li>
          <li><code class="bg-blue-100 px-1 rounded">SMTP_PORT</code> - SMTP port (usually 587)</li>
          <li><code class="bg-blue-100 px-1 rounded">SMTP_USER</code> - Your email username</li>
          <li><code class="bg-blue-100 px-1 rounded">SMTP_PASS</code> - Your email password or app password</li>
          <li><code class="bg-blue-100 px-1 rounded">FROM_EMAIL</code> - Email address for sending newsletters</li>
          <li><code class="bg-blue-100 px-1 rounded">AUTHOR_EMAIL</code> - Your personal email for replies</li>
        </ul>
        
        <p class="mt-3">
          <strong>Personal Unsubscribe:</strong> When subscribers want to unsubscribe, they simply reply to any newsletter email. This creates a personal connection and gives you valuable feedback.
        </p>
      </div>
    </div>
  </div>
</div>
`;