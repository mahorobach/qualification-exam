// 専門科目（機械部門）の問題をサブカテゴリに自動分類するスクリプト
// 使い方: ANTHROPIC_API_KEY=your_key node scripts/classify-expert-questions.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY が設定されていません");
  process.exit(1);
}

const DATA_PATH = path.join(__dirname, "../kikai-app/questions.json");
const questions = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// 技術士一次試験・機械部門の専門科目サブカテゴリ
const SUB_FIELDS = [
  "材料力学",
  "機械力学・振動",
  "流体工学",
  "熱工学",
  "機械設計・加工",
  "制御工学",
  "その他"
];

async function classify(question) {
  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: `以下の技術士第一次試験（機械部門）専門科目の問題を、最も適切なサブカテゴリ1つに分類してください。
サブカテゴリ: ${SUB_FIELDS.join(" / ")}
問題文: ${question.slice(0, 200)}
サブカテゴリ名のみ回答してください。`
      }
    ]
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const raw = data.content[0].text.trim();

  // 最も近いサブカテゴリにマッチ
  const matched = SUB_FIELDS.find(f => raw.includes(f)) || "その他";
  return matched;
}

async function main() {
  const expertQuestions = questions.filter(q => q.category === "専門科目（機械部門）");
  console.log(`専門科目 ${expertQuestions.length} 問を分類します...`);

  let done = 0;
  for (const q of expertQuestions) {
    if (q.subField) { done++; continue; } // 既に分類済みはスキップ
    try {
      q.subField = await classify(q.question);
      done++;
      console.log(`[${done}/${expertQuestions.length}] ${q.subField} — ${q.question.slice(0, 40)}...`);
      await new Promise(r => setTimeout(r, 200)); // レート制限対策
    } catch (e) {
      console.error(`エラー: ${e.message}`);
      q.subField = "その他";
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(questions, null, 2), "utf-8");
  console.log("\n✅ 分類完了。questions.json を更新しました。");

  // 集計表示
  const counts = {};
  expertQuestions.forEach(q => { counts[q.subField] = (counts[q.subField] || 0) + 1; });
  console.log("\n--- サブカテゴリ集計 ---");
  Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}問`));
}

main().catch(console.error);
