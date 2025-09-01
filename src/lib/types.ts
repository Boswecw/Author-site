// src/lib/types.ts
export type RetailLinks = {
    amazon?: string;
    barnesNoble?: string;
    appleBooks?: string;
    kobo?: string;
    googlePlay?: string;
    ingramSpark?: string;
  };
  
 // src/lib/types.ts
export type Book = {
  id: string;
  title: string;
  cover: string;
  description: string;
  status: 'published' | 'upcoming';
  publishDate: string;
  isbn?: string;
  format: string;
  genre: 'faith' | 'epic';   // 👈 new field
  buyLinks: Record<string, string>;
};
