'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

// Custom Tooltip component for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card border border-outline-variant/10 p-3 rounded-lg shadow-xl">
        <p className="text-xs text-on-surface-variant mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-sm font-bold text-white" style={{ color: pld.color }}>
            {pld.name}: ${pld.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Area Chart for Revenue Trends
export function RevenueTrendChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-80 w-full bg-surface-card animate-pulse rounded-xl" />;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#155CBE" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#155CBE" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="month" 
            stroke="#c2c6d5" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#c2c6d5" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="Sponsorship" 
            name="Sponsorship"
            stroke="#155CBE" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
          <Area 
            type="monotone" 
            dataKey="YouTube" 
            name="AdSense"
            stroke="#FFFFFF" 
            strokeWidth={1.5}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Bar Chart for Platform Share
export function PlatformShareBarChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-80 w-full bg-surface-card animate-pulse rounded-xl" />;

  // Aggregate platforms
  const platformSummary = [
    { name: 'YouTube', value: 17200, color: '#FF0000' },
    { name: 'Instagram', value: 9200, color: '#E1306C' },
    { name: 'TikTok', value: 14500, color: '#00F2EA' },
    { name: 'Direct/Web', value: 25000, color: '#155CBE' }
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={platformSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="name" 
            stroke="#c2c6d5" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#c2c6d5" 
            fontSize={11}
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Revenue" radius={[8, 8, 0, 0]}>
            {platformSummary.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Donut Chart for Revenue Categories
export function CategoryDonutChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-80 w-full bg-surface-card animate-pulse rounded-xl" />;

  const categoryData = [
    { name: 'Sponsorships', value: 65900, color: '#155CBE' },
    { name: 'AdSense', value: 43200, color: '#ffffff' },
    { name: 'Affiliates', value: 9800, color: '#A1A1AA' },
    { name: 'Merchandise', value: 5600, color: '#454747' }
  ];

  return (
    <div className="h-80 w-full flex flex-col justify-center items-center">
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${Number(value ?? 0).toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {categoryData.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
            <span className="text-on-surface-variant">{cat.name}:</span>
            <span className="font-semibold text-white">${(cat.value/1000).toFixed(1)}k</span>
          </div>
        ))}
      </div>
    </div>
  );
}
