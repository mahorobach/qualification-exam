# 資格トレイン — 資格試験クイズアプリ

スマホでスキマ時間に学習できる、資格試験向けの静的Webクイズ集です。
各資格ごとにポータル、クイズ画面、問題JSON、擬似問題集を持ち、Cloudflare Workers + Static Assets で配信します。

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

## 主なページ構成

| ページ | ファイル | 説明 |
|---|---|---|
| トップ | `index.html` | 資格トレイン全体の入口 |
| ブログ一覧 | `blog/index.html` | 資格学習記事一覧 |
| 電気資格ポータル | `denco-app/index.html` | 電験三種・第二種電気工事士の入口 |
| 第二種電気工事士ポータル | `denco-app/koujishi-index.html` | 学科対策アプリの説明とモード導線 |
| 第二種電気工事士クイズ | `denco-app/quiz.html` | ランダム・年度別・分野別・弱点復習 |
| 第二種電気工事士問題 | `denco-app/questions.json` | 200問の問題データ |
| 第二種電気工事士擬似問題集 | `denco-app/mock-sets.html` | 50問セットの入口 |
| 電験三種ポータル | `denco-app/denken-index.html` | 電験三種アプリの説明と導線 |
| お問い合わせ | `contact.html` | 問い合わせページ |
| プライバシーポリシー | `privacy.html` | Cookie・広告・個人情報方針 |

---

## 第二種電気工事士アプリの仕様

### 収録データ

| 項目 | 内容 |
|---|---|
| JSON問題数 | 200問 |
| 内蔵フォールバック | 3問 |
| 最大読込数 | 203問 |
| 年度 | 2022 / 2023 / 2024 / 2025 |
| カテゴリ | 電気理論、配線図・記号・識別、法令、接地・漏電保護、屋内配線・施工、機器・試験・計測 |
| 難易度 | easy / medium / hard |

### モード

| モード | 説明 |
|---|---|
| クイズを始める | 全問からランダム20問。過去に出た問題を避け、使い切ると履歴をリセット |
| 年度別演習 | 年度を選択し、120分タイマー付きで解答。終了後に全解説を確認 |
| 学習モード（分野別） | 分野を選んで1問ずつ解答。解答ごとに正誤と解説を表示 |
| 擬似問題集 | 難易度比率別の50問セット。60%以上で合格判定 |
| 間違った問題だけ再出題 | 不正解だった問題をlocalStorageに保存し、集中復習 |
| 回答済みを出題に戻す | 回答済み履歴を削除し、通常出題対象に戻す |

---

## データ保存

第二種電気工事士アプリはブラウザの `localStorage` に以下を保存します。

| キー | 内容 |
|---|---|
| `denkoWeakQuestionIds` | 間違った問題のID |
| `denkoCategoryStats` | 分野別の累計正答率 |
| `denkoAnsweredQids` | 学習モード・擬似問題集の回答済みID |
| `denkoQuickQuizIssuedQids` | ランダム20問で出題済みのID |

会員登録やサーバー保存は行いません。

---

## 試験情報の扱い

第二種電気工事士の学科試験は、公式情報に合わせて以下の前提で表記します。

| 項目 | 表記方針 |
|---|---|
| 試験名 | 学科試験 |
| 方式 | 筆記方式またはCBT方式 |
| 試験時間 | 120分 |
| 出題数 | 50問 |
| 合格ライン | 60点以上、50問中30問以上を目安 |
| 配線図問題 | 20問程度 |

正確な試験情報は、一般財団法人 電気技術者試験センターの公式サイトを参照します。

---

## ローカル確認

静的HTMLですが、`questions.json` を `fetch()` するページは `file://` 直開きだと読み込みに失敗することがあります。

```bash
python3 -m http.server 8000
```

起動後、以下をブラウザで確認します。

```text
http://localhost:8000/
http://localhost:8000/denco-app/koujishi-index.html
http://localhost:8000/denco-app/quiz.html
http://localhost:8000/denco-app/mock-sets.html
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

Cloudflare WorkersのStatic Assetsとしてリポジトリ直下を配信します。

---

## 改善メモ

- 第二種電気工事士は現在200問。問題数を増やした場合は、ポータル・README・サイト内説明の表記も同時に更新する
- 「AI解説」と表記する場合は、実際にAI連携があるページだけに限定する
- 年度別演習は収録問題ベース。公式試験そのものではないため、必要以上に「本番完全再現」と表現しない
- ブログ記事の試験制度・問題数・合格基準は、定期的に公式情報で確認する

