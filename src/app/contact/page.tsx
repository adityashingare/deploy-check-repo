import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact & Architecture Validation — BLFA Learning Lab',
  description: 'Test client and server-side validation via the Next.js API route.',
};

export default function ContactPage() {
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Contact &amp; Inquiry
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Demonstrates Next.js server-side validation via the <code>/api/contact</code> route.
          Try submitting valid data or invalid data (e.g. empty fields, short message) to test error handling.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
