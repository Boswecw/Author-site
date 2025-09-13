<!-- src/lib/components/NewsletterModal.svelte -->
<script lang="ts">
  // Runes-friendly props + instance methods (Svelte 5)
  const props = $props<{ onClose?: () => void; initialEmail?: string }>();

  let open = $state(false);
  let emailPrefill = $state(props.initialEmail ?? '');

  // Expose instance methods using `export function`
  export function show(email = '') {
    emailPrefill = email || props.initialEmail || '';
    open = true;
    queueMicrotask(() => {
      const el = document.getElementById('nl-email') as HTMLInputElement | null;
      el?.focus();
    });
  }

  export function close() {
    open = false;
    props.onClose?.();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
    role="dialog" tabindex="-1" tabindex="-1"
    aria-modal="true"
    aria-labelledby="nl-title"
    tabindex="-1" 
    onclick={(e) => e.currentTarget === e.target && close()}
    onkeydown={(e) => e.key === 'Escape' && close()}
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
      <div class="flex items-start justify-between gap-4">
        <h2 id="nl-title" class="text-xl font-semibold">Subscribe to the Newsletter</h2>
        <button
          class="rounded p-2 hover:bg-black/5 dark:hover:bg-white/10"
          onclick={close}
          aria-label="Close"
        >✕</button>
      </div>

      <!-- optional success slot -->
       {#if $$slots.success}
        {@render $$slots.success()}
      {/if}

      <form method="POST" action="?/subscribe" class="mt-4 space-y-4">
        <div class="space-y-1">
          <label for="nl-name" class="text-sm">Name (optional)</label>
          <input id="nl-name" name="name" type="text" class="w-full rounded border px-3 py-2" placeholder="Your name" />
        </div>

        <div class="space-y-1">
          <label for="nl-email" class="text-sm">Email</label>
          <input
            id="nl-email"
            name="email"
            type="email"
            required
            class="w-full rounded border px-3 py-2"
            placeholder="you@example.com"
            value={emailPrefill}
          />
        </div>

        <!-- Honeypot (spam trap) -->
        <div class="hidden" aria-hidden="true">
          <label>
            Do not fill this field
            <input name="website" tabindex="-1" autocomplete="off" />
          </label>
        </div>

        <button
          type="submit"
          class="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Subscribe
        </button>

        <!-- Resend helper -->
        <p class="text-xs text-neutral-500 mt-2">
          Didn’t get the email?
          <a class="underline text-red-600" href="/newsletter/resend">Resend</a>
        </p>

        <!-- Legal -->
        <p class="text-xs text-neutral-500">
          By subscribing you agree to receive occasional updates. Unsubscribe anytime.
        </p>
      </form>
    </div>
  </div>
{/if}
