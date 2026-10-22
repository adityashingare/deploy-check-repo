import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-inner">
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            BLFA Learning Lab — Next.js + Headless WordPress
          </p>
          <p>Local containerized architecture replicating enterprise client deployment.</p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>
            Overview
          </Link>
          <Link href="/blog" style={{ color: 'var(--text-secondary)' }}>
            Articles
          </Link>
          <Link href="/contact" style={{ color: 'var(--text-secondary)' }}>
            Contact
          </Link>
          <a
            href="http://localhost:9000/wp-admin"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-secondary)' }}
            id="footer-wp-admin-link"
          >
            WP Admin &rarr;
          </a>
        </div>
      </div>
    </footer>
  );
}
