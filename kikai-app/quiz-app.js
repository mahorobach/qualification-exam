// ============================================================
//  quiz-app.js — 技術士第一次試験（機械部門）クイズ本体ロジック
//  既存の動作・要素ID・データ構造・localStorageキーは維持。
//  追加: 「苦手問題だけ再出題」機能（kikaiWrongQuestions）。
// ============================================================

// ══════════════════════════════════════
//  リッチ解説レンダラー（KaTeX + marked）
// ══════════════════════════════════════
// 問題文の（ア）〜（エ）前で改行してHTMLを返す
function renderQuestionText(el, text) {
  const html = escHtml(text)
    .replace(/\s*（ア）/g, '<br>（ア）')
    .replace(/\s*（イ）/g, '<br>（イ）')
    .replace(/\s*（ウ）/g, '<br>（ウ）')
    .replace(/\s*（エ）/g, '<br>（エ）')
    .replace(/\s*（オ）/g, '<br>（オ）')
    .replace(/\s*（カ）/g, '<br>（カ）')
    .replace(/\s*（キ）/g, '<br>（キ）');
  el.innerHTML = html;
}

function renderExplanation(el, q) {
  if (q.richExplanation) {
    // marked で Markdown → HTML
    const html = marked.parse(q.richExplanation);
    const div = document.createElement("div");
    div.className = "rich-explanation";
    div.innerHTML = html;
    el.innerHTML = "";
    el.appendChild(div);
    // KaTeX で数式をレンダリング（ライブラリ読み込み待ち）
    function applyKatex() {
      if (window.renderMathInElement) {
        renderMathInElement(div, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$",  right: "$",  display: false }
          ],
          throwOnError: false
        });
      } else {
        setTimeout(applyKatex, 100);
      }
    }
    applyKatex();
  } else {
    el.textContent = q.explanation || "";
    el.className = "explanation";
  }
}

// ── アイコン（Lucide系インラインSVG） ──
const ICON_PATHS = {
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"/>',
  flame: '<path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.8-2.5C9 9 9.5 10 11 10c.5-3-1-4.5 1-8z"/><path d="M8.5 14a3.5 3.5 0 0 0 7 0c0-1.5-1-2.5-1.5-3"/>',
  check: '<path d="m5 12 4 4 10-11"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>'
};
function icon(name, opt) {
  opt = opt || {};
  const size = opt.size || 24, stroke = opt.stroke || 2, cls = opt.cls || "";
  return '<svg class="ic ' + cls + '" width="' + size + '" height="' + size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + stroke +
    '" stroke-linecap="round" stroke-linejoin="round">' + (ICON_PATHS[name] || "") + "</svg>";
}

// ══════════════════════════════════════
//  Config & Constants
// ══════════════════════════════════════
const CAT_ORDER = ["基礎科目", "適性科目（法令・倫理）", "専門科目（機械部門）"];
const CAT_BADGE = {
  "基礎科目": "badge-basic",
  "適性科目（法令・倫理）": "badge-ethics",
  "専門科目（機械部門）": "badge-expert"
};
const CAT_SHORT = {
  "基礎科目": "基礎",
  "適性科目（法令・倫理）": "適性",
  "専門科目（機械部門）": "専門"
};
// 科目 → 色クラス・アイコン（デザイン用）
const CAT_SUBJ = {
  "基礎科目": "basic",
  "適性科目（法令・倫理）": "ethics",
  "専門科目（機械部門）": "expert"
};
const CAT_ICON = {
  "基礎科目": "book",
  "適性科目（法令・倫理）": "shield",
  "専門科目（機械部門）": "gear"
};
const CAT_TIMER_MIN = {
  "基礎科目": 60,
  "適性科目（法令・倫理）": 60,
  "専門科目（機械部門）": 110
};

// ══════════════════════════════════════
//  State
// ══════════════════════════════════════
let allQuestions = [];
let categoryStats = {};
let subFieldStats = {};   // { "材料力学": { correct, attempted }, ... }
let wrongSet = {};        // { qKey: true } 苦手（直近で不正解）問題

// Exam (year) mode
let examQuestions = [];
let examAnswers   = [];
let examIdx       = 0;
let examTimerSec  = 0;
let examTimerInt  = null;
let examYearKey   = null;
let examCatKey    = null;

// Practice (cat) mode
let pracQuestions = [];
let pracIdx       = 0;
let pracAnswered  = false;
let pracRecord    = [];
let pracWeakOnly  = false;

// cat-sel UI
let selectedCat = "__all__";
let weakOnly    = false;

// For retry
let currentMode   = null;
let currentCatKey = null;

// ══════════════════════════════════════
//  Screen management
// ══════════════════════════════════════
const SCREENS = ["s-mode","s-expert-sel","s-basic-sel","s-ethics-sel","s-year-sel","s-subject-sel","s-cat-sel","s-exam","s-prac","s-results"];
function showScreen(id) {
  SCREENS.forEach(s => document.getElementById(s).hidden = (s !== id));
  window.scrollTo(0, 0);
}

