// src/lib/server/email-template-2.ts
import { render } from 'svelte/server';
import AuthorNewsletterTemplate2 from '$lib/components/email/AuthorNewsletterTemplate2.svelte';

export interface Template2Data {
  subject: string;
  preheader: string;
  featuredStory: {
    headline: string;
    content: string;
    author: string;
    date: string;
    image?: string;
  };
  topStories: Array<{
    headline: string;
    excerpt: string;
    author: string;
    date: string;
    url?: string;
  }>;
  subscriber?: {
    email: string;
    name?: string;
    id: string;
  };
}

/**
 * Process Google Docs content for Template 2 structure
 */
export function processTemplate2Content(rawHtml: string): {
  subject: string;
  preheader: string;
  featuredStory: {
    headline: string;
    content: string;
    author: string;
    date: string;
    image?: string;
  };
  topStories: Array<{
    headline: string;
    excerpt: string;
    author: string;
    date: string;
    url?: string;
  }>;
} {
  // Clean up the HTML first
  let processed = rawHtml
    .replace(/style="[^"]*"/g, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .trim();

  // Extract subject (first H1)
  const subjectMatch = processed.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const subject = subjectMatch ? 
    subjectMatch[1].replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim() : 
    'Weekly Digest';

  // Extract preheader (look for "We have a surprise!" or similar)
  const surpriseMatch = processed.match(/<h1[^>]*>We have a surprise[^<]*<\/h1>\s*<h2[^>]*>(.*?)<\/h2>/i);
  const preheader = surpriseMatch ? 
    surpriseMatch[1].replace(/<[^>]*>/g, '').trim() : 
    '';

  // Find featured story (first main content section after headers)
  const contentSections = processed.split(/<h[1-3][^>]*>/i);
  
  let featuredStory = {
    headline: 'Featured Story',
    content: '',
    author: 'Charles W. Boswell',
    date: new Date().toISOString(),
    image: undefined as string | undefined
  };

  let topStories: Array<{
    headline: string;
    excerpt: string;
    author: string;
    date: string;
    url?: string;
  }> = [];

  // Process sections to find featured story and top stories
  let isInTopStories = false;
  let currentSection = '';

  for (let i = 1; i < contentSections.length; i++) {
    const section = contentSections[i];
    
    // Check if this section contains "TOP STORIES"
    if (section.toLowerCase().includes('top stories')) {
      isInTopStories = true;
      continue;
    }

    // Extract headline from the section
    const headlineMatch = processed.match(new RegExp(`<h[1-3][^>]*>([^<]*)</h[1-3]>\\s*${section.substring(0, 50)}`));
    const headline = headlineMatch ? 
      headlineMatch[1].replace(/\*\*/g, '').trim() : 
      `Story ${i}`;

    // Clean section content
    const cleanContent = section
      .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanContent || cleanContent.length < 20) continue;

    // Extract author and date (look for "by Author on Date" pattern)
    const bylineMatch = cleanContent.match(/by\s+([^,]+?)\s+on\s+([^\n.]+)/i);
    const author = bylineMatch ? bylineMatch[1].trim() : 'Charles W. Boswell';
    const date = bylineMatch ? bylineMatch[2].trim() : new Date().toLocaleDateString();

    // Remove byline from content
    const contentWithoutByline = cleanContent.replace(/by\s+[^,]+?\s+on\s+[^\n.]+/i, '').trim();

    if (isInTopStories) {
      // This is a top story
      topStories.push({
        headline,
        excerpt: contentWithoutByline.substring(0, 150) + '...',
        author,
        date,
        url: undefined // Could be extracted from links if present
      });
    } else if (!featuredStory.content && contentWithoutByline.length > 50) {
      // This is the featured story
      featuredStory = {
        headline,
        content: `<p>${contentWithoutByline}</p>`,
        author,
        date,
        image: undefined
      };
    }
  }

  // If no featured story found, create a default one
  if (!featuredStory.content) {
    const firstParagraph = processed.match(/<p[^>]*>(.*?)<\/p>/i);
    featuredStory.content = firstParagraph ? firstParagraph[1] : 'Welcome to this week\'s newsletter!';
  }

  // If no top stories found, create some from remaining content
  if (topStories.length === 0) {
    const allParagraphs = processed.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    for (let i = 0; i < Math.min(3, allParagraphs.length); i++) {
      const content = allParagraphs[i].replace(/<[^>]*>/g, '').trim();
      if (content.length > 30) {
        topStories.push({
          headline: `Story ${i + 1}`,
          excerpt: content.substring(0, 100) + '...',
          author: 'Charles W. Boswell',
          date: new Date().toLocaleDateString(),
        });
      }
    }
  }

  return {
    subject,
    preheader,
    featuredStory,
    topStories
  };
}

