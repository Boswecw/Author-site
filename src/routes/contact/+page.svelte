<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';

  export let form:
    | {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        values?: Record<string, string>;
      }
    | undefined;

  // Bound inputs (preserve on failed submit)
  let name = form?.values?.name ?? '';
  let email = form?.values?.email ?? '';
  let subject = form?.values?.subject ?? '';
  let message = form?.values?.message ?? '';

  // Toast
  let showToast = false;
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  function openToast() {
    showToast = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (showToast = false), 4000);
  }

  // Simple client email hint
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  $: emailHint = email && !emailRe.test(email) ? 'Enter a valid email address.' : '';

  // If this page is rendered with a success already present (non-JS or full reload)
  onMount(() => {
    if (form?.success) openToast();
  });

  // ✅ Correct enhance signature
  const enhanceSubmit = (node: HTMLFormElement) =>
    enhance(node, ({ form: _f, submit }) => {
      // Use default submit behavior but intercept the result afterwards
      return async ({ result, update }) => {
        if (result.type === 'success') {
          openToast();
          update({ reset: true }); // clears native form
          // clear bound values too
          name = '';
          email = '';
          subject = '';
          message = '';
        }
        // On failure, SvelteKit injects new `form` data; bound values remain as-typed
      };
    });
</script>

<svelte:head>
  <title>Contact — Charles W. Boswell</title>
  <meta name="description" content="Get in touch with author Charles W. Boswell." />
</svelte:head>

{#if showToast}
  <div
    class="fixed inset-x-0 top-4 z-[200] mx-auto w-fit rounded-lg px-4 py-3 text-white shadow-lg"
    style="background: var(--accent-600)"
    role="status"
    aria-live="polite"
  >
    <span class="font-semibold">Message sent.</span>
    <span class="ml-2 opacity-90">{form?.message ?? 'Thanks for reaching out!'}</span>
  </div>
{/if}

<section class="pt-28 pb-20 bg-white scroll-mt-28">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center mb-10">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Contact</h1>
      <p class="text-lg text-gray-600">
        Questions, speaking requests, media inquiries — I read every message.
      </p>
    </header>

    {#if form?.success}
      <div class="rounded-xl border border-green-200 bg-green-50 p-6 mb-10">
        <h2 class="text-xl font-semibold text-green-800 mb-1">Message sent</h2>
        <p class="text-green-800/90">
          {form.message ?? "Thanks for reaching out. I'll get back to you soon."}
        </p>
      </div>
    {/if}

    <form
      method="POST"
      class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-6"
      use:enhanceSubmit
    >
      <!-- Honeypot -->
      <div class="hidden">
        <label for="website">Website (leave this blank)</label>
        <input id="website" name="website" type="text" autocomplete="off" tabindex="-1" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Your name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={name}
            aria-invalid={form?.errors?.name ? 'true' : 'false'}
            aria-describedby={form?.errors?.name ? 'name-error' : undefined}
          />
          {#if form?.errors?.name}
            <p id="name-error" class="mt-1 text-sm text-red-600">{form.errors.name}</p>
          {/if}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={email}
            aria-invalid={form?.errors?.email ? 'true' : 'false'}
            aria-describedby={(form?.errors?.email || emailHint) ? 'email-error' : undefined}
          />
          {#if emailHint && !form?.errors?.email}
            <p id="email-error" class="mt-1 text-sm text-amber-700">{emailHint}</p>
          {/if}
          {#if form?.errors?.email}
            <p id="email-error" class="mt-1 text-sm text-red-600">{form.errors.email}</p>
          {/if}
        </div>
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          bind:value={subject}
          aria-invalid={form?.errors?.subject ? 'true' : 'false'}
          aria-describedby={form?.errors?.subject ? 'subject-error' : undefined}
        />
        {#if form?.errors?.subject}
          <p id="subject-error" class="mt-1 text-sm text-red-600">{form.errors.subject}</p>
        {/if}
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          name="message"
          rows="6"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          bind:value={message}
          aria-invalid={form?.errors?.message ? 'true' : 'false'}
          aria-describedby={form?.errors?.message ? 'message-error' : undefined}
        ></textarea>
        {#if form?.errors?.message}
          <p id="message-error" class="mt-1 text-sm text-red-600">{form.errors.message}</p>
        {/if}
      </div>

      <div class="flex items-center justify-between gap-4">
        <button
          type="submit"
          class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
        >
          Send message
        </button>

        <a
          href="mailto:charlesboswell@boswellwebdevelopment.com"
          class="text-sm font-semibold text-gray-600 hover:text-gray-800"
        >
          or email me directly
        </a>
      </div>
    </form>

    <div class="mt-10 text-sm text-gray-500">
      <p>By submitting, you agree your information will be stored to contact you regarding your inquiry.</p>
    </div>
  </div>
</section>
