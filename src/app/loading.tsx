export default function Loading() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <p style={{ color: 'var(--text-secondary)' }}>Loading BLFA Learning Lab content...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
