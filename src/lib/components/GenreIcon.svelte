<!-- src/lib/components/GenreIcon.svelte -->
<script lang="ts">
  import { IMAGES } from '$lib/utils/image';

  export let genre: 'faith' | 'epic' = 'faith';
  export let size: 'small' | 'medium' | 'large' = 'medium';

  $: iconUrl = genre === 'epic' ? IMAGES.EPIC_ICON : IMAGES.FAITH_ICON;
  $: iconAlt = genre === 'epic' ? 'Epic Fantasy' : 'Christian Fiction';

  $: sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40 md:w-56 md:h-56'
  }[size];

  $: fallbackText = genre === 'epic' ? 'EPIC' : 'FAITH';
  $: fallbackColors = genre === 'epic'
    ? 'bg-red-800 text-white'
    : 'bg-blue-800 text-white';
</script>

<div class="relative inline-block">
  <img
    src={iconUrl}
    alt={iconAlt}
    class="{sizeClasses} rounded-full shadow-lg object-cover"
    loading="lazy"
    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
  />

  <!-- Fallback if image fails -->
  <div
    class="{sizeClasses} {fallbackColors} rounded-full shadow-lg items-center justify-center font-bold text-sm hidden"
  >
    {fallbackText}
  </div>
</div>
