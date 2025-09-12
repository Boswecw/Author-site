<!-- src/routes/newsletter/unsubscribe/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  $: status = $page.url.searchParams.get('status') ?? 'ok';
</script>

<section class="pt-24 pb-16 max-w-2xl mx-auto px-6">
  <h1 class="text-3xl font-semibold mb-2">
    {status === 'ok' ? 'You have been unsubscribed' : 'Unsubscribe'}
  </h1>
  <p class="text-gray-600">Sorry to see you go.</p>
</section>
