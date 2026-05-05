export type Status    = '未着手' | '進行中' | '完了待ち' | '完了';
export type Situation = '未着手' | '対応中' | '提案済み' | '完了';
export type Priority  = '高' | '中' | '低';

/** 設定ページで管理するチームメンバーの名簿 */
export interface RosterMember { id: number; name: string; role: string }

export const DEFAULT_ROSTER: RosterMember[] = [
  { id: 1, name: '田中 一郎', role: 'シニア' },
  { id: 2, name: '鈴木 花子', role: 'シニア' },
  { id: 3, name: '佐藤 太郎', role: 'ジュニア' },
  { id: 4, name: '山田 次郎', role: 'シニア' },
  { id: 5, name: '伊藤 美咲', role: 'リーダー' },
  { id: 6, name: '渡辺 健二', role: 'ミドル' },
  { id: 7, name: '小林 直樹', role: 'ミドル' },
  { id: 8, name: '加藤 聡子', role: 'ジュニア' },
];

export interface CustomerSituation {
  name: string;
  situation: Situation;
}

export interface Member {
  name: string;
  status: Status;
  customers: CustomerSituation[];
  summary: string;
  updatedAt: string;
}

export const STATUS_BG: Record<Status, string> = {
  '未着手':  'bg-slate-100 text-slate-600',
  '進行中':  'bg-blue-100  text-blue-700',
  '完了待ち': 'bg-amber-100 text-amber-700',
  '完了':    'bg-green-100 text-green-700',
};

export const SITUATION_BG: Record<Situation, string> = {
  '未着手':  'bg-slate-100 text-slate-600',
  '対応中':  'bg-blue-100  text-blue-700',
  '提案済み': 'bg-amber-100 text-amber-700',
  '完了':    'bg-green-100 text-green-700',
};

export const STATUS_BORDER: Record<Status, string> = {
  '未着手':  'border-l-4 border-slate-300',
  '進行中':  'border-l-4 border-blue-400',
  '完了待ち': 'border-l-4 border-amber-400',
  '完了':    'border-l-4 border-green-400',
};

export const STATUS_ROW: Record<Status, string> = {
  '未着手':  'bg-white',
  '進行中':  'bg-blue-50',
  '完了待ち': 'bg-amber-50',
  '完了':    'bg-green-50',
};

/** 週次計画フォームで提出された顧客データ */
export interface WeeklyPlanCustomer {
  name: string;
  goal: string;
  priority: Priority;
}

/** 週次計画フォームの提出データ全体 */
export interface WeeklyPlanSubmission {
  member: string;
  customers: WeeklyPlanCustomer[];
  theme: string;
  submittedAt: string;
}

/** 日次フォームの提出データ */
export interface DailySubmission {
  member: string;
  status: Status;
  custSits: Record<string, Situation>;
  summary: string;
  submittedAt: string;
}

/** localStorage キー生成ユーティリティ */
export const weeklyPlanKey    = (name: string) => `weekly-plan-${name}`;
export const dailySubmissionKey = (name: string, date = new Date().toISOString().slice(0, 10)) =>
  `daily-submission-${date}-${name}`;

export const MEMBERS: Member[] = [
  { name: '田中 一郎', status: '完了',    customers: [{ name: 'A社', situation: '完了' }, { name: 'B社', situation: '提案済み' }], summary: 'A社との商談クローズ。次回フォロー日程を確定済み。',     updatedAt: '10:30' },
  { name: '鈴木 花子', status: '進行中',  customers: [{ name: 'C社', situation: '対応中' }, { name: 'D社', situation: '未着手' }],  summary: 'C社訪問済み。提案書を作成中、明日提出予定。',         updatedAt: '11:15' },
  { name: '佐藤 太郎', status: '未着手',  customers: [{ name: 'E社', situation: '未着手' }, { name: 'F社', situation: '未着手' }],  summary: '本日の活動記録なし。',                              updatedAt: '—'     },
  { name: '山田 次郎', status: '完了待ち', customers: [{ name: 'G社', situation: '提案済み' }, { name: 'H社', situation: '提案済み' }], summary: 'G・H社へ見積提出済み。先方の回答待ち。',           updatedAt: '09:45' },
  { name: '伊藤 美咲', status: '完了',    customers: [{ name: 'I社', situation: '完了' }, { name: 'J社', situation: '完了' }, { name: 'K社', situation: '対応中' }], summary: 'I社と契約合意。J社書類完了。K社継続ヒアリング。', updatedAt: '14:00' },
  { name: '渡辺 健二', status: '進行中',  customers: [{ name: 'L社', situation: '対応中' }, { name: 'M社', situation: '未着手' }],  summary: 'L社追加ヒアリング中。M社は来週訪問予定。',           updatedAt: '13:20' },
  { name: '小林 直樹', status: '完了待ち', customers: [{ name: 'N社', situation: '提案済み' }, { name: 'O社', situation: '提案済み' }], summary: 'N・O社に見積提出。承認待ち。',                   updatedAt: '12:00' },
  { name: '加藤 聡子', status: '未着手',  customers: [{ name: 'P社', situation: '未着手' }],                                        summary: '本日の活動記録なし。',                              updatedAt: '—'     },
];
