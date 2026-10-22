export interface PostAuthor {
  name: string;
  avatar?: {
    url?: string;
  };
}

export interface PostCategory {
  name: string;
  slug: string;
}

export interface PostFeaturedImage {
  node: {
    sourceUrl: string;
    altText?: string;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content?: string;
  author?: {
    node: PostAuthor;
  };
  categories?: {
    nodes: PostCategory[];
  };
  featuredImage?: PostFeaturedImage | null;
  isMockFallback?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  service: string;
  version: string;
  wordpressApiUrl: string;
}
