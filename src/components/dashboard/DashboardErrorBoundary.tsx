import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error to console for debugging
    console.group('Dashboard Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 p-4">
          <Card className="glass-card max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Dashboard Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-white/80">
                <p>Something went wrong with the dashboard. This could be due to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Network connectivity issues</li>
                  <li>Authentication problems</li>
                  <li>Database connection errors</li>
                  <li>JavaScript errors</li>
                </ul>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-white/60 hover:text-white/80">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-2 bg-black/20 rounded text-red-300 font-mono">
                    <div><strong>Error:</strong> {this.state.error.message}</div>
                    <div><strong>Stack:</strong></div>
                    <pre className="whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                  </div>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="glass-button">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="glass-button-outline">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary; 