/**
 * Render Template 2 with all data
 */
export async function renderTemplate2(data: Template2Data): Promise<{
  html: string;
  text: string;
}> {
  // Build dynamic URLs
  const baseUrl = process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(data.subscriber?.email || '')}&id=${data.subscriber?.id || ''}`;
  const webviewUrl = `${baseUrl}/newsletter/view/${data.subscriber?.id || ''}`;

  // Get featured books
  const featuredBooks = await getFeaturedBooks();

  const templateData = {
    ...data,
    unsubscribeUrl,
    webviewUrl,
    websiteUrl: baseUrl,
    books: featuredBooks,
    author: {
      name: 'Charles W. Boswell',
      bio: 'Fantasy author, former firefighter, and military veteran. Crafting epic tales of adventure, magic, and the human spirit.',
      website: baseUrl,
      address: 'Louisville, Kentucky' // You can update this
    }
  };

  // Render Svelte component to HTML
  const { body: html } = render(AuthorNewsletterTemplate2, {
    props: { newsletterData: templateData }
  });

  // Generate text version
  const text = generateTemplate2Text(templateData);

  // Wrap in complete HTML email structure
  const completeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${data.subject}</title>
      <!--[if mso]>
      <style type="text/css">
        table { border-collapse: collapse; }
        .outlook-group-fix { width: 100% !important; }
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
      ${html}
    </body>
    </html>
  `;

  return {
    html: completeHtml,
    text
  };
}

/**
 * Generate text version of Template 2
 */
function generateTemplate2Text(data: any): string {
  let text = `${data.subject}\n${'='.repeat(data.subject.length)}\n\n`;
  
  if (data.preheader) {
    text += `📖 ${data.preheader}\n\n`;
  }

  // Featured Story
  text += `FEATURED STORY\n${'-'.repeat(15)}\n`;
  text += `${data.featuredStory.headline}\n`;
  text += `by ${data.featuredStory.author} on ${data.featuredStory.date}\n\n`;
  text += `${data.featuredStory.content.replace(/<[^>]*>/g, '')}\n\n`;

  // Top Stories
  text += `THIS WEEK'S TOP STORIES\n${'-'.repeat(25)}\n`;
  data.topStories.forEach((story: any, index: number) => {
    text += `${index + 1}. ${story.headline}\n`;
    text += `   by ${story.author} on ${story.date}\n`;
    text += `   ${story.excerpt}\n\n`;
  });

  // Footer
  text += `\n${'='.repeat(50)}\n`;
  text += `${data.author.name}\n`;
  text += `${data.author.address}\n`;
  text += `Website: ${data.author.website}\n`;
  text += `Unsubscribe: ${data.unsubscribeUrl}\n`;

  return text;
}

/**
 * Enhanced newsletter creation for Template 2
 */
export async function enhanceNewsletterTemplate2(rawData: any) {
  // Process the content for Template 2 structure
  const processed = processTemplate2Content(rawData.content?.html || '');
  
  // Render with Template 2
  const rendered = await renderTemplate2({
    subject: processed.subject || rawData.subject,
    preheader: processed.preheader,
    featuredStory: processed.featuredStory,
    topStories: processed.topStories
  });

  return {
    ...rawData,
    subject: processed.subject || rawData.subject,
    preheader: processed.preheader,
    content: {
      html: rendered.html,
      text: rendered.text
    },
    processedAt: new Date(),
    source: 'google-docs-template-2',
    template: 'template-2'
  };
}

/**
 * Get featured books for newsletter
 */
async function getFeaturedBooks() {
  try {
    const { getDb } = await import('$lib/server/db');
    const db = await getDb();
    
    const books = await db.collection('books')
      .find({ 
        status: 'published',
        featured: true 
      })
      .limit(2)
      .toArray();
    
    return books.map(book => ({
      title: book.title,
      coverUrl: book.coverImage || '',
      description: book.description || book.excerpt || '',
      amazonUrl: book.purchaseLinks?.amazon
    }));
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }
}