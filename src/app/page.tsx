import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getFeaturedPosts } from '@/lib/wordpress';

export default async function HomePage() {
  const { posts, isFallback } = await getFeaturedPosts();

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero" aria-label="Introduction">
        <div className="hero-pill">
          <span>🚀</span>
          <span>Docker Compose + Headless WordPress + Next.js</span>
        </div>
        <h1 className="hero-title">BLFA Learning Lab</h1>
        <p className="hero-subtitle">
          A production-grade local development environment replicating the BLFA architecture:
          Next.js App Router, Headless WordPress (PHP-FPM), WPGraphQL, Nginx, and MySQL 8.0.
        </p>

        <div className="hero-actions">
          <Link href="/blog" className="btn btn-primary" id="hero-explore-articles">
            Explore Articles ({posts.length})
          </Link>
          <Link href="/contact" className="btn btn-secondary" id="hero-contact-btn">
            Test Contact Form
          </Link>
          <a
            href="http://localhost:9000/wp-admin"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            id="hero-wp-admin-btn"
          >
            Open WP Admin &rarr;
          </a>
        </div>
      </section>

      {/* Backend Status Warning if using Fallback */}
      {isFallback && (
        <aside className="alert alert-warning" role="status" aria-live="polite">
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          <div>
            <strong>WordPress Backend Offline or Initializing:</strong> Showing cached demo
            articles. Start the backend Compose project (`docker compose up -d`) and enable
            WPGraphQL to load live content from WordPress.
          </div>
        </aside>
      )}

      {/* Architecture Showcase */}
      <section style={{ margin: '3rem 0' }} aria-labelledby="arch-section-title">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 id="arch-section-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Local System Architecture
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Each component runs in an isolated container joined by the <code>blfa-network</code> bridge.
          </p>
        </div>

        <div className="architecture-grid">
          <div className="arch-card">
            <div className="arch-icon">⚡</div>
            <h3 className="arch-title">Next.js Frontend</h3>
            <p className="arch-desc">
              Containerized React 18 App Router with Server-Side Rendering and standalone Node.js production build.
            </p>
            <div className="arch-meta">Port: 3000 | Non-Root Alpine</div>
          </div>

          <div className="arch-card">
            <div className="arch-icon">🛡️</div>
            <h3 className="arch-title">Nginx Reverse Proxy</h3>
            <p className="arch-desc">
              Official Nginx reverse proxy serving static WordPress assets and delegating PHP requests to PHP-FPM.
            </p>
            <div className="arch-meta">Port: 9000 | /healthz Endpoint</div>
          </div>

          <div className="arch-card">
            <div className="arch-icon">📝</div>
            <h3 className="arch-title">WordPress PHP-FPM</h3>
            <p className="arch-desc">
              Official <code>wordpress:php8.2-fpm-alpine</code> image. No custom Dockerfile required.
            </p>
            <div className="arch-meta">Port: 9000 (Internal) | WPGraphQL</div>
          </div>

          <div className="arch-card">
            <div className="arch-icon">🗄️</div>
            <h3 className="arch-title">MySQL 8.0 Database</h3>
            <p className="arch-desc">
              Official MySQL 8 container with persistent storage through named Docker volume <code>db_data</code>.
            </p>
            <div className="arch-meta">Port: 3306 (Internal) | blfa_local</div>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
      <section style={{ margin: '4rem 0' }} aria-labelledby="featured-posts-title">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 id="featured-posts-title" style={{ fontSize: '1.8rem' }}>
              Featured Posts
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Dynamic content queried through WPGraphQL from WordPress.
            </p>
          </div>
          <Link href="/blog" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
            View all posts &rarr;
          </Link>
        </div>

        {posts.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>No articles found in WordPress.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <PostCard key={post.id || post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
