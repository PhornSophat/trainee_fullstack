interface ErrorDisplayProps {
    message?: string;
    onDismiss?: () => void;
    onRetry?: () => void;
    fullHeight?: boolean;
}

export function ErrorDisplay({
    message = 'An error occurred. Please try again.',
    onDismiss,
    onRetry,
    fullHeight = false,
}: ErrorDisplayProps) {
    const containerClass = fullHeight
        ? 'flex h-screen items-center justify-center bg-slate-50'
        : 'flex items-center justify-center p-4';

    return (
        <div className={containerClass}>
            <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
                <div className="flex items-start gap-3">
                    <svg
                        className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-600">Error</h3>
                        <p className="mt-1 text-sm text-slate-600">{message}</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
