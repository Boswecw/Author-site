<script lang="ts">
    import type { Book } from '$lib/types';
    export let book: Book;
  
    const isPublished = book.status === 'published';
    const pub = new Date(book.publishDate).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  </script>
  
  <article class="grid gap-3 md:grid-cols-[180px,1fr] p-4 rounded-2xl shadow">
    <img src={book.cover} alt={`Cover of ${book.title}`} class="w-[180px] h-auto rounded-xl object-cover" />
    <div class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold">{book.title}</h3>
      <p class="opacity-80">{book.description}</p>
      <p class="text-sm">
        <strong>Status:</strong> {isPublished ? 'Available' : 'Coming {pub}'}
        {book.isbn ? ` • ISBN: ${book.isbn}` : ''}
        {book.format ? ` • ${book.format}` : ''}
      </p>
  
      {#if isPublished && Object.keys(book.buyLinks).length}
        <div class="flex gap-2 flex-wrap">
          {#if book.buyLinks.amazon}<a class="btn" href={book.buyLinks.amazon}>Amazon</a>{/if}
          {#if book.buyLinks.barnesNoble}<a class="btn" href={book.buyLinks.barnesNoble}>B&N</a>{/if}
          {#if book.buyLinks.appleBooks}<a class="btn" href={book.buyLinks.appleBooks}>Apple Books</a>{/if}
          {#if book.buyLinks.kobo}<a class="btn" href={book.buyLinks.kobo}>Kobo</a>{/if}
          {#if book.buyLinks.googlePlay}<a class="btn" href={book.buyLinks.googlePlay}>Google Play</a>{/if}
        </div>
      {:else}
        <form class="flex gap-2" method="post" action="/api/notify">
          <input class="input" name="email" type="email" placeholder="Get release email…" required />
          <input type="hidden" name="bookId" value={book.id} />
          <button class="btn" type="submit">Notify me</button>
        </form>
      {/if}
    </div>
  </article>
  
  <style>
    .btn { padding: .5rem .9rem; border-radius: 9999px; border: 1px solid currentColor; }
    .input { padding: .5rem .75rem; border-radius: .75rem; border: 1px solid #4443; }
  </style>
  