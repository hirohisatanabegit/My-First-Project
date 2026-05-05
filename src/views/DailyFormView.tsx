import { useState, useEffect } from 'react';
import {
  Status, Situation, STATUS_BG, SITUATION_BG,
  RosterMember, WeeklyPlanSubmission, DailySubmission,
  weeklyPlanKey, dailySubmissionKey,
} from '../types';
import { formatJapaneseDate } from '../utils/date';

const STATUSES: Status[]      = ['未着手', '進行中', '完了待ち', '完了'];
const SITUATIONS: Situation[] = ['未着手', '対応中', '提案済み', '完了'];

const STATUS_HINT: Record<Status, string> = {
  '未着手':  '活動なし・本日未着手',
  '進行中':  '商談・訪問・作業中',
  '完了待ち': '提案済・先方回答待ち',
  '完了':    '本日の目標達成',
};

const draftKey = (name: string) => `daily-draft-${name}`;

interface DraftData { status: Status; custSits: Record<string, Situation>; summary: string }

/** 週次計画から今日の顧客リストを取得 */
function getWeeklyCustomers(memberName: string): Array<{ name: string; situation: Situation }> {
  try {
    const raw = localStorage.getItem(weeklyPlanKey(memberName));
    if (raw) {
      const plan: WeeklyPlanSubmission = JSON.parse(raw);
      return plan.customers.map(c => ({ name: c.name, situation: '未着手' as Situation }));
    }
  } catch { /* ignore */ }
  return [];
}

export default function DailyFormView({ roster }: { roster: RosterMember[] }) {
  const [member,    setMember]    = useState(roster[0]?.name ?? '');
  const [status,    setStatus]    = useState<Status>('進行中');
  const [custSits,  setCustSits]  = useState<Record<string, Situation>>({});
  const [summary,   setSummary]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);
  const [errors,    setErrors]    = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // メンバー切替時にドラフト復元
  useEffect(() => {
    if (!member) return;
    const raw = localStorage.getItem(draftKey(member));
    if (raw) {
      try {
        const d: DraftData = JSON.parse(raw);
        setStatus(d.status ?? '進行中');
        setCustSits(d.custSits ?? {});
        setSummary(d.summary ?? '');
        showToast('下書きを読み込みました');
        return;
      } catch { /* ignore */ }
    }
    setStatus('進行中');
    setCustSits({});
    setSummary('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const setSituation = (cust: string, sit: Situation) =>
    setCustSits(prev => ({ ...prev, [cust]: sit }));

  const saveDraft = () => {
    localStorage.setItem(draftKey(member), JSON.stringify({ status, custSits, summary }));
    showToast('下書きを保存しました');
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!member)         errs.push('氏名を選択してください。');
    if (!summary.trim()) errs.push('活動サマリーを入力してください（1〜2文で構いません）。');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // 今日の送信データを保存（ダッシュボードが読み込む）
    const submission: DailySubmission = {
      member, status, custSits, summary,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(dailySubmissionKey(member), JSON.stringify(submission));
    localStorage.removeItem(draftKey(member));
    setSubmitted(true);
  };

  const customerList = getWeeklyCustomers(member);

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">送信しました</h2>
        <p className="text-slate-500 text-sm">ダッシュボードに反映されました。20:00 に自動でEmail送信されます。</p>
        <button
          onClick={() => { setSubmitted(false); setStatus('進行中'); setCustSits({}); setSummary(''); setErrors([]); }}
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
        <h1 className="text-2xl font-bold text-slate-900">日次活動レポート　入力フォーム</h1>
        <p className="mt-1 text-sm text-slate-500">退勤前または顧客対応後に入力。所要時間の目安: 1〜2分</p>
      </div>

      <div className="card p-4 bg-slate-50 border-slate-200">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">入力の心得:</span>　
          詳細は対面・チャットで共有する前提です。このフォームは「状況のシグナル」を記録するためのものです。
          20:00 に自動でスクリーンショットが撮影され、上長・経営陣へEmail送信されます。
        </p>
      </div>

      {/* SECTION 1: 基本情報 */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">基本情報</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">氏名 <span className="text-slate-400 font-normal">（自動入力）</span></label>
            <select
              value={member}
              onChange={e => setMember(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
              {roster.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">日付</label>
            <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50">
              {formatJapaneseDate()}　自動入力
            </div>
          </div>
        </div>

        {/* ステータス選択 */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">本日のステータス <span className="font-normal text-slate-400">（1つ選択）</span></label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  status === s
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`status-pill text-xs ${status === s ? 'bg-white/20 text-white' : STATUS_BG[s]}`}>
                    {s}
                  </span>
                </div>
                <p className={`text-xs ${status === s ? 'text-white/70' : 'text-slate-400'}`}>{STATUS_HINT[s]}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: 顧客状況 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">今週の顧客対応状況</h2>
        <p className="text-sm text-slate-500">週次計画で登録した顧客が自動表示されます。現在の状況を選択してください。</p>

        {customerList.length === 0 ? (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-700 font-medium">週次計画が未登録です</p>
            <p className="text-xs text-blue-500 mt-0.5">「週次計画」タブで今週の顧客を登録すると、ここに自動表示されます。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customerList.map(c => {
              const current = custSits[c.name] ?? c.situation;
              return (
                <div key={c.name} className="flex items-start gap-4">
                  <span className="text-sm font-semibold text-slate-700 w-14 pt-2 flex-shrink-0">{c.name}</span>
                  <div className="flex flex-wrap gap-2">
                    {SITUATIONS.map(sit => (
                      <button
                        key={sit}
                        onClick={() => setSituation(c.name, sit)}
                        className={`status-pill transition-all border-2 ${
                          current === sit
                            ? `${SITUATION_BG[sit]} border-current`
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {sit}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-400">※ 顧客リストは週次計画フォームから管理できます。</p>
      </section>

      {/* SECTION 3: 活動サマリー */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
          活動サマリー <span className="text-slate-400 text-sm font-normal">（必須・1〜2文）</span>
        </h2>
        <p className="text-sm text-slate-500">今日の活動を簡潔に記入してください。詳細は直接共有する前提です。</p>
        <textarea
          value={summary}
          onChange={e => { setSummary(e.target.value); if (e.target.value.trim()) setErrors(prev => prev.filter(e => !e.includes('サマリー'))); }}
          rows={2}
          placeholder="例: C社訪問済み。ニーズ確認し来週提案書を提出予定。D社は先方都合で来週に延期。"
          className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 transition-colors ${
            errors.some(e => e.includes('サマリー'))
              ? 'border-red-400 focus:ring-red-200'
              : 'border-slate-200 focus:ring-blue-300'
          }`}
        />
      </section>

      {/* SUBMIT */}
      <section className="space-y-3 pb-8">
        {errors.length > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
            {errors.map(e => (
              <p key={e} className="text-xs text-red-600 font-medium">⚠ {e}</p>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
            送信する
          </button>
          <button
            onClick={saveDraft}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:border-slate-400 transition-colors">
            下書き保存
          </button>
        </div>
        <p className="text-xs text-slate-400">送信後、ダッシュボードに即時反映。修正は当日20:00まで可能です。</p>
      </section>
    </div>
  );
}
