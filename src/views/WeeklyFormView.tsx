import { useState, useEffect } from 'react';
import { MEMBERS, Priority, RosterMember } from '../types';
import StatusPill from '../components/StatusPill';

const PRIORITY_OPTIONS: Priority[] = ['高', '中', '低'];
const TASK_CATEGORY_OPTIONS = [
  '資料作成・提案書作成',
  '社内会議・MTG',
  '教育・研修・勉強会',
  '管理業務・報告書作成',
  'システム・ツール対応',
  'その他',
];
// MEMBER_OPTIONS は roster から動的に生成するため削除

interface CustomerRow { name: string; goal: string; priority: Priority }
interface TaskRow { description: string; category: string; priority: Priority }

const DEFAULT_CUSTOMER = (firstGoal: string): CustomerRow => ({ name: '', goal: firstGoal, priority: '中' });
const DEFAULT_TASK = (): TaskRow => ({ description: '', category: '資料作成・提案書作成', priority: '中' });

const INPUT_CLS = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300';
const SELECT_CLS = INPUT_CLS;

const WEEKLY_DRAFT_KEY = (name: string) => `weekly-draft-${name}`;

export default function WeeklyFormView({ roster, goalOptions }: { roster: RosterMember[]; goalOptions: string[] }) {
  const [member,     setMember]     = useState(roster[0]?.name ?? '');
  const [customers,  setCustomers]  = useState<CustomerRow[]>([
    { name: 'C社', goal: goalOptions[2] ?? goalOptions[0], priority: '高' },
    { name: 'D社', goal: goalOptions[0],                   priority: '中' },
  ]);
  const [tasks,      setTasks]      = useState<TaskRow[]>([
    { description: '', category: '資料作成・提案書作成', priority: '中' },
  ]);
  const [theme,      setTheme]      = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // メンバー切替時にドラフトを復元
  useEffect(() => {
    if (!member) return;
    const raw = localStorage.getItem(WEEKLY_DRAFT_KEY(member));
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (d.customers) setCustomers(d.customers);
        if (d.tasks)     setTasks(d.tasks);
        if (d.theme !== undefined) setTheme(d.theme);
        showToast('下書きを読み込みました');
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const saveDraft = () => {
    localStorage.setItem(WEEKLY_DRAFT_KEY(member), JSON.stringify({ customers, tasks, theme }));
    showToast('下書きを保存しました');
  };

  const handleSubmit = () => {
    localStorage.removeItem(WEEKLY_DRAFT_KEY(member));
    setSubmitted(true);
  };

  // 顧客行の操作
  const updateCustomer = (i: number, field: keyof CustomerRow, value: string) =>
    setCustomers(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const addCustomer    = () => customers.length < 5 && setCustomers(prev => [...prev, DEFAULT_CUSTOMER(goalOptions[0])]);
  const removeCustomer = (i: number) => customers.length > 1 && setCustomers(prev => prev.filter((_, idx) => idx !== i));

  // タスク行の操作
  const updateTask  = (i: number, field: keyof TaskRow, value: string) =>
    setTasks(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const addTask     = () => tasks.length < 5 && setTasks(prev => [...prev, DEFAULT_TASK()]);
  const removeTask  = (i: number) => tasks.length > 1 && setTasks(prev => prev.filter((_, idx) => idx !== i));

  const filledCustomers = customers.filter(r => r.name.trim() !== '');
  const filledTasks     = tasks.filter(r => r.description.trim() !== '');

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
    <div className="space-y-8 max-w-2xl relative">
      {/* トースト通知 */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">週次計画　入力フォーム</h1>
        <p className="mt-1 text-sm text-slate-500">毎週月曜日の朝に1回入力。この計画が今週の日次フォームに自動反映されます。</p>
      </div>

      <div className="card p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">入力のタイミングと目的:</span>　
          週初めに今週担当する顧客と「何を達成するか」を登録します。
          顧客以外の作業タスクも合わせて計画することで、週全体の動きを一元管理できます。
        </p>
      </div>

      {/* SECTION 1: 担当者・対象週 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">担当者・対象週</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">氏名 <span className="text-slate-400 font-normal">（ログインから自動入力）</span></label>
            <select value={member} onChange={e => setMember(e.target.value)} className={`w-full ${SELECT_CLS}`}>
              {roster.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
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
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">顧</span>
          <h2 className="text-base font-semibold text-slate-800">今週の担当顧客と目標</h2>
          <span className="text-xs text-slate-400 ml-1">最大5社</span>
        </div>
        <p className="text-sm text-slate-500">今週アプローチする顧客を登録し、各顧客で達成したいことを選択してください。</p>

        {/* ヘッダー */}
        <div className="grid grid-cols-12 gap-2 px-1">
          <span className="col-span-1 text-xs text-slate-400 font-semibold">#</span>
          <span className="col-span-3 text-xs text-slate-400 font-semibold">顧客名・社名</span>
          <span className="col-span-6 text-xs text-slate-400 font-semibold">今週の目標アクション</span>
          <span className="col-span-2 text-xs text-slate-400 font-semibold">優先度</span>
        </div>

        <div className="space-y-2">
          {customers.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-1 text-sm text-slate-400 text-center">{i + 1}</span>
              <input type="text" value={row.name} onChange={e => updateCustomer(i, 'name', e.target.value)}
                placeholder="例: A社" className={`col-span-3 ${INPUT_CLS}`} />
              <select value={row.goal} onChange={e => updateCustomer(i, 'goal', e.target.value)}
                className={`col-span-6 ${SELECT_CLS}`}>
                {goalOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={row.priority} onChange={e => updateCustomer(i, 'priority', e.target.value as Priority)}
                className={`col-span-1 ${SELECT_CLS}`}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={() => removeCustomer(i)} disabled={customers.length <= 1}
                className="col-span-1 text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none">×</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={addCustomer} disabled={customers.length >= 5}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-slate-400 disabled:opacity-40 transition-colors">
            <span className="text-lg leading-none">+</span> 顧客を追加
          </button>
          <span className="text-xs text-slate-400">{customers.length} / 5 件</span>
        </div>
      </section>

      {/* SECTION 3: 顧客以外の作業タスク */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">作</span>
          <h2 className="text-base font-semibold text-slate-800">その他の作業・社内タスク</h2>
          <span className="text-xs text-slate-400 ml-1">最大5件</span>
        </div>
        <p className="text-sm text-slate-500">
          顧客対応以外に今週取り組む作業を登録してください。資料作成・MTG準備・管理業務など。
        </p>

        {/* ヘッダー */}
        <div className="grid grid-cols-12 gap-2 px-1">
          <span className="col-span-1 text-xs text-slate-400 font-semibold">#</span>
          <span className="col-span-5 text-xs text-slate-400 font-semibold">作業内容</span>
          <span className="col-span-4 text-xs text-slate-400 font-semibold">カテゴリ</span>
          <span className="col-span-2 text-xs text-slate-400 font-semibold">優先度</span>
        </div>

        <div className="space-y-2">
          {tasks.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-1 text-sm text-slate-400 text-center">{i + 1}</span>
              <input type="text" value={row.description}
                onChange={e => updateTask(i, 'description', e.target.value)}
                placeholder="例: Q2提案書の仕上げ"
                className={`col-span-5 ${INPUT_CLS}`} />
              <select value={row.category} onChange={e => updateTask(i, 'category', e.target.value)}
                className={`col-span-4 ${SELECT_CLS}`}>
                {TASK_CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={row.priority} onChange={e => updateTask(i, 'priority', e.target.value as Priority)}
                className={`col-span-1 ${SELECT_CLS}`}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={() => removeTask(i)} disabled={tasks.length <= 1}
                className="col-span-1 text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none">×</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={addTask} disabled={tasks.length >= 5}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-slate-400 disabled:opacity-40 transition-colors">
            <span className="text-lg leading-none">+</span> タスクを追加
          </button>
          <span className="text-xs text-slate-400">{tasks.length} / 5 件</span>
        </div>
      </section>

      {/* SECTION 4: 週次テーマ */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
          今週の重点テーマ <span className="text-slate-400 text-sm font-normal">（任意・1〜2文）</span>
        </h2>
        <textarea value={theme} onChange={e => setTheme(e.target.value)} rows={2}
          placeholder="例: 新規案件の提案書を2件以上提出する。既存顧客への丁寧なフォローで関係強化を図る。"
          className={`w-full resize-none ${INPUT_CLS}`} />
      </section>

      {/* SECTION 5: プレビュー */}
      {(filledCustomers.length > 0 || filledTasks.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">登録内容の確認</h2>

          {filledCustomers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">担当顧客</p>
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
                    {filledCustomers.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{r.name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.goal}</td>
                        <td className="px-4 py-2.5"><StatusPill type="priority" value={r.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filledTasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">その他の作業タスク</p>
              <div className="card overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['#', '作業内容', 'カテゴリ', '優先度'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filledTasks.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{r.description}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.category}</td>
                        <td className="px-4 py-2.5"><StatusPill type="priority" value={r.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
          <button onClick={handleSubmit}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
            週次計画を登録する
          </button>
          <button onClick={saveDraft}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:border-slate-400 transition-colors">
            下書き保存
          </button>
        </div>
        <p className="text-xs text-slate-400">登録後、今週の日次フォームに顧客リストが自動反映されます。変更は金曜17:00まで可能です。</p>
      </section>

      {/* フロー説明 */}
      <section className="border-t border-slate-200 pt-6 space-y-3">
        <h2 className="text-base font-semibold text-slate-800">このフォームが自動化に接続される流れ</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { when: '月曜',  title: '週次計画を登録',    body: '顧客リストと社内タスクを入力。日次フォームに自動反映されます。' },
            { when: '毎日',  title: '日次レポートを入力', body: '表示される顧客の状況を選択 + 活動サマリーを1〜2文記入。1〜2分で完了。' },
            { when: '20:00', title: 'Emailで自動送信',   body: 'ダッシュボードを自動撮影し、指定アドレスへスクリーンショットを添付送信。' },
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
