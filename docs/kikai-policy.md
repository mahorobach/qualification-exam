# 技術士第一次試験（機械部門）ポリシー

対象:

- `kikai-app/index.html`
- `kikai-app/quiz.html`
- `kikai-app/questions.json`
- `kikai-app/taisaku-basic.html`
- `kikai-app/taisaku-ethics.html`
- `kikai-app/taisaku-specialty.html`

---

## 基本方針

- 問題は、技術士第一次試験の出題テーマ・知識領域を参考にした学習用オリジナル問題として扱う
- 公式過去問そのもの、公式問題文、公式図面、公式PDF紙面は転載しない
- 図面問題は、問題が成立する範囲で自作SVGとして作図する
- 公式図面の配置、線幅、番号位置、紙面レイアウトをトレースしない
- 表示上は「過去問風オリジナル」「出題テーマ・知識領域を参考に独自作成」と説明する

---

## 現在値

| 項目 | 現在値 |
|---|---|
| JSON問題数 | 186問 |
| 年度 | 2020 / 2021 / 2022 / 2023 / 2024 / 2025 |
| 年度別内訳 | 2020:12問 / 2021:12問 / 2022:12問 / 2023:22問 / 2024:101問 / 2025:27問 |
| カテゴリ | 基礎科目、適性科目（法令・倫理）、専門科目（機械部門） |
| 年度別演習タイマー | 50分 |
| 全年度ランダムタイマー | 110分 |

2024年度は公式R06をベースにしたオリジナル問題を追加し101問に拡充済みです。2025年度は重複問題51問と簡易問題29問を削除後、公式R07をベースにしたオリジナル問題27問を収録しています。2020〜2023年度は初期問題セットのため、本試験1年度相当の問題量には達していません。ポータル上でも「5年分を完全収録」と誤認される表記は避けます。

---

## 問題数の目標

技術士第一次試験は、現在の試験案内ベースでは次の構成を前提にします。

| 科目 | 出題ベース | 解答ベース | 備考 |
|---|---:|---:|---|
| 基礎科目 | 30問相当 | 15問 | 5つの問題群から各3問を選択して解答 |
| 適性科目 | 15問 | 15問 | 全問解答 |
| 専門科目（機械部門） | 35問 | 25問 | 35問から25問を選択して解答 |
| 合計 | 80問相当 | 55問 | 1年度あたり |

本サイトで本試験の出題量に近い学習体験を作る場合の目標:

- 1年度相当: 80問
- 2年度相当: 160問（2024・2025は達成済み）
- 5年度相当: 400問
- 2020〜2023年度も順次80問相当に近づける
- その後、同じ公式・同じ図面型を数値違いで反復できる類題を追加する

問題拡充の優先順位:

1. 専門科目（機械部門）を各年度35問相当に近づける
2. 基礎科目を5群それぞれ6問相当に近づける
3. 適性科目を各年度15問相当に近づける
4. 図面問題は公式図面を使わず、自作SVGで増やす

問題数を増減したら、以下を必ず確認します。

- `kikai-app/questions.json`
- `kikai-app/index.html`
- `kikai-app/quiz.html`
- `kikai-app/taisaku-basic.html`
- `kikai-app/taisaku-ethics.html`
- `kikai-app/taisaku-specialty.html`
- `sitemap.xml`
- `readme.md`

---

## 問題JSON

`kikai-app/questions.json` の各問題は以下を基本形とします。

```json
{
  "category": "専門科目（機械部門）",
  "year": 2024,
  "question": "問題文",
  "figureHtml": "<svg>...</svg>",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correctIndex": 0,
  "explanation": "解説文"
}
```

入力ルール:

- `choices` は必ず4件
- `correctIndex` は0から3
- `category` は既存3カテゴリに合わせる
- `year` は4桁の年を基本とする
- `figureHtml` は図面問題だけに付与する
- 解説には、公式・計算過程・選択肢を切る観点をできるだけ書く

---

## 図面問題の扱い

図面が必要な場合は、公式画像を取り込まず、自作SVGで作図します。

優先して作図するテーマ:

- 材料力学: 梁、支点、集中荷重、トラス、モールの応力円
- 流体: 管路、断面積、流速、ポンプ・配管
- 熱工学: P-v線図、T-s線図、サイクル図
- 機械力学: ばね質量系、振動、制御ブロック
- 機械要素: 歯車、ねじ、軸受、カム

作図ルール:

- 学習に必要な情報だけを模式化する
- 公式図面の見た目を再現しない
- 数値や配置は独自に設計する
- スマホ幅でも読める文字量に抑える
- 図だけでなく、問題文にも条件を明記する

---

## 傾向と対策ページ

以下の3ページを持ちます。

| 科目 | ファイル | 役割 |
|---|---|---|
| 基礎科目 | `kikai-app/taisaku-basic.html` | 数学・情報・信頼性・環境の頻出型と公式整理 |
| 適性科目 | `kikai-app/taisaku-ethics.html` | 技術士法・倫理・公益・守秘・利益相反の判断軸整理 |
| 専門科目 | `kikai-app/taisaku-specialty.html` | 材料・流体・熱・機械力学・機械要素の公式と図面問題の解き方 |

ページ作成ルール:

- 覚えやすく見やすい構成を優先する
- 「頻出パターン」「覚える公式・判断軸」「選択肢の切り方」「直前チェック」を入れる
- 大きな本文だけにせず、カード・短い箇条書き・公式ボックスで整理する
- ポータルの「試験科目について」各ブロックからボタンで導線を置く
- 新規追加・URL変更時は `sitemap.xml` に反映する

---

## 表記ルール

| NG表記 | 推奨表記 |
|---|---|
| 公式過去問そのもの | 過去問風オリジナル問題 |
| AI解説機能付き | 詳しい解説付き |
| 本番完全再現 | 年度別演習 |
| 公式図面を再現 | 自作SVGで作図 |

---

## 検証

問題データを編集したら、最低限以下を実行します。

```bash
node -e "const q=require('./kikai-app/questions.json'); for(const x of q){ if(!x.category||!x.question||!Array.isArray(x.choices)||x.choices.length!==4||!Number.isInteger(x.correctIndex)||x.correctIndex<0||x.correctIndex>3||!x.explanation) throw new Error('invalid question'); } console.log('kikai questions ok', q.length);"
```

画面変更時は、ローカルサーバーで以下を確認します。

```text
http://localhost:8000/kikai-app/index.html
http://localhost:8000/kikai-app/quiz.html
http://localhost:8000/kikai-app/taisaku-basic.html
http://localhost:8000/kikai-app/taisaku-ethics.html
http://localhost:8000/kikai-app/taisaku-specialty.html
```
