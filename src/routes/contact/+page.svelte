<script lang="ts">
  import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';

  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  let isSubmitting = false;
  let isSubmitted = false;

  async function handleSubmit() {
    isSubmitting = true;
    
    // Simulate form submission - replace with your actual endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    isSubmitted = true;
    isSubmitting = false;
    
    // Reset form
    formData = { name: '', email: '', subject: '', message: '' };
  }
</script>

<svelte:head>
  <title>Contact Charles W. Boswell — Get in Touch</title>
  <meta name="description" content="Contact fantasy author Charles W. Boswell for speaking engagements, interviews, or general inquiries. Connect with a Navy veteran turned novelist." />
</svelte:head>

<div class="section-padding">
  <div class="container-width">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Whether you're interested in speaking engagements, interviews, book clubs, 
        or just want to share your thoughts about my books, I'd love to hear from you.
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Contact Form -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
        
        {#if isSubmitted}
          <div class="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
            <h3 class="font-semibold mb-2">Message Sent Successfully!</h3>
            <p>Thank you for reaching out. I'll get back to you as soon as possible.</p>
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                bind:value={formData.name}
                required
                disabled={isSubmitting}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                bind:value={formData.email}
                required
                disabled={isSubmitting}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              bind:value={formData.subject}
              required
              disabled={isSubmitting}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="What's this about?"
            />
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              bind:value={formData.message}
              required
              disabled={isSubmitting}
              rows="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
              placeholder="Your message..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full btn-primary {isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <!-- Contact Info -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Other Ways to Connect</h2>
        
        <div class="space-y-8">
          <!-- Speaking Engagements -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Speaking Engagements</h3>
            <p class="text-gray-600 mb-4">
              Available for book clubs, veterans' organizations, writing conferences, 
              and faith-based events. Topics include military service, firefighting, 
              writing craft, and faith-based storytelling.
            </p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Book clubs and reading groups</li>
              <li>• Veterans and first responder events</li>
              <li>• Writing workshops and conferences</li>
              <li>• Church and faith community talks</li>
            </ul>
          </div>

          <!-- Media Inquiries -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Media & Interviews</h3>
            <p class="text-gray-600 mb-4">
              Available for podcasts, interviews, and media appearances. 
              Happy to discuss military service, firefighting experiences, 
              the writing process, and Christian fantasy as a genre.
            </p>
            <p class="text-sm text-gray-600">
              Response time: Usually within 24-48 hours
            </p>
          </div>

          <!-- Social Media -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Follow My Journey</h3>
            <p class="text-gray-600 mb-4">
              Stay connected on social media for writing updates, behind-the-scenes 
              content, and thoughts on military life, firefighting, and faith.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors" aria-label="Facebook">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-red-600 transition-colors" aria-label="Instagram">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm4.896 14.896A8 8 0 1113.104 1.104a8 8 0 011.792 13.792zM10 5a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Location -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Based in Louisville, KY</h3>
            <p class="text-gray-600">
              Located in Kentucky, available for regional events and willing to travel 
              for the right speaking opportunities. Virtual appearances always welcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Newsletter Signup Section -->
<NewsletterSignup />