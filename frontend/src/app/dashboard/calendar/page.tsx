'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import nextDynamic from 'next/dynamic';

const CalendarView = nextDynamic(() => import('@/components/calendar/CalendarView'), { ssr: false });

export default function CalendarPage() {
  return (
    <div className="h-full">
      <CalendarView />
    </div>
  );
}
