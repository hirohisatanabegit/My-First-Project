import { useState } from 'react';
import { MEMBERS, Status, STATUS_BG, SITUATION_BG, STATUS_BORDER, STATUS_ROW } from '../types';
import StatusPill from '../components/StatusPill';
import DonutChart from '../components/DonutChart';

const ALL_STATUSES: (Status | 'すべて')[] = ['すべて', '未着手', '進行中', '完了待ち', '完了'];

export default function DashboardView() {
  const [filter, setFilter] = useState<Status | 'すべて'>('すべて');

  const counts: Record<Status, number> = {
    '未着手':  MEMBERS.filter(m => m.status === '未着手').length,
    '進行中':  MEMBERS.filter(m => m.status === '進行中').length,
    '完了待ち': MEMBERS.filter(m => m.status === '完了待ち').length,
    '完了':    MEMBERS.filter(m => m.status === '完了').length,
  };
  const total    = MEMBERS.length;
  const filtered = filter === 'すべて' ? MEMBERS : MEMBERS.filter(m => m.status === filter);

  const statCards = [
    { label: '未着手',  count: counts['未着手'],  color: 'text-slate-600', border: 'border-t-4 border-slate-300' },
    { label: '進行中',  count: counts['進行中'],  color: 'text-blue-600',  border: 'border-t-4 border-blue-400' },
    { label: '完了待ち', count: counts['完了待ち'], color: 'text-amber-600', border: 'border-t-4 border-amber-400' },
    { label: '完了',    count: counts['完了'],    color: 'text-green-600', border: 'border-t-4 border-green-500' },
  ] as const;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">営業活動 日次シグナルボード</h1>
          <p className="mt-1 text-sm text-slate-500">
            2026年5月5日（火）　集計: 14:30　対象: {total}名
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Email 配信予定: 17:30
          </span>
          <p className="mt-1 text-xs text-slate-400">スクリーンショット自動送信</p>
        </div>
      </div>

      {/* TEAM SIGNAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {statCards.map(s => (
            <div key={s.label} className={`card p-5 ${s.border} cursor-pointer hover:shadow-sm transition-shadow`}
              onClick={() => setFilter(filter === s.label ? 'すべて' : s.label as Status)}>
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className={`text-4xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-400 mt-1">/ {total}名</p>
            </div>
          ))}
        </div>
        <div className="card p-4 flex items-center justify-center">
          <DonutChart
            size={180}
            data={[
              { label: '未着手',  value: counts['未着手'],  tone: 'neutral' },
              { label: '進行中',  value: counts['進行中'],  tone: 'info' },
              { label: '完了待ち', value: counts['完了待ち'], tone: 'warning' },
              { label: '完了',    value: counts['完了'],    tone: 'success' },
            ]}
          />
        </div>
      </div>

      {/* FILTER */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">メンバー別ステータス</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                filter === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {s === 'すべて' ? `すべて (${total})` : `${s}  ${counts[s as Status]}`}
            </button>
          ))}
        </div>

        {/* MEMBER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(member => (
            <div key={member.name} className={`card ${STATUS_BORDER[member.status]}`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">{member.name}</span>
                <StatusPill type="status" value={member.status} />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="section-label mb-2">今週の顧客状況</p>
                  <div className="space-y-1.5">
                    {member.customers.map(c => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 w-8">{c.name}</span>
                        <StatusPill type="situation" value={c.situation} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="section-label mb-1">活動サマリー</p>
                  <p className="text-sm text-slate-600">{member.summary}</p>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-slate-400">{member.updatedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">全員サマリー一覧</h2>
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['氏名', 'ステータス', '主要顧客と状況', '活動サマリー', '更新'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MEMBERS.map(m => (
                <tr key={m.name} className={STATUS_ROW[m.status]}>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{m.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusPill type="status" value={m.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.customers.map(c => (
                        <StatusPill key={c.name} type="custom" value={c.name}
                          className={`status-pill ${SITUATION_BG[c.situation]}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{m.summary}</td>
                  <td className="px-4 py-3 text-slate-400 text-right whitespace-nowrap">{m.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
