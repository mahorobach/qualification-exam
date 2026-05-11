# 資格トレイン — 開発ルール

**作業前に `readme.md` を読むこと。**

---

## 絶対ルール

| ルール | 理由 |
|---|---|
| 実装されていない機能を「AI解説」「AI機能」と書かない | ユーザー期待と実装のズレを防ぐ |
| 収録問題数は実データと一致させる | SEO・信頼性の低下を防ぐ |
| 試験制度・問題数・合格基準は公式情報を確認してから更新する | 古い試験情報の掲載を防ぐ |
| 問題は「公式過去問そのもの」ではなく「過去問ベースのオリジナル問題」と明記する | 著作権・誤認リスクを避ける |
| `questions.json` のスキーマを崩さない | クイズ画面の読込失敗を防ぐ |
| 既存ユーザーのlocalStorageキーを安易に変更しない | 学習履歴の消失を防ぐ |

---

## 第二種電気工事士アプリの現在値

| 項目 | 現在値 |
|---|---|
| JSON問題数 | 150問 |
| 内蔵フォールバック | 3問 |
| 表示上の収録数 | 150問以上 |
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

## 問題JSONスキーマ

`denco-app/questions.json` の各問題は以下を必須とします。

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

### 入力ルール

- `choices` は必ず4件
- `correctIndex` は0から3
- `category` は既存カテゴリ名に合わせる
- `difficulty` は `easy` / `medium` / `hard`
- `year` は年度別演習に使うため、4桁文字列を基本とする
- 解説には、なぜ正解か、なぜ他が違うかをできるだけ書く

---

## 画面・導線ルール

### 第二種電気工事士

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
| 300問以上 | 実データに合わせた「150問以上」など |
| 本番モード（年度別） | 年度別演習 |
| 筆記試験のみ | 学科試験（筆記方式またはCBT方式） |
| 30問中18問以上 | 50問中30問以上 |
| 配線図10問 | 配線図問題20問程度 |

「本番」「完全再現」「公式過去問そのもの」といった表現は、実装・データ・権利面で確認できる場合だけ使います。

---

## localStorageルール

| キー | 変更可否 |
|---|---|
| `denkoWeakQuestionIds` | 原則変更しない |
| `denkoCategoryStats` | 原則変更しない |
| `denkoAnsweredQids` | 原則変更しない |
| `denkoQuickQuizIssuedQids` | 原則変更しない |

キーを変更する場合は、旧キーから新キーへの移行処理を入れます。

---

## 実装前の確認

- 変更対象のHTML/JS/JSONを先に読む
- 同じ文言がトップ、ポータル、クイズ、ブログ、READMEに重複していないか検索する
- 公式情報に関わる変更は、公式サイトまたは一次情報で確認する
- 既存の未コミット変更を上書きしない

---

## 作業後チェックリスト

- [ ] `questions.json` がJSONとして正しくパースできる
- [ ] 問題数・モード名・合格基準の表記が一致している
- [ ] `rg "AI解説|300問|30問中18問|配線図が10問" denco-app blog/denki-koujishi-2shu-point.html` で不要な古い表記が残っていない
- [ ] `quiz.html?mode=all` が起動する
- [ ] `quiz.html?mode=year` で年度選択が表示される
- [ ] `quiz.html?mode=category` で分野別メニューが表示される
- [ ] `mock-sets.html` から擬似問題集が開始できる
- [ ] 変更内容を `readme.md` / `rules.md` に反映した
