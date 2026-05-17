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

---

## 第二種電気工事士アプリの現在値

| 項目 | 現在値 |
|---|---|
| JSON問題数 | 311問 |
| 画像付き問題 | 93問（自作SVGのみ） |
| 内蔵フォールバック | 3問 |
| 最大読込数 | 314問 |
| 表示上の収録数 | 300問以上 |
| ランダムクイズ | 20問 |
| 擬似問題集 | 50問 |
| 合格判定 | 60%以上 |
| 年度別演習タイマー | 120分 |
| 年度 | 2022 / 2023 / 2024前期 / 2024後期 / 2025上期 / 2025下期 |

### カテゴリ別内訳（現在値）

| カテゴリ | 問題数 |
|---|---|
| 電気理論 | 38問 |
| 屋内配線・施工 | 45問 |
| 機器・試験・計測 | 64問 |
| 接地・漏電保護 | 12問 |
| 配線図・記号・識別 | 106問 |
| 法令 | 46問 |

※年度未設定の問題が5問含まれており、各カテゴリに分散しています。

問題数を増減したら、以下を必ず確認します。

- `denco-app/questions.json`
- `denco-app/koujishi-index.html`
- `denco-app/index.html`
- `denco-app/quiz.html`
- `denco-app/mock-sets.html`
- `readme.md`

---

## 年度・session別問題数の管理

問題を追加・削除したら以下で確認する。

```bash
node -e 'const q=require("./denco-app/questions.json"); const years={}; for(const x of q) years[(x.year||"未設定")+(x.session?"-"+x.session:"")]=(years[(x.year||"未設定")+(x.session?"-"+x.session:"")]||0)+1; console.log(years); console.log("全問題数:", q.length);'
```

### 目標値（1年度・1期あたり）

| カテゴリ | 問題数 |
|---|---|
| 電気理論 | 6問 |
| 屋内配線・施工 | 8問 |
| 機器・試験・計測 | 10問 |
| 接地・漏電保護 | 3問 |
| 法令 | 8問 |
| 配線図・記号・識別 | 20問 |
| 合計 | 55問 |

### 配線図SVGの命名規則

| 年度・時期 | SVGファイル名 |
|---|---|
| 2025年上期 | 2025-wiring-plan.svg |
| 2025年下期 | 2025-kouki-wiring-plan.svg |
| 2024年前期 | 2024-zenki-wiring-plan.svg | 作成済み |
| 2024年後期 | 2024-kouki-wiring-plan.svg | 作成済み |

---

## モード

| モード | 説明 |
|---|---|
| クイズを始める | 全問からランダム20問。過去に出た問題を避け、使い切ると履歴をリセット |
| 年度別演習 | 年度・前期後期ごとに独立した50問（一般30問＋配線図・記号・識別20問）を解答。120分タイマー付き。他年度からの補完は行わない |
| 学習モード（分野別） | 分野を選んで1問ずつ解答。解答ごとに正誤と解説を表示 |
| 擬似問題集 | 本番形式50問（一般30問＋配線図・記号・識別20問）をベースに、難易度比率別で出題。60%以上で合格判定 |
| 間違った問題だけ再出題 | 不正解だった問題をlocalStorageに保存し、集中復習 |
| 回答済みを出題に戻す | 回答済み履歴を削除し、通常出題対象に戻す |

---

## 試験情報の表記方針

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

