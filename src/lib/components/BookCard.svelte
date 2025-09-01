<script lang="ts">
  export let title: string;
  export let subtitle: string | undefined = undefined;
  export let description: string;
  export let status: string;
  export let isbn: string | undefined = undefined;
  export let format: string | undefined = "EPUB";
  export let coverSrc: string;
  export let ctaLabel: string = "Notify Me";
  export let onNotify: (email: string) => void = () => {};
  let email = "";
</script>

<div class="h-full rounded-2xl border border-gray-200/70 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
  <!-- Top: media + copy -->
  <div class="p-5 sm:p-6 flex gap-5">
    <img
      src={coverSrc}
      alt={title}
      class="h-40 w-28 sm:h-44 sm:w-32 rounded-md object-cover shadow"
      loading="lazy"
    />
    <div class="min-w-0">
      <h3 class="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
      {#if subtitle}<p class="text-sm text-gray-500 mt-0.5">{subtitle}</p>{/if}
      <p class="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-6">{description}</p>

      <dl class="mt-4 space-x-3 text-xs text-gray-500">
        <span class="inline-flex items-center gap-1">
          <dt class="font-medium text-gray-600">Status:</dt>
          <dd>{status}</dd>
        </span>
        {#if isbn}
          <span class="inline-flex items-center gap-1">
            <dt class="font-medium text-gray-600">ISBN:</dt>
            <dd>{isbn}</dd>
          </span>
        {/if}
        {#if format}
          <span class="inline-flex items-center gap-1">
            <dt class="font-medium text-gray-600">•</dt>
            <dd>{format}</dd>
          </span>
        {/if}
      </dl>
    </div>
  </div>

  <!-- Footer: sticks to bottom -->
  <div class="mt-auto border-t border-gray-100 px-5 sm:px-6 py-4">
    <form
      class="flex items-center gap-3"
      on:submit|preventDefault={() => onNotify(email)}
    >
      <input
        class="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
        type="email"
        placeholder="Get release updates…"
        bind:value={email}
      />
      <button
        type="submit"
        class="h-10 shrink-0 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 text-white text-sm font-medium shadow hover:opacity-95 active:opacity-90"
        aria-label={ctaLabel}
      >
        {ctaLabel}
      </button>
    </form>
  </div>
</div>
