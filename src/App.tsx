import { useState } from 'react';
import DashboardView from './views/DashboardView';
import WeeklyFormView from './views/WeeklyFormView';
import DailyFormView from './views/DailyFormView';
import SettingsView from './views/SettingsView';
import { RosterMember, DEFAULT_ROSTER } from './types';

type Tab = 'dashboard' | 'weekly' | 'daily' | 'settings';

export const DEFAULT_GOAL_OPTIONS = [
  '初回訪問（アポ取得済み）',
  'ニーズヒアリング',
  '提案書の提出',
  '見積・価格交渉',
  'クロージング（合意獲得）',
  'フォロー・関係維持',
];

const TABS: { id: Tab; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    sub: '報告・閲覧',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'weekly',
    label: '週次計画',
    sub: '月曜朝・1回',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'daily',
    label: '日次レポート',
    sub: '毎日退勤前',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: '設定',
    sub: 'メンバー・配信',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function App() {
  const [tab, setTab]           = useState<Tab>('dashboard');
  const [goalOptions, setGoalOptions] = useState<string[]>(DEFAULT_GOAL_OPTIONS);
  const [roster, setRoster]     = useState<RosterMember[]>(DEFAULT_ROSTER);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP NAV */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14">
            {/* ロゴ */}
            <div className="flex items-center gap-2 mr-6 flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-bold text-slate-800 hidden sm:block">営業管理</span>
            </div>

            {/* タブ */}
            <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    tab === t.id
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={tab === t.id ? 'text-slate-700' : 'text-slate-400'}>{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className={`text-xs hidden md:block ${tab === t.id ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t.sub}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === 'dashboard' && <DashboardView roster={roster} />}
        {tab === 'weekly'    && <WeeklyFormView roster={roster} goalOptions={goalOptions} />}
        {tab === 'daily'     && <DailyFormView roster={roster} />}
        {tab === 'settings'  && (
          <SettingsView
            roster={roster} setRoster={setRoster}
            goalOptions={goalOptions} setGoalOptions={setGoalOptions}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 mt-12 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">営業活動 日次シグナルボード　—　自動報告システム</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            毎日 20:00 にスクリーンショット撮影 → Email 自動送信
          </div>
        </div>
      </footer>
    </div>
  );
}
