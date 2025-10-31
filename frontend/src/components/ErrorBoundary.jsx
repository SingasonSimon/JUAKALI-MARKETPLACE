import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import LoadingButton from './LoadingButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="flex gap-4 justify-center">
              <LoadingButton
                onClick={() => window.location.reload()}
                className="px-6 py-2"
              >
                Refresh Page
              </LoadingButton>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

