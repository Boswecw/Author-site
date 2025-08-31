<script lang="ts">
  import NewsletterForm from '$lib/components/NewsletterForm.svelte';
  
  let name = '';
  let email = '';
  let message = '';
  let isSubmitted = false;
  let isLoading = false;
  
  function handleContactSubmit() {
    if (!name || !email || !message) return;
    
    isLoading = true;
    // Simulate form submission
    setTimeout(() => {
      isLoading = false;
      isSubmitted = true;
      name = '';
      email = '';
      message = '';
    }, 1000);
  }
</script>

<svelte:head>
  <title>Contact Author Name - Get In Touch</title>
  <meta name="description" content="Contact me for interviews, speaking engagements, or just to share your thoughts on my books. Plus, join my newsletter for exclusive updates." />
</svelte:head>

<section class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        I love hearing from readers, fellow veterans, firefighters, and anyone who enjoys 
        fantasy grounded in real experience. Let's connect!
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Contact Form -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Send Me a Message</h2>
        
        {#if isSubmitted}
          <div class="bg-green-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-center">
              <svg class="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                <h3 class="text-green-800 font-semibold">Message Sent Successfully!</h3>
                <p class="text-green-700 mt-1">Thanks for reaching out. I'll get back to you within 48 hours.</p>
              </div>
            </div>
          </div>
        {:else}
          <form on:submit|preventDefault={handleContactSubmit} class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                bind:value={name}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="contact-email"
                bind:value={email}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                bind:value={message}
                required
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Tell me what's on your mind..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !name || !email || !message}
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Message...
              {:else}
                Send Message
              {/if}
            </button>
          </form>
        {/if}
      </div>

      <!-- Newsletter & Info -->
      <div class="space-y-8">
        <NewsletterForm />
        
        <!-- Contact Info -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Other Ways to Connect</h3>
          
          <div class="space-y-4">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="text-gray-700">author@example.com</span>
            </div>
            
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
              <span class="text-gray-700">@AuthorTwitter</span>
            </div>
            
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="text-gray-700">Facebook Author Page</span>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="font-semibold text-gray-900 mb-2">Perfect for:</h4>
            <ul class="text-gray-600 space-y-1">
              <li>• Book club discussions</li>
              <li>• Speaking engagements</li>
              <li>• Media interviews</li>
              <li>• Veteran/firefighter events</li>
              <li>• General fan mail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>