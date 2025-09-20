import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class WorkflowErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Workflow Builder Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center glass-card">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-4">Workflow Builder Error</h2>
            <p className="text-gray-300 mb-4">
              Something went wrong with the workflow builder. This might be due to a React Flow compatibility issue or JavaScript error.
            </p>
            
            {this.state.error && (
              <details className="text-left mb-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
                <summary className="cursor-pointer mb-2">Error Details</summary>
                <div className="font-mono">
                  <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button 
                onClick={this.handleRefresh} 
                className="glass-button w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button 
                onClick={() => window.history.back()} 
                variant="outline"
                className="glass-button-outline w-full"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
