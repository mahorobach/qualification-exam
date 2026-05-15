# 電気資格系ポリシー

対象:

- `denco-app/index.html`
- `denco-app/koujishi-index.html`
- `denco-app/quiz.html`
- `denco-app/questions.json`
- `denco-app/mock-sets.html`
- `denco-app/denken-index.html`
- `denco-app/denken-quiz.html`
- `denco-app/denken-questions.json`
- `denco-app/denken-mock-sets.html`

詳細な重複回避・著作権・図面方針は `denco-app/quick-quiz-duplicate-policy.md` も参照します。

---

## 第二種電気工事士アプリの現在値

| 項目 | 現在値 |
|---|---|
| JSON問題数 | 205問 |
| 画像付き問題 | 7問（自作SVGのみ） |
| 内蔵フォールバック | 3問 |
| 最大読込数 | 208問 |
| 表示上の収録数 | 200問以上 |
| ランダムクイズ | 20問 |
| 擬似問題集 | 50問 |
| 合格判定 | 60%以上 |
| 年度別演習タイマー | 120分 |

問題数を増減したら、以下を必ず確認します。

- `denco-app/questions.json`
- `denco-app/koujishi-index.html`
- `denco-app/index.html`
- `denco-app/quiz.html`
- `denco-app/mock-sets.html`
- `readme.md`

---

## 第二種電気工事士の問題JSON

`denco-app/questions.json` の各問題は以下を基本形とします。

```json
{
  "id": 1,
  "category": "電気理論",
  "difficulty": "medium",
  "question": "問題文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correctIndex": 0,
  "explanation": "解説文",
  "year": "2024"
}
```

入力ルール:

- `choices` は必ず4件
- `correctIndex` は0から3
- `category` は既存カテゴリ名に合わせる
- `difficulty` は `easy` / `medium` / `hard`
- `year` は年度別演習に使うため、4桁文字列を基本とする
- 解説には、なぜ正解か、なぜ他が違うかをできるだけ書く

---

## 年度別演習・擬似問題集

第二種電気工事士の年度別演習と擬似問題集は、本番形式の体感に近づけるため、50問を次の配分で構成します。

- 一般問題: 30問
- 配線図・記号・識別: 20問

選択した年度だけで配線図・記号・識別20問を満たせない場合は、問題バンクから補完して50問配分を優先します。

注意:

- 公式試験そのものの完全再現ではない
- 年度名は、主にその年度の問題を中心にした演習セットを意味する
- 表示上も「年度ベース」「不足分は問題バンクから補完」と明記する

---

## 図面・写真の扱い

- 公式PDFの図面・写真ページをそのまま画像化して取り込まない
- 公式図面の線幅、配置、記号の具体的な並び、写真、紙面レイアウトをトレースしない
- 図面・写真が必要な問題は、自作SVG、自作アイコン、または公式PDFへの参照で対応する
- 写真問題は、公式写真を使わず、特徴を示す自作SVGアイコンまたは文章で成立させる
- 自作SVGには、必要に応じて「公式図面のトレースではない」旨を残す

現在の自作SVG例:

- `branch-circuit-example.svg`
- `three-way-switch-control.svg`
- `four-way-switch-control.svg`
- `outlet-suffix-symbols.svg`
- `wire-count-slashes.svg`
- `vvf-cable-notation.svg`
- `outlet-box-icon.svg`

---

## 画面・導線ルール

| 導線 | 遷移先 |
|---|---|
| `koujishi-index.html?mode=all` | `quiz.html?mode=all` |
| `koujishi-index.html?mode=year` | `quiz.html?mode=year` |
| `koujishi-index.html?mode=category` | `quiz.html?mode=category` |
| `koujishi-index.html?set=...` | `quiz.html?set=...` |

`koujishi-index.html` にはリダイレクト用スクリプトがあるため、モード付きURLの挙動を変更する場合は `quiz.html` の `boot()` とセットで確認します。

---

## 表記ルール

| NG表記 | 推奨表記 |
|---|---|
| AI解説機能付き | 詳しい解説付き |
| 300問以上 | 実データに合わせた「200問以上」など |
| 本番モード（年度別） | 年度別演習 |
| 筆記試験のみ | 学科試験（筆記方式またはCBT方式） |
| 30問中18問以上 | 50問中30問以上 |
| 配線図10問 | 配線図問題20問程度 |

---

## localStorage

| キー | 変更可否 |
|---|---|
| `denkoWeakQuestionIds` | 原則変更しない |
| `denkoCategoryStats` | 原則変更しない |
| `denkoAnsweredQids` | 原則変更しない |
| `denkoQuickQuizIssuedQids` | 原則変更しない |
| `denkoQuickQuizIssuedGroups` | 原則変更しない |

キーを変更する場合は、旧キーから新キーへの移行処理を入れます。

---

## 検証

第二種電気工事士の問題を編集したら、表示確認の前に検証スクリプトを実行します。

```bash
node scripts/validate-denco-questions.mjs
```

検証では、ID重複、選択肢数、`correctIndex`、解説、構造化問題、自作図面以外の画像参照、写真問題の成立性を確認します。
