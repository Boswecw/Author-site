<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import type { ActionData } from './$types';
  import NewsletterModal from '$lib/components/NewsletterModal.svelte';

  // Runes props
  const props = $props<{ form: ActionData }>();
  const form = $derived(props.form);

  // Form state (must use $state because we mutate them)
  let name = $state('');
  let email = $state('');
  let subject = $state('');
  let message = $state('');

  // Runes-safe derived hint
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailHint = $derived(
    email ? (emailRegex.test(email) ? '' : 'Please enter a valid email address') : ''
  );

  // Toast + loading (must be $state if mutated)
  let showToast = $state(false);
  let submitMessage = $state('');
  let loading = $state(false);

  const enhanceSubmit = (node: HTMLFormElement) =>
    enhance(node, () => {
      loading = true;
      return async ({ result, update }) => {
        loading = false;

        if (result.type === 'success') {
          showToast = true;
          submitMessage = 'Message sent successfully!';
          name = ''; email = ''; subject = ''; message = '';
          setTimeout(() => (showToast = false), 5000);
        } else if (result.type === 'failure') {
          submitMessage = result.data?.error || 'Failed to send message';
          showToast = true;
          setTimeout(() => (showToast = false), 5000);
        }
        await update();
      };
    });

  function toast(msg: string) {
    submitMessage = msg;
    showToast = true;
    setTimeout(() => (showToast = false), 5000);
  }

  let modalRef: { show: (initialEmail?: string) => void; close?: () => void } | null = null;
  function openSubscribeModal() {
    modalRef?.show?.(email || '');
  }

  onMount(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLFormElement | null;
      if (!target) return;
      const action = target.getAttribute('action') || '';
      if (!action.includes('?/subscribe')) return;
      if ((target as any).__enhanced) return;
      (target as any).__enhanced = true;

      enhance(target, () => {
        return async ({ result, update }) => {
          if (result.type === 'success' && (result.data as any)?.success) {
            toast('Subscribed! Check your email to confirm.');
            modalRef?.close?.();
          } else if (result.type === 'failure') {
            const err = (result.data as any)?.error || 'Subscription failed. Please try again.';
            toast(err);
          }
          await update();
        };
      });
    };

    document.addEventListener('submit', handler, true);
    return () => document.removeEventListener('submit', handler, true);
  });
</script>

<svelte:head>
  <title>Contact — Charles W. Boswell</title>
  <meta name="description" content="Get in touch with Charles Boswell and subscribe to his newsletter for updates on new releases and adventures." />
</svelte:head>

{#if showToast}
  <div class="fixed top-4 right-4 z-50 max-w-md bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transition-all" role="alert">
    <span class="font-semibold">{submitMessage || 'Action completed.'}</span>
  </div>
{/if}

<section class="pt-28 pb-16 bg-white">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    {#if form?.success}
      <div class="rounded-xl border border-green-200 bg-green-50 p-6 mb-10">
        <h2 class="text-lg font-semibold text-green-800 mb-2">Message Sent Successfully!</h2>
        <p class="text-green-800/90">{form.message ?? "Thanks for reaching out. I'll get back to you soon."}</p>
      </div>
    {/if}

    <header class="text-center mb-12">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Have questions about my books, want to discuss a project, or just want to say hello?
        I'd love to hear from you.
      </p>
    </header>

    <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
      <!-- ✅ FIXED: Added action="?/contact" to use the named action -->
      <form method="POST" action="?/contact" use:enhanceSubmit class="space-y-6">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input id="name" name="name" type="text" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={name}
            aria-invalid={form?.errors?.name ? 'true' : 'false'}
            aria-describedby={form?.errors?.name ? 'name-error' : undefined}
          />
          {#if form?.errors?.name}
            <p id="name-error" class="mt-1 text-sm text-red-600">{form.errors.name}</p>
          {/if}
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input id="email" name="email" type="email" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={email}
            aria-invalid={form?.errors?.email ? 'true' : 'false'}
            aria-describedby={form?.errors?.email ? 'email-error' : (emailHint ? 'email-hint' : undefined)}
          />
          {#if emailHint && !form?.errors?.email}
            <p id="email-hint" class="mt-1 text-sm text-amber-700">{emailHint}</p>
          {/if}
          {#if form?.errors?.email}
            <p id="email-error" class="mt-1 text-sm text-red-600">{form.errors.email}</p>
          {/if}
        </div>

        <!-- Subject -->
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input id="subject" name="subject" type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={subject}
            aria-invalid={form?.errors?.subject ? 'true' : 'false'}
            aria-describedby={form?.errors?.subject ? 'subject-error' : undefined}
          />
          {#if form?.errors?.subject}
            <p id="subject-error" class="mt-1 text-sm text-red-600">{form.errors.subject}</p>
          {/if}
        </div>

        <!-- Message -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
          <textarea id="message" name="message" rows="5" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={message}
            aria-invalid={form?.errors?.message ? 'true' : 'false'}
            aria-describedby={form?.errors?.message ? 'message-error' : undefined}
          ></textarea>
          {#if form?.errors?.message}
            <p id="message-error" class="mt-1 text-sm text-red-600">{form.errors.message}</p>
          {/if}
        </div>

        <button type="submit" disabled={loading}
          class="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>

    <!-- Contact Info -->
    <div class="mt-16 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Other Ways to Connect</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Newsletter</h3>
          <p class="text-gray-600 mb-4">Stay updated on new releases, writing process insights, and exclusive content.</p>
          <!-- Svelte 5: use native onclick -->
          <button
            type="button"
            class="text-red-600 font-medium hover:text-red-700 transition-colors underline underline-offset-4 decoration-red-300"
            onclick={openSubscribeModal}
            aria-haspopup="dialog"
          >
            Subscribe →
          </button>
        </div>

        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Professional Inquiries</h3>
          <p class="text-gray-600 mb-4">For speaking engagements, interviews, or collaboration opportunities.</p>
          <p class="text-red-600 font-medium">Use the form above</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Newsletter modal -->
<NewsletterModal bind:this={modalRef} />