/**
 * 基礎科目・適性科目の問題にサブカテゴリ(subField)を付与するスクリプト
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../kikai-app/questions.json");
const questions = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// ══════════════════════════════════════
// 基礎科目 5分野（技術士一次試験の問題群に対応）
// ══════════════════════════════════════
const basicRules = [
  {
    field: "設計・計画",
    keywords: ["安全率","信頼度","信頼性","不良率","PDCA","許容応力","品質","設計","冗長","安全係数"]
  },
  {
    field: "情報・論理",
    keywords: ["ソート","アルゴリズム","フローチャート","2進数","論理","AND","OR","ゲート","CSV","暗号","ネットワーク","TCP","情報理論","セキュリティ","標的型","アッカーマン","伝送","計算量","ビット","バイト","進数"]
  },
  {
    field: "解析",
    keywords: ["微分","積分","行列","固有値","行列式","ラプラス","ベクトル","平均値","標準偏差","確率","統計","検定","ポアソン","シンプソン","集合","関数","変換","線形"]
  },
  {
    field: "材料・化学・バイオ",
    keywords: ["金属","材料","結晶","高分子","化学","触媒","pH","酸","塩基","酸化","化合","合金","アミノ酸","細胞","生化学","応力","ひずみ","熱容量","比熱","電磁気","磁束","抵抗","電流","レール","平面応力","平面ひずみ"]
  },
  {
    field: "環境・エネルギー・技術史",
    keywords: ["CO2","CO₂","環境","エネルギー","LCA","再生可能","気候","プラスチック","廃棄","資源","科学史","技術史","科学技術","基本計画","エネルギー基本"]
  }
];

function classifyBasic(question) {
  for (const rule of basicRules) {
    if (rule.keywords.some(kw => question.includes(kw))) {
      return rule.field;
    }
  }
  return "解析"; // デフォルト
}

// ══════════════════════════════════════
// 適性科目 3分野
// ══════════════════════════════════════
const ethicsRules = [
  {
    field: "技術士法・制度",
    keywords: ["技術士法","技術士","登録","名称","業務","罰則","資格","試験","CPD","継続","倫理綱領","規定","条","法律","法令","処分","義務","禁止","責務"]
  },
  {
    field: "技術者倫理",
    keywords: ["倫理","公益","不正","ハラスメント","内部告発","公正","誠実","守秘","リスク","安全","事故","設計","コンプライアンス","説明責任","社会的責任","ステークホルダー","知的財産","著作権","特許"]
  },
  {
    field: "環境・社会・安全",
    keywords: ["環境","持続可能","SDGs","地球温暖化","廃棄物","ISO","安全管理","労働","事業者","製造物","PL法","国際","グローバル","社会","影響","評価"]
  }
];

function classifyEthics(question) {
  for (const rule of ethicsRules) {
    if (rule.keywords.some(kw => question.includes(kw))) {
      return rule.field;
    }
  }
  return "技術者倫理"; // デフォルト
}

// ══════════════════════════════════════
// 適用
// ══════════════════════════════════════
let basicCount = 0, ethicsCount = 0;

questions.forEach(q => {
  if (q.category === "基礎科目" && !q.subField) {
    q.subField = classifyBasic(q.question);
    basicCount++;
  }
  if (q.category === "適性科目（法令・倫理）" && !q.subField) {
    q.subField = classifyEthics(q.question);
    ethicsCount++;
  }
});

fs.writeFileSync(DATA_PATH, JSON.stringify(questions, null, 2), "utf-8");

// 集計
const basicCounts = {}, ethicsCounts = {};
questions.filter(q=>q.category==="基礎科目").forEach(q=>{basicCounts[q.subField]=(basicCounts[q.subField]||0)+1;});
questions.filter(q=>q.category==="適性科目（法令・倫理）").forEach(q=>{ethicsCounts[q.subField]=(ethicsCounts[q.subField]||0)+1;});

console.log("✅ 基礎科目:", basicCount, "問を分類");
Object.entries(basicCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k}: ${v}問`));
console.log("✅ 適性科目:", ethicsCount, "問を分類");
Object.entries(ethicsCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k}: ${v}問`));
