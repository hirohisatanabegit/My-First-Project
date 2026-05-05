import { useState } from 'react';

export default function LoginView({
  passcode,
  onLogin,
}: {
  passcode: string;
  onLogin: () => void;
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === passcode) {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">営業活動管理</h1>
          <p className="mt-1 text-sm text-slate-500">チーム専用ダッシュボード</p>
        </div>

        {/* カード */}
        <div className={`card p-6 space-y-5 ${shake ? 'animate-shake' : ''}`}>
          <div>
            <h2 className="text-base font-semibold text-slate-800">パスコードでアクセス</h2>
            <p className="text-xs text-slate-400 mt-0.5">チームに配布されたパスコードを入力してください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">パスコード</label>
              <input
                type="password"
                value={input}
                onChange={e => { setInput(e.target.value); setError(false); }}
                placeholder="パスコードを入力"
                autoFocus
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-blue-300'
                }`}
              />
              {error && (
                <p className="text-xs text-red-500 font-medium">パスコードが正しくありません。</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
              アクセスする
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          パスコードは管理者にお問い合わせください
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
