
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.error('🚨 [ERROR-BOUNDARY] Error caught:', {
      errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ERROR-BOUNDARY] Component stack trace:', {
      errorId: this.state.errorId,
      error: error.message,
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
      timestamp: new Date().toISOString()  
    });

    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    console.log('🔄 [ERROR-BOUNDARY] Retrying after error:', this.state.errorId);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    console.log('🔄 [ERROR-BOUNDARY] Reloading page after error:', this.state.errorId);
    window.location.reload();
  };

  private handleGoHome = () => {
    console.log('🏠 [ERROR-BOUNDARY] Navigating home after error:', this.state.errorId);
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-figuro-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/5 rounded-lg border border-white/10 p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            
            <h2 className="text-xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-white/70 mb-6">
              We encountered an unexpected error. Don't worry, we're working to fix it.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reload
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </div>
            </div>
            
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-white/50 text-sm hover:text-white/70">
                <Bug className="w-3 h-3 inline mr-1" />
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-black/20 rounded text-xs text-white/60 font-mono">
                <p><strong>Error ID:</strong> {this.state.errorId}</p>
                <p><strong>Message:</strong> {this.state.error?.message}</p>
                {this.state.error?.stack && (
                  <p><strong>Stack:</strong> {this.state.error.stack.substring(0, 200)}...</p>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
