import type { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/wordpress';

export const metadata: Metadata = {
  title: 'Blog Articles — BLFA Learning Lab',
  description: 'Explore technical posts and architecture deep dives queried via WPGraphQL.',
};

export default async function BlogPage() {
  const { posts, isFallback } = await getAllPosts(50);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Home
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>Blog</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Knowledge Base &amp; Articles
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px' }}>
          Articles managed in the WordPress headless CMS and retrieved via WPGraphQL.
        </p>
      </header>

      {/* Fallback Notice */}
      {isFallback && (
        <aside className="alert alert-warning" role="status">
          <span>⚠️</span>
          <div>
            <strong>Showing Offline Fallback Content:</strong> The WordPress backend at{' '}
            <code>http://localhost:9000/graphql</code> was unreachable or not yet initialized. Once
            the backend is up and posts are published, live WordPress content will appear here.
          </div>
        </aside>
      )}

      {/* Empty State */}
      {posts.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>No Posts Published Yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Log in to the WordPress dashboard to create and publish your first blog post.
          </p>
          <a
            href="http://localhost:9000/wp-admin"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Go to WordPress Admin &rarr;
          </a>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <PostCard key={post.id || post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
