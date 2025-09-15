<!-- src/lib/components/email/BrandedNewsletterTemplate.svelte -->
<!-- @component
no description yet
-->
<script lang="ts">
  export let newsletterData: {
    subject: string;
    preheader: string;
    featuredStory: {
      headline: string;
      content: string;
      author: string;
      date: string;
      genre?: 'epic-fantasy' | 'christian-fiction' | 'sci-fi' | 'multi-genre';
      image?: string;
    };
    topStories: Array<{
      headline: string;
      excerpt: string;
      author: string;
      date: string;
      genre?: 'epic-fantasy' | 'christian-fiction' | 'sci-fi' | 'behind-scenes' | 'personal';
      url?: string;
    }>;
    author: {
      name: string;
      bio: string;
      website: string;
      address?: string;
    };
    books?: Array<{
      title: string;
      coverUrl: string;
      description: string;
      genre: 'epic-fantasy' | 'christian-fiction' | 'sci-fi';
      amazonUrl?: string;
    }>;
    unsubscribeUrl: string;
    webviewUrl: string;
    websiteUrl: string;
  };

  // Genre icon mapping
  const genreIcons = {
    'epic-fantasy': '🐲',
    'christian-fiction': '✝️',
    'sci-fi': '🚀',
    'multi-genre': '📖',
    'behind-scenes': '🔍',
    'personal': '🔥'
  };

  // Genre colors (inspired by your golden/bronze branding)
  const genreColors = {
    'epic-fantasy': '#D97706', // Bronze/amber for dragons
    'christian-fiction': '#B45309', // Darker bronze for faith
    'sci-fi': '#F59E0B', // Golden for sci-fi
    'multi-genre': '#92400E', // Deep bronze
    'behind-scenes': '#78350F',
    'personal': '#451A03'
  };

  function getGenreIcon(genre?: string): string {
    return genre ? genreIcons[genre as keyof typeof genreIcons] || '📖' : '📖';
  }

  function getGenreColor(genre?: string): string {
    return genre ? genreColors[genre as keyof typeof genreColors] || '#92400E' : '#92400E';
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
</script>

<!-- Email template with golden/bronze branding -->
<div style="
  max-width: 600px; 
  margin: 0 auto; 
  font-family: Georgia, 'Times New Roman', serif; 
  line-height: 1.6; 
  color: #333;
  background-color: #ffffff;
">
  <!-- Header Section with Brand Icons -->
  <header style="
    background: linear-gradient(135deg, #1c1917, #292524);
    color: #FEF3C7;
    padding: 40px 30px;
    text-align: center;
    border-radius: 8px 8px 0 0;
    position: relative;
  ">
    <!-- Golden accent border -->
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #F59E0B, #D97706, #B45309);
    "></div>
    
    <h1 style="
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      color: #FEF3C7;
    ">
      {newsletterData.author.name}
    </h1>
    <p style="
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 16px;
      font-style: italic;
      color: #FDE68A;
    ">
      Author's Monthly Update
    </p>
    <!-- Genre badges -->
    <div style="
      margin-top: 15px;
      font-size: 14px;
      color: #FDE68A;
      letter-spacing: 1px;
    ">
      🐲 Epic Fantasy | ✝️ Christian Fiction | 🚀 Sci-Fi
    </div>
  </header>

  <!-- Spotlight Section -->
  <section style="
    background: linear-gradient(135deg, #FEF3C7, #FDE68A);
    padding: 30px;
    text-align: center;
    border-left: 6px solid #D97706;
  ">
    <h2 style="
      margin: 0 0 15px;
      font-size: 26px;
      color: #92400E;
      font-weight: bold;
    ">
      📖 This Month's spotlight!
    </h2>
    {#if newsletterData.preheader}
    <p style="
      margin: 0;
      font-size: 16px;
      color: #78350F;
      font-style: italic;
    ">
      {newsletterData.preheader}
    </p>
    {/if}
  </section>

  <!-- Featured Story Section -->
  <section style="padding: 40px 30px; background-color: #ffffff;">
    {#if newsletterData.featuredStory.image}
    <div style="text-align: center; margin-bottom: 25px;">
      <img 
        src={newsletterData.featuredStory.image} 
        alt="Featured story"
        style="
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        "
      />
    </div>
    {/if}

    <!-- Genre indicator for featured story -->
    {#if newsletterData.featuredStory.genre}
    <div style="
      display: inline-flex;
      align-items: center;
      background-color: {getGenreColor(newsletterData.featuredStory.genre)}20;
      color: {getGenreColor(newsletterData.featuredStory.genre)};
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
      border: 2px solid {getGenreColor(newsletterData.featuredStory.genre)}40;
    ">
      <span style="margin-right: 8px; font-size: 16px;">
        {getGenreIcon(newsletterData.featuredStory.genre)}
      </span>
      {newsletterData.featuredStory.genre.replace('-', ' ').toUpperCase()}
    </div>
    {/if}

    <h2 style="
      margin: 0 0 15px;
      font-size: 26px;
      color: #1e293b;
      font-weight: bold;
      line-height: 1.3;
    ">
      {newsletterData.featuredStory.headline}
    </h2>

    <div style="
      margin-bottom: 20px;
      font-size: 14px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
    ">
      by <strong style="color: #D97706;">{newsletterData.featuredStory.author}</strong> 
      on {formatDate(newsletterData.featuredStory.date)}
    </div>

    <div style="
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 25px;
    ">
      {@html newsletterData.featuredStory.content}
    </div>
  </section>

  <!-- Golden Divider -->
  <div style="
    height: 4px;
    background: linear-gradient(90deg, #F59E0B, #D97706, #B45309, #D97706, #F59E0B);
    margin: 0 30px;
  "></div>

  <!-- Writing Updates Section -->
  <section style="
    padding: 40px 30px;
    background-color: #f8fafc;
  ">
    <div style="text-align: center; margin-bottom: 30px;">
      <h3 style="
        margin: 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #64748b;
        font-weight: normal;
      ">
        THIS WEEK'S
      </h3>
      <h2 style="
        margin: 5px 0 0;
        font-size: 28px;
        color: #1e293b;
        font-weight: bold;
      ">
        📝 WRITING UPDATES
      </h2>
    </div>

    <!-- Stories Grid -->
    <div>
      {#each newsletterData.topStories as story}
      <article style="
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-left: 4px solid {getGenreColor(story.genre)};
        margin-bottom: 20px;
      ">
        <!-- Genre badge for each story -->
        {#if story.genre}
        <div style="
          display: inline-flex;
          align-items: center;
          background-color: {getGenreColor(story.genre)}15;
          color: {getGenreColor(story.genre)};
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 15px;
        ">
          <span style="margin-right: 6px;">
            {getGenreIcon(story.genre)}
          </span>
          {story.genre.replace('-', ' ').toUpperCase()}
        </div>
        {/if}

        <h4 style="
          margin: 0 0 10px;
          font-size: 20px;
          color: #1e293b;
          font-weight: bold;
          line-height: 1.3;
        ">
          {#if story.url}
            <a href={story.url} style="color: #1e293b; text-decoration: none;">
              {story.headline}
            </a>
          {:else}
            {story.headline}
          {/if}
        </h4>

        <div style="
          margin-bottom: 12px;
          font-size: 13px;
          color: #64748b;
        ">
          by <strong style="color: #D97706;">{story.author}</strong> 
          on {formatDate(story.date)}
        </div>

        <p style="
          margin: 0;
          font-size: 15px;
          color: #374151;
          line-height: 1.6;
        ">
          {story.excerpt}
        </p>
      </article>
      {/each}
    </div>
  </section>

  <!-- Featured Books Section (Genre-Separated) -->
  {#if newsletterData.books && newsletterData.books.length > 0}
  <section style="
    background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
    padding: 40px 30px;
    margin: 0;
  ">
    <h3 style="
      color: #1F2937;
      margin: 0 0 25px;
      font-size: 24px;
      text-align: center;
      font-weight: bold;
    ">
      📚 Featured Books by Genre
    </h3>
    
    {#each ['epic-fantasy', 'christian-fiction', 'sci-fi'] as genre}
      {@const genreBooks = newsletterData.books?.filter(book => book.genre === genre) || []}
      {#if genreBooks.length > 0}
      <div style="margin-bottom: 30px;">
        <h4 style="
          color: {getGenreColor(genre)};
          margin: 0 0 15px;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
        ">
          <span style="margin-right: 10px; font-size: 20px;">
            {getGenreIcon(genre)}
          </span>
          {genre.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h4>
        
        {#each genreBooks as book}
        <div style="
          display: flex;
          background: white;
          margin-bottom: 15px;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          align-items: center;
          border-left: 4px solid {getGenreColor(genre)};
        ">
          {#if book.coverUrl}
          <img 
            src={book.coverUrl} 
            alt="{book.title} cover"
            style="
              width: 60px;
              height: 90px;
              object-fit: cover;
              border-radius: 4px;
              margin-right: 15px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              flex-shrink: 0;
            "
          />
          {/if}
          <div style="flex: 1;">
            <h5 style="
              margin: 0 0 5px;
              color: {getGenreColor(genre)};
              font-size: 16px;
              font-weight: bold;
            ">
              {book.title}
            </h5>
            <p style="
              margin: 0 0 10px;
              color: #6b7280;
              font-size: 13px;
              line-height: 1.4;
            ">
              {book.description}
            </p>
            {#if book.amazonUrl}
            <a 
              href={book.amazonUrl}
              style="
                display: inline-block;
                background: {getGenreColor(genre)};
                color: white;
                padding: 6px 12px;
                text-decoration: none;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
              "
            >
              View on Amazon
            </a>
            {/if}
          </div>
        </div>
        {/each}
      </div>
      {/if}
    {/each}
  </section>
  {/if}

  <!-- Call to Action Section - FIXED TABLE STRUCTURE -->
  <section style="
    padding: 40px 30px;
    text-align: center;
    background-color: #ffffff;
  ">
    <table role="presentation" style="margin: 0 auto;">
      <tbody> <!-- ✅ FIXED: Added tbody wrapper -->
        <tr>
          <td style="
            background: linear-gradient(135deg, #D97706, #B45309);
            padding: 15px 40px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
          ">
            <a 
              href={newsletterData.websiteUrl}
              style="
                color: white;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                letter-spacing: 0.5px;
                display: block;
              "
            >
              🌐 EXPLORE ALL GENRES ON MY WEBSITE
            </a>
          </td>
        </tr>
      </tbody> <!-- ✅ FIXED: Added closing tbody -->
    </table>
  </section>

  <!-- Golden Divider -->
  <div style="
    height: 4px;
    background: linear-gradient(90deg, #F59E0B, #D97706, #B45309, #D97706, #F59E0B);
    margin: 0 30px;
  "></div>

  <!-- Footer -->
  <footer style="
    background-color: #f8fafc;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  ">
    <div style="margin-bottom: 20px;">
      <h4 style="
        color: #1e293b;
        margin: 0 0 10px;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="margin-right: 8px;">📖</span>
        {newsletterData.author.name}
      </h4>
      <p style="
        color: #64748b;
        margin: 0 0 10px;
        font-size: 14px;
      ">
        🐲 Epic Fantasy | ✝️ Christian Fiction | 🚀 Sci-Fi
      </p>
      <p style="
        color: #64748b;
        margin: 0 0 15px;
        font-size: 14px;
      ">
        🔥 Former Firefighter | 🎖️ Military Veteran | 📍 {newsletterData.author.address || 'Louisville, Kentucky'}
      </p>
      <p style="
        color: #78350F;
        margin: 0 0 15px;
        font-size: 14px;
        font-style: italic;
      ">
        <em>Crafting tales of adventure, faith, and future worlds.</em>
      </p>
      <a 
        href={newsletterData.author.website}
        style="
          color: #D97706;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        "
      >
        Visit Website →
      </a>
    </div>

    <!-- Unsubscribe Links -->
    <div style="
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      font-size: 12px;
      color: #94a3b8;
    ">
      <p style="margin: 0 0 8px;">
        <a href={newsletterData.webviewUrl} style="color: #64748b;">
          View this email in your browser
        </a>
      </p>
      <p style="margin: 0;">
        <a href={newsletterData.unsubscribeUrl} style="color: #64748b;">
          Unsubscribe from this newsletter
        </a>
      </p>
    </div>
  </footer>
</div>

<style>
  /* Override any global styles */
  :global(h1), :global(h2), :global(h3), :global(h4) {
    margin-top: 0 !important;
  }
  
  :global(p) {
    margin-bottom: 15px !important;
  }
  
  :global(a) {
    color: #D97706 !important;
  }
  
  :global(table) {
    border-collapse: collapse !important;
  }
</style>