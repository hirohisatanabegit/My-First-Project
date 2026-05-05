import { useState, useEffect } from 'react';
import { MEMBERS, Member, Status, SITUATION_BG, STATUS_BORDER, STATUS_ROW, RosterMember } from '../types';
import { formatJapaneseDate, formatTime } from '../utils/date';
import StatusPill from '../components/StatusPill';
import DonutChart from '../components/DonutChart';

const ALL_STATUSES: (Status | 'すべて')[] = ['すべて', '未着手', '進行中', '完了待ち', '完了'];

/** 名簿からアクティブメンバーを生成（サンプルデータと結合、未登録は未着手扱い） */
function buildActiveMembers(roster: RosterMember[]): Member[] {
  return roster.map(r => {
    const found = MEMBERS.find(m => m.name === r.name);
    return found ?? {
      name:      r.name,
      status:    '未着手' as Status,
      customers: [],
      summary:   '本日の活動記録なし。',
      updatedAt: '—',
    };
  });
}

// ── スライドナビゲーション ─────────────────────────────────────────────────

function SlideNav({ page, total, onPrev, onNext }: {
  page: number; total: number; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onPrev} disabled={page === 0}
        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? 'bg-slate-700' : 'bg-slate-300'}`} />
        ))}
      </div>
      <button onClick={onNext} disabled={page === total - 1}
        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span className="text-xs text-slate-400">{page + 1} / {total}</span>
    </div>
  );
}

// ── ページ 1: チームシグナル + メンバーカード ─────────────────────────

function Page1({ counts, total, filter, setFilter, activeMembers }: {
  counts: Record<Status, number>;
  total: number;
  filter: Status | 'すべて';
  setFilter: (f: Status | 'すべて') => void;
  activeMembers: Member[];
}) {
  const filtered = filter === 'すべて' ? activeMembers : activeMembers.filter(m => m.status === filter);

  return (
    <div className="space-y-5">
      {/* チーム全体シグナル */}
      <div className="grid grid-cols-5 gap-4 items-center">
        <div className="col-span-3 grid grid-cols-2 gap-3">
          {([
            { label: '未着手',  count: counts['未着手'],  color: 'text-slate-600', border: 'border-t-4 border-slate-300' },
            { label: '進行中',  count: counts['進行中'],  color: 'text-blue-600',  border: 'border-t-4 border-blue-400' },
            { label: '完了待ち', count: counts['完了待ち'], color: 'text-amber-600', border: 'border-t-4 border-amber-400' },
            { label: '完了',    count: counts['完了'],    color: 'text-green-600', border: 'border-t-4 border-green-500' },
          ] as const).map(s => (
            <div key={s.label}
              onClick={() => setFilter(filter === s.label ? 'すべて' : s.label as Status)}
              className={`card p-3 ${s.border} cursor-pointer hover:shadow-sm transition-shadow`}>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold mt-0.5 ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-400">/ {total}名</p>
            </div>
          ))}
        </div>
        <div className="col-span-2 card p-3 flex items-center justify-center">
          <DonutChart size={150} data={[
            { label: '未着手',  value: counts['未着手'],  tone: 'neutral' },
            { label: '進行中',  value: counts['進行中'],  tone: 'info' },
            { label: '完了待ち', value: counts['完了待ち'], tone: 'warning' },
            { label: '完了',    value: counts['完了'],    tone: 'success' },
          ]} />
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filter === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}>
            {s === 'すべて' ? `すべて (${total})` : `${s} ${counts[s as Status]}`}
          </button>
        ))}
      </div>

      {/* メンバーカード */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(member => (
          <div key={member.name} className={`card ${STATUS_BORDER[member.status]}`}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="font-semibold text-sm text-slate-800">{member.name}</span>
              <StatusPill type="status" value={member.status} />
            </div>
            <div className="px-3 py-2 space-y-2">
              {member.customers.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">今週の顧客状況</p>
                  <div className="flex flex-wrap gap-1">
                    {member.customers.map(c => (
                      <span key={c.name} className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${SITUATION_BG[c.situation]}`}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 leading-relaxed">{member.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ページ 2: 全員サマリーテーブル ───────────────────────────────────────

function Page2({ counts, total, activeMembers }: {
  counts: Record<Status, number>;
  total: number;
  activeMembers: Member[];
}) {
  const doneRate    = total === 0 ? 0 : Math.round((counts['完了'] / total) * 100);
  const activeCount = counts['完了'] + counts['進行中'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: '対象メンバー', value: `${total}名`,            sub: '全員対象' },
          { label: '完了率',       value: `${doneRate}%`,          sub: `${counts['完了']}名が完了` },
          { label: '活動中',       value: `${activeCount}名`,      sub: '進行中 + 完了' },
          { label: '要フォロー',   value: `${counts['未着手']}名`, sub: '未着手' },
        ] as const).map(s => (
          <div key={s.label} className="card p-3">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{s.value}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">全員サマリー一覧</h3>
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['氏名', 'ステータス', '主要顧客', '活動サマリー', '更新'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeMembers.map(m => (
                <tr key={m.name} className={STATUS_ROW[m.status]}>
                  <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{m.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <StatusPill type="status" value={m.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {m.customers.map(c => (
                        <StatusPill key={c.name} type="custom" value={c.name}
                          className={`status-pill ${SITUATION_BG[c.situation]}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 text-xs max-w-xs">{m.summary}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-right whitespace-nowrap text-xs">{m.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ─────────────────────────────────────────────────

export default function DashboardView({ roster }: { roster: RosterMember[] }) {
  const [page,   setPage]   = useState(0);
  const [filter, setFilter] = useState<Status | 'すべて'>('すべて');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const activeMembers = buildActiveMembers(roster);

  const counts: Record<Status, number> = {
    '未着手':  activeMembers.filter(m => m.status === '未着手').length,
    '進行中':  activeMembers.filter(m => m.status === '進行中').length,
    '完了待ち': activeMembers.filter(m => m.status === '完了待ち').length,
    '完了':    activeMembers.filter(m => m.status === '完了').length,
  };
  const total = activeMembers.length;

  const PAGE_LABELS = ['チームシグナル・メンバー別', '全員サマリー一覧'];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">営業活動 日次シグナルボード</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatJapaneseDate(now)}　集計: {formatTime(now)}　対象: {total}名
          </p>
        </div>
        <div className="text-right space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Email 配信予定: 20:00
          </span>
          <div>
            <SlideNav page={page} total={2}
              onPrev={() => setPage(p => Math.max(0, p - 1))}
              onNext={() => setPage(p => Math.min(1, p + 1))} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {PAGE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setPage(i)}
            className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
              page === i ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {page === 0 && (
          <Page1 counts={counts} total={total} filter={filter} setFilter={setFilter} activeMembers={activeMembers} />
        )}
        {page === 1 && (
          <Page2 counts={counts} total={total} activeMembers={activeMembers} />
        )}
      </div>
    </div>
  );
}
