# 資格トレイン — 資格試験クイズアプリ

スマホでスキマ時間に学習できる、資格試験向けの静的Webクイズ集です。
Cloudflare Workers + Static Assets で配信します。

---

## ターゲットユーザー

- 通勤・通学中に資格試験対策を進めたい社会人・学生
- 過去問ベースの短時間演習を繰り返したい受験者
- 分野別に苦手分野を確認したい独学者
- 会員登録なしで無料の学習ツールを使いたいユーザー

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド | HTML / CSS / JavaScript（静的） |
| 問題データ | JSON |
| 学習履歴 | localStorage |
| 配信 | Cloudflare Workers + Static Assets |
| Workers設定 | `wrangler.toml` |
| Worker本体 | `src/worker.js` |
| 本番URL | https://qualifications.app |

---

## 収録資格

| 資格 | フォルダ | ポリシー |
|---|---|---|
| 第二種電気工事士・電験三種 | `denco-app/` | `denco-app/policy.md` |
| 技術士第一次試験（機械部門） | `kikai-app/` | `kikai-app/policy.md` |

新しい資格を追加する場合は、`{資格slug}-app/` フォルダを作成し、`{資格slug}-app/policy.md` にポリシーを記載します。

---

## 開発ルール

作業前に必ず以下を読みます。

| 種別 | ファイル | 内容 |
|---|---|---|
| 共通ルール | `rules.md` | 全資格に共通する表記・著作権・JSON・localStorage・確認ルール |
| 資格別ポリシー | `{資格slug}-app/policy.md` | 各資格固有の仕様・問題作成方針・検証方法 |

---

## ページ構成

| ページ | ファイル |
|---|---|
| トップ | `index.html` |
| ブログ一覧 | `blog/index.html` |
| お問い合わせ | `contact.html` |
| プライバシーポリシー | `privacy.html` |

各資格のページ構成は、それぞれの `policy.md` を参照します。

---

## デプロイ

`wrangler.toml` は以下の構成です。

```toml
name = "qualification-exam"
compatibility_date = "2026-04-13"
main = "src/worker.js"

[assets]
directory = "."
binding = "ASSETS"
```

Cloudflare Workers の Static Assets としてリポジトリ直下を配信します。

---

## ローカル確認

`questions.json` を `fetch()` するページは `file://` 直開きだと読み込みに失敗することがあります。ローカルサーバーを使います。

```bash
python3 -m http.server 8000
```

各資格の確認URLは `{資格slug}-app/policy.md` を参照します。
