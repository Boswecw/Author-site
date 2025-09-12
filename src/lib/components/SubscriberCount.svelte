<!-- src/lib/components/SubscriberCount.svelte - Display subscriber count on public site -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let subscriberCount = $state(0);
  let loading = $state(true);
  let error = $state(false);
  
  onMount(async () => {
    try {
      const response = await fetch('/api/newsletter/stats');
      if (response.ok) {
        const data = await response.json();
        subscriberCount = data.confirmed || 0;
      } else {
        error = true;
      }
    } catch (err) {
      console.error('Failed to load subscriber count:', err);
      error = true;
    } finally {
      loading = false;
    }
  });
  
  function formatCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
</script>

<div class="inline-flex items-center gap-2 text-sm text-gray-600">
  {#if loading}
    <div class="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    <span>Loading...</span>
  {:else if error}
    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
    <span>Newsletter readers</span>
  {:else}
    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
    <span><strong>{formatCount(subscriberCount)}</strong> newsletter readers</span>
  {/if}
</div>

<!-- API endpoint for subscriber stats -->
<!-- Create: src/routes/api/newsletter/stats/+server.ts -->
<style>
  /* Optional: Add any custom styling */
</style>