import { useState } from 'react';
import { Status, RosterMember } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const INITIAL_STATUSES: { key: Status; label: string; description: string; color: string }[] = [
  { key: '未着手',  label: '未着手',  description: '当日の活動記録なし・未対応',       color: 'bg-slate-100 text-slate-600' },
  { key: '進行中',  label: '進行中',  description: '商談・訪問・提案作業を実施中',     color: 'bg-blue-100 text-blue-700' },
  { key: '完了待ち', label: '完了待ち', description: '提案済み・先方の回答・承認待ち',   color: 'bg-amber-100 text-amber-700' },
  { key: '完了',    label: '完了',    description: '本日の目標を達成・クローズ完了',    color: 'bg-green-100 text-green-700' },
];

const ROLE_OPTIONS = ['リーダー', 'シニア', 'ミドル', 'ジュニア'];

const INPUT_CLS = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300';

// ── セクションコンポーネント ─────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SaveBanner({ onSave }: { onSave: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-20">
      <button onClick={onSave}
        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        設定を保存する
      </button>
    </div>
  );
}

// ── メインコンポーネント ─────────────────────────────────────────────────

export default function SettingsView({
  roster, setRoster,
  goalOptions, setGoalOptions,
}: {
  roster: RosterMember[];
  setRoster: (r: RosterMember[]) => void;
  goalOptions: string[];
  setGoalOptions: (opts: string[]) => void;
}) {
  // メンバー管理（ローカルコピー → 保存時に反映）
  const [members, setMembers] = useState<RosterMember[]>([...roster]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('ミドル');
  const [editingId, setEditingId] = useState<number | null>(null);

  // レポート設定（localStorage 永続化）
  const [reportTime,   setReportTime]   = useLocalStorage('cfg-reportTime',   '20:00');
  const [emailTo,      setEmailTo]      = useLocalStorage('cfg-emailTo',      'manager@company.co.jp\nceo@company.co.jp');
  const [emailSubject, setEmailSubject] = useLocalStorage('cfg-emailSubject', '【営業活動】日次シグナルボード {date}');
  const [autoCapture,  setAutoCapture]  = useLocalStorage<boolean>('cfg-autoCapture', true);

  // ステータス設定（説明文のみ編集可・localStorage 永続化）
  const [statusDescs, setStatusDescs] = useLocalStorage<Record<string, string>>(
    'cfg-statusDescs',
    Object.fromEntries(INITIAL_STATUSES.map(s => [s.key, s.description])),
  );
  const statusDefs = INITIAL_STATUSES.map(s => ({ ...s, description: statusDescs[s.key] ?? s.description }));

  // 目標アクション選択肢の編集用ローカルコピー
  const [localGoals,  setLocalGoals]  = useState<string[]>(goalOptions);
  const [newGoalText, setNewGoalText] = useState('');

  const updateGoal  = (i: number, val: string) =>
    setLocalGoals(prev => prev.map((g, idx) => idx === i ? val : g));
  const removeGoal  = (i: number) =>
    localGoals.length > 1 && setLocalGoals(prev => prev.filter((_, idx) => idx !== i));
  const addGoal     = () => {
    if (!newGoalText.trim()) return;
    setLocalGoals(prev => [...prev, newGoalText.trim()]);
    setNewGoalText('');
  };
  const moveUp   = (i: number) => {
    if (i === 0) return;
    setLocalGoals(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; });
  };
  const moveDown = (i: number) => {
    if (i === localGoals.length - 1) return;
    setLocalGoals(prev => { const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  };

  // パスコード設定
  const [passcode,    setPasscode]    = useLocalStorage('cfg-passcode',    '0000');
  const [newPasscode, setNewPasscode] = useState('');
  const [pcError,     setPcError]     = useState('');

  const savePasscode = () => {
    if (newPasscode.length < 4) { setPcError('4文字以上で設定してください。'); return; }
    setPasscode(newPasscode);
    setNewPasscode('');
    setPcError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // 締切・リマインド設定（localStorage 永続化）
  const [deadlineTime,    setDeadlineTime]    = useLocalStorage('cfg-deadlineTime',    '19:30');
  const [reminderTime,    setReminderTime]    = useLocalStorage('cfg-reminderTime',    '19:00');
  const [reminderEnabled, setReminderEnabled] = useLocalStorage<boolean>('cfg-reminderEnabled', true);

  // 保存通知
  const [saved, setSaved] = useState(false);

  const addMember = () => {
    if (!newName.trim()) return;
    setMembers(prev => [...prev, { id: Date.now(), name: newName.trim(), role: newRole }]);
    setNewName('');
  };

  const removeMember = (id: number) => setMembers(prev => prev.filter(m => m.id !== id));

  const updateMemberRole = (id: number, role: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));

  const updateMemberName = (id: number, name: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, name } : m));

  const updateStatusDesc = (key: Status, description: string) =>
    setStatusDescs(prev => ({ ...prev, [key]: description }));

  const handleSave = () => {
    setRoster(members);          // メンバー名簿を全ページへ反映
    setGoalOptions(localGoals);  // 目標アクション選択肢を全ページへ反映
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">設定</h1>
        <p className="mt-1 text-sm text-slate-500">メンバー・レポート配信・ステータス定義を管理します。</p>
      </div>

      {/* 保存完了トースト */}
      {saved && (
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          設定を保存しました
        </div>
      )}

      {/* ── 1. チームメンバー管理 ── */}
      <SectionCard title="チームメンバー管理">
        <div className="space-y-4">
          {/* メンバー一覧 */}
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                {editingId === m.id ? (
                  <input
                    type="text"
                    value={m.name}
                    onChange={e => updateMemberName(m.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    className={`flex-1 ${INPUT_CLS} py-1`}
                  />
                ) : (
                  <span
                    className="flex-1 text-sm font-medium text-slate-800 cursor-pointer hover:text-blue-600"
                    onClick={() => setEditingId(m.id)}>
                    {m.name}
                  </span>
                )}
                <select
                  value={m.role}
                  onChange={e => updateMemberRole(m.id, e.target.value)}
                  className={`w-28 ${INPUT_CLS} py-1`}>
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={() => removeMember(m.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0">×</button>
              </div>
            ))}
          </div>

          {/* メンバー追加 */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
              placeholder="氏名を入力（例: 木村 拓哉）"
              className={`flex-1 ${INPUT_CLS}`}
            />
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className={`w-28 ${INPUT_CLS}`}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={addMember}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap">
              追加
            </button>
          </div>
          <p className="text-xs text-slate-400">名前をクリックすると直接編集できます。</p>
        </div>
      </SectionCard>

      {/* ── 2. レポート配信設定 ── */}
      <SectionCard title="レポート配信設定">
        <div className="space-y-5">
          {/* 自動送信 On/Off */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">スクリーンショット自動送信</p>
              <p className="text-xs text-slate-400">毎日指定時刻にダッシュボードを撮影してEmail送信します</p>
            </div>
            <button
              onClick={() => setAutoCapture(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoCapture ? 'bg-green-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoCapture ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* 送信時刻 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">送信時刻</label>
              <input
                type="time"
                value={reportTime}
                onChange={e => setReportTime(e.target.value)}
                className={`w-full ${INPUT_CLS}`}
              />
              <p className="text-xs text-slate-400">毎日この時刻に自動実行されます（現在: {reportTime}）</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">件名テンプレート</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                className={`w-full ${INPUT_CLS}`}
              />
              <p className="text-xs text-slate-400">{'{date}'} は送信日付に自動置換されます</p>
            </div>
          </div>

          {/* 送信先 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">送信先メールアドレス <span className="font-normal text-slate-400">（1行に1アドレス）</span></label>
            <textarea
              value={emailTo}
              onChange={e => setEmailTo(e.target.value)}
              rows={3}
              className={`w-full resize-none ${INPUT_CLS}`}
              placeholder="manager@company.co.jp"
            />
          </div>

          {/* 現在の設定プレビュー */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">現在の設定プレビュー</p>
            <p>送信: 毎日 {reportTime}　|　自動スクリーンショット: {autoCapture ? '有効' : '無効'}</p>
            <p>宛先: {emailTo.split('\n').filter(Boolean).join('、')}</p>
          </div>
        </div>
      </SectionCard>

      {/* ── 3. ステータス定義 ── */}
      <SectionCard title="ステータス定義">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">4つのステータスの説明文を編集できます。ステータス名と色は変更できません。</p>
          <div className="space-y-3">
            {statusDefs.map(s => (
              <div key={s.key} className="flex items-start gap-3">
                <span className={`status-pill flex-shrink-0 mt-1 ${s.color}`}>{s.label}</span>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={s.description}
                    onChange={e => updateStatusDesc(s.key, e.target.value)}
                    className={`w-full ${INPUT_CLS} py-1.5`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">説明文はメンバーの入力フォームのガイドとして表示されます。</p>
        </div>
      </SectionCard>

      {/* ── 3.5 目標アクション選択肢 ── */}
      <SectionCard title="週次計画フォーム：目標アクションの選択肢">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            週次計画フォームの「今週の目標アクション」ドロップダウンに表示される選択肢を管理します。
            並び順の変更・編集・削除・追加ができます。
          </p>

          {/* 選択肢一覧 */}
          <div className="space-y-2">
            {localGoals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* 並び替えボタン */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} disabled={i === 0}
                    className="w-5 h-4 flex items-center justify-center text-slate-300 hover:text-slate-500 disabled:opacity-20 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === localGoals.length - 1}
                    className="w-5 h-4 flex items-center justify-center text-slate-300 hover:text-slate-500 disabled:opacity-20 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {/* テキスト編集 */}
                <span className="text-xs text-slate-400 w-5 text-center flex-shrink-0">{i + 1}</span>
                <input
                  type="text"
                  value={goal}
                  onChange={e => updateGoal(i, e.target.value)}
                  className={`flex-1 ${INPUT_CLS} py-1.5`}
                />
                <button onClick={() => removeGoal(i)} disabled={localGoals.length <= 1}
                  className="text-slate-300 hover:text-red-400 disabled:opacity-20 transition-colors text-lg leading-none flex-shrink-0">×</button>
              </div>
            ))}
          </div>

          {/* 新規追加 */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newGoalText}
              onChange={e => setNewGoalText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
              placeholder="新しい選択肢を入力（例: デモ・製品説明）"
              className={`flex-1 ${INPUT_CLS}`}
            />
            <button onClick={addGoal}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap">
              追加
            </button>
          </div>
          <p className="text-xs text-slate-400">
            変更は「設定を保存する」ボタンを押すと週次計画フォームに即時反映されます。
          </p>
        </div>
      </SectionCard>

      {/* ── 4. 入力締切設定 ── */}
      <SectionCard title="日次レポート 締切・リマインド">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">入力締切時刻</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={e => setDeadlineTime(e.target.value)}
                className={`w-full ${INPUT_CLS}`}
              />
              <p className="text-xs text-slate-400">この時刻以降は当日の修正ができなくなります</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">リマインド通知時刻</label>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className={`w-full ${INPUT_CLS}`}
              />
              <p className="text-xs text-slate-400">未入力メンバーへSlack/メールで通知します（現在: {reminderTime}）</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">未入力メンバーへのリマインド送信</p>
              <p className="text-xs text-slate-400">締切前にSlackまたはメールで自動通知</p>
            </div>
            <button
              onClick={() => setReminderEnabled(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-green-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── 5. アクセス設定 ── */}
      <SectionCard title="アクセス設定（パスコード）">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            アプリへのアクセスに必要なパスコードを変更します。変更後はチームメンバーへ新しいパスコードをお知らせください。
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">現在のパスコード</label>
            <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 tracking-widest">
              {'●'.repeat(passcode.length)}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">新しいパスコード <span className="font-normal text-slate-400">（4文字以上）</span></label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPasscode}
                onChange={e => { setNewPasscode(e.target.value); setPcError(''); }}
                placeholder="新しいパスコードを入力"
                className={`flex-1 ${INPUT_CLS} ${pcError ? 'border-red-400' : ''}`}
              />
              <button
                onClick={savePasscode}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap">
                変更する
              </button>
            </div>
            {pcError && <p className="text-xs text-red-500">{pcError}</p>}
          </div>
          <p className="text-xs text-slate-400">
            ※ パスコードはブラウザのローカルストレージに保存されます。
            セキュリティが重要な場合はサーバー認証への移行をご検討ください。
          </p>
        </div>
      </SectionCard>

      <SaveBanner onSave={handleSave} />
    </div>
  );
}
