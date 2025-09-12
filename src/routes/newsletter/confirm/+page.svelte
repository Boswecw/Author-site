<!-- src/routes/newsletter/confirm/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  $: status = $page.url.searchParams.get('status') ?? 'ok';
</script>

<section class="pt-24 pb-16 max-w-2xl mx-auto px-6 text-center">
  {#if status === 'ok'}
    <h1 class="text-3xl font-semibold mb-2">Subscription confirmed 🎉</h1>
    <p class="text-gray-600">Thanks for joining the newsletter.</p>
  {:else if status === 'expired'}
    <h1 class="text-3xl font-semibold mb-2">Link expired</h1>
    <p class="text-gray-600">
      Your confirmation link has expired. You can
      <a
        href="/newsletter/resend"
        class="text-red-600 hover:text-red-700 underline underline-offset-2"
      >
        request a new one here
      </a>.
    </p>
  {/if}
</section>
