<script lang="ts">
  import { enhance } from '$app/forms';

  // SvelteKit form actions result
  export let form:
    | {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        values?: Record<string, string>;
      }
    | undefined;

  // Live client-side helpers
  let name = form?.values?.name ?? '';
  let email = form?.values?.email ?? '';
  let subject = form?.values?.subject ?? '';
  let message = form?.values?.message ?? '';

  // optional: basic client validation feedback
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  $: emailHint = email && !emailRe.test(email) ? 'Enter a valid email address.' : '';
</script>


<svelte:head>
  <title>Contact — Charles W. Boswell</title>
  <meta name="description" content="Get in touch with author Charles W. Boswell." />
</svelte:head>

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
        <p class="text-green-800/90">{form.message ?? 'Thanks for reaching out. I’ll get back to you soon.'}</p>
      </div>
    {/if}

    <form method="POST" class="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8 space-y-6" use:enhance>
      <!-- Honeypot (hidden from humans) -->
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
        />
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

        <a href="mailto:contact@yourdomain.com" class="text-sm font-semibold text-gray-600 hover:text-gray-800">
          or email me directly
        </a>
      </div>
    </form>

    <div class="mt-10 text-sm text-gray-500">
      <p>By submitting, you agree your information will be stored to contact you regarding your inquiry.</p>
    </div>
  </div>
</section>

<!-- progressive enhancement for form actions -->
<script>
  // SvelteKit's enhance is available globally in +page.svelte
  // If you don't want JS enhancement, remove `use:enhance` on <form>.
  import { enhance } from '$app/forms';
</script>
