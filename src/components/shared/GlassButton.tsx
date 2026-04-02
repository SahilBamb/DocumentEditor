'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'glass' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
}

export function GlassButton({
  variant = 'ghost',
  size = 'md',
  icon,
  children,
  className,
  ...props
}: GlassButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    ghost: 'hover:bg-black/[0.04] active:bg-black/[0.07]',
    glass:
      'glass glass-hover active:bg-white/90',
    accent:
      'text-white hover:opacity-90 active:opacity-80',
    danger:
      'text-white hover:opacity-90 active:opacity-80',
  };

  const sizes = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-sm',
  };

  const bgStyle =
    variant === 'accent'
      ? { background: 'var(--accent)' }
      : variant === 'danger'
        ? { background: 'var(--red-text)' }
        : undefined;

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={bgStyle}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
