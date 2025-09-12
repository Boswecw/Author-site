<!-- src/routes/admin/+page.svelte - Admin Dashboard -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let stats = $state(null as any);
  let loading = $state(true);

  onMount(async () => {
    try {
      // Get quick health/stats overview
      const [healthResponse, diagnosticsResponse] = await Promise.all([
        fetch('/health'),
        fetch('/admin/diagnostics')
      ]);
      
      if (healthResponse.ok && diagnosticsResponse.ok) {
        const healthData = await healthResponse.json();
        const diagnosticsData = await diagnosticsResponse.json();
        
        stats = {
          database: healthData.database,
          subscribers: diagnosticsData.subscribers,
          overall: diagnosticsData.summary
        };
      }
    } catch (error) {
      console.warn('Failed to load admin stats:', error);
    } finally {
      loading = false;
    }
  });
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
      <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Database Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full {stats.database?.connected ? 'bg-green-500' : 'bg-red-500'} mr-3"></div>
            <h3 class="text-lg font-medium text-gray-900">Database</h3>
          </div>
          <p class="mt-2 text-sm text-gray-600">
            {stats.database?.connected ? 'Connected' : 'Disconnected'}
            {#if stats.database?.connectionTime}
              ({stats.database.connectionTime}ms)
            {/if}
          </p>
        </div>

        <!-- Subscribers -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <svg class="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Subscribers</h3>
          </div>
          <p class="mt-2 text-2xl font-bold text-gray-900">
            {stats.subscribers?.stats?.total || 0}
          </p>
          <p class="text-sm text-gray-600">
            {stats.subscribers?.stats?.confirmed || 0} confirmed
          </p>
        </div>

        <!-- System Health -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full {stats.overall?.overallHealth === 'good' ? 'bg-green-500' : 'bg-yellow-500'} mr-3"></div>
            <h3 class="text-lg font-medium text-gray-900">System Health</h3>
          </div>
          <p class="mt-2 text-sm text-gray-600 capitalize">
            {stats.overall?.overallHealth?.replace('-', ' ') || 'Unknown'}
          </p>
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
        <p class="text-gray-600 mb-4">Manage subscribers, view statistics, and handle newsletter operations.</p>
        <a 
          href="/admin/subscribers" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Manage Subscribers
          <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <!-- Data Migration -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Data Migration</h3>
        </div>
        <p class="text-gray-600 mb-4">Sync data between Google Sheets and MongoDB, run diagnostics.</p>
        <a 
          href="/admin/migration" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Migration Tools
          <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <!-- System Health -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">System Health</h3>
        </div>
        <p class="text-gray-600 mb-4">Monitor database connections, system performance, and diagnostics.</p>
        <a 
          href="/health" 
          target="_blank"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Health Check
          <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>

      <!-- Content Management -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Books & Content</h3>
        </div>
        <p class="text-gray-600 mb-4">Manage your books, blog posts, and website content.</p>
        <div class="space-x-2">
          <a 
            href="/books" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            View Books
          </a>
          <a 
            href="/blog" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            View Blog
          </a>
        </div>
      </div>

      <!-- Site Navigation -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <svg class="h-8 w-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">Public Site</h3>
        </div>
        <p class="text-gray-600 mb-4">Visit the public-facing parts of your author website.</p>
        <div class="space-x-2">
          <a 
            href="/" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Homepage
          </a>
          <a 
            href="/about" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            About
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
        {#if stats?.subscribers?.stats?.total}
          You currently have <strong>{stats.subscribers.stats.total} newsletter subscribers</strong> with <strong>{stats.subscribers.stats.confirmed} confirmed</strong>.
        {/if}
      </p>
    </div>
  </div>
</div>