import { useState } from 'react';
import { MEMBERS, Priority, WeekGoal } from '../types';
import StatusPill from '../components/StatusPill';

const PRIORITY_OPTIONS: Priority[]  = ['高', '中', '低'];
const WEEKGOAL_OPTIONS: { value: WeekGoal; label: string }[] = [
  { value: '初回訪問',    label: '初回訪問（アポ取得済み）' },
  { value: 'ヒアリング',  label: 'ニーズヒアリング' },
  { value: '提案',        label: '提案書の提出' },
  { value: '見積交渉',    label: '見積・価格交渉' },
  { value: 'クロージング', label: 'クロージング（合意獲得）' },
  { value: 'フォロー',    label: 'フォロー・関係維持' },
];
const MEMBER_OPTIONS = MEMBERS.map(m => m.name);

interface CustomerRow { name: string; goal: WeekGoal; priority: Priority }

const DEFAULT_ROW = (): CustomerRow => ({ name: '', goal: 'ヒアリング', priority: '中' });

export default function WeeklyFormView() {
  const [member,  setMember]  = useState('鈴木 花子');
  const [rows,    setRows]    = useState<CustomerRow[]>([
    { name: 'C社', goal: '提案',       priority: '高' },
    { name: 'D社', goal: '初回訪問',   priority: '中' },
  ]);
  const [theme,   setTheme]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateRow = (i: number, field: keyof CustomerRow, value: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };
  const addRow    = () => rows.length < 5 && setRows(prev => [...prev, DEFAULT_ROW()]);
  const removeRow = (i: number) => rows.length > 1 && setRows(prev => prev.filter((_, idx) => idx !== i));

  const filledRows = rows.filter(r => r.name.trim() !== '');

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">週次計画を登録しました</h2>
        <p className="text-slate-500 text-sm">今週の日次フォームに顧客リストが自動反映されます。</p>
        <button onClick={() => setSubmitted(false)}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
          入力フォームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">週次計画　入力フォーム</h1>
        <p className="mt-1 text-sm text-slate-500">毎週月曜日の朝に1回入力。この計画が今週の日次フォームに自動反映されます。</p>
      </div>

      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">入力のタイミングと目的:</span>　
          週初めに今週担当する顧客と「何を達成するか」を登録します。
          登録された顧客リストは日次フォームに自動表示され、毎日の状況更新が1クリックで完結します。
        </p>
      </div>

      {/* SECTION 1: 担当者・対象週 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
          担当者・対象週
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">氏名 <span className="text-slate-400 font-normal">（ログインから自動入力）</span></label>
            <select value={member} onChange={e => setMember(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
              {MEMBER_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">対象週</label>
            <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50">
              2026年5月4日（月）〜 5月8日（金）　自動設定
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 担当顧客と目標 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
          今週の担当顧客と目標
        </h2>
        <p className="text-sm text-slate-500">今週アプローチする顧客を登録し、各顧客で達成したいことを選択してください。最大5社まで追加できます。</p>

        {/* ヘッダー */}
        <div className="grid grid-cols-12 gap-2 px-1">
          <span className="col-span-1 text-xs text-slate-400 font-semibold">#</span>
          <span className="col-span-3 text-xs text-slate-400 font-semibold">顧客名・社名</span>
          <span className="col-span-6 text-xs text-slate-400 font-semibold">今週の目標アクション</span>
          <span className="col-span-2 text-xs text-slate-400 font-semibold">優先度</span>
        </div>

        {/* 顧客行 */}
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-1 text-sm text-slate-400 text-center">{i + 1}</span>
              <input
                type="text"
                value={row.name}
                onChange={e => updateRow(i, 'name', e.target.value)}
                placeholder="例: A社"
                className="col-span-3 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={row.goal}
                onChange={e => updateRow(i, 'goal', e.target.value)}
                className="col-span-6 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {WEEKGOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={row.priority}
                onChange={e => updateRow(i, 'priority', e.target.value as Priority)}
                className="col-span-1 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={() => removeRow(i)} disabled={rows.length <= 1}
                className="col-span-1 text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none">
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={addRow} disabled={rows.length >= 5}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-slate-400 hover:text-slate-800 disabled:opacity-40 transition-colors">
            <span className="text-lg leading-none">+</span> 顧客を追加
          </button>
          <span className="text-xs text-slate-400">{rows.length} / 5 件</span>
        </div>
      </section>

      {/* SECTION 3: 週次テーマ */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
          今週の重点テーマ <span className="text-slate-400 text-sm font-normal">（任意・1〜2文）</span>
        </h2>
        <p className="text-sm text-slate-500">今週特に意識して取り組むことを簡潔に記入してください。チーム全体で共有されます。</p>
        <textarea
          value={theme}
          onChange={e => setTheme(e.target.value)}
          rows={2}
          placeholder="例: 新規案件の提案書を2件以上提出する。既存顧客への丁寧なフォローで関係強化を図る。"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </section>

      {/* SECTION 4: プレビュー */}
      {filledRows.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
            登録内容の確認
          </h2>
          <div className="card overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['#', '顧客名', '今週の目標', '優先度'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filledRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.goal}</td>
                    <td className="px-4 py-2.5">
                      <StatusPill type="priority" value={r.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {theme && (
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">今週の重点テーマ</p>
              <p className="text-sm text-slate-700">{theme}</p>
            </div>
          )}
        </section>
      )}

      {/* SUBMIT */}
      <section className="space-y-3 pb-8">
        <div className="flex gap-3">
          <button onClick={() => setSubmitted(true)}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
            週次計画を登録する
          </button>
          <button className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:border-slate-400 transition-colors">
            下書き保存
          </button>
        </div>
        <p className="text-xs text-slate-400">
          登録後、今週の日次フォームに顧客リストが自動反映されます。変更は金曜17:00まで可能です。
        </p>
      </section>

      {/* フロー説明 */}
      <section className="border-t border-slate-200 pt-6 space-y-3">
        <h2 className="text-base font-semibold text-slate-800">このフォームが自動化に接続される流れ</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { when: '月曜',  title: '週次計画を登録',      body: '顧客リストと今週の目標を入力。日次フォームに自動反映されます。' },
            { when: '毎日',  title: '日次レポートを入力',   body: '表示される顧客の状況を選択 + 活動サマリーを1〜2文記入。1〜2分で完了。' },
            { when: '17:30', title: 'Emailで自動送信',     body: 'ダッシュボードを自動撮影し、指定アドレスへスクリーンショットを添付送信。' },
          ].map((s, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{s.title}</span>
                <span className="text-xs text-slate-400">{s.when}</span>
              </div>
              <p className="text-xs text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
