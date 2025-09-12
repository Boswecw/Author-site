// src/routes/admin/migration/+page.svelte
<!-- Admin page for data migration and system diagnostics -->

<script lang="ts">
  import { onMount } from 'svelte';
  
  let diagnostics = $state(null as any);
  let migrationResult = $state(null as any);
  let loading = $state({ diagnostics: false, migration: false });
  let error = $state(null as string | null);

  async function runDiagnostics() {
    loading.diagnostics = true;
    error = null;
    
    try {
      const response = await fetch('/admin/diagnostics');
      if (response.ok) {
        diagnostics = await response.json();
      } else {
        error = `Diagnostics failed: ${response.status}`;
      }
    } catch (err) {
      error = `Diagnostics error: ${err}`;
    } finally {
      loading.diagnostics = false;
    }
  }

  async function runMigration() {
    loading.migration = true;
    error = null;
    
    try {
      const response = await fetch('/admin/sync-subscribers', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        migrationResult = result;
        // Refresh diagnostics after successful migration
        setTimeout(runDiagnostics, 1000);
      } else {
        error = `Migration failed: ${result.error || response.status}`;
      }
    } catch (err) {
      error = `Migration error: ${err}`;
    } finally {
      loading.migration = false;
    }
  }

  // Run diagnostics on page load
  onMount(() => {
    runDiagnostics();
  });
</script>

<svelte:head>
  <title>Migration & Diagnostics - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">System Migration & Diagnostics</h1>
      <p class="mt-2 text-gray-600">Sync Google Sheets data to MongoDB and verify system health</p>
    </div>

    <!-- Error Alert -->
    {#if error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="mb-8 flex flex-col sm:flex-row gap-4">
      <button 
        onclick={runDiagnostics}
        disabled={loading.diagnostics}
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {#if loading.diagnostics}
          <svg class="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Running Diagnostics...
        {:else}
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Run Diagnostics
        {/if}
      </button>

      <button 
        onclick={runMigration}
        disabled={loading.migration}
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {#if loading.migration}
          <svg class="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Migrating Data...
        {:else}
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          Migrate Google Sheets → MongoDB
        {/if}
      </button>
    </div>

    <!-- Migration Results -->
    {#if migrationResult}
      <div class="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-green-800 mb-4">Migration Completed</h3>
        <p class="text-green-700 mb-4">{migrationResult.message}</p>
        
        {#if migrationResult.results?.details}
          <div class="space-y-2">
            <h4 class="font-medium text-green-800">Details:</h4>
            {#each migrationResult.results.details as detail}
              <div class="text-sm text-green-700 flex items-center">
                {#if detail.status === 'success'}
                  <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                {:else}
                  <svg class="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                {/if}
                <span class="font-medium">{detail.email}</span>
                <span class="ml-2">- {detail.action || detail.status}</span>
                {#if detail.error}
                  <span class="ml-2 text-red-600">({detail.error})</span>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Diagnostics Results -->
    {#if diagnostics}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- System Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div class="space-y-3">
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full {diagnostics.connection.healthy ? 'bg-green-500' : 'bg-red-500'} mr-3"></div>
              <span class="text-sm">
                MongoDB Connection: 
                <span class="font-medium">{diagnostics.connection.status}</span>
                {#if diagnostics.connection.connectionTime}
                  <span class="text-gray-500">({diagnostics.connection.connectionTime}ms)</span>
                {/if}
              </span>
            </div>
            
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full {diagnostics.subscribers.stats?.total > 0 ? 'bg-green-500' : 'bg-yellow-500'} mr-3"></div>
              <span class="text-sm">
                Subscriber Data: 
                <span class="font-medium">{diagnostics.subscribers.stats?.total || 0} records</span>
              </span>
            </div>
            
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full {diagnostics.summary.overallHealth === 'good' ? 'bg-green-500' : 'bg-yellow-500'} mr-3"></div>
              <span class="text-sm">
                Overall Health: 
                <span class="font-medium capitalize">{diagnostics.summary.overallHealth.replace('-', ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Database Collections -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Database Collections</h3>
          <div class="space-y-2">
            {#each Object.entries(diagnostics.database.collectionCounts) as [name, count]}
              <div class="flex justify-between text-sm">
                <span class="font-medium">{name}</span>
                <span class="text-gray-600">{count} documents</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Subscriber Statistics -->
        {#if diagnostics.subscribers.stats}
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Subscriber Statistics</h3>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-gray-900">{diagnostics.subscribers.stats.total}</div>
                <div class="text-sm text-gray-500">Total</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{diagnostics.subscribers.stats.confirmed}</div>
                <div class="text-sm text-gray-500">Confirmed</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-yellow-600">{diagnostics.subscribers.stats.pending}</div>
                <div class="text-sm text-gray-500">Pending</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-red-600">{diagnostics.subscribers.stats.unsubscribed}</div>
                <div class="text-sm text-gray-500">Unsubscribed</div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Data Issues -->
        {#if diagnostics.subscribers.dataIssues.length > 0}
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 class="text-lg font-medium text-yellow-800 mb-4">Data Issues Found</h3>
            <ul class="space-y-2">
              {#each diagnostics.subscribers.dataIssues as issue}
                <li class="text-sm text-yellow-700 flex items-start">
                  <svg class="h-4 w-4 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  {issue}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Navigation -->
    <div class="mt-8 text-center">
      <a href="/admin/subscribers" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
        ← Back to Subscriber Management
      </a>
    </div>
  </div>
</div>