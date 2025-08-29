// backend/generate-tokens-csv.js
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Parser } = require("json2csv");

const TOKENS_FILE = path.join(__dirname, "tokens.json");
const OUTPUT_CSV = path.join(__dirname, "tokens.csv");

const COUNT = 50; // change if needed
const FRONTEND_URL = process.env.FRONTEND_URL || "https://rankedvotingapp.netlify.app";

let tokens = [];
if (fs.existsSync(TOKENS_FILE)) tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8"));

for (let i = 0; i < COUNT; i++) {
  const id = uuidv4();
  tokens.push({ id, url: `${FRONTEND_URL}/?token=${id}`, used: false });
}

fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));

const parser = new Parser({ fields: ["id", "url", "used"] });
const csv = parser.parse(tokens);
fs.writeFileSync(OUTPUT_CSV, csv);

console.log(`Generated ${COUNT} tokens. tokens.json updated, tokens.csv written`);

