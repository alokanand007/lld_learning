import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertTriangle, FileEdit } from 'lucide-react';
import { ATTEMPT_STATUS } from '../domain/Attempt.js';

export function StatusBadge({ status = ATTEMPT_STATUS.DRAFT, size = 'md' }) {
  const normalized = (status || '').toLowerCase();

  let config = {
    label: 'Draft',
    symbol: '✎',
    icon: FileEdit,
    classes: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  switch (normalized) {
    case ATTEMPT_STATUS.SUBMITTED:
      config = {
        label: 'Submitted',
        symbol: '⏳',
        icon: Clock,
        classes: 'bg-blue-50 text-blue-700 border-blue-200'
      };
      break;
    case ATTEMPT_STATUS.EVALUATING:
      config = {
        label: 'Evaluating...',
        symbol: '⚠',
        icon: Loader2,
        classes: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse',
        spin: true
      };
      break;
    case ATTEMPT_STATUS.COMPLETED:
      config = {
        label: 'Completed',
        symbol: '✓',
        icon: CheckCircle2,
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
      break;
    case ATTEMPT_STATUS.FAILED:
      config = {
        label: 'Evaluation Failed',
        symbol: '✕',
        icon: AlertTriangle,
        classes: 'bg-rose-50 text-rose-700 border-rose-200'
      };
      break;
    default:
      break;
  }

  const Icon = config.icon;
  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.classes} ${sizeClasses} select-none`}
      title={`Status: ${config.label}`}
    >
      <span className="font-mono text-[11px] font-bold" aria-hidden="true">
        {config.symbol}
      </span>
      <Icon className={`h-3 w-3 shrink-0 ${config.spin ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
