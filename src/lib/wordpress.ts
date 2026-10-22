import { Post } from './types';
import { MOCK_POSTS } from './mockData';

/**
 * Returns the appropriate WPGraphQL endpoint URL depending on whether the code is
 * executing in a Node.js SSR runtime (server-side) or the browser (client-side).
 */
export function getGraphQLUrl(): string {
  if (typeof window === 'undefined') {
    // Running in Node.js server context (SSR / Server Component / API Route)
    return (
      process.env.WORDPRESS_INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
      'http://localhost:9000/graphql'
    );
  }
  // Running in browser client context
  return process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:9000/graphql';
}

/**
 * Low-level GraphQL fetcher with network timeout and graceful fallback
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  timeoutMs = 4000
): Promise<{ data: T | null; error: string | null; isFallback: boolean }> {
  const url = getGraphQLUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      next: { revalidate: 30 }, // Next.js ISR cache for 30s
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`WordPress GraphQL HTTP error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      console.warn('[WPGraphQL] Query returned errors:', json.errors);
      return { data: json.data || null, error: json.errors[0]?.message || 'GraphQL Error', isFallback: false };
    }

    return { data: json.data, error: null, isFallback: false };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[WPGraphQL] Unable to reach backend at ${url} (${errorMessage}). Falling back to cached demo data.`);
    return { data: null, error: errorMessage, isFallback: true };
  }
}

/**
 * Query to fetch all published blog posts
 */
const GET_ALL_POSTS_QUERY = `
  query GetAllPosts($first: Int = 20) {
    posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        date
        excerpt
        author {
          node {
            name
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch a single blog post by slug
 */
const GET_POST_BY_SLUG_QUERY = `
  query GetPostBySlug($id: ID!) {
    post(id: $id, idType: SLUG) {
      id
      title
      slug
      date
      excerpt
      content
      author {
        node {
          name
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

interface PostsQueryResult {
  posts: {
    nodes: Post[];
  };
}

interface PostQueryResult {
  post: Post | null;
}

/**
 * Fetches all blog posts from WPGraphQL, falling back to mock posts if WordPress is down
 */
export async function getAllPosts(limit = 20): Promise<{ posts: Post[]; isFallback: boolean }> {
  const { data, error, isFallback } = await fetchGraphQL<PostsQueryResult>(
    GET_ALL_POSTS_QUERY,
    { first: limit }
  );

  if (isFallback || !data || !data.posts || data.posts.nodes.length === 0) {
    if (error && !isFallback) {
      console.warn('[WPGraphQL] Query failed or empty, using mock posts.');
    }
    return { posts: MOCK_POSTS, isFallback: true };
  }

  return { posts: data.posts.nodes, isFallback: false };
}

/**
 * Fetches a single blog post by slug, falling back to mock post if WordPress is down
 */
export async function getPostBySlug(slug: string): Promise<{ post: Post | null; isFallback: boolean }> {
  const { data, isFallback } = await fetchGraphQL<PostQueryResult>(
    GET_POST_BY_SLUG_QUERY,
    { id: slug }
  );

  if (isFallback || !data || !data.post) {
    const mockMatch = MOCK_POSTS.find((p) => p.slug === slug);
    return { post: mockMatch || null, isFallback: true };
  }

  return { post: data.post, isFallback: false };
}

/**
 * Fetches featured blog posts (first 3 posts)
 */
export async function getFeaturedPosts(): Promise<{ posts: Post[]; isFallback: boolean }> {
  const { posts, isFallback } = await getAllPosts(3);
  return { posts: posts.slice(0, 3), isFallback };
}

/**
 * Checks backend WPGraphQL health
 */
export async function checkBackendConnection(): Promise<{ isConnected: boolean; message: string; url: string }> {
  const url = getGraphQLUrl();
  try {
    const { data } = await fetchGraphQL<{ __typename: string }>(
      `query { __typename }`,
      {},
      2000
    );
    if (data) {
      return { isConnected: true, message: 'Connected to WPGraphQL', url };
    }
    return { isConnected: false, message: 'WPGraphQL returned empty response', url };
  } catch (err: unknown) {
    return {
      isConnected: false,
      message: err instanceof Error ? err.message : 'Connection failed',
      url,
    };
  }
}
