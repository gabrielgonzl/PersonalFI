import { Component } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { es } from '../../locales/es';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.state = {
      hasError: true,
      error,
      errorInfo
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <div className="text-center py-8">
              <ErrorOutlineIcon className="text-danger-500 mx-auto mb-4" style={{ fontSize: 80 }} />

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {es.common.errorOccurred}
              </h1>

              <p className="text-gray-600 mb-6">
                {es.common.errorDescription}
              </p>

              {this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error details
                  </summary>
                  <div className="bg-gray-100 rounded-lg p-4 text-sm">
                    <p className="font-mono text-danger-700 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-600 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => window.history.back()}>
                  {es.common.goBack}
                </Button>
                <Button onClick={this.handleReset}>
                  {es.common.returnToDashboard}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
