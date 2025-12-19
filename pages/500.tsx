export default function Custom500() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8fafc',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#800000', margin: 0 }}>
        500
      </h1>
      <p style={{ color: '#64748b', marginTop: '1rem' }}>
        Server error
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#800000',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.375rem',
        }}
      >
        Return Home
      </a>
    </div>
  );
}
