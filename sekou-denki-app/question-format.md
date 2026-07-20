# 1級電気工事施工管理技士 クイズ問題形式

この形式は、資格トレインの電気工事士クイズと同じ「4択・即時解説・年度別演習」に使える問題データです。

## 対象にする過去問

2026-07-20時点では、直近3年の第一次検定を次の年度として扱います。

- 令和8年度（2026年度）1級電気工事施工管理技術検定 第一次検定
- 令和7年度（2025年度）1級電気工事施工管理技術検定 第一次検定
- 令和6年度（2024年度）1級電気工事施工管理技術検定 第一次検定

公式の検定問題・正答肢は一般財団法人建設業振興基金の公開PDFを参照します。ただし、公式サイトに転載禁止表示があるため、サイト掲載用の本文は「公式過去問を参考にした学習用類題」として作成し、原文の丸写しは避けます。

## 問題データ形式

`questions.json` は配列です。1問は次の形にします。

```json
{
  "id": "sekou-denki-2026-f1-001",
  "exam": "1級電気工事施工管理技士",
  "examStage": "第一次検定",
  "year": 2026,
  "eraYear": "令和8年度",
  "part": "午前",
  "officialQuestionNo": 1,
  "category": "電気工学",
  "subcategory": "電気基礎",
  "difficulty": "medium",
  "answerFormat": "single_choice",
  "choiceCount": 4,
  "question": "問題文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correctIndex": 0,
  "answerLabel": "1",
  "explanation": "解説文",
  "learningPoint": "学習ポイント",
  "sourceFacts": {},
  "expressionPolicy": "official_past_question_referenced; question_text_generated",
  "isModified": true,
  "source": "一般財団法人建設業振興基金公表の検定問題・正答肢を参考にした学習用類題",
  "sourceUrl": "https://www.fcip-shiken.jp/pdf/r08_1dg_mondai.pdf"
}
```

## 回答データ形式

ユーザーの回答は、保存・採点しやすいように次の形で扱います。

```json
{
  "questionId": "sekou-denki-2026-f1-001",
  "selectedIndex": 0,
  "answeredAt": "2026-07-20T10:00:00+09:00",
  "elapsedMs": 18000
}
```

採点結果は次の形です。

```json
{
  "questionId": "sekou-denki-2026-f1-001",
  "selectedIndex": 0,
  "correctIndex": 0,
  "isCorrect": true,
  "answerLabel": "1",
  "explanation": "解説文"
}
```

## 分野区分

第一次検定の年度別モードでは、公式の選択解答制に合わせて問題番号と分野を保持します。学習モードでは次の区分で表示します。

- 電気工学
- 電気設備
- 関連分野
- 設計・契約関係
- 施工管理法
- 法規

## 表示ルール

- 4択または5択を `choiceCount` で判定する。
- `correctIndex` は0始まり、`answerLabel` は表示用の1始まり。
- 年度別演習では `year`、`part`、`officialQuestionNo` で並べる。
- 著作権対応として、`source`、`sourceUrl`、`expressionPolicy`、`isModified` を必ず入れる。
