interface Slice { label: string; value: number; color: string }

const COLORS: Record<string, string> = {
  neutral: '#94a3b8',
  info:    '#3b82f6',
  warning: '#f59e0b',
  success: '#22c55e',
};

export default function DonutChart({
  data,
  size = 180,
}: {
  data: { label: string; value: number; tone: string }[];
  size?: number;
}) {
  const total    = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.42, innerR = size * 0.27;

  function polar(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(start: number, end: number) {
    const s1 = polar(start, outerR), e1 = polar(end, outerR);
    const s2 = polar(end, innerR),   e2 = polar(start, innerR);
    const large = end - start > 180 ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y}`,
      'Z',
    ].join(' ');
  }

  const slices: (Slice & { startAngle: number; endAngle: number })[] = [];
  let current = 0;
  for (const d of data) {
    const span = total === 0 ? 0 : (d.value / total) * 360;
    slices.push({ label: d.label, value: d.value, color: COLORS[d.tone] ?? '#94a3b8', startAngle: current, endAngle: current + span - 1 });
    current += span;
  }

  const doneRate = total === 0 ? 0 : Math.round((data.find(d => d.tone === 'success')?.value ?? 0) / total * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={outerR} fill="#e2e8f0" />
        ) : (
          slices.map((sl, i) => (
            sl.value > 0 && <path key={i} d={arcPath(sl.startAngle, sl.endAngle)} fill={sl.color} />
          ))
        )}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-slate-700" style={{ fontSize: 20, fontWeight: 700, fill: '#0f172a' }}>{doneRate}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8' }}>完了率</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[d.tone] ?? '#94a3b8' }} />
            <span className="text-xs text-slate-500">{d.label} {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
