import { useState } from 'react';
import DashboardView from './views/DashboardView';
import WeeklyFormView from './views/WeeklyFormView';
import DailyFormView from './views/DailyFormView';

type Tab = 'dashboard' | 'weekly' | 'daily';

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'dashboard', label: 'ダッシュボード',       sub: '報告・閲覧画面' },
  { id: 'weekly',    label: '週次計画フォーム',     sub: '月曜朝・1回入力' },
  { id: 'daily',     label: '日次レポートフォーム', sub: '毎日退勤前に入力' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP NAV */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 h-14">
            <div className="flex items-center gap-2 mr-6">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-bold text-slate-800 hidden sm:block">営業管理</span>
            </div>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-start px-4 py-2 rounded-lg transition-colors text-left ${
                  tab === t.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={`text-sm font-semibold ${tab === t.id ? 'text-slate-900' : ''}`}>{t.label}</span>
                <span className="text-xs text-slate-400 hidden sm:block">{t.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === 'dashboard' && <DashboardView />}
        {tab === 'weekly'    && <WeeklyFormView />}
        {tab === 'daily'     && <DailyFormView />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">営業活動 日次シグナルボード　—　自動報告システム</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            毎日 17:30 にスクリーンショット撮影 → Email 自動送信
          </div>
        </div>
      </footer>
    </div>
  );
}
