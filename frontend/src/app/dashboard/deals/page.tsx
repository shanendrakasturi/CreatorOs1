'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import nextDynamic from 'next/dynamic';

const KanbanBoard = nextDynamic(() => import('@/components/deals/KanbanBoard'), { ssr: false });

export default function DealsPage() {
  return (
    <div className="h-full">
      <KanbanBoard />
    </div>
  );
}
