import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/wordpress';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { post } = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Post Not Found — BLFA Learning Lab',
    };
  }
  return {
    title: `${post.title} — BLFA Learning Lab`,
    description: post.excerpt?.replace(/<[^>]*>?/gm, '').slice(0, 160) || 'BLFA Article',
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { post, isFallback } = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div className="container">
      <article className="post-detail">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}
        >
          <Link href="/" style={{ color: 'var(--text-muted)' }}>
            Home
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Link href="/blog" style={{ color: 'var(--text-muted)' }}>
            Blog
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-secondary)' }}>{post.slug}</span>
        </nav>

        {isFallback && (
          <aside className="alert alert-warning" role="status">
            <span>ℹ️</span>
            <div>
              <strong>Fallback Preview:</strong> This article is served from local fallback data
              because the WordPress backend is offline or WPGraphQL is not yet active.
            </div>
          </aside>
        )}

        <header className="post-header">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {post.categories?.nodes?.map((cat) => (
              <span key={cat.slug} className="badge-tag">
                {cat.name}
              </span>
            ))}
          </div>

          <h1>{post.title}</h1>

          <div className="post-header-meta">
            <span>By {post.author?.node?.name || 'BLFA Team'}</span>
            <span>&bull;</span>
            <time dateTime={post.date}>{formattedDate}</time>
            <span>&bull;</span>
            <span>WPGraphQL Source</span>
          </div>
        </header>

        {/* Post Content rendering sanitized HTML */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{
            __html: post.content || `<p>${post.excerpt}</p>`,
          }}
        />

        <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/blog" className="btn btn-secondary">
            &larr; Back to all articles
          </Link>
        </div>
      </article>
    </div>
  );
}
