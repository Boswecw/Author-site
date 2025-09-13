<!-- src/lib/components/HealthModal.svelte -->
<script lang="ts">
  let open = $state(false);
  let loading = $state(false);
  let healthData = $state(null as any);
  let error = $state(null as string | null);

  export function show() {
    open = true;
    loadHealthData();
  }

  export function close() {
    open = false;
    error = null;
  }

  async function loadHealthData() {
    loading = true;
    error = null;
    
    try {
      const [healthResponse, diagnosticsResponse] = await Promise.all([
        fetch('/health'),
        fetch('/debug/mongodb'),
        fetch('/admin/diagnostics')
      ].slice(0, 2)); // Only use first 2 for now, add 3rd if needed

      const healthResult = await healthResponse.json();
      const mongoResult = await diagnosticsResponse.json();

      healthData = {
        health: healthResult,
        mongodb: mongoResult,
        timestamp: new Date().toLocaleString()
      };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load health data';
    } finally {
      loading = false;
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="health-modal-title" 
    role="dialog" 
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      onclick={close}
    ></div>

    <!-- Modal panel -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 id="health-modal-title" class="text-lg font-medium text-gray-900">
            System Health Check
          </h3>
          <button 
            onclick={close}
            class="text-gray-400 hover:text-gray-500 p-2"
            aria-label="Close modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {#if loading}
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-3 text-gray-600">Loading health data...</span>
            </div>
          {:else if error}
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error Loading Health Data</h3>
                  <p class="mt-1 text-sm text-red-700">{error}</p>
                  <button 
                    onclick={loadHealthData}
                    class="mt-2 text-sm text-red-600 underline hover:text-red-800"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          {:else if healthData}
            <div class="space-y-6">
              <!-- Timestamp -->
              <div class="text-xs text-gray-500">
                Last updated: {healthData.timestamp}
              </div>

              <!-- Overall Status -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Overall Status</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="flex items-center">
                    <div class="h-3 w-3 rounded-full {healthData.health.healthy ? 'bg-green-500' : 'bg-red-500'} mr-2"></div>
                    <span class="text-sm font-medium">
                      {healthData.health.healthy ? 'Healthy' : 'Unhealthy'}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Environment: {healthData.health.environment?.nodeEnv || 'unknown'}
                  </div>
                  <div class="text-sm text-gray-600">
                    Platform: {healthData.health.environment?.platform || 'unknown'}
                  </div>
                </div>
              </div>

              <!-- Database Status -->
              {#if healthData.health.database || healthData.mongodb}
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Database</h4>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Connection:</span>
                      <span class="text-sm {healthData.health.database?.connected ? 'text-green-600' : 'text-red-600'}">
                        {healthData.health.database?.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    {#if healthData.health.database?.connectionTime}
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Connection Time:</span>
                        <span class="text-sm text-gray-900">{healthData.health.database.connectionTime}ms</span>
                      </div>
                    {/if}
                    {#if healthData.mongodb?.database?.collections}
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Collections:</span>
                        <span class="text-sm text-gray-900">
                          {healthData.mongodb.database.collections.join(', ')}
                        </span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- Subscribers -->
              {#if healthData.health.subscribers}
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Subscribers</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-900">{healthData.health.subscribers.total || 0}</div>
                      <div class="text-xs text-gray-500">Total</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-600">{healthData.health.subscribers.confirmed || 0}</div>
                      <div class="text-xs text-gray-500">Confirmed</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-yellow-600">{healthData.health.subscribers.pending || 0}</div>
                      <div class="text-xs text-gray-500">Pending</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-red-600">{healthData.health.subscribers.unsubscribed || 0}</div>
                      <div class="text-xs text-gray-500">Unsubscribed</div>
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Performance -->
              {#if healthData.health.performance}
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Performance</h4>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Total Response Time:</span>
                      <span class="text-sm text-gray-900">{healthData.health.performance.totalTime}ms</span>
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Configuration -->
              {#if healthData.health.configuration}
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Configuration</h4>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">MongoDB URI:</span>
                      <span class="text-sm {healthData.health.configuration.hasMongoUri ? 'text-green-600' : 'text-red-600'}">
                        {healthData.health.configuration.hasMongoUri ? 'Configured' : 'Missing'}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Database Name:</span>
                      <span class="text-sm text-gray-900">{healthData.health.configuration.mongoDbName}</span>
                    </div>
                    {#if healthData.health.configuration.uriHost}
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Host:</span>
                        <span class="text-sm text-gray-900">{healthData.health.configuration.uriHost}</span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button 
            onclick={loadHealthData}
            disabled={loading}
            class="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          <button 
            onclick={close}
            class="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}