<script lang="ts">
  import { createFallbackImage } from '$lib/utils/image';
  
  export let book: { title: string; cover?: string | null; [key: string]: any };
  
  function handleImageError(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    img.src = createFallbackImage(book.title || 'Book', 'book');
  }
</script>

<div class="book-card">
  <img 
    src={book.cover || createFallbackImage(book.title || 'Book', 'book')}
    alt={book.title}
    class="book-cover"
    loading="lazy"
    on:error={handleImageError}
  />
  <h3>{book.title}</h3>
</div>

<style>
  .book-cover {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
  }
</style>