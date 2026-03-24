import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try refreshing the page.";
      
      try {
        // Check if it's a Firestore permission error (JSON string)
        if (this.state.error?.message.startsWith('{')) {
          const errorData = JSON.parse(this.state.error.message);
          if (errorData.error.includes('insufficient permissions')) {
            errorMessage = "You don't have permission to perform this action. Please make sure you are logged in correctly.";
          }
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
            <p className="text-gray-600 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
