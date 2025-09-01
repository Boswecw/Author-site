<script>
    export let genre; // expects "faith" or "epic"
    export let size = "w-10 h-10";
  
    // Firebase URLs for your branded icons
    const icons = {
      faith: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/icons%2Ffaith-icon.png?alt=media",
      epic: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/icons%2Fepic-icon.png?alt=media"
    };
  
    $: iconUrl = icons[genre] || null;
  </script>
  
  {#if iconUrl}
    <img src={iconUrl} alt={`${genre} icon`} class={`${size} object-contain mx-auto`} />
  {/if}
  