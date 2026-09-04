import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center w-full h-screen bg-slate-50">
                    <div className="max-w-md p-6 bg-white border border-red-200 rounded-lg shadow-lg">
                        <h1 className="mb-2 text-lg font-bold text-red-600">
                            Oops! Something went wrong
                        </h1>
                        <p className="mb-4 text-sm text-slate-600">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <details className="p-3 mb-4 text-xs rounded bg-slate-100 text-slate-700">
                                <summary className="font-semibold cursor-pointer">
                                    Error details
                                </summary>
                                <pre className="mt-2 overflow-auto text-[11px] whitespace-pre-wrap break-words">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
