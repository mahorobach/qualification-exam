/**
 * 2026年 電験三種過去問の詳細解説を Gemini API で生成する。
 *
 * 使い方:
 *   node scripts/enhance-denken-explanations.mjs --dry-run
 *   node scripts/enhance-denken-explanations.mjs --limit=3
 *   node scripts/enhance-denken-explanations.mjs
 *
 * オプション:
 *   --categories=理論,電力  対象科目（省略時は全科目）
 *   --questions=問5,問14     対象の問題番号（省略時は全問）
 *   --limit=3              最大処理件数
 *   --overwrite            既存の richExplanation も再生成
 *   --delay=5000           API呼び出し間隔（ミリ秒）
 *   --dry-run              APIを呼ばず対象だけ表示
 *
 * .env:
 *   GEMINI_API_KEY=...
 *   GEMINI_MODEL=gemini-3.1-flash-lite  # 任意
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(scriptDir, "..");
const dataPath = path.join(rootDir, "denco-app/denken-questions.json");
const envPath = path.join(rootDir, ".env");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] = value;
  }
}

function parseArgs() {
  return Object.fromEntries(process.argv.slice(2).map(arg => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.length ? rest.join("=") : "true"];
  }));
}

loadEnv();
const args = parseArgs();
const targetYear = Number(args.year || 2026);
const categories = args.categories
  ? new Set(args.categories.split(",").map(value => value.trim()).filter(Boolean))
  : null;
const questionNumbers = args.questions
  ? new Set(args.questions.split(",").map(value => value.trim()).filter(Boolean))
  : null;
const limit = Math.max(0, Number(args.limit || 0));
const delayMs = Math.max(0, Number(args.delay || 5000));
const overwrite = args.overwrite === "true";
const dryRun = args["dry-run"] === "true";
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

const questions = JSON.parse(fs.readFileSync(dataPath, "utf8"));
let targets = questions.filter(question =>
  question.year === targetYear &&
  (!categories || categories.has(question.category)) &&
  (!questionNumbers || questionNumbers.has(question.examQuestion)) &&
  (overwrite || !question.richExplanation?.trim())
);
if (limit > 0) targets = targets.slice(0, limit);

console.log(`対象: ${targets.length}問（${targetYear}年、${categories ? [...categories].join("・") : "全科目"}）`);
for (const question of targets) {
  console.log(`- ${question.category} ${question.examQuestion || question.question.slice(0, 24)}`);
}

if (dryRun || targets.length === 0) {
  if (dryRun) console.log("dry-run のためAPIは呼び出していません。");
  process.exit(0);
}
if (!apiKey || apiKey === "your_gemini_api_key_here") {
  console.error(".env に GEMINI_API_KEY を設定してください。");
  process.exit(1);
}

const responseSchema = {
  type: "OBJECT",
  properties: {
    conclusion: {
      type: "STRING",
      description: "正解と、そう判断できる理由を1〜2文で要約"
    },
    steps: {
      type: "ARRAY",
      description: "前提、公式、計算、判断を順序立てた解説。各項目は1〜4文",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          body: { type: "STRING" }
        },
        required: ["title", "body"]
      }
    },
    choiceAnalysis: {
      type: "ARRAY",
      description: "全選択肢について、正誤とその理由",
      items: {
        type: "OBJECT",
        properties: {
          number: { type: "INTEGER" },
          verdict: { type: "STRING", enum: ["選ぶ", "選ばない"] },
          reason: { type: "STRING" }
        },
        required: ["number", "verdict", "reason"]
      }
    },
    keyPoint: {
      type: "STRING",
      description: "試験で再利用できる公式、見分け方、注意点"
    },
    verification: {
      type: "STRING",
      enum: ["整合", "要確認"],
      description: "指定された正解と自身の計算・法令知識が整合するか"
    },
    verificationNote: {
      type: "STRING",
      description: "検算内容。要確認の場合は疑義を具体的に記す"
    }
  },
  required: [
    "conclusion",
    "steps",
    "choiceAnalysis",
    "keyPoint",
    "verification",
    "verificationNote"
  ]
};

function extractDiagramLabels(question) {
  if (!question.diagram) return "";
  const diagramPath = path.join(rootDir, "denco-app", question.diagram);
  if (!fs.existsSync(diagramPath) || path.extname(diagramPath) !== ".svg") return "";
  const svg = fs.readFileSync(diagramPath, "utf8");
  return [...svg.matchAll(/<[^>]*text[^>]*>(.*?)<\/[^>]*text>/gs)]
    .map(match => match[1].replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .join(" / ");
}

function relatedQuestionContext(question) {
  if (!/\(b\)$/.test(question.examQuestion || "")) return "";
  const index = questions.indexOf(question);
  const previous = questions[index - 1];
  if (!previous || previous.year !== question.year || previous.category !== question.category) return "";
  return `【直前の関連設問】
${previous.examQuestion}: ${previous.question}
公式正解: (${previous.correctIndex + 1}) ${previous.choices[previous.correctIndex]}
解説: ${previous.explanation}`;
}

const supplementalContexts = new Map([
  ["2026|理論|問16(b)", "図1は端子a-d間に、上側20 Ω・中央R・下側20 Ωの3枝が並列である。全電流4.5 A、Rの枝電流0.5 Aなので、上下各枝は2 A、電源電圧E=40 V、R=80 Ωとなる。図2はa-b=16 Ω、b-d=4 Ω、a-c=4 Ω、c-d=16 Ω、b-c=80 Ωのブリッジ回路である。"],
  ["2026|法規|問13(a)", "図では、支線の取付高さは8 m、地際から支線アンカーまでの水平距離は6 m、支線長は10 mである。支線張力Tの水平分力はT×(6/10)である。"]
]);

function buildPrompt(question) {
  const answerNumber = question.correctIndex + 1;
  const diagramLabels = extractDiagramLabels(question);
  const relatedContext = relatedQuestionContext(question);
  const supplementalContext = supplementalContexts.get(
    `${question.year}|${question.category}|${question.examQuestion}`
  ) || "";
  return `あなたは第三種電気主任技術者試験（電験三種）の熟練講師です。
次の公式過去問について、初学者にも根拠を追える正確な解説を作成してください。

【科目】${question.category}
【実施年】${question.year}年${question.session ? ` ${question.session}` : ""}
【問題】${question.examQuestion || ""}
${question.question}

【選択肢】
${question.choices.map((choice, index) => `(${index + 1}) ${choice}`).join("\n")}

【公式正解】(${answerNumber}) ${question.choices[question.correctIndex]}
【既存の解説】${question.explanation || "なし"}
${diagramLabels ? `【図から読み取れる文字・数値】${diagramLabels}` : ""}
${supplementalContext ? `【図の補足情報】${supplementalContext}` : ""}
${relatedContext}

守ること:
- 公式正解を出発点にしつつ、計算・定義・法令上の根拠を独立に検算する。
- 問題にない条件や数値を作らない。図がある場合は問題文から確実に読める情報だけを使う。
- 式はプレーンテキストで読みやすく書き、記号を定義する。必要なら単位も示す。
- 計算問題は式の立て方、代入、計算、選択肢との照合まで示す。
- 途中で誤った計算を示して後から訂正する構成にせず、検算済みの正しい手順だけを書く。
- 知識問題・法規問題は判断基準と、各選択肢が正しい／誤りである理由を示す。
- choiceAnalysis は選択肢数と同じ${question.choices.length}件を、番号順に必ず返す。
- choiceAnalysis の verdict は、記述自体の正誤ではなく「この問題の解答として選ぶ／選ばない」を表す。正しいもの・誤っているものを選ぶ問題のどちらでも、公式正解だけを「選ぶ」とする。
- 断定できない内容があれば verification を「要確認」にし、verificationNote に理由を書く。
- 日本語で、簡潔だが十分な情報量にする。`;
}

async function requestExplanation(question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(question) }] }],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema
      }
    })
  });
  if (!response.ok) {
    throw new Error(`Gemini API ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();
  if (!text) throw new Error("Geminiから本文が返りませんでした。");
  return JSON.parse(text);
}

function validateResult(result, question) {
  if (result.verification !== "整合") {
    throw new Error(`正解との整合性が要確認: ${result.verificationNote}`);
  }
  if (!Array.isArray(result.steps) || result.steps.length < 2) {
    throw new Error("解説手順が不足しています。");
  }
  if (!Array.isArray(result.choiceAnalysis) ||
      result.choiceAnalysis.length !== question.choices.length) {
    throw new Error("選択肢別解説の件数が一致しません。");
  }
  const numbers = result.choiceAnalysis.map(item => item.number);
  if (numbers.some((number, index) => number !== index + 1)) {
    throw new Error("選択肢別解説が番号順ではありません。");
  }
  const correctItems = result.choiceAnalysis.filter(item => item.verdict === "選ぶ");
  if (correctItems.length !== 1 || correctItems[0].number !== question.correctIndex + 1) {
    throw new Error("選択肢別解説の正解番号が公式正解と一致しません。");
  }
  const combinedText = JSON.stringify(result);
  if (/既存の?解説.{0,30}(?:従|基づ)|仮定された|はずですが|本問の数値設定|再検討/.test(combinedText)) {
    throw new Error("既存解説への盲従または不確かな推測を検出しました。");
  }
}

function formatExplanation(result) {
  const stepText = result.steps
    .map((step, index) => `### ${index + 1}. ${step.title}\n${step.body}`)
    .join("\n\n");
  const choiceText = result.choiceAnalysis
    .map(item => `- (${item.number}) ${item.verdict}: ${item.reason}`)
    .join("\n");
  return `## 結論\n${result.conclusion}\n\n## 解き方\n${stepText}\n\n## 選択肢の確認\n${choiceText}\n\n## 覚えておきたいポイント\n${result.keyPoint}`;
}

function save() {
  const temporaryPath = `${dataPath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryPath, dataPath);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let completed = 0;
let failed = 0;
for (const question of targets) {
  const label = `${question.category} ${question.examQuestion || ""}`.trim();
  let result = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`[${completed + failed + 1}/${targets.length}] ${label} を生成中…`);
      const candidate = await requestExplanation(question);
      validateResult(candidate, question);
      result = candidate;
      break;
    } catch (error) {
      console.error(`  試行 ${attempt}/5: ${error.message}`);
      if (attempt < 5) await wait(Math.max(5000, delayMs * attempt));
    }
  }

  if (!result) {
    failed++;
    continue;
  }

  question.richExplanation = formatExplanation(result);
  save();
  completed++;
  console.log(`  保存しました（${question.richExplanation.length}文字）`);
  if (completed + failed < targets.length) await wait(delayMs);
}

console.log(`完了: ${completed}問、失敗: ${failed}問`);
if (failed > 0) process.exitCode = 1;
