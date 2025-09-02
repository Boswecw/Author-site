// src/lib/utils/images.ts

/**
 * Simple utility to fix Firebase Storage URLs
 */
export function fixFirebaseUrl(url?: string | null): string | undefined {
    if (!url) return undefined;
    
    // Fix the domain issue you're having
    return url.replace(
      'endless-fire-467204-n2.firebasestorage.app',
      'endless-fire-467204-n2.appspot.com'
    );
  }
  
  /**
   * Your static image URLs - all fixed and ready to use
   */
  export const IMAGES = {
    // Logo
    LOGO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
    
    // Author photos
    AUTHOR_PORTRAIT: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58',
    
    AUTHOR_FIREFIGHTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/CharlesBosewll_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
    
    // Genre icons - FIXED URLs
    FAITH_ICON: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
    
    EPIC_ICON: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025',
    
    // Book covers (from your data)
    BOOKS: {
      FAITH_FIRESTORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Faith%20in%20a%20FireStorm%20Cover.png?alt=media&token=96a07f8e-b0f6-47b4-bcba-84f581a475da',
      
      CONVICTION_FLOOD: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
      
      HURRICANE_EVE: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334',
      
      HUNTERS_FAITH: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/20250831_2300_Hunter\'s%20Faith%20Adventure_simple_compose_01k41kc9cge95t9xhrte18arrn.png?alt=media&token=4182a745-4591-44ee-aa7f-1619db3bd895',
      
      HEART_OF_STORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Heart%20of%20the%20Storm_%20Elf%20and%20Wolf.png?alt=media&token=5376fbb7-b0e4-4595-abc8-6ec96be68005'
    }
  } as const;
  
  /**
   * Simple fallbacks - just text/CSS, no complex generation
   */
  export const FALLBACKS = {
    LOGO: '/images/logo-fallback.svg', // You can create a simple SVG
    AUTHOR: '/images/author-fallback.jpg', 
    BOOK: '/images/book-fallback.jpg',
    ICON: '/images/icon-fallback.svg'
  } as const;