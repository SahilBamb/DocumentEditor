'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

export function RelativeTime({ date, className, style }: { date: string; className?: string; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState<string>('');

  useEffect(() => {
    setDisplay(formatDate(date));
    const interval = setInterval(() => setDisplay(formatDate(date)), 60_000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={className} style={style} suppressHydrationWarning>
      {display}
    </span>
  );
}
