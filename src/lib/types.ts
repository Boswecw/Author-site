// src/lib/types.ts
export type RetailLinks = {
    amazon?: string;
    barnesNoble?: string;
    appleBooks?: string;
    kobo?: string;
    googlePlay?: string;
    ingramSpark?: string;
  };
  
  export type Book = {
    id: string;
    title: string;
    cover: string;        // path under /static (e.g., /images/...)
    description: string;
    status: 'published' | 'upcoming';
    publishDate: string;  // YYYY-MM-DD
    isbn?: string;
    format?: 'EPUB' | 'Paperback' | 'Hardcover';
    buyLinks: RetailLinks;
  };
  