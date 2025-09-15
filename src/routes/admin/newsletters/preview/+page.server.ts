// src/routes/admin/newsletters/preview/+page.server.ts - Newsletter preview
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { emailTemplates } from '$lib/server/email';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async ({ url }) => {
  try {
    const newsletterId = url.searchParams.get('id');
    const format = url.searchParams.get('format') || 'html'; // 'html' or 'text'
    
    if (!newsletterId) {
      throw error(400, 'Newsletter ID required');
    }

    const db = await getDb();
    const newslettersCollection = db.collection('newsletters');
    
    const newsletter = await newslettersCollection.findOne({ 
      _id: new ObjectId(newsletterId) 
    });

    if (!newsletter) {
      throw error(404, 'Newsletter not found');
    }

    // Generate preview using email template
    const newsletterData = {
      subject: newsletter.subject,
      content: newsletter.content,
      preheader: newsletter.preheader || ''
    };

    const template = emailTemplates.newsletter(
      newsletterData,
      'Preview User',
      'preview@example.com'
    );

    return {
      newsletter: {
        id: newsletter._id.toString(),
        subject: newsletter.subject,
        preheader: newsletter.preheader || '',
        status: newsletter.status,
        createdAt: newsletter.createdAt,
        googleDocUrl: newsletter.googleDocUrl
      },
      preview: {
        html: template.html,
        text: template.text,
        subject: template.subject
      },
      format
    };

  } catch (err) {
    console.error('[Newsletter Preview] Error:', err);
    throw error(500, 'Failed to load newsletter preview');
  }
};

// src/routes/admin/newsletters/preview/+page.svelte - Newsletter preview component
export const previewComponent = `
<script lang="ts">
  import type { PageData } from './$types';
  
  const { data }: { data: PageData } = $props();
  
  let activeTab = $state(data.format || 'html');

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  }
</script>

<svelte:head>
  <title>Preview: {data.newsletter.subject} - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <nav class="text-sm text-gray-500 mb-4">
        <a href="/admin" class="hover:text-gray-700">Admin</a>
        <span class="mx-2">→</span>
        <a href="/admin/newsletters" class="hover:text-gray-700">Newsletters</a>
        <span class="mx-2">→</span>
        <span class="text-gray-900">Preview</span>
      </nav>
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{data.newsletter.subject}</h1>
          <p class="text-gray-600 mt-1">
            Created {formatDate(data.newsletter.createdAt)}
            • Status: <span class="capitalize">{data.newsletter.status}</span>
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <a 
            href="/admin/newsletters/send?id={data.newsletter.id}"
            class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            Send Newsletter
          </a>
          
          {#if data.newsletter.googleDocUrl}
            <a 
              href={data.newsletter.googleDocUrl} 
              target="_blank"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              Edit in Google Docs
            </a>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            onclick={() => activeTab = 'html'}
            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'html' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          >
            HTML Preview
          </button>
          
          <button
            onclick={() => activeTab = 'text'}
            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'text' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          >
            Plain Text
          </button>
          
          <button
            onclick={() => activeTab = 'source'}
            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'source' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          >
            HTML Source
          </button>
        </nav>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="bg-white rounded-lg shadow">
      {#if activeTab === 'html'}
        <div class="p-6">
          <div class="mb-4 pb-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Email Preview</h3>
            <p class="text-sm text-gray-500 mt-1">
              This is how your newsletter will appear in email clients
            </p>
          </div>
          
          <!-- Email Frame -->
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <div class="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <div class="text-sm text-gray-600">
                <strong>From:</strong> Your Name &lt;newsletter@yourdomain.com&gt;<br>
                <strong>To:</strong> subscriber@example.com<br>
                <strong>Subject:</strong> {data.preview.subject}
              </div>
            </div>
            
            <div class="bg-white">
              <!-- Render HTML content -->
              {@html data.preview.html}
            </div>
          </div>
        </div>
        
      {:else if activeTab === 'text'}
        <div class="p-6">
          <div class="mb-4 pb-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Plain Text Version</h3>
              <p class="text-sm text-gray-500 mt-1">
                Fallback version for email clients that don't support HTML
              </p>
            </div>
            
            <button
              onclick={() => copyToClipboard(data.preview.text)}
              class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Copy Text
            </button>
          </div>
          
          <div class="bg-gray-50 rounded border p-4">
            <pre class="whitespace-pre-wrap text-sm text-gray-900 font-mono">{data.preview.text}</pre>
          </div>
        </div>
        
      {:else if activeTab === 'source'}
        <div class="p-6">
          <div class="mb-4 pb-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">HTML Source Code</h3>
              <p class="text-sm text-gray-500 mt-1">
                Raw HTML source for debugging and customization
              </p>
            </div>
            
            <button
              onclick={() => copyToClipboard(data.preview.html)}
              class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Copy HTML
            </button>
          </div>
          
          <div class="bg-gray-900 rounded border overflow-x-auto">
            <pre class="text-green-400 text-xs p-4 font-mono">{data.preview.html}</pre>
          </div>
        </div>
      {/if}
    </div>

    <!-- Info Panel -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800">Preview Notes</h3>
      <ul class="text-sm text-blue-700 mt-1 space-y-1">
        <li>• Email appearance may vary between different email clients</li>
        <li>• All replies to this newsletter will go to your personal email</li>
        <li>• Subscribers can unsubscribe by replying with "unsubscribe"</li>
        <li>• Test the email by sending it to yourself before sending to all subscribers</li>
      </ul>
    </div>
  </div>
</div>
`;