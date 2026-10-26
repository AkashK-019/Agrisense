import React from 'react';
import { useApp } from '../context/AppContext';

/* Catches a */
class Catcher extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Page crashed]', error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.renderFallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}

export const ErrorBoundary = ({ children }) => {
  const { language, currentView, setCurrentView } = useApp();
  const isMarathi = language === 'mr';

  const renderFallback = (error, reset) => (
    <div
      style={{
        maxWidth: '28rem',
        margin: '2rem auto',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0d2818' }}>
        {isMarathi ? 'या पानावर काहीतरी अडचण आली' : 'Something went wrong on this page'}
      </h1>
      <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
        {isMarathi
          ? 'तुमची जतन केलेली माहिती सुरक्षित आहे. पुन्हा प्रयत्न करा किंवा डॅशबोर्डवर जा.'
          : 'Your saved data is safe. Try again, or go back to the dashboard.'}
      </p>

      {/* Only while */}
      {import.meta.env.DEV && (
        <pre
          style={{
            margin: '12px 0 0 0',
            padding: '10px',
            backgroundColor: '#fff1f2',
            color: '#9f1239',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {String(error?.message || error)}
        </pre>
      )}

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {currentView !== 'dashboard' && (
          <button
            type="button"
            onClick={() => {
              reset();
              setCurrentView('dashboard');
            }}
            style={{ padding: '12px', backgroundColor: '#14452f', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            {isMarathi ? 'डॅशबोर्डवर जा' : 'Go to Dashboard'}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          style={{ padding: '12px', backgroundColor: '#f3f4f6', color: '#0d2818', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
        >
          {isMarathi ? 'पुन्हा प्रयत्न करा' : 'Try again'}
        </button>
      </div>
    </div>
  );

  return <Catcher renderFallback={renderFallback}>{children}</Catcher>;
};

export default ErrorBoundary;