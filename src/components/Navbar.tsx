import Link from 'next/link';
import { checkBackendConnection } from '@/lib/wordpress';

export default async function Navbar() {
  const connection = await checkBackendConnection();

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="container navbar-inner">
        <Link href="/" className="brand-logo" id="nav-brand-link">
          <span>BLFA</span>
          <span className="brand-badge">Learning Lab</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link href="/" className="nav-link" id="nav-home">
              Home
            </Link>
          </li>
          <li>
            <Link href="/blog" className="nav-link" id="nav-blog">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/contact" className="nav-link" id="nav-contact">
              Contact
            </Link>
          </li>
          <li>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              id="nav-health-api"
            >
              API Health
            </a>
          </li>
        </ul>

        <div className="nav-status" id="nav-status-badge" title={`WPGraphQL Endpoint: ${connection.url}`}>
          <span className={`status-dot ${connection.isConnected ? 'online' : 'fallback'}`} />
          <span>{connection.isConnected ? 'WordPress Live' : 'Fallback / Offline'}</span>
        </div>
      </div>
    </nav>
  );
}
