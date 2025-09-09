<!-- src/routes/contact/+page.svelte - FIXED: Proper state variable declarations -->
<script lang="ts">
  import { enhance } from '$app/forms';
 
  export let form: ActionData;

  // ✅ FIXED: Declare form state variables properly for Svelte 5
  let name = '';
  let email = '';
  let subject = '';
  let message = '';

  // Email validation
  let emailHint = '';
  $: if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailHint = emailRegex.test(email) ? '' : 'Please enter a valid email address';
  } else {
    emailHint = '';
  }

  // Success message handling
  let showToast = false;
  let submitMessage = '';

  const enhanceSubmit = (node: HTMLFormElement) =>
    enhance(node, ({ formData, cancel }) => {
      // Show loading state if needed
      return async ({ result, update }) => {
        if (result.type === 'success') {
          showToast = true;
          submitMessage = 'Message sent successfully!';
          
          // Clear form
          name = '';
          email = '';
          subject = '';
          message = '';
          
          // Hide toast after 5 seconds
          setTimeout(() => {
            showToast = false;
          }, 5000);
        } else if (result.type === 'failure') {
          submitMessage = result.data?.error || 'Failed to send message';
        }
        await update();
      };
    });
</script>

<svelte:head>
  <title>Contact — Charles W. Boswell</title>
  <meta name="description" content="Get in touch with Charles Boswell and subscribe to his newsletter for updates on new releases and adventures." />
</svelte:head>

<!-- Toast notification -->
{#if showToast}
  <div
    class="fixed top-4 right-4 z-50 max-w-md bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out"
    role="alert"
  >
    <span class="font-semibold">Message sent.</span>
    <span class="ml-2 opacity-90">{form?.message ?? 'Thanks for reaching out!'}</span>
  </div>
{/if}

<section class="pt-28 pb-16 bg-white">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

    {#if form?.success}
      <div class="rounded-xl border border-green-200 bg-green-50 p-6 mb-10">
        <h2 class="text-lg font-semibold text-green-800 mb-2">Message Sent Successfully!</h2>
        <p class="text-green-800/90">
          {form.message ?? "Thanks for reaching out. I'll get back to you soon."}
        </p>
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
      <form method="POST" use:enhanceSubmit class="space-y-6">
        
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
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

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
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

        <!-- Subject Field -->
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            bind:value={subject}
            aria-invalid={form?.errors?.subject ? 'true' : 'false'}
            aria-describedby={form?.errors?.subject ? 'subject-error' : undefined}
          />
          {#if form?.errors?.subject}
            <p id="subject-error" class="mt-1 text-sm text-red-600">{form.errors.subject}</p>
          {/if}
        </div>

        <!-- Message Field -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows="5"
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

        <button
          type="submit"
          class="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Send Message
        </button>
      </form>
    </div>

    <!-- Contact Info -->
    <div class="mt-16 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Other Ways to Connect</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        
        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Newsletter</h3>
          <p class="text-gray-600 mb-4">
            Stay updated on new releases, writing process insights, and exclusive content.
          </p>
          <a href="#newsletter" class="text-red-600 font-medium hover:text-red-700 transition-colors">
            Subscribe →
          </a>
        </div>

        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Professional Inquiries</h3>
          <p class="text-gray-600 mb-4">
            For speaking engagements, interviews, or collaboration opportunities.
          </p>
          <p class="text-red-600 font-medium">
            Use the form above
          </p>
        </div>

      </div>
    </div>
  </div>
</section>