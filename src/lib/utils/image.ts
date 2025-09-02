export const IMAGES = {
    // Logo and branding
    SIGNATURE_LOGO: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Signaturelogo.png?alt=media&token=11b771f1-789b-426a-b9e0-b24caf98150f',
    
    // Author photos
    AUTHOR_PORTRAIT: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/August25.png?alt=media&token=ae2aa914-5e2e-4519-9749-077037b54e58',
    
    AUTHOR_FIREFIGHTER: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/CharlesBoswell_USFS.jpg?alt=media&token=46388a4c-27d2-4da6-9ad3-9d4c9b279e05',
    
    // Genre icons
    FAITH_ICON: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/ChristianFiction.png?alt=media&token=6f8f6512-0818-44aa-8fd6-2c29b80c570d',
    
    EPIC_ICON: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/EpicFantasy.png?alt=media&token=3534891a-927d-4a4b-aa82-911ea6e03025',
    
    // Book covers
    BOOKS: {
      FAITH_FIRESTORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Faith%20in%20a%20FireStorm%20Cover.png?alt=media&token=96a07f8e-b0f6-47b4-bcba-84f581a475da',
      
      CONVICTION_FLOOD: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Conviction_in_a_Flood%20Cover.png?alt=media&token=0e9ea64f-f71c-427e-a63e-dfdc301a60c1',
      
      HURRICANE_EVE: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hurricane_Eve%20Cover.png?alt=media&token=547854ac-b00e-411a-b5e5-e15995b01334',
      
      HUNTERS_FAITH: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Hunters_Faith_Adventure.png?alt=media&token=4182a745-4591-44ee-aa7f-1619db3bd895',
      
      HEART_OF_STORM: 'https://firebasestorage.googleapis.com/v0/b/endless-fire-467204-n2.appspot.com/o/Heart_of_the_Storm_Elf_and_Wolf.png?alt=media&token=5376fbb7-b0e4-4595-abc8-6ec96be68005'
    }
  } as const;
  
  /**
   * Simple fallback image generator
   */
  export function createImageFallback(text: string, bgColor = '#7f1d1d', textColor = 'white'): string {
    const svg = `
      <svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="600" fill="${bgColor}"/>
        <text x="50%" y="50%" font-family="serif" font-size="24" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `;
    const base64 =
      typeof window === 'undefined'
        ? Buffer.from(svg).toString('base64')
        : btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  }
