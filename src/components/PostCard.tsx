import Link from 'next/link';
import { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Format date safely
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  // Strip HTML from excerpt if present
  const cleanExcerpt = post.excerpt
    ? post.excerpt.replace(/<[^>]*>?/gm, '').trim()
    : 'Read the full article to learn more.';

  return (
    <article className="post-card" id={`post-${post.slug}`}>
      <div className="post-card-body">
        <div className="post-card-tags">
          {post.categories?.nodes && post.categories.nodes.length > 0 ? (
            post.categories.nodes.map((cat) => (
              <span key={cat.slug} className="badge-tag">
                {cat.name}
              </span>
            ))
          ) : (
            <span className="badge-tag">WordPress</span>
          )}
          {post.isMockFallback && (
            <span
              className="badge-tag"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fde68a',
              }}
            >
              Demo Preview
            </span>
          )}
        </div>

        <h3 className="post-card-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="post-card-excerpt">
          {cleanExcerpt.length > 140 ? `${cleanExcerpt.slice(0, 140)}...` : cleanExcerpt}
        </p>

        <div className="post-card-footer">
          <span>By {post.author?.node?.name || 'BLFA Team'}</span>
          <time dateTime={post.date}>{formattedDate}</time>
        </div>
      </div>
    </article>
  );
}
