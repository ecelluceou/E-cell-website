import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AuthUI.css";

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className = "",
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}



function AuthFormContainer() {
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already signed in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      await signInWithEmail(email);
      setSuccessMessage('Magic link sent! Check your email to sign in.');
    } catch (err) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1 className="auth-title">Welcome to E-Cell UCEOU</h1>
        <p className="auth-subtitle">Sign in or create an account to continue</p>
      </div>

      {error && (
        <div className="auth-error" aria-live="polite">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="auth-success" aria-live="polite" style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          color: '#22c55e', 
          padding: '0.75rem 1rem', 
          borderRadius: '8px', 
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label htmlFor="email-input" className="sr-only">Email Address</label>
        <input 
          id="email-input"
          name="email"
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="auth-input-email"
          disabled={loading || successMessage}
          autoComplete="email"
          spellCheck={false}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        />
        <button
          type="submit"
          className="auth-button-email"
          disabled={loading || successMessage}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '12px',
            background: 'var(--brand-primary)',
            color: 'var(--text-inverse)',
            fontWeight: '600',
            fontSize: '1rem',
            border: 'none',
            cursor: loading || successMessage ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s ease',
            opacity: loading || successMessage ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <span className="auth-spinner" style={{ borderColor: 'var(--text-inverse) transparent var(--text-inverse) transparent' }} />
          ) : (
            'Send Magic Link'
          )}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
      </div>

      <button
        type="button"
        onClick={async () => {
          try {
            setLoading(true);
            await signInWithGoogle();
          } catch (err) {
            setError(err.message);
            setLoading(false);
          }
        }}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.85rem',
          borderRadius: '12px',
          background: 'transparent',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          fontWeight: '600',
          fontSize: '0.95rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {/* Google SVG icon */}
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        Passwordless login — no passwords to remember.
      </p>
    </div>
  );
}

const defaultSignInContent = {
  image: {
    src: "https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png",
    alt: "A beautiful interior design for sign-in",
  },
  quote: {
    text: "Welcome Back! The journey continues.",
    author: "E-Cell UCEOU",
  },
};


export function AuthUI({ signInContent = {} }) {
  const currentContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form-section">
        <AuthFormContainer />
      </div>

      <div
        className="auth-image-section"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="auth-image-gradient" />

        <div className="auth-quote-container">
          <blockquote className="auth-quote">
            <p className="auth-quote-text">
              “
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />
              ”
            </p>
            <cite className="auth-quote-author">— {currentContent.quote.author}</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
