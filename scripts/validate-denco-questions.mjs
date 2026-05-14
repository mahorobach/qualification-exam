import fs from "node:fs";

const file = "denco-app/questions.json";
const questions = JSON.parse(fs.readFileSync(file, "utf8"));

const errors = [];
const warnings = [];
const ids = new Set();
const validDifficulty = new Set(["easy", "medium", "hard"]);
const validQualityStatus = new Set(["keep", "revise", "merge", "replace"]);

function fail(id, message) {
  errors.push(id ? `id ${id}: ${message}` : message);
}

function warn(id, message) {
  warnings.push(id ? `id ${id}: ${message}` : message);
}

function formatTemplate(template, params) {
  return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!params || !Object.prototype.hasOwnProperty.call(params, key)) {
      fail(null, `template placeholder {${key}} has no matching param`);
      return match;
    }
    return String(params[key]);
  });
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

if (!Array.isArray(questions)) {
  fail(null, `${file} must be a JSON array`);
} else {
  questions.forEach((q, index) => {
    const id = q && q.id;
    if (!q || typeof q !== "object") {
      fail(null, `row ${index + 1}: question must be an object`);
      return;
    }

    if (!Number.isInteger(id)) fail(id, "id must be an integer");
    if (ids.has(id)) fail(id, "duplicate id");
    ids.add(id);

    if (!q.category) fail(id, "category is required");
    if (!validDifficulty.has(q.difficulty)) fail(id, "difficulty must be easy, medium, or hard");
    if (typeof q.question !== "string" && typeof q.questionTemplate !== "string") {
      fail(id, "question or questionTemplate is required");
    }
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      fail(id, "choices must contain exactly 4 items");
    }
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
      fail(id, "correctIndex must be 0..3");
    }
    if (Array.isArray(q.choices) && q.choices.length === 4 && !q.choices[q.correctIndex]) {
      fail(id, "correctIndex points to an empty choice");
    }
    if (!q.explanation || normalizeText(q.explanation).length < 24) {
      fail(id, "explanation is too short or missing");
    }
    if (!q.duplicateGroup) warn(id, "duplicateGroup is missing");
    if (!q.learningPoint) warn(id, "learningPoint is missing");
    if (!validQualityStatus.has(q.qualityStatus)) warn(id, "qualityStatus should be keep, revise, merge, or replace");
    if (!q.variantRole) warn(id, "variantRole is missing");

    if (q.questionTemplate) {
      const rendered = normalizeText(formatTemplate(q.questionTemplate, q.params));
      if (!rendered) fail(id, "questionTemplate rendered empty text");
      if (q.question && normalizeText(q.question) !== rendered) {
        fail(id, "question does not match rendered questionTemplate");
      }
      if (!q.sourceFacts) warn(id, "structured question should include sourceFacts");
      if (!q.expressionPolicy) warn(id, "structured question should include expressionPolicy");
    }

    if (q.image) {
      if (!String(q.image).startsWith("images/diagrams/self-made/")) {
        fail(id, "image must point to a self-made diagram under images/diagrams/self-made/");
      }
      if (!q.figureCaption) warn(id, "image questions should include figureCaption");
    }

    if (q.sourceUrl && !String(q.sourceUrl).startsWith("https://www.shiken.or.jp/")) {
      warn(id, "sourceUrl is not the official exam center domain");
    }
  });
}

if (questions.length !== 200) {
  warn(null, `expected 200 questions, found ${questions.length}`);
}

if (warnings.length) {
  console.warn(`Warnings (${warnings.length}):`);
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (errors.length) {
  console.error(`Errors (${errors.length}):`);
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`OK: validated ${questions.length} denco questions`);
