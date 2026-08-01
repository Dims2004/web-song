import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import type { BpmSample } from '../types';

export function BpmChart({ data }: { data: BpmSample[] }) {
  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-app-subtext">
        Menunggu data BPM dari ESP32…
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e91429" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#e91429" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
        <Tooltip
          contentStyle={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 8 }}
          labelFormatter={() => ''}
          formatter={(value) => [`${value} BPM`, '']}
        />
        <Area type="monotone" dataKey="bpm" stroke="#e91429" strokeWidth={2} fill="url(#bpmGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
