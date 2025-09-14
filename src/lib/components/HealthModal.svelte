<!-- src/lib/components/HealthModal.svelte - Fixed A11y -->
<!-- @component
no description yet
-->
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
        fetch('/debug/mongodb')
      ]);

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
  
  // Handle keyboard events for accessibility
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="health-modal-title" 
    role="dialog" 
    aria-modal="true"
    onkeydown={handleKeydown}
  >
    <!-- ✅ FIXED: Background overlay as proper button -->
    <button
      type="button"
      class="fixed inset-0 bg-black/50 transition-opacity"
      onclick={close}
      aria-label="Close modal"
    ></button>

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
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close health modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {#if loading}
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-4 text-gray-600">Loading system health data...</p>
            </div>
          {:else if error}
            <div class="text-center py-8">
              <div class="text-red-500 mb-4">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <p class="text-gray-900 font-medium">Failed to load health data</p>
              <p class="text-gray-600 mt-1">{error}</p>
              <button 
                onclick={loadHealthData}
                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          {:else if healthData}
            <div class="space-y-6">
              <!-- System Status -->
              <div class="flex items-center p-4 bg-gray-50 rounded-lg">
                <div class="h-3 w-3 rounded-full {healthData.health.healthy ? 'bg-green-500' : 'bg-red-500'} mr-3"></div>
                <div>
                  <h4 class="font-medium text-gray-900">Overall Status</h4>
                  <p class="text-sm text-gray-600">
                    {healthData.health.healthy ? 'All systems operational' : 'Issues detected'}
                    • Last checked: {healthData.timestamp}
                  </p>
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
            </div>
          {/if}
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button 
            onclick={loadHealthData}
            disabled={loading}
            class="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          <button 
            onclick={close}
            class="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}