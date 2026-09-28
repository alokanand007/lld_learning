import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button.jsx';

export function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel = null,
  actionTo = null,
  onAction = null,
  icon = Layers
}) {
  const Icon = icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 my-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel && (actionTo || onAction)) && (
        <div className="mt-5">
          {actionTo ? (
            <Link to={actionTo}>
              <Button size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={onAction} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
