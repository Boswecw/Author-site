export interface Book {
  id: string;
  title: string;
  description: string;
  cover: string;
  genre: 'faith' | 'epic';
  status: 'published' | 'coming-soon' | 'writing';
  publishDate?: string;
  isbn?: string;
  pages?: number;
  buyLinks?: {
    amazon?: string;
    barnes?: string;
    other?: string;
  };
}

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  tags?: string[];
}