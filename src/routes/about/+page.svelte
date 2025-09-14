<!-- src/routes/about/+page.svelte - Updated for new Firebase service -->
<script lang="ts">
  import { AUTHOR_IMAGES } from '$lib/services/authorImages';
  
  // Direct image URLs - no normalizeFirebaseUrl needed!
  const authorPortrait = AUTHOR_IMAGES.AUTHOR.AUGUST_25;
  const navyPhoto = AUTHOR_IMAGES.AUTHOR.NAVY;
  const firefighterPhoto = AUTHOR_IMAGES.AUTHOR.FIREFIGHTER;
</script>

<svelte:head>
  <title>About Charles Boswell — Navy Veteran & Fantasy Author</title>
  <meta
    name="description"
    content="Learn about Charles W. Boswell's journey from U.S. Navy service to wildland firefighting to becoming a published fantasy author."
  />
</svelte:head>

<section class="pt-28 pb-20 bg-white scroll-mt-28">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <!-- Top-center oval portrait -->
      <figure class="flex justify-center mb-6">
        <img
          src={authorPortrait}
          alt="Portrait of Charles W. Boswell"
          width="320"
          height="384"
          class="w-40 h-48 md:w-48 md:h-56 object-cover rounded-[9999px] ring-2 ring-[var(--brand-gold)] shadow-lg"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </figure>

      <!-- Visible page title (tab <title> is for SEO, this is for users) -->
      <h1 class="brand-name text-4xl md:text-5xl text-gray-900 mb-3">
        About Charles W. Boswell
      </h1>
      <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
        From Navy decks to wildfire frontlines, my life has been shaped by service,
        courage, and the unbreakable bonds forged in extreme circumstances.
      </p>
    </div>

    <!-- Main Content -->
    <div class="grid lg:grid-cols-3 gap-12 mb-16">
      <!-- Author Photo -->
      <div class="lg:col-span-1">
        <img
          src={navyPhoto}
          alt="Charles W. Boswell in Navy uniform, 1993"
          class="rounded-lg shadow-xl w-full h-auto sticky top-8"
          loading="lazy"
        />
      </div>

      <!-- Biography Content -->
      <div class="lg:col-span-2 space-y-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Navy Service</h2>
          <p class="text-gray-600 mb-4">
            My journey began in the United States Navy, where I learned the values of honor,
            courage, and commitment that would guide me throughout my life. Serving aboard
            naval vessels, I witnessed firsthand the power of brotherhood and the strength
            that comes from shared purpose in the face of danger.
          </p>
          <p class="text-gray-600">
            The disciplined environment of military service taught me about leadership,
            sacrifice, and the importance of faith during challenging times. These experiences
            became the foundation for the authentic military characters and scenarios in my novels.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Wildland Firefighting</h2>
          <div class="mb-4">
            <img
              src={firefighterPhoto}
              alt="Charles Boswell as USFS Firefighter"
              class="float-right ml-4 mb-4 w-48 h-auto rounded-lg shadow-md"
              loading="lazy"
            />
            <p class="text-gray-600 mb-4">
              After my naval service, I spent sixteen years as a wildland firefighter,
              battling some of the most dangerous fires across the American West. This career
              put me face-to-face with nature's raw power and taught me about courage,
              teamwork, and the split-second decisions that can mean the difference between
              life and death.
            </p>
            <p class="text-gray-600">
              The camaraderie among firefighters mirrors the brotherhood found in military units,
              and these bonds of trust and mutual reliance feature prominently in my writing.
              The elemental forces I battled in real life inspire the magical systems and
              environmental challenges in my fantasy worlds.
            </p>
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Faith & Writing</h2>
          <p class="text-gray-600 mb-4">
            Throughout my military and firefighting careers, faith has been my anchor.
            The trials I've faced and the miracles I've witnessed have deepened my
            understanding of divine purpose and human resilience. This spiritual foundation
            permeates every story I write.
          </p>
          <p class="text-gray-600">
            My novels blend Christian themes with epic fantasy elements, creating stories
            that explore questions of faith, sacrifice, and redemption within imaginative
            worlds filled with magic and adventure. Each book reflects the truth that
            courage and faith can overcome any darkness.
          </p>
        </div>
      </div>
    </div>

    <!-- Career Highlights -->
    <div class="bg-gray-50 rounded-xl p-8 mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Career Highlights</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">U.S. Navy Veteran</h3>
          <p class="text-gray-600">Honorable service protecting our nation's interests at sea</p>
        </div>

        <div class="text-center">
          <div class="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">16 Years Firefighting</h3>
          <p class="text-gray-600">Protecting communities from devastating wildland fires</p>
        </div>

        <div class="text-center">
          <div class="bg-yellow-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Published Author</h3>
          <p class="text-gray-600">Crafting epic tales of faith, courage, and brotherhood</p>
        </div>
      </div>
    </div>

    <!-- Writing Inspiration -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center">From Experience to Story</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Real-World Inspiration</h3>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Military brotherhood becomes fantasy fellowships
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Wildfire battles inspire magical conflicts
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Faith journeys become character arcs
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Life-or-death decisions shape plot tension
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Core Themes</h3>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Courage in the face of overwhelming odds
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Faith as a source of strength and guidance
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Sacrifice for others and higher purpose
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Redemption and second chances
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Personal Touch -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Beyond the Books</h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
        When I'm not writing, you'll find me spending time with family, enjoying the
        Kentucky countryside, or sharing stories with fellow veterans and first responders.
        I believe in the power of community and the importance of passing on the lessons
        learned through service to others.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/contact" class="btn-primary">Get in Touch</a>
        <a href="/books" class="btn-secondary">Explore My Books</a>
      </div>
    </div>
  </div>
</section>

<style>
  .brand-name {
    font-family: Georgia, serif;
  }
</style>
