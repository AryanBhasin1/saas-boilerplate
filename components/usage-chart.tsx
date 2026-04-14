'use client'
// components/usage-chart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface UsageChartProps {
  data: Array<{ date: string; tokens: number }>
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <p style={{ color: 'var(--fg-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--amber)', fontWeight: 600 }}>
        {payload[0].value.toLocaleString()} tokens
      </p>
    </div>
  )
}

export function UsageChart({ data }: UsageChartProps) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--fg-subtle)', fontFamily: 'var(--font-body)' }}
          axisLine={false} tickLine={false} interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--fg-subtle)', fontFamily: 'var(--font-body)' }}
          axisLine={false} tickLine={false} width={38}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)', radius: 4 }} />
        <Bar dataKey="tokens" fill="var(--amber)" radius={[4, 4, 0, 0]} maxBarSize={24} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}
