import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button.jsx';

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while processing your request. Please try again.',
  onRetry = null,
  retryLabel = 'Try Again',
  secondaryAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs my-8 max-w-lg mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-sm">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-600 max-w-sm leading-relaxed">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            {retryLabel}
          </Button>
        )}

        {secondaryAction || (
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<Home className="h-3.5 w-3.5" />}>
              Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
