import { Post } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: 'mock-1',
    title: 'Welcome to the BLFA Learning Lab: Next.js + Headless WordPress',
    slug: 'welcome-to-blfa-learning-lab',
    date: '2026-10-22T08:00:00',
    excerpt: 'Explore how Next.js 14 App Router and Headless WordPress communicate seamlessly using WPGraphQL and Docker Compose.',
    content: `
      <p>Welcome to the <strong>BLFA Learning Lab</strong>! This demo environment is built to replicate the enterprise architecture of the BLFA website locally on your workstation.</p>
      <h2>Architecture Pillars</h2>
      <ul>
        <li><strong>Next.js 14 (App Router):</strong> Fast Server-Side Rendering (SSR) and modern React Server Components.</li>
        <li><strong>Headless WordPress:</strong> Official PHP-FPM container operating strictly as a headless content management system.</li>
        <li><strong>WPGraphQL:</strong> High-performance, schema-driven GraphQL query layer for WordPress.</li>
        <li><strong>Nginx:</strong> High-performance reverse proxy routing static assets and delegating PHP execution to PHP-FPM.</li>
        <li><strong>MySQL 8.0:</strong> Robust, persistent relational storage backed by Docker named volumes.</li>
      </ul>
      <p>When the WordPress backend container is running and WPGraphQL is active, posts are dynamically queried over GraphQL. When the backend is offline or warming up, this fallback view keeps the frontend resilient and accessible.</p>
    `,
    author: {
      node: {
        name: 'BLFA DevOps Team',
      },
    },
    categories: {
      nodes: [
        { name: 'Architecture', slug: 'architecture' },
        { name: 'DevOps', slug: 'devops' },
      ],
    },
    featuredImage: null,
    isMockFallback: true,
  },
  {
    id: 'mock-2',
    title: 'Containerized Microservices: Overcoming Docker Networking Pitfalls',
    slug: 'containerized-microservices-docker-networking',
    date: '2026-10-21T14:30:00',
    excerpt: 'Understand why browser-facing URLs differ from container-to-container service discovery in multi-container setups.',
    content: `
      <p>One of the most frequent hurdles when building headless WordPress setups in Docker is <em>URL bifurcation</em>:</p>
      <blockquote>
        <strong>Browser-Facing URL:</strong> The user's browser runs on the host machine and accesses WordPress through <code>http://localhost:9000/graphql</code> or <code>http://local.blfa.com:9000/graphql</code>.
      </blockquote>
      <blockquote>
        <strong>Internal Docker URL:</strong> Next.js Server Components running inside the Docker network reach Nginx through its internal service name: <code>http://nginx/graphql</code>.
      </blockquote>
      <p>By configuring both <code>NEXT_PUBLIC_WORDPRESS_API_URL</code> (client-side) and <code>WORDPRESS_INTERNAL_API_URL</code> (server-side), our application provides 100% reliable data retrieval in all execution contexts.</p>
    `,
    author: {
      node: {
        name: 'Infrastructure Lead',
      },
    },
    categories: {
      nodes: [
        { name: 'Docker', slug: 'docker' },
        { name: 'Networking', slug: 'networking' },
      ],
    },
    featuredImage: null,
    isMockFallback: true,
  },
  {
    id: 'mock-3',
    title: 'Zero Custom Backend Dockerfiles: The Power of Official Images',
    slug: 'zero-custom-backend-dockerfiles',
    date: '2026-10-20T11:15:00',
    excerpt: 'Discover why standardizing on official Docker Hub images reduces maintenance overhead and security vulnerabilities.',
    content: `
      <p>A strict design principle for the BLFA Learning Lab backend is avoiding custom WordPress Dockerfiles. Instead, we orchestrate the official <code>wordpress:php8.2-fpm-alpine</code> image alongside an official <code>nginx:alpine</code> proxy.</p>
      <h2>Why Avoid Custom Backend Images?</h2>
      <ol>
        <li><strong>Security Patching:</strong> Official images are maintained directly by the Docker and WordPress security teams.</li>
        <li><strong>No Local Drift:</strong> Developers avoid missing custom layers that exist only on a colleague's laptop.</li>
        <li><strong>Reproducibility:</strong> Dynamic plugins like WPGraphQL can be mounted or initialized reproducibly via WP-CLI or automated scripts.</li>
      </ol>
    `,
    author: {
      node: {
        name: 'WordPress Architect',
      },
    },
    categories: {
      nodes: [
        { name: 'Security', slug: 'security' },
        { name: 'Best Practices', slug: 'best-practices' },
      ],
    },
    featuredImage: null,
    isMockFallback: true,
  },
];
