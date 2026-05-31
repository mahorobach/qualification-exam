/**
 * 技術士（機械部門）の解説を Gemini API で充実させるスクリプト
 *
 * ■ 使い方
 *   1. プロジェクトルートに .env ファイルを作成:
 *      GEMINI_API_KEY=あなたのキー
 *
 *   2. 実行:
 *      node scripts/enhance-kikai-explanations.mjs
 *
 *   ※ richExplanation が既にある問題はスキップします（再実行安全）
 *   ※ API レート制限のため1問ずつ処理します（約2秒間隔）
 *
 * ■ API キーの取得
 *   https://aistudio.google.com/app/apikey（無料）
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── .env を手動読み込み（dotenv 不要）──
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach(line => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
  console.error("❌ GEMINI_API_KEY が設定されていません。");
  console.error("   .env ファイルに GEMINI_API_KEY=xxx を記載してください。");
  console.error("   キー取得: https://aistudio.google.com/app/apikey");
  process.exit(1);
}

const DATA_PATH = path.join(__dirname, "../kikai-app/questions.json");
const questions  = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// 対象：専門科目のみ（必要なら全科目に変更可）
const targets = questions.filter(
  q => q.category === "専門科目（機械部門）" && !q.richExplanation
);

console.log(`対象: ${targets.length} 問（richExplanation 未設定）`);
if (targets.length === 0) {
  console.log("✅ すべての問題に richExplanation が設定済みです。");
  process.exit(0);
}

// ── Gemini API 呼び出し ──
async function generateRichExplanation(q) {
  const prompt = `あなたは技術士第一次試験（機械部門）の専門講師です。
以下の問題について、受験者が理解しやすい詳しい解説を書いてください。

【問題文】
${q.question}

【選択肢】
${q.choices.map((c, i) => `${i + 1}. ${c}`).join("\n")}

【正解】選択肢 ${q.correctIndex + 1}（${q.choices[q.correctIndex]}）

【既存の短い解説】
${q.explanation}

---

以下のルールに従って Markdown + LaTeX 形式で解説を書いてください：

- ## や ### で見出しをつけて手順を分かりやすく
- 数式は KaTeX 対応の LaTeX 記法で書く（インライン: $数式$、ブロック: $$数式$$）
- 計算手順を step by step で説明する
- 最後に「💡 ポイント」として覚え方や類題への応用を1〜3行まとめる
- 文字数の目安: 200〜500文字程度（簡潔かつ丁寧に）
- 解説のみ出力し、余計な前置き・後書きは不要

解説:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// ── メイン処理 ──
async function main() {
  let done = 0, skipped = 0, errors = 0;

  for (const q of targets) {
    const preview = q.question.slice(0, 40);
    try {
      console.log(`\n[${done + 1}/${targets.length}] 生成中: ${preview}...`);
      const rich = await generateRichExplanation(q);

      if (!rich) {
        console.warn("  ⚠ 空のレスポンス、スキップ");
        skipped++;
        continue;
      }

      q.richExplanation = rich;
      done++;
      console.log(`  ✅ 完了 (${rich.length} 文字)`);

      // 途中保存（エラー時のロス防止）
      if (done % 5 === 0) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(questions, null, 2), "utf-8");
        console.log(`  💾 ${done} 問 保存済み`);
      }

      // レート制限対策（2秒待機）
      await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
      console.error(`  ❌ エラー: ${e.message}`);
      errors++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // 最終保存
  fs.writeFileSync(DATA_PATH, JSON.stringify(questions, null, 2), "utf-8");

  console.log("\n════════════════════════════");
  console.log(`✅ 完了: ${done} 問生成`);
  if (skipped) console.log(`⚠  スキップ: ${skipped} 問`);
  if (errors)  console.log(`❌ エラー: ${errors} 問`);
  console.log("questions.json を更新しました。");
  console.log("次のステップ: git add kikai-app/questions.json && git push");
}

main().catch(e => { console.error(e); process.exit(1); });
