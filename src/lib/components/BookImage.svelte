<script lang="ts">
  export let src: string | null;
  export let alt = '';
  export let loading: 'lazy' | 'eager' = 'lazy';  

  function fallback(e: Event) {
    (e.currentTarget as HTMLImageElement).src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200">
        <rect width="100%" height="100%" fill="#eee"/>
        <text x="50%" y="50%" font-size="48" text-anchor="middle" fill="#888">${alt || 'Cover'}</text>
      </svg>`);
  }
</script>

<img
  src={src ?? ''}
  alt={alt}
  loading={loading}   
  class="w-full h-80 object-cover rounded-lg shadow"
  on:error={fallback}
/>