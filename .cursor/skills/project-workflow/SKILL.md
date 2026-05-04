---
name: project-workflow
description: >-
  My-First-Project 専用のワークフロースキル。HTML/CSS のコーディング支援、
  コミットメッセージの生成・フォーマット、コードレビュー、デプロイ手順をカバーする。
  HTML ファイルの編集・作成、コミットの作成、コードレビューの依頼、
  デプロイや公開に関する作業が発生したときに自動で適用される。
---

# My-First-Project ワークフロースキル

## 図解・ビジュアル表現

- 図解を作成する際は **Tailwind CSS** を使用する。
- Tailwind の CDN (`https://cdn.tailwindcss.com`) を `<script>` タグで読み込む。
- ユーティリティクラスを活用し、インラインスタイルや独自 CSS は書かない。

---

## HTML/CSS コーディング支援

- `index.html` をエントリーポイントとして扱う。
- セマンティックな HTML5 要素 (`<header>`, `<main>`, `<footer>`, `<section>` など) を優先する。
- スタイルはインライン記述を避け、`<style>` タグまたは外部 CSS ファイルにまとめる。
- レスポンシブデザイン: `meta viewport` タグを必ず含め、メディアクエリでモバイル対応する。
- 文字コードは `UTF-8`、言語属性は `lang="ja"` を基本とする。

### HTML テンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>タイトル</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header></header>
  <main></main>
  <footer></footer>
</body>
</html>
```

---

## コミットメッセージ

Conventional Commits 形式を使用する。

```
<type>(<scope>): <要約（日本語可）>
```

| type | 用途 |
|------|------|
| `feat` | 新機能の追加 |
| `fix` | バグ修正 |
| `style` | スタイル・見た目の変更 |
| `refactor` | リファクタリング |
| `docs` | ドキュメント変更 |
| `chore` | ビルド・設定の変更 |

**例:**
```
feat(index): ヒーローセクションを追加
fix(style): スマホでのレイアウト崩れを修正
```

---

## コードレビューチェックリスト

HTML/CSS のレビュー時に確認する項目:

- [ ] `<!DOCTYPE html>` と `lang` 属性が存在する
- [ ] `meta charset` と `meta viewport` が設定されている
- [ ] 見出しタグ (`h1`〜`h6`) の階層が正しい (`h1` は1ページに1つ)
- [ ] 画像に `alt` 属性がある
- [ ] リンクに適切なテキストがある (「こちら」だけは NG)
- [ ] CSS クラス名がわかりやすく一貫している
- [ ] 未使用の CSS ルールがない

フィードバックの形式:
- 🔴 **必須**: マージ前に修正が必要
- 🟡 **推奨**: できれば改善したい
- 🟢 **任意**: あると良い

---

## デプロイ手順

このプロジェクトは静的サイトのため、以下のいずれかでホスティングする。

### GitHub Pages (推奨)
```bash
# リポジトリを GitHub にプッシュ後、Settings > Pages で
# Source: Deploy from a branch > main / root を選択
```

### ローカル確認
```bash
# Python が使える場合
python3 -m http.server 8080
# → ブラウザで http://localhost:8080 を開く
```

デプロイ前チェック:
- [ ] 全リンクと画像パスが相対パスになっている
- [ ] コンソールエラーがない (ブラウザの DevTools で確認)
- [ ] モバイル表示を DevTools のデバイスモードで確認済み