// ══════════════════════════════════════
//  Persistence
// ══════════════════════════════════════
function loadStats() {
  try { categoryStats = JSON.parse(localStorage.getItem("kikaiCategoryStats") || "{}") || {}; }
  catch(e) { categoryStats = {}; }
  try { subFieldStats = JSON.parse(localStorage.getItem("kikaiSubFieldStats") || "{}") || {}; }
  catch(e) { subFieldStats = {}; }
}
function saveStats() {
  localStorage.setItem("kikaiCategoryStats", JSON.stringify(categoryStats));
  localStorage.setItem("kikaiSubFieldStats", JSON.stringify(subFieldStats));
}
function recordAnswer(cat, isCorrect, sf) {
  if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, attempted: 0 };
  categoryStats[cat].attempted++;
  if (isCorrect) categoryStats[cat].correct++;
  if (sf) {
    if (!subFieldStats[sf]) subFieldStats[sf] = { correct: 0, attempted: 0 };
    subFieldStats[sf].attempted++;
    if (isCorrect) subFieldStats[sf].correct++;
  }
  saveStats();
}

// — 苦手問題ストア —
function qKey(q) { return (q.category || "") + "|" + (q.year || "") + "|" + q.question; }
function loadWrong() {
  try {
    const arr = JSON.parse(localStorage.getItem("kikaiWrongQuestions") || "[]");
    wrongSet = {};
    if (Array.isArray(arr)) arr.forEach(k => { wrongSet[k] = true; });
  } catch(e) { wrongSet = {}; }
}
function saveWrong() {
  localStorage.setItem("kikaiWrongQuestions", JSON.stringify(Object.keys(wrongSet)));
}
// 正誤を苦手ストアへ反映：正解なら外す、不正解なら入れる
function markQuestion(q, isCorrect) {
  const k = qKey(q);
  if (isCorrect) { if (wrongSet[k]) delete wrongSet[k]; }
  else { wrongSet[k] = true; }
  saveWrong();
}
function wrongCountFor(catKey) {
  return allQuestions.filter(q =>
    (catKey === "__all__" || q.category === catKey) && wrongSet[qKey(q)]
  ).length;
}

// ══════════════════════════════════════
//  Stats（累計正答率バー） — モード選択画面
// ══════════════════════════════════════
function renderStats(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  CAT_ORDER.forEach((cat, idx) => {
    const st = categoryStats[cat] || { correct: 0, attempted: 0 };
    const has = st.attempted > 0;
    const rate = has ? Math.round(st.correct / st.attempted * 100) : 0;
    const subj = CAT_SUBJ[cat];
    const row = document.createElement("div");
    row.className = "acc-row";
    row.dataset.subj = subj;
    row.innerHTML =
      '<span class="acc-name">' + cat + '</span>' +
      '<span class="acc-bar"><span class="acc-fill" style="width:' + (has ? rate : 0) + '%"></span></span>' +
      '<span class="acc-val">' + (has ? rate + '%' : '—') + '</span>';
    el.appendChild(row);
  });
}

