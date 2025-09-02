<script lang="ts">
  export let genre: 'faith' | 'epic';
  export let size: 'small' | 'medium' = 'medium';

  $: badgeStyle = genre === 'epic'
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';

  $: textSize = size === 'small' ? 'text-xs' : 'text-sm';
  $: padding = size === 'small' ? 'px-2 py-1' : 'px-3 py-1';

  $: displayText = genre === 'epic' ? 'Epic Fantasy' : 'Christian Fiction';
</script>

<span class="inline-flex items-center {padding} {textSize} font-medium rounded-full border {badgeStyle}">
  {displayText}
</span>

