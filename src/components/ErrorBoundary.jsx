import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '3rem',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.5rem',
              color: 'var(--brand-primary)',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              Something went wrong
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              We encountered an unexpected error. Our team has been notified.
            </p>
            {this.state.error && (
              <pre style={{
                background: 'rgba(255,0,0,0.1)',
                padding: '1rem',
                borderRadius: '8px',
                color: '#ffaaaa',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '2rem'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'white',
                backgroundColor: 'var(--brand-primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.2s ease',
                outlineOffset: '2px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-primary)'}
            >
              Try Again
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.8rem' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Error Details (Development)</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ff6b6b' }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '1rem', color: '#aaa' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;