// ══════════════════════════════════════
//  Question loading
// ══════════════════════════════════════
async function loadQuestions() {
  try {
    const res = await fetch("questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("not array");
    allQuestions = data.filter(q =>
      q && typeof q.question === "string" &&
      Array.isArray(q.choices) && q.choices.length === 4 &&
      typeof q.correctIndex === "number"
    );
  } catch(err) {
    const w = document.getElementById("load-warning");
    w.hidden = false;
    w.textContent = "questions.json を読み込めませんでした。python3 -m http.server などでローカルサーバー経由で開いてください。";
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════════
//  Screen 0: Mode Selection
// ══════════════════════════════════════
function initModeScreen() {
  renderStats("mode-stats");
  showScreen("s-mode");
}

document.getElementById("btn-mode-year").addEventListener("click", () => {
  showScreen("s-year-sel");
  buildYearList();
});
document.getElementById("btn-mode-cat").addEventListener("click", () => {
  showScreen("s-cat-sel");
  enterCatSel();
});
document.getElementById("btn-mode-basic").addEventListener("click", () => {
  showBasicSel();
});
document.getElementById("btn-mode-ethics").addEventListener("click", () => {
  showEthicsSel();
});
document.getElementById("btn-mode-expert").addEventListener("click", () => {
  showExpertSel();
});

// ══════════════════════════════════════
//  専門科目サブカテゴリ選択画面
// ══════════════════════════════════════
const SUBFIELDS = ["材料力学", "機械力学・振動", "熱工学", "流体工学", "機械設計・加工", "制御工学"];
const SUBFIELD_ICON = {
  "材料力学":     '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  "機械力学・振動": '<path d="M2 12 Q5 6 8 12 Q11 18 14 12 Q17 6 20 12 Q22 15 22 12"/>',
  "熱工学":       '<path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.8-2.5C9 9 9.5 10 11 10c.5-3-1-4.5 1-8z"/><path d="M8.5 14a3.5 3.5 0 0 0 7 0c0-1.5-1-2.5-1.5-3"/>',
  "流体工学":     '<path d="M12 22a8 8 0 0 1-8-8c0-4.3 7-12 8-12s8 7.7 8 12a8 8 0 0 1-8 8z"/>',
  "機械設計・加工": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  "制御工学":     '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'
};

function showExpertSel() {
  buildExpertSelScreen();
  showScreen("s-expert-sel");
}

function buildExpertSelScreen() {
  const list = document.getElementById("subfield-list");
  list.innerHTML = "";

  SUBFIELDS.forEach(sf => {
    const pool = allQuestions.filter(q => q.subField === sf);
    const st   = subFieldStats[sf] || { correct: 0, attempted: 0 };
    const acc  = st.attempted > 0 ? Math.round(st.correct / st.attempted * 100) : null;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "subfield-card";
    btn.innerHTML =
      '<span class="subfield-icon"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      (SUBFIELD_ICON[sf] || "") + '</svg></span>' +
      '<span class="subfield-body">' +
        '<span class="subfield-name">' + sf + '</span>' +
        '<span class="subfield-meta">' + pool.length + '問 ／ 5問出題' +
        (acc !== null ? '・正答率 ' + acc + '%' : '') + '</span>' +
      '</span>' +
      '<span class="subfield-chev"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>';
    btn.addEventListener("click", () => startPracBySubField(sf, 5));
    list.appendChild(btn);
  });

  // 正答率パネル
  const statsEl = document.getElementById("subfield-stats");
  statsEl.innerHTML = "";
  SUBFIELDS.forEach(sf => {
    const st  = subFieldStats[sf] || { correct: 0, attempted: 0 };
    const acc = st.attempted > 0 ? Math.round(st.correct / st.attempted * 100) : null;
    const row = document.createElement("div");
    row.className = "sf-acc-row";
    row.innerHTML =
      '<span class="sf-acc-label">' + sf + '</span>' +
      '<span class="sf-acc-bar"><span class="sf-acc-fill" style="width:' + (acc ?? 0) + '%"></span></span>' +
      '<span class="sf-acc-val">' + (acc !== null ? acc + '%' : '—') + '</span>';
    statsEl.appendChild(row);
  });
}

document.getElementById("btn-expert-all").addEventListener("click", () => {
  startPrac("専門科目（機械部門）", { count: 20 });
});
document.getElementById("lnk-expert-back").addEventListener("click", e => {
  e.preventDefault(); initModeScreen();
});

// ══════════════════════════════════════
//  基礎科目・適性科目サブカテゴリ選択画面
// ══════════════════════════════════════
const BASIC_SUBFIELDS  = ["設計・計画", "情報・論理", "解析", "材料・化学・バイオ", "環境・エネルギー・技術史"];
const ETHICS_SUBFIELDS = ["技術士法・制度", "技術者倫理", "環境・社会・安全"];

const SUBFIELD_COLOR = {
  basic:  { accent: "var(--subj-basic)",  soft: "var(--subj-basic-soft)",  statsColor: "var(--subj-basic)" },
  ethics: { accent: "var(--subj-ethics)", soft: "var(--subj-ethics-soft)", statsColor: "var(--subj-ethics)" }
};

function buildSubSelScreen(catKey, subfields, listId, statsId, colorKey) {
  const col = SUBFIELD_COLOR[colorKey];
  const list = document.getElementById(listId);
  list.innerHTML = "";

  subfields.forEach(sf => {
    const pool = allQuestions.filter(q => q.category === catKey && q.subField === sf);
    const st   = subFieldStats[sf] || { correct: 0, attempted: 0 };
    const acc  = st.attempted > 0 ? Math.round(st.correct / st.attempted * 100) : null;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "subfield-card";
    btn.innerHTML =
      '<span class="subfield-icon" style="background:' + col.soft + ';color:' + col.accent + '">' +
        '<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' +
        '</svg></span>' +
      '<span class="subfield-body">' +
        '<span class="subfield-name">' + sf + '</span>' +
        '<span class="subfield-meta">' + pool.length + '問 ／ 5問出題' +
        (acc !== null ? '・正答率 ' + acc + '%' : '') + '</span>' +
      '</span>' +
      '<span class="subfield-chev"><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>';
    btn.addEventListener("click", () => startPracBySubField(sf, 5, catKey));
    list.appendChild(btn);
  });

  // 正答率パネル
  const statsEl = document.getElementById(statsId);
  statsEl.innerHTML = "";
  subfields.forEach(sf => {
    const st  = subFieldStats[sf] || { correct: 0, attempted: 0 };
    const acc = st.attempted > 0 ? Math.round(st.correct / st.attempted * 100) : null;
    const row = document.createElement("div");
    row.className = "sf-acc-row";
    row.innerHTML =
      '<span class="sf-acc-label">' + sf + '</span>' +
      '<span class="sf-acc-bar"><span class="sf-acc-fill" style="width:' + (acc ?? 0) + '%;background:' + col.accent + '"></span></span>' +
      '<span class="sf-acc-val" style="color:' + col.statsColor + '">' + (acc !== null ? acc + '%' : '—') + '</span>';
    statsEl.appendChild(row);
  });
}

function showBasicSel() {
  buildSubSelScreen("基礎科目", BASIC_SUBFIELDS, "basic-subfield-list", "basic-subfield-stats", "basic");
  showScreen("s-basic-sel");
}
function showEthicsSel() {
  buildSubSelScreen("適性科目（法令・倫理）", ETHICS_SUBFIELDS, "ethics-subfield-list", "ethics-subfield-stats", "ethics");
  showScreen("s-ethics-sel");
}

function startPracBySubField(sf, count, catKeyOverride) {
  let pool = allQuestions.filter(q => q.subField === sf);
  if (catKeyOverride) pool = pool.filter(q => q.category === catKeyOverride);
  if (pool.length === 0) { alert("この分野の問題が見つかりません。"); return; }
  pool = shuffle(pool).slice(0, count);
  currentMode   = "prac";
  currentCatKey = catKeyOverride || "専門科目（機械部門）";
  pracWeakOnly  = false;
  pracQuestions = pool;
  pracIdx       = 0;
  pracAnswered  = false;
  pracRecord    = new Array(pool.length).fill(null);
  showScreen("s-prac");
  renderPracQ();
}

document.getElementById("btn-basic-all").addEventListener("click", () => {
  startPrac("基礎科目", { count: 20 });
});
document.getElementById("lnk-basic-back").addEventListener("click", e => {
  e.preventDefault(); initModeScreen();
});
document.getElementById("btn-ethics-all").addEventListener("click", () => {
  startPrac("適性科目（法令・倫理）", { count: 20 });
});
document.getElementById("lnk-ethics-back").addEventListener("click", e => {
  e.preventDefault(); initModeScreen();
});

// ══════════════════════════════════════
//  Screen 1: Year Selection
// ══════════════════════════════════════
function buildYearList() {
  const el = document.getElementById("year-list");
  el.innerHTML = "";

  const byYear = {};
  allQuestions.forEach(q => {
    const y = String(q.year || "");
    if (!byYear[y]) byYear[y] = {};
    const c = q.category || "未分類";
    byYear[y][c] = (byYear[y][c] || 0) + 1;
  });

  const years = Object.keys(byYear).filter(y => /^\d{4}$/.test(y)).sort((a,b) => Number(b)-Number(a));

  years.forEach(y => {
    const cats = byYear[y];
    const total = Object.values(cats).reduce((s,n) => s+n, 0);
    const detail = CAT_ORDER.filter(c => cats[c])
      .map(c => (CAT_SHORT[c]||c) + ":" + cats[c] + "問").join(" / ");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sel-item";
    btn.innerHTML =
      '<span class="sel-icon" data-subj="expert">' + icon("calendar", { size: 22, stroke: 1.9 }) + '</span>' +
      '<span class="sel-body"><span class="sel-name">' + y + '年度</span>' +
      '<span class="s-meta">全 ' + total + ' 問 ／ ' + detail + '</span></span>' +
      '<span class="sel-chev">' + icon("chevronRight", { size: 20 }) + '</span>';
    btn.addEventListener("click", () => showSubjectSel(y));
    el.appendChild(btn);
  });

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "sel-item accent";
  allBtn.innerHTML =
    '<span class="sel-icon" data-subj="basic">' + icon("sparkle", { size: 22, stroke: 1.9 }) + '</span>' +
    '<span class="sel-body"><span class="sel-name">全年度ランダム</span>' +
    '<span class="s-meta">全 ' + allQuestions.length + ' 問をシャッフル出題（110分）</span></span>' +
    '<span class="sel-chev">' + icon("chevronRight", { size: 20 }) + '</span>';
  allBtn.addEventListener("click", () => startExam("__all__"));
  el.appendChild(allBtn);
}

document.getElementById("lnk-year-back").addEventListener("click", e => {
  e.preventDefault(); initModeScreen();
});

// ══════════════════════════════════════
//  Screen 1b: Subject Selection (within a year)
// ══════════════════════════════════════
function showSubjectSel(year) {
  document.getElementById("subject-sel-year").textContent = year + "年度";
  buildSubjectList(year);
  showScreen("s-subject-sel");
}

function buildSubjectList(year) {
  const el = document.getElementById("subject-list");
  el.innerHTML = "";

  const yearQs = allQuestions.filter(q => String(q.year || "") === year);
  const counts = {};
  yearQs.forEach(q => { const c = q.category || "未分類"; counts[c] = (counts[c] || 0) + 1; });

  CAT_ORDER.forEach(c => {
    if (!counts[c]) return;
    const subj = CAT_SUBJ[c] || "basic";
    const mins  = CAT_TIMER_MIN[c] || 60;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sel-item";
    btn.innerHTML =
      '<span class="sel-icon" data-subj="' + subj + '">' + icon(CAT_ICON[c] || "book", { size: 22, stroke: 1.8 }) + '</span>' +
      '<span class="sel-body"><span class="sel-name">' + c + '</span>' +
      '<span class="s-meta">' + counts[c] + ' 問 ／ 制限 ' + mins + ' 分</span></span>' +
      '<span class="sel-chev">' + icon("chevronRight", { size: 20 }) + '</span>';
    btn.addEventListener("click", () => startExam(year, c));
    el.appendChild(btn);
  });
}

document.getElementById("lnk-subject-back").addEventListener("click", e => {
  e.preventDefault();
  showScreen("s-year-sel");
  buildYearList();
});

// ══════════════════════════════════════
//  Screen 2: Category Selection（分野別・ラジオ選択＋開始）
// ══════════════════════════════════════
function enterCatSel() {
  selectedCat = "__all__";
  weakOnly = false;
  const tg = document.getElementById("cat-weak-toggle");
  if (tg) tg.setAttribute("aria-pressed", "false");
  renderCatCards();
}

function catCount(catKey) {
  if (weakOnly) return wrongCountFor(catKey);
  return catKey === "__all__"
    ? allQuestions.length
    : allQuestions.filter(q => q.category === catKey).length;
}
function catAccuracy(catKey) {
  if (catKey === "__all__") {
    let c = 0, a = 0;
    CAT_ORDER.forEach(cat => { const s = categoryStats[cat]; if (s) { c += s.correct; a += s.attempted; } });
    return a > 0 ? Math.round(c / a * 100) : null;
  }
  const s = categoryStats[catKey];
  return s && s.attempted > 0 ? Math.round(s.correct / s.attempted * 100) : null;
}

function renderCatCards() {
  const el = document.getElementById("cat-list");
  el.innerHTML = "";

  const opts = [
    { key: "__all__", name: "すべての科目（混合）", subj: "all", icon: "sparkle" }
  ].concat(CAT_ORDER.map(c => ({ key: c, name: c, subj: CAT_SUBJ[c], icon: CAT_ICON[c] })));

  opts.forEach(o => {
    const cnt = catCount(o.key);
    const acc = catAccuracy(o.key);
    const active = selectedCat === o.key;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick";
    btn.dataset.subj = o.subj;
    btn.dataset.cat = o.key;
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    const meta = (weakOnly ? "苦手 " + cnt + " 問" : cnt + " 問")
      + (acc !== null ? "・累計正答率 <b>" + acc + "%</b>" : "");
    btn.innerHTML =
      '<span class="pick-icon">' + icon(o.icon, { size: 24, stroke: 1.8 }) + '</span>' +
      '<span class="pick-body"><span class="pick-name">' + o.name + '</span>' +
      '<span class="pick-meta">' + meta + '</span></span>' +
      '<span class="pick-radio">' + icon("check", { size: 15, stroke: 3 }) + '</span>';
    btn.addEventListener("click", () => {
      if (o.key !== "__all__") {
        startPrac(o.key, { count: 20 });
      } else {
        selectedCat = o.key;
        renderCatCards();
      }
    });
    el.appendChild(btn);
  });
}

document.getElementById("cat-weak-toggle").addEventListener("click", function () {
  weakOnly = this.getAttribute("aria-pressed") !== "true";
  this.setAttribute("aria-pressed", weakOnly ? "true" : "false");
  renderCatCards();
});

document.getElementById("btn-cat-start").addEventListener("click", () => {
  startPrac(selectedCat, { weakOnly: weakOnly });
});

document.getElementById("lnk-cat-back").addEventListener("click", e => {
  e.preventDefault(); initModeScreen();
});

// ══════════════════════════════════════
//  Screen 3: Exam Mode (Year)
// ══════════════════════════════════════
function startExam(yearKey, catKey) {
  currentMode = "year";
  examYearKey = yearKey;
  examCatKey  = catKey || null;
  clearInterval(examTimerInt);

  let pool;
  if (yearKey === "__all__") {
    pool = shuffle(allQuestions.slice());
    examTimerSec = 110 * 60;
  } else {
    pool = allQuestions.filter(q => String(q.year || "") === yearKey);
    if (catKey) pool = pool.filter(q => q.category === catKey);
    pool.sort((a, b) => {
      const ai = CAT_ORDER.indexOf(a.category);
      const bi = CAT_ORDER.indexOf(b.category);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
    examTimerSec = (catKey ? (CAT_TIMER_MIN[catKey] || 60) : 60) * 60;
  }

  examQuestions = pool;
  examAnswers   = new Array(pool.length).fill(null);
  examIdx       = 0;

  showScreen("s-exam");
  document.getElementById("all-done-notice").hidden = true;
  buildQNav();
  renderExamQ();
  updateExamMeta();
  startTimer();
}

function buildQNav() {
  const nav = document.getElementById("q-nav");
  nav.innerHTML = "";
  examQuestions.forEach((q, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "q-dot" +
      (i === examIdx ? " current" : "") +
      (examAnswers[i] !== null ? " answered" : "");
    b.textContent = i + 1;
    b.title = (q.category || "") + " Q" + (i+1);
    b.addEventListener("click", () => { examIdx = i; buildQNav(); renderExamQ(); });
    nav.appendChild(b);
  });
}

function renderExamQ() {
  const q = examQuestions[examIdx];
  const subj = CAT_SUBJ[q.category] || "basic";
  const short = CAT_SHORT[q.category] || q.category;

  const numEl = document.getElementById("exam-q-num");
  numEl.innerHTML =
    '<span class="q-pill" data-subj="' + subj + '">' + icon(CAT_ICON[q.category] || "book", { size: 14 }) +
    ' ' + short + '</span><span class="q-count">' + q.year + '年 ・ 問 ' + (examIdx + 1) + ' / ' + examQuestions.length + '</span>';

  const fig = document.getElementById("exam-q-fig");
  if (q.figureHtml) { fig.innerHTML = q.figureHtml; fig.hidden = false; }
  else { fig.innerHTML = ""; fig.hidden = true; }

  renderQuestionText(document.getElementById("exam-q-text"), q.question);

  const choicesEl = document.getElementById("exam-choices");
  choicesEl.innerHTML = "";
  q.choices.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn" + (examAnswers[examIdx] === idx ? " selected" : "");
    const key = document.createElement("span"); key.className = "choice-key"; key.textContent = idx + 1;
    const lab = document.createElement("span"); lab.className = "choice-label"; lab.textContent = label;
    btn.appendChild(key); btn.appendChild(lab);
    btn.addEventListener("click", () => {
      examAnswers[examIdx] = idx;
      buildQNav();
      updateExamMeta();
      renderExamQ();
      checkAllExamDone();
    });
    choicesEl.appendChild(btn);
  });

  document.getElementById("btn-exam-prev").disabled = examIdx === 0;
  document.getElementById("btn-exam-next").disabled = examIdx === examQuestions.length - 1;
  document.getElementById("btn-exam-next").innerHTML =
    examIdx === examQuestions.length - 1 ? "最後の問題" : '次の問題 ' + icon("arrowRight", { size: 18 });
}

function updateExamMeta() {
  const answered = examAnswers.filter(a => a !== null).length;
  document.getElementById("exam-meta").textContent =
    "回答済み " + answered + " / " + examQuestions.length + " 問";
}

function checkAllExamDone() {
  const answered = examAnswers.filter(a => a !== null).length;
  document.getElementById("all-done-notice").hidden = answered < examQuestions.length;
}

document.getElementById("btn-exam-prev").addEventListener("click", () => {
  if (examIdx > 0) { examIdx--; buildQNav(); renderExamQ(); }
});
document.getElementById("btn-exam-next").addEventListener("click", () => {
  if (examIdx < examQuestions.length - 1) { examIdx++; buildQNav(); renderExamQ(); }
});
document.getElementById("btn-end-exam").addEventListener("click", () => {
  const unanswered = examAnswers.filter(a => a === null).length;
  const msg = unanswered > 0
    ? "未回答が " + unanswered + " 問あります。このまま終了して採点しますか？"
    : "試験を終了して結果を表示します。よろしいですか？";
  if (!window.confirm(msg)) return;
  endExam();
});

function startTimer() {
  clearInterval(examTimerInt);
  renderTimer();
  examTimerInt = setInterval(() => {
    examTimerSec--;
    renderTimer();
    if (examTimerSec <= 0) {
      clearInterval(examTimerInt);
      window.alert("⏰ 時間になりました。採点結果を表示します。");
      endExam();
    }
  }, 1000);
}

function renderTimer() {
  const el = document.getElementById("timer-val");
  const m = Math.floor(examTimerSec / 60);
  const s = examTimerSec % 60;
  el.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  el.className = "timer-val";
  if (examTimerSec <= 60) el.classList.add("danger");
  else if (examTimerSec <= 300) el.classList.add("warn");
}

function endExam() {
  clearInterval(examTimerInt);
  examQuestions.forEach((q, i) => {
    if (examAnswers[i] !== null) {
      const ok = examAnswers[i] === q.correctIndex;
      recordAnswer(q.category || "未分類", ok, q.subField || null);
      markQuestion(q, ok);
    }
  });
  showResults("year");
}

// ══════════════════════════════════════
//  Screen 4: Practice Mode (Category)
// ══════════════════════════════════════
function startPrac(catKey, opts) {
  opts = opts || {};
  currentMode = "prac";
  currentCatKey = catKey;
  pracWeakOnly = !!opts.weakOnly;

  let pool = catKey === "__all__"
    ? allQuestions.slice()
    : allQuestions.filter(q => q.category === catKey);

  if (pracWeakOnly) pool = pool.filter(q => wrongSet[qKey(q)]);

  if (opts.count && opts.count > 0) pool = shuffle(pool).slice(0, opts.count);

  if (pool.length === 0) {
    window.alert(pracWeakOnly
      ? "この科目に苦手問題はありません。まずは通常の出題で挑戦しましょう。"
      : "この科目には問題がありません。");
    return;
  }

  pracQuestions = shuffle(pool);
  pracIdx       = 0;
  pracAnswered  = false;
  pracRecord    = new Array(pracQuestions.length).fill(null);

  showScreen("s-prac");
  renderPracQ();
}

function renderPracQ() {
  const q = pracQuestions[pracIdx];
  pracAnswered = false;

  const total = pracQuestions.length;
  document.getElementById("prac-prog-label").textContent = (pracIdx + 1) + " / " + total;
  document.getElementById("prac-prog-fill").style.width = ((pracIdx + 1) / total * 100) + "%";

  const subj = CAT_SUBJ[q.category] || "basic";
  const short = CAT_SHORT[q.category] || q.category;
  document.getElementById("prac-q-num").innerHTML =
    '<span class="q-pill" data-subj="' + subj + '">' + icon(CAT_ICON[q.category] || "book", { size: 14 }) +
    ' ' + short + '</span><span class="q-count">' + q.year + '年 ・ 問 ' + (pracIdx + 1) + '</span>';

  const fig = document.getElementById("prac-q-fig");
  if (q.figureHtml) { fig.innerHTML = q.figureHtml; fig.hidden = false; }
  else { fig.innerHTML = ""; fig.hidden = true; }

  renderQuestionText(document.getElementById("prac-q-text"), q.question);

  const choicesEl = document.getElementById("prac-choices");
  choicesEl.innerHTML = "";
  q.choices.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    const key = document.createElement("span"); key.className = "choice-key"; key.textContent = idx + 1;
    const lab = document.createElement("span"); lab.className = "choice-label"; lab.textContent = label;
    btn.appendChild(key); btn.appendChild(lab);
    btn.addEventListener("click", () => onPracChoose(idx));
    choicesEl.appendChild(btn);
  });

  document.getElementById("prac-feedback").classList.remove("visible");
  document.getElementById("prac-result-label").textContent = "";
  document.getElementById("prac-explanation").textContent = "";
  document.getElementById("btn-prac-next").innerHTML =
    (pracIdx === pracQuestions.length - 1 ? "結果を見る " : "次の問題へ ") + icon("arrowRight", { size: 18 });
}

function onPracChoose(selectedIdx) {
  if (pracAnswered) return;
  pracAnswered = true;

  const q = pracQuestions[pracIdx];
  const isCorrect = selectedIdx === q.correctIndex;

  pracRecord[pracIdx] = selectedIdx;
  recordAnswer(q.category || "未分類", isCorrect, q.subField || null);
  markQuestion(q, isCorrect);

  const buttons = document.getElementById("prac-choices").querySelectorAll(".choice-btn");
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add("correct-pick");
    else if (i === selectedIdx) btn.classList.add("wrong-pick");
  });

  const lbl = document.getElementById("prac-result-label");
  lbl.innerHTML = (isCorrect ? icon("checkCircle", { size: 18 }) + " 正解！" : icon("flame", { size: 18 }) + " 不正解…");
  lbl.className = "result-label " + (isCorrect ? "ok" : "ng");
  renderExplanation(document.getElementById("prac-explanation"), q);

  document.getElementById("prac-feedback").classList.add("visible");
}

document.getElementById("btn-prac-next").addEventListener("click", () => {
  if (!pracAnswered) {
    if (!window.confirm("この問題を未回答のままスキップしますか？")) return;
  }
  if (pracIdx < pracQuestions.length - 1) {
    pracIdx++;
    renderPracQ();
  } else {
    showResults("prac");
  }
});

document.getElementById("lnk-prac-back").addEventListener("click", e => {
  e.preventDefault();
  showScreen("s-cat-sel");
  enterCatSel();
});

// ══════════════════════════════════════
//  Screen 5: Results
// ══════════════════════════════════════
function showResults(mode) {
  showScreen("s-results");

  const qs  = mode === "year" ? examQuestions : pracQuestions;
  const ans = mode === "year" ? examAnswers   : pracRecord;

  const answered = ans.filter(a => a !== null).length;
  const correct  = qs.reduce((s, q, i) => s + (ans[i] === q.correctIndex ? 1 : 0), 0);
  const pct      = answered > 0 ? Math.round(correct / answered * 100) : 0;
  const pass     = pct >= 50;

  document.getElementById("res-title").textContent =
    mode === "year"
      ? (examYearKey === "__all__"
          ? "全年度ランダム"
          : examYearKey + "年度 " + (examCatKey ? (CAT_SHORT[examCatKey] || examCatKey) : "全科目"))
      : (pracWeakOnly ? "苦手復習" : "分野別学習");

  // リング＋スコア
  const ring = document.getElementById("res-ring");
  ring.style.background = "conic-gradient(" + (pass ? "var(--success)" : "var(--subj-expert)") +
    " " + pct + "%, var(--line) 0)";
  document.getElementById("res-ring-pct").innerHTML = pct + '<span>%</span>';
  document.getElementById("res-score").innerHTML = correct + '<span> / ' + answered + ' 問</span>';

  const banner = document.getElementById("res-banner");
  banner.className = "pass-banner " + (pass ? "pass" : "fail");
  banner.innerHTML = (pass ? icon("checkCircle", { size: 16 }) + " 合格ライン到達"
    : icon("flame", { size: 16 }) + " 合格基準 50% 未満");

  document.getElementById("res-msg").textContent =
    pct === 100 ? "全問正解！素晴らしい成績です。" :
    pct >= 70 ? "よく出来ています。間違えた問題の解説を確認しましょう。" :
    "解説をじっくり読んで基礎を固めましょう。";

  // 科目別成績バー
  const catSummary = document.getElementById("res-cat-summary");
  catSummary.innerHTML = "";
  const catMap = {};
  qs.forEach((q, i) => {
    const c = q.category || "未分類";
    if (!catMap[c]) catMap[c] = { ok: 0, done: 0, total: 0 };
    catMap[c].total++;
    if (ans[i] !== null) { catMap[c].done++; if (ans[i] === q.correctIndex) catMap[c].ok++; }
  });
  CAT_ORDER.forEach(c => {
    if (!catMap[c]) return;
    const s = catMap[c];
    const r = s.done > 0 ? Math.round(s.ok / s.done * 100) : 0;
    const subj = CAT_SUBJ[c];
    const row = document.createElement("div");
    row.className = "acc-row";
    row.dataset.subj = subj;
    row.innerHTML =
      '<span class="acc-name">' + c + '</span>' +
      '<span class="acc-bar"><span class="acc-fill" style="width:' + r + '%"></span></span>' +
      '<span class="acc-val">' + s.ok + '/' + s.done + '</span>';
    catSummary.appendChild(row);
  });

  // 全問の解説
  const listEl = document.getElementById("res-q-list");
  listEl.innerHTML = "";
  qs.forEach((q, i) => {
    const userAns = ans[i];
    const isSkip  = userAns === null;
    const isOk    = !isSkip && userAns === q.correctIndex;
    const subj    = CAT_SUBJ[q.category] || "basic";
    const short   = CAT_SHORT[q.category] || q.category;

    const statusCls = isSkip ? "skip" : isOk ? "ok" : "ng";
    const statusTxt = isSkip ? "未回答" : isOk ? "正解" : "不正解";
    const statusIco = isSkip ? "" : isOk ? icon("check", { size: 13, stroke: 3 }) : icon("flame", { size: 13 });

    const card = document.createElement("div");
    card.className = "rev-card " + statusCls;
    let html =
      '<div class="rev-head">' +
        '<span class="rev-qno">問' + String(i + 1).padStart(2, "0") + '</span>' +
        '<span class="q-pill sm" data-subj="' + subj + '">' + short + '</span>' +
        '<span class="rev-status ' + statusCls + '">' + statusIco + ' ' + statusTxt + '</span>' +
      '</div>' +
      '<div class="rev-body">' +
        '<p class="rev-q">' + escHtml(q.question).replace(/\s*（ア）/g,'<br>（ア）').replace(/\s*（イ）/g,'<br>（イ）').replace(/\s*（ウ）/g,'<br>（ウ）').replace(/\s*（エ）/g,'<br>（エ）').replace(/\s*（オ）/g,'<br>（オ）').replace(/\s*（カ）/g,'<br>（カ）').replace(/\s*（キ）/g,'<br>（キ）') + '</p>';
    html += '<div class="rev-ans">';
    if (!isSkip && !isOk) {
      html += '<div class="rev-line ng"><span>あなた</span><span>' + escHtml(q.choices[userAns]) + '</span></div>';
    }
    html += '<div class="rev-line ok"><span>正解</span><span>' + escHtml(q.choices[q.correctIndex]) + '</span></div>';
    html += '</div>';
    html += '<div class="rev-exp" data-q-idx="' + i + '"></div>';
    html += '</div>';
    card.innerHTML = html;
    // rev-exp に解説を注入（richExplanation 対応）
    const revExp = card.querySelector('.rev-exp[data-q-idx]');
    if (revExp) renderExplanation(revExp, q);
    listEl.appendChild(card);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.getElementById("btn-to-menu").addEventListener("click", () => initModeScreen());
document.getElementById("btn-retry").addEventListener("click", () => {
  if (currentMode === "year") startExam(examYearKey, examCatKey);
  else startPrac(currentCatKey, { weakOnly: pracWeakOnly });
});

// ══════════════════════════════════════
//  Boot
// ══════════════════════════════════════
async function boot() {
  loadStats();
  loadWrong();
  await loadQuestions();

  const params = new URLSearchParams(location.search);
  const gotoParam  = params.get("goto");
  const subjParam  = params.get("subject");
  const countParam = parseInt(params.get("count"), 10) || 0;
  const SUBJ_MAP = {
    "basic":  "基礎科目",
    "ethics": "適性科目（法令・倫理）",
    "expert": "専門科目（機械部門）"
  };

  if (gotoParam === "expert") {
    showExpertSel();
  } else if (gotoParam === "basic") {
    showBasicSel();
  } else if (gotoParam === "ethics") {
    showEthicsSel();
  } else if (subjParam && SUBJ_MAP[subjParam]) {
    startPrac(SUBJ_MAP[subjParam], { count: countParam || 0 });
  } else {
    initModeScreen();
  }
}
boot();

// ── Drawer ──
(function() {
  const hamburger = document.getElementById('nav-hamburger');
  const drawer    = document.getElementById('drawer');
  const overlay   = document.getElementById('drawer-overlay');
  const drawerClose = document.getElementById('drawer-close');
  function openDrawer() { drawer.classList.add('open'); overlay.classList.add('open'); hamburger.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); hamburger.classList.remove('open'); document.body.style.overflow = ''; }
  hamburger.addEventListener('click', () => { drawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
})();
