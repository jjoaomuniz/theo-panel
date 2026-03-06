import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="bg-bg-card border border-error/30 rounded-xl p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Erro no componente</h2>
            <p className="text-sm text-text-secondary mb-4">
              Algo deu errado ao renderizar esta seção.
            </p>
            {this.state.error && (
              <pre className="text-xs font-mono text-error bg-error/5 rounded-lg p-3 text-left overflow-auto max-h-32 mb-4">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-accent-purple text-white text-sm rounded-lg hover:bg-accent-purple/80 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
