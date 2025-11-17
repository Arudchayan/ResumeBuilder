import { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
    
    this.setState({ errorInfo });
    
    // In production, you could send to error tracking service
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={32} />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-3">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-slate-600 text-center mb-6">
              {this.state.error?.message || 'An unexpected error occurred while building your resume.'}
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mb-6 bg-slate-50 rounded-lg p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-slate-700 mb-2">
                  Technical Details (Development Mode)
                </summary>
                <div className="text-slate-600 font-mono text-xs overflow-auto max-h-48">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.toString()}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                aria-label="Try again without reloading"
              >
                <Home size={18} />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                aria-label="Reload the entire page"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-slate-500 text-center mt-6">
              If this problem persists, try clearing your browser cache or exporting your resume as JSON before reloading.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
