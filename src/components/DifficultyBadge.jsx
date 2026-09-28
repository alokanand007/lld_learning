import React from 'react';
import { Sparkles, Zap, ShieldAlert } from 'lucide-react';

export function DifficultyBadge({ difficulty = 'Beginner', size = 'md' }) {
  const normalized = (difficulty || '').toLowerCase();

  let config = {
    label: 'Beginner',
    icon: Sparkles,
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    indicator: 'bg-emerald-500'
  };

  if (normalized.includes('intermediate')) {
    config = {
      label: 'Intermediate',
      icon: Zap,
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      indicator: 'bg-amber-500'
    };
  } else if (normalized.includes('advanced') || normalized.includes('hard')) {
    config = {
      label: 'Advanced',
      icon: ShieldAlert,
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      indicator: 'bg-purple-500'
    };
  }

  const Icon = config.icon;
  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses} select-none`}
      title={`Difficulty: ${config.label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'currentColor' }} />
      <Icon className="h-3 w-3 shrink-0 opacity-80" />
      <span>{config.label}</span>
    </span>
  );
}