## 問題JSONスキーマ

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
  "year": "2024",
  "duplicateGroup": "theory_parallel_resistance",
  "learningPoint": "並列抵抗の合成抵抗",
  "qualityStatus": "keep",
  "variantRole": "basic"
}
```

入力ルール:

- `choices` は必ず4件
- `correctIndex` は0から3
- `category` は既存カテゴリ名に合わせる
- `difficulty` は `easy` / `medium` / `hard`
- `year` は4桁文字列を基本とする
- 解説には、なぜ正解か、なぜ他が違うかをできるだけ書く

### 品質メタデータ

| フィールド | 説明 |
|---|---|
| `duplicateGroup` | 人間が同じ型と感じる問題群のグループID |
| `learningPoint` | この問題で学ばせたい1つの論点 |
| `qualityStatus` | `keep` / `revise` / `merge` / `replace` |
| `variantRole` | 同じ論点内での役割。例: `basic` / `calculation` / `exception` / `trap` / `field_practice` |

同じ `duplicateGroup` の問題を複数残す場合は、`variantRole` が違うことを条件にします。役割が同じなら、片方は統合または差し替え候補にします。

### 構造化問題（著作権対応）

公式問題文をそのままコピーせず、問題の「事実」と「表示文」を分けて管理します。

```json
{
  "sourceFacts": {
    "circuit": "two_resistors_parallel",
    "values": { "r1_ohm": 4, "r2_ohm": 6 },
    "askedValue": "equivalent_resistance"
  },
  "questionTemplate": "抵抗 {r1}{unit} と {r2}{unit} を並列に接続した。合成抵抗として最も近い値を選べ。",
  "params": { "r1": 4, "r2": 6, "unit": "Ω" },
  "expressionPolicy": "question_text_generated_from_template"
}
```

---

## 年度別演習・擬似問題集

50問を次の配分で構成します。

- 一般問題: 30問
- 配線図・記号・識別: 20問

選択した年度だけで配線図・記号・識別20問を満たせない場合は、問題バンクから補完して50問配分を優先します。

注意:

- 公式試験そのものの完全再現ではない
- 年度名は、主にその年度の問題を中心にした演習セットを意味する
- 表示上も「年度ベース」「不足分は問題バンクから補完」と明記する

---

## ランダムクイズの重複回避

### 実装仕様

- 1セットは `QUICK_QUIZ_QUESTION_COUNT = 20`
- 出題済み履歴は `localStorage` の `denkoQuickQuizIssuedQids` と `denkoQuickQuizIssuedGroups`
- クイッククイズ開始時に、今回選ばれた問題の `_qid` と `duplicateGroup` を履歴へ保存
- 次回は `_qid` と `duplicateGroup` の両方で除外
- 残り問題が20問未満になると履歴を自動リセット

### グループ除外の判定

- `duplicateGroup` がある問題は、同じグループを出題済みなら除外
- `duplicateGroup` がない問題は、従来どおり `_qid` で除外
- どうしても20問に足りない場合だけ、グループ除外を緩める

通常学習・間違った問題の再出題では、反復学習の価値があるため問題単位で扱います。

---

## 良問の基準

以下を満たすものを良問とします。

- 本試験で問われやすい論点に直結している
- 正解だけでなく、不正解選択肢にも意味がある
- 解説で「なぜ正しいか」「なぜ他が違うか」が分かる
- 暗記問題は、数字や語句を丸暗記させるだけでなく、条件との対応が見える
- 計算問題は、公式を使うだけでなく、単位・条件・典型ミスを意識できる
- 配線図・器具・施工は、現場イメージまたは試験図面での見え方につながる

以下は修正対象の弱い問題です。

- 数値だけ変えた同型問題で、学習上の差がない
- 正解選択肢だけが明らかに浮いている
- 問い方が曖昧で、条件不足に見える
- 解説が正解の言い換えだけになっている
- 本試験の出題感から遠い雑学寄りの問題

---

## 図面・写真の扱い

- 公式PDFの図面・写真ページをそのまま画像化して取り込まない
- 公式図面の線幅、配置、記号の具体的な並び、写真、紙面レイアウトをトレースしない
- 図面・写真が必要な問題は、自作SVGまたは公式PDFへの参照で対応する
- 写真問題は、公式写真を使わず、特徴を示す自作SVGアイコンまたは文章で成立させる
- 自作SVGには、`desc` タグで「公式図面のトレースではない」旨を残す

### 現在の自作SVG一覧

**`images/circuit/`（計算問題用 回路図）**

| ファイル | 内容 |
|---|---|
| `c-series-2-8.svg` | 直列回路（2Ω + 8Ω） |
| `c-series-3-7.svg` | 直列回路（3Ω + 7Ω） |
| `c-series-6-4.svg` | 直列回路（6Ω + 4Ω） |
| `c-par2-4-4.svg` | 2素子並列回路（4Ω ‖ 4Ω） |
| `c-par2-6-3.svg` | 2素子並列回路（6Ω ‖ 3Ω） |
| `c-par3-2-3-6.svg` | 3素子並列回路（2Ω ‖ 3Ω ‖ 6Ω） |
| `c-par3-3-6-6.svg` | 3素子並列回路（3Ω ‖ 6Ω ‖ 6Ω） |
| `c-sp-2-4-4.svg` | 直並列回路（2Ω直列 + 4Ω‖4Ω並列） |

**`images/diagrams/self-made/`（自作模式図・基本）**

| ファイル | 内容 |
|---|---|
| `branch-circuit-example.svg` | 片切スイッチと非接地側電線 |
| `three-way-switch-control.svg` | 3路スイッチによる2か所点滅 |
| `four-way-switch-control.svg` | 4路スイッチを含む3か所点滅 |
| `outlet-suffix-symbols.svg` | E / ET / EET / WP / T の傍記整理 |
| `wire-count-slashes.svg` | 単線図の電線本数表示 |
| `vvf-cable-notation.svg` | VVF 2.0-3C の表記整理 |
| `outlet-box-icon.svg` | アウトレットボックスの特徴アイコン |

**`images/diagrams/self-made/`（2025年度用）**

| ファイル | 内容 |
|---|---|
| `2025-q01-circuit.svg` | 2025年 Q01 回路図 |
| `2025-rl-voltage-triangle.svg` | RL回路 電圧三角形 |
| `2025-resistor-switch-network.svg` | 抵抗・スイッチネットワーク回路 |
| `2025-single-phase-three-wire.svg` | 単相3線式回路 |
| `2025-three-phase-load.svg` | 三相負荷回路 |
| `2025-voltage-drop-table.svg` | 電圧降下計算表 |
| `2025-q16-material.svg` | 2025年 Q16 材料識別 |
| `2025-q17-device.svg` | 2025年 Q17 機器識別 |
| `2025-q18-tool.svg` | 2025年 Q18 工具識別 |
| `2025-q25-insulation-meter.svg` | 2025年 Q25 絶縁抵抗計 |
| `2025-q27-meter-symbol.svg` | 2025年 Q27 メーター記号 |
| `2025-material-icons.svg` | 2025年度 材料アイコン集 |
| `2025-outlet-switch-symbols.svg` | 2025年度 コンセント・スイッチ記号 |
| `2025-branch-circuit-set.svg` | 2025年度 分岐回路セット |
| `2025-feeder-branch.svg` | 2025年度 幹線・分岐回路 |
| `2025-ring-sleeve-box.svg` | 2025年度 リングスリーブ・ボックス |
| `2025-test-instrument-icons.svg` | 2025年度 試験器具アイコン集 |
| `2025-wiring-plan.svg` | 2025年度 配線図（詳細版） |
| `2025-wiring-plan-simplified.svg` | 2025年度 配線図（簡略版） |
| `2025-kouki-wiring-plan.svg` | 2025年度下期 木造2階建て住宅配線図 |
| `2024-zenki-wiring-plan.svg` | 2024年度前期 鉄骨軽量コンクリート造単層店舗兼事務所配線図 |
| `2024-kouki-wiring-plan.svg` | 2024年度後期 鉄骨軽量コンクリート造一部2階建工場及び倉庫配線図 |

---

## 出典・改変表示

アプリの使い方欄と分野別メニューに、出典表示を常時掲載します。各問題データには `source`、`sourceUrl`、`sourceQuestion`、`isModified` を持たせます。

基本表示:

```text
出典：一般財団法人 電気技術者試験センター公表「第二種電気工事士試験の問題と解答」。
本アプリでは学習しやすいように一部の問題文・選択肢・解説を編集しています。図面・写真が必要な問題では、公式画像を取り込まず、自作図面または公式PDFへの参照で対応します。
```

---

## localStorage

| キー | 内容 | 変更可否 |
|---|---|---|
| `denkoWeakQuestionIds` | 間違った問題のID | 原則変更しない |
| `denkoCategoryStats` | 分野別の累計正答率 | 原則変更しない |
| `denkoAnsweredQids` | 学習モード・擬似問題集の回答済みID | 原則変更しない |
| `denkoQuickQuizIssuedQids` | ランダム20問で出題済みのID | 原則変更しない |
| `denkoQuickQuizIssuedGroups` | ランダム20問で出題済みの重複グループ | 原則変更しない |

キーを変更する場合は、旧キーから新キーへの移行処理を入れます。

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

## 検証

第二種電気工事士の問題を編集したら、表示確認の前に検証スクリプトを実行します。

```bash
node scripts/validate-denco-questions.mjs
```

検証では、ID重複、選択肢数、`correctIndex`、解説、構造化問題、自作図面以外の画像参照、写真問題の成立性を確認します。

ローカルサーバーで以下を確認します。

```text
http://localhost:8000/denco-app/koujishi-index.html
http://localhost:8000/denco-app/quiz.html
http://localhost:8000/denco-app/mock-sets.html
```
