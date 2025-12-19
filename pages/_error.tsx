import { NextPageContext } from 'next';

interface Props {
  statusCode?: number;
}

function Error({ statusCode }: Props) {
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
        {statusCode || 'Error'}
      </h1>
      <p style={{ color: '#64748b', marginTop: '1rem' }}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
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

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
