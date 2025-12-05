import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ NetworkErrorBoundary caught error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Component stack:', errorInfo?.componentStack);
    
    alert(`React Error: ${error.message}\n\nCheck console for full details`);
  }

  componentDidMount() {
    // Check network status and redirect on offline
    if (!navigator.onLine) {
      this.redirectToError();
    }
    
    window.addEventListener('offline', this.redirectToError);
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.redirectToError);
  }

  redirectToError = () => {
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.get('page')?.includes('error')) {
      window.location.href = '/?page=error-500';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: 'red' }}>Application Error</h1>
          <p>An error occurred. Please check the browser console for details.</p>
          <p>The error boundary prevented navigation to avoid losing error information.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '20px' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
