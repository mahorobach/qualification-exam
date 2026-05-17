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

| 資格 | フォルダ | ポリシー | 状態 |
|---|---|---|---|
| 第二種電気工事士・電験三種 | `denco-app/` | `denco-app/denco-policy.md` | 稼働中 |
| 技術士第一次試験（機械部門） | `kikai-app/` | `kikai-app/kikai-policy.md` | 稼働中 |
| 応用情報技術者（AP） | `ap-app/` | — | 稼働中 |
| 基本情報技術者（FE） | `fe-app/` | — | 稼働中 |
| 情報処理安全確保支援士（登録セキスペ） | `sekispe-app/` | — | 稼働中 |
| 情報処理資格ポータル（AP・FE・セキスペ統合） | `ipa-app/` | — | ポータルのみ |
| 宅地建物取引士（宅建） | `takken-app/` | — | 稼働中 |
| 管理業務主任者 | `kanri-app/` | — | 稼働中 |
| マンション管理士 | `mansion-app/` | — | 稼働中 |
| 不動産資格ポータル（宅建・管理業・マンション統合） | `fudosan-app/` | — | ポータルのみ |
| 行政書士 | `gyosei-app/` | — | 稼働中 |
| CCNA（シスコ技術者認定） | `ccna-app/` | — | 稼働中 |
| 地質調査技士 | `chishitsu-app/` | — | 稼働中 |
| 環境計量士 | `kankyoKeiryo-app/` | — | 準備中 |

新しい資格を追加する場合は、`{資格slug}-app/` フォルダを作成し、`{資格slug}-app/{資格slug}-policy.md` にポリシーを記載します。

---

## 開発ルール

作業前に必ず以下を読みます。

| 種別 | ファイル | 内容 |
|---|---|---|
| 共通ルール | `rules.md` | 全資格に共通する表記・著作権・JSON・localStorage・確認ルール |
| 資格別ポリシー | `{資格slug}-app/{資格slug}-policy.md` | 各資格固有の仕様・問題作成方針・検証方法 |
| 過去問PDF | `kakomon/` | 問題作成の参照用。gitignore済み。コミット禁止 |

---

## ページ構成

| ページ | ファイル |
|---|---|
| トップ | `index.html` |
| サービス紹介 | `about.html` |
| ブログ一覧 | `blog/index.html` |
| お問い合わせ | `contact.html` |
| プライバシーポリシー | `privacy.html` |

各資格のページ構成は、それぞれの `{slug}-policy.md` を参照します。

---

## プロジェクト構成

```
qualification-exam/               ルートディレクトリ（Cloudflare Workers で配信）
├── index.html                    トップページ
├── about.html                    サービス紹介
├── contact.html                  お問い合わせ
├── privacy.html                  プライバシーポリシー
├── robots.txt
├── sitemap.xml
├── wrangler.toml                 Cloudflare Workers 設定
├── readme.md                     プロジェクト概要（このファイル）
├── rules.md                      共通開発ルール
├── src/
│   └── worker.js                 Cloudflare Workers エントリポイント
├── scripts/
│   └── validate-denco-questions.mjs  電気系 JSON 検証スクリプト
├── assets/
│   └── site-nav.css              共通ナビゲーション CSS
├── blog/                         ブログ記事群
│   ├── index.html                ブログ一覧
│   └── *.html                    各記事
├── ai-chat/
│   └── index.html                AI チャット（実験的）
│
├── denco-app/                    第二種電気工事士・電験三種
│   ├── denco-policy.md           電気資格系ポリシー
│   ├── index.html                電気資格系ポータル
│   ├── koujishi-index.html       第二種電気工事士ポータル
│   ├── quiz.html                 クイズ画面
│   ├── mock-sets.html            擬似問題集
│   ├── questions.json            第二種電気工事士 問題データ
│   ├── denken-index.html         電験三種ポータル
│   ├── denken-quiz.html          電験三種クイズ画面
│   ├── denken-mock-sets.html     電験三種擬似問題集
│   ├── denken-questions.json     電験三種 問題データ
│   ├── images/
│   │   ├── circuit/              計算問題用 回路図 SVG
│   │   └── diagrams/self-made/   自作模式図 SVG
│   ├── api/
│   │   └── comments.php          コメント投稿 API
│   └── data/
│       └── comments.json         コメントデータ
│
├── kikai-app/                    技術士第一次試験（機械部門）
│   ├── kikai-policy.md           機械部門ポリシー
│   ├── index.html                ポータル
│   ├── quiz.html                 クイズ画面
│   ├── questions.json            問題データ
│   ├── taisaku-basic.html        基礎科目 傾向と対策
│   ├── taisaku-ethics.html       適性科目 傾向と対策
│   └── taisaku-specialty.html    専門科目 傾向と対策
│
├── ap-app/                       応用情報技術者（AP）
│   ├── index.html
│   ├── quiz.html
│   ├── mock-sets.html
│   └── questions.json
│
├── fe-app/                       基本情報技術者（FE）
│   ├── index.html
│   ├── quiz.html
│   ├── mock-sets.html
│   └── questions.json
│
├── sekispe-app/                  情報処理安全確保支援士（登録セキスペ）
│   ├── index.html
│   ├── quiz.html
│   ├── mock-sets.html
│   └── questions.json
│
├── ipa-app/                      情報処理資格ポータル（AP・FE・セキスペ統合）
│   └── index.html
│
├── takken-app/                   宅地建物取引士（宅建）
│   ├── index.html
│   ├── quiz.html
│   ├── mock-sets.html
│   └── questions.json
│
├── kanri-app/                    管理業務主任者
│   ├── index.html
│   ├── quiz.html
│   ├── mock-sets.html
│   └── questions.json
│
├── mansion-app/                  マンション管理士
│   ├── index.html
│   ├── quiz.html
│   ├── mock-sets.html
│   └── questions.json
│
├── fudosan-app/                  不動産資格ポータル（宅建・管理業・マンション統合）
│   └── index.html
│
├── gyosei-app/                   行政書士
│   ├── index.html
│   ├── quiz.html
│   └── questions.json
│
├── ccna-app/                     CCNA（シスコ技術者認定）
│   ├── index.html
│   ├── quiz.html
│   └── questions.json
│
├── chishitsu-app/                地質調査技士
│   ├── index.html
│   ├── quiz.html
│   └── questions.json
│
├── kankyoKeiryo-app/             環境計量士（準備中）
│
└── kakomon/                      公式過去問PDF（gitignore・コミット禁止）
    ├── 20240526_co_second_q01.pdf   第二種電気工事士 2024年前期
    ├── 20241027_co_second_q01.pdf   第二種電気工事士 2024年後期
    ├── 20250525_co_second_q01.pdf   第二種電気工事士 2025年前期
    └── 20251026_co_second_q01.pdf   第二種電気工事士 2025年後期
```

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

各資格の確認URLは `{資格slug}-app/{資格slug}-policy.md` を参照します。
