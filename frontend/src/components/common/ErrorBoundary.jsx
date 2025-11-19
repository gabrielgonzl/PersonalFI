import { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

/**
 * Enhanced Error Boundary with:
 * - Error tracking and counting
 * - Retry logic with limits
 * - Different UI for persistent errors
 * - Development error details
 * - Production error logging support
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorHistory: [],
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorEntry = {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Update state
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      errorHistory: [...prevState.errorHistory, errorEntry].slice(-5), // Keep last 5 errors
    }));

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('🚨 [ErrorBoundary] Error caught:', {
        error,
        errorInfo,
        count: this.state.errorCount + 1,
      });
    }

    // Send to error tracking service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(errorEntry);
    }
  }

  logErrorToService(errorEntry) {
    // Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(errorEntry.error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorEntry.errorInfo.componentStack,
    //     },
    //   },
    // });

    console.log('[ErrorBoundary] Would log to service:', errorEntry);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorHistory: [],
    });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isPersistent = this.state.errorCount > 2;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/20 mb-4">
                <AlertCircle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
              </div>

              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {isPersistent ? 'Problema Persistente' : 'Algo Salió Mal'}
              </h1>

              <p className="text-gray-600 dark:text-gray-400">
                {isPersistent
                  ? 'Parece que hay un problema que no podemos resolver automáticamente. Por favor, recarga la página o contacta soporte.'
                  : 'Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.'}
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-danger-800 dark:text-danger-400 mb-2 select-none">
                  Detalles del Error (Desarrollo)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-danger-900 dark:text-danger-300 mb-1">
                      Error:
                    </p>
                    <pre className="text-xs text-danger-700 dark:text-danger-400 bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-danger-900 dark:text-danger-300 mb-1">
                        Component Stack:
                      </p>
                      <pre className="text-xs text-danger-700 dark:text-danger-400 bg-white dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-danger-600 dark:text-danger-400">
                      Error count: {this.state.errorCount}
                    </p>
                  </div>
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!isPersistent ? (
                <>
                  <Button
                    onClick={this.handleReset}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    fullWidth
                  >
                    Intentar de Nuevo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    leftIcon={<Home className="w-4 h-4" />}
                    fullWidth
                  >
                    Ir al Inicio
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={this.handleReload}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    fullWidth
                  >
                    Recargar Página
                  </Button>
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    leftIcon={<Home className="w-4 h-4" />}
                    fullWidth
                  >
                    Ir al Inicio
                  </Button>
                  {import.meta.env.DEV && (
                    <button
                      onClick={() => {
                        console.log('Error History:', this.state.errorHistory);
                        alert('Error history logged to console');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Ver Historial de Errores (Console)
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Additional Info */}
            {isPersistent && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Si el problema persiste, por favor contacta soporte con la siguiente información:
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
                  Error ID: {Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
