/**
 * capture-and-send.mjs
 * ─────────────────────────────────────────────────────────
 * 営業活動ダッシュボードのスクリーンショットを撮影し、
 * SendGrid 経由でEmail送信します。
 *
 * 必要な環境変数:
 *   SITE_URL         デプロイ先URL
 *   APP_PASSCODE     ダッシュボードのパスコード (デフォルト: 0000)
 *   SENDGRID_API_KEY SendGrid APIキー
 *   EMAIL_FROM       送信元アドレス (SendGrid認証済み)
 *   EMAIL_TO         送信先アドレス (カンマ区切りで複数可)
 *   EMAIL_SUBJECT    件名 ({date}は日付に置換。省略可)
 *   TEAM_ID          チームID (複数チーム運用時のみ)
 * ─────────────────────────────────────────────────────────
 */

import puppeteer from 'puppeteer';
import sgMail from '@sendgrid/mail';
import { readFileSync } from 'fs';

// ── 設定値の読み込み（report-config.json → 環境変数 の順で優先）──────────
let fileConfig = {};
try {
  fileConfig = JSON.parse(readFileSync('./report-config.json', 'utf-8'));
  console.log('📄 report-config.json を読み込みました');
} catch {
  console.log('📄 report-config.json が見つかりません。環境変数を使用します。');
}

const SITE_URL         = process.env.SITE_URL || 'https://hirohisatanabegit.github.io/My-First-Project/';
const APP_PASSCODE     = process.env.APP_PASSCODE || '0000';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM       = fileConfig.emailFrom  || process.env.EMAIL_FROM;
const EMAIL_TO         = fileConfig.emailTo    || (process.env.EMAIL_TO || '').split(',').map(e => e.trim()).filter(Boolean);
const TEAM_ID          = process.env.TEAM_ID   || '';

// 日本時間で日付・時刻フォーマット
const now      = new Date();
const dateStr  = now.toLocaleDateString('ja-JP', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  timeZone: 'Asia/Tokyo',
});
const timeStr  = now.toLocaleTimeString('ja-JP', {
  hour: '2-digit', minute: '2-digit',
  timeZone: 'Asia/Tokyo',
});
const dateKey  = now.toLocaleDateString('ja-JP', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  timeZone: 'Asia/Tokyo',
}).replaceAll('/', '-');

const EMAIL_SUBJECT = (fileConfig.emailSubject || process.env.EMAIL_SUBJECT || '【営業活動】日次シグナルボード {date}')
  .replace('{date}', dateStr);

// ── バリデーション ────────────────────────────────────────
function assertEnv() {
  const missing = [];
  if (!SENDGRID_API_KEY) missing.push('SENDGRID_API_KEY');
  if (!EMAIL_FROM)       missing.push('EMAIL_FROM');
  if (EMAIL_TO.length === 0) missing.push('EMAIL_TO');
  if (missing.length > 0) {
    throw new Error(`必須の環境変数が未設定です: ${missing.join(', ')}\n` +
      'リポジトリの Settings > Secrets and variables から設定してください。');
  }
}

// ── スクリーンショット撮影 ────────────────────────────────
async function captureScreenshots() {
  console.log('🌐 ブラウザを起動中...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  // チームIDがあればURLに付与
  const targetUrl = TEAM_ID ? `${SITE_URL}?team=${TEAM_ID}` : SITE_URL;
  console.log(`📡 アクセス中: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30_000 });

  // ── ログイン画面の処理 ────────────────────────────────
  const passwordInput = await page.$('input[type="password"]');
  if (passwordInput) {
    console.log('🔑 パスコードを入力中...');
    await passwordInput.type(APP_PASSCODE);
    await page.click('button[type="submit"]');
    await delay(2000);
  }

  // ── Page 1: チームシグナル・メンバー別 ────────────────
  // ダッシュボードタブへ移動（他のタブにいる場合）
  await clickTabByText(page, 'ダッシュボード');
  await delay(800);
  await clickTabByText(page, 'チームシグナル');  // スライドタブ
  await delay(500);
  const shot1 = await page.screenshot({ type: 'png' });
  console.log('📸 ページ1（チームシグナル）撮影完了');

  // ── Page 2: 全員サマリー一覧 ──────────────────────────
  await clickTabByText(page, '全員サマリー');
  await delay(500);
  const shot2 = await page.screenshot({ type: 'png' });
  console.log('📸 ページ2（全員サマリー）撮影完了');

  await browser.close();
  return [shot1, shot2];
}

/** テキストを含むボタン・タブをクリック（存在しない場合はスキップ） */
async function clickTabByText(page, text) {
  try {
    await page.evaluate((t) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.includes(t));
      if (btn) btn.click();
    }, text);
  } catch { /* ignore */ }
}

/** ms ミリ秒待機 */
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Email 送信 ────────────────────────────────────────────
async function sendEmail(screenshots) {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const html = `
    <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #334155;">
      <div style="background: #1e293b; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <p style="margin:0; font-size: 18px; font-weight: bold;">営業活動 日次シグナルボード</p>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.7;">${dateStr}　${timeStr} 時点</p>
      </div>
      <div style="padding: 20px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 12px;">お疲れ様です。本日の営業活動レポートをお送りします。</p>
        <p style="margin: 0 0 4px; font-size: 13px; color: #64748b;">添付ファイル:</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b;">
          <li>p1: チームシグナル・メンバー別カード</li>
          <li>p2: 全員サマリー一覧</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          このメールは GitHub Actions によって自動送信されています。
        </p>
      </div>
    </div>
  `;

  const msg = {
    to:      EMAIL_TO,
    from:    EMAIL_FROM,
    subject: EMAIL_SUBJECT,
    text:    `${dateStr} ${timeStr} 時点の営業活動シグナルボードをお送りします。`,
    html,
    attachments: screenshots.map((buf, i) => ({
      content:     buf.toString('base64'),
      filename:    `sales-report-${dateKey}-p${i + 1}.png`,
      type:        'image/png',
      disposition: 'attachment',
    })),
  };

  await sgMail.send(msg);
}

// ── メイン処理 ────────────────────────────────────────────
async function main() {
  console.log('='.repeat(50));
  console.log('営業日次レポート 自動送信スクリプト');
  console.log(`実行日時: ${dateStr} ${timeStr}`);
  console.log('='.repeat(50));

  assertEnv();

  const screenshots = await captureScreenshots();

  console.log('📧 メール送信中...');
  console.log(`   件名: ${EMAIL_SUBJECT}`);
  console.log(`   宛先: ${EMAIL_TO.join(', ')}`);
  await sendEmail(screenshots);

  console.log('');
  console.log('✅ 完了しました！');
}

main().catch(err => {
  console.error('');
  console.error('❌ エラーが発生しました:');
  console.error(err.message);
  process.exit(1);
});
