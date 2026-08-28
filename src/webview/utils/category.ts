import { JourneyCategory, MRStatus } from '../types/journey';

export interface CategoryMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  dotColor: string;
}

export const CATEGORY_MAP: Record<string, CategoryMeta> = {
  feature: {
    label: 'Feature',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    dotColor: '#3b82f6'
  },
  bugfix: {
    label: 'Bug Fix',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    dotColor: '#f43f5e'
  },
  refactor: {
    label: 'Refactor',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    dotColor: '#10b981'
  },
  review: {
    label: 'Code Review',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    dotColor: '#a855f7'
  },
  meeting: {
    label: 'Meeting',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dotColor: '#f59e0b'
  },
  docs: {
    label: 'Documentation',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    dotColor: '#06b6d4'
  },
  testing: {
    label: 'Testing / QA',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    dotColor: '#6366f1'
  },
  other: {
    label: 'Other',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    dotColor: '#71717a'
  }
};

export const MR_STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  draft: {
    label: 'Draft',
    bg: 'bg-zinc-500/15',
    color: 'text-zinc-300',
    border: 'border-zinc-500/30'
  },
  in_review: {
    label: 'In Review',
    bg: 'bg-amber-500/15',
    color: 'text-amber-300',
    border: 'border-amber-500/30'
  },
  merged: {
    label: 'Merged',
    bg: 'bg-emerald-500/15',
    color: 'text-emerald-300',
    border: 'border-emerald-500/30'
  },
  closed: {
    label: 'Closed',
    bg: 'bg-rose-500/15',
    color: 'text-rose-300',
    border: 'border-rose-500/30'
  }
};
