<!-- src/routes/admin/+page.svelte - Updated with Health Modal -->
<script lang="ts">
  import { onMount } from 'svelte';
  import HealthModal from '$lib/components/HealthModal.svelte';
  
  let stats = $state(null as any);
  let loading = $state(true);
  let healthModalRef: { show: () => void; close: () => void } | null = null;

  onMount(async () => {
    try {
      // Get quick stats overview (lightweight)
      const healthResponse = await fetch('/health');
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        stats = {
          database: healthData.database,
          subscribers: healthData.subscribers,
          healthy: healthData.healthy
        };
      }
    } catch (error) {
      console.warn('Failed to load admin stats:', error);
    } finally {
      loading = false;
    }
  });

  function openHealthModal() {
    healthModalRef?.show();
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Charles W. Boswell</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="mt-2 text-gray-600">Manage your author site and newsletter</p>
    </div>

    <!-- Quick Status Overview -->
    {#if loading}
      <div class="mb-8 bg-white rounded-lg shadow p-6">
        <div class="animate-pulse flex space-x-4">
          <div class="rounded-full bg-gray-300 h-12 w-12"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    {:else if stats}
      <div class="mb-8 bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full {stats.healthy ? 'bg-green-500' : 'bg-red-500'} mr-3"></div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">System Status</h3>
              <p class="text-sm text-gray-600">
                {stats.healthy ? 'All systems operational' : 'Issues detected'}
                {#if stats.database?.connected}
                  • Database connected
                {/if}
                {#if stats.subscribers?.total}
                  • {stats.subscribers.total} subscribers ({stats.subscribers.confirmed} confirmed)
                {/if}
              </p>
            </div>
          </div>
          <button 
            onclick={openHealthModal}
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            View Details
          </button>
        </div>
      </div>
    {/if}

    <!-- Admin Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Newsletter Management -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Newsletter</h3>
        </div>
        <p class="text-gray-600 mb-4">Manage subscribers, view campaigns, and handle newsletter operations.</p>
        <div class="space-y-2">
          <a 
            href="/admin/subscribers" 
            class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Manage Subscribers
          </a>
          <a 
            href="/admin/newsletters" 
            class="block w-full text-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Campaigns
          </a>
        </div>
      </div>

      <!-- Content Management -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Content</h3>
        </div>
        <p class="text-gray-600 mb-4">Manage books, blog posts, and site content.</p>
        <div class="space-y-2">
          <a 
            href="/books" 
            class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            View Books
          </a>
          <a 
            href="/blog" 
            class="block w-full text-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            View Blog
          </a>
        </div>
      </div>

      <!-- System Tools -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">System</h3>
        </div>
        <p class="text-gray-600 mb-4">Monitor health, view diagnostics, and manage system settings.</p>
        <div class="space-y-2">
          <button 
            onclick={openHealthModal}
            class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            System Health
          </button>
          <a 
            href="/admin/diagnostics" 
            class="block w-full text-center px-4 py-2 border border-purple-600 text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Full Diagnostics
          </a>
        </div>
      </div>

      <!-- Site Pages -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Site Pages</h3>
        </div>
        <p class="text-gray-600 mb-4">Navigate to main site pages and view public content.</p>
        <div class="grid grid-cols-2 gap-2">
          <a 
            href="/" 
            class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Homepage
          </a>
          <a 
            href="/about" 
            class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            About
          </a>
          <a 
            href="/contact" 
            class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Contact
          </a>
          <a 
            href="/books" 
            class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Books
          </a>
        </div>
      </div>

      <!-- External Links -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">External Services</h3>
        </div>
        <p class="text-gray-600 mb-4">Access external services and backups.</p>
        <div class="space-y-2">
          <a 
            href="https://docs.google.com/spreadsheets/d/1Sbz89vJMlc1MYIlQ-Ol41Grq_DghdT1M7g7aTQ06qiA/edit"
            target="_blank"
            class="block w-full text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Google Sheets Backup
          </a>
          <a 
            href="https://dashboard.render.com"
            target="_blank"
            class="block w-full text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Render Dashboard
          </a>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800">Admin Dashboard</h3>
      <p class="text-sm text-blue-700 mt-1">
        Welcome to your author site admin panel. Use the tools above to manage your newsletter, content, and monitor system health.
        {#if stats?.subscribers?.total}
          You currently have <strong>{stats.subscribers.total} newsletter subscribers</strong> with <strong>{stats.subscribers.confirmed} confirmed</strong>.
        {/if}
      </p>
    </div>
  </div>
</div>

<!-- Health Modal -->
<HealthModal bind:this={healthModalRef} />