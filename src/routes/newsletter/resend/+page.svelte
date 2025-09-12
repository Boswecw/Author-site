<!-- src/routes/newsletter/resend/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  // Runes props
  const props = $props<{ form: ActionData }>();
  const form = $derived(props.form);

  // State
  let email = $state('');
  let name = $state('');
  let loading = $state(false);
  let toast = $state<{ msg: string; kind: 'ok' | 'err' } | null>(null);

  // ✅ Initialize from `form` once, then stop (so typing isn't overwritten)
  let _inited = $state(false);
  $effect(() => {
    if (_inited) return;
    email = (form?.values as any)?.email ?? '';
    name = (form?.values as any)?.name ?? '';
    _inited = true;
  });

  const enhanceSubmit = (node: HTMLFormElement) =>
    enhance(node, () => {
      loading = true;
      toast = null;
      return async ({ result, update }) => {
        loading = false;
        if (result.type === 'success' && (result.data as any)?.success) {
          toast = { msg: (result.data as any)?.message || 'New confirmation sent.', kind: 'ok' };
        } else if (result.type === 'failure') {
          toast = { msg: (result.data as any)?.error || 'Please try again.', kind: 'err' };
        }
        await update();
      };
    });
</script>

<svelte:head>
  <title>Resend Confirmation — Newsletter</title>
  <meta name="description" content="Request a new confirmation link for your newsletter subscription." />
</svelte:head>

<section class="pt-28 pb-16">
  <div class="max-w-md mx-auto px-4">
    <h1 class="text-3xl font-semibold mb-2">Resend confirmation</h1>
    <p class="text-gray-600 mb-6">Didn’t get the email? Enter your address and we’ll send a fresh confirmation link.</p>

    {#if toast}
      <div class={`mb-4 rounded-lg px-4 py-3 ${toast.kind === 'ok' ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
        {toast.msg}
      </div>
    {/if}

    <form method="POST" use:enhanceSubmit class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input id="email" name="email" type="email" required
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          bind:value={email} autocomplete="email" />
        {#if form?.error && !form?.success}
          <p class="mt-1 text-sm text-red-600">{form.error}</p>
        {/if}
      </div>

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
        <input id="name" name="name" type="text"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          bind:value={name} autocomplete="name" />
      </div>

      <button type="submit" class="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
        {loading ? 'Sending…' : 'Send link'}
      </button>

      <p class="text-sm text-gray-500">Tip: check your spam folder, and add our address to your contacts.</p>
    </form>

    <div class="mt-8 text-sm">
      <a href="/contact" class="text-red-600 hover:text-red-700">← Back to Contact</a>
    </div>
  </div>
</section>
