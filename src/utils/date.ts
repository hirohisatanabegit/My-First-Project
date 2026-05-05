const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** "2026年5月5日（火）" */
export function formatJapaneseDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAYS[d.getDay()];
  return `${y}年${m}月${day}日（${w}）`;
}

/** "14:30" */
export function formatTime(d: Date = new Date()): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/** "2026年5月5日（火）　更新: 14:30" */
export function formatDatetime(d: Date = new Date()): string {
  return `${formatJapaneseDate(d)}　更新: ${formatTime(d)}`;
}
