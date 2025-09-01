<script lang="ts">
    export let data: { component: any; metadata: any };
    const Post = data.component;
  </script>
  
  <svelte:head>
    <title>{data.metadata?.title} — Charles W. Boswell</title>
    {#if data.metadata?.excerpt}
      <meta name="description" content={data.metadata.excerpt} />
    {/if}
  </svelte:head>
  
  <Post metadata={data.metadata} />
  