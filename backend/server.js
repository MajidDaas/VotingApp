const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow only Netlify frontend
app.use(cors({
  origin: "https://rankedvotingapp.netlify.app",
  credentials: true
}));
app.use(bodyParser.json());

// File paths
const votesFile = path.join(__dirname, "votes.json");
const tokensFile = path.join(__dirname, "tokens.json");
const candidatesFile = path.join(__dirname, "candidates.json");

// Admin password
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "supersecret";

// Helpers
function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// GET candidates
app.get("/api/candidates", (req, res) => {
  res.json(readJSON(candidatesFile));
});

// POST vote with single-use token
app.post("/api/vote", (req, res) => {
  const { ballot, token } = req.body;

  if (!token) return res.status(400).json({ error: "Missing voting token" });

  const tokens = readJSON(tokensFile);
  const match = tokens.find(t => t.id === token);

  if (!match) return res.status(403).json({ error: "Invalid token" });
  if (match.used) return res.status(403).json({ error: "Token already used" });

  if (!Array.isArray(ballot) || ballot.length !== 14 || new Set(ballot).size !== ballot.length) {
    return res.status(400).json({ error: "Invalid ballot" });
  }

  // Save vote
  const votes = readJSON(votesFile);
  votes.push({ ballot, timestamp: Date.now() });
  writeJSON(votesFile, votes);

  // Mark token as used
  match.used = true;
  writeJSON(tokensFile, tokens);

  res.json({ message: "Vote recorded successfully" });
});

// ADMIN Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  res.status(403).json({ error: "Invalid credentials" });
});

// ADMIN - Get all tokens
app.get("/api/admin/tokens", (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Unauthorized" });
  res.json(readJSON(tokensFile));
});

// ADMIN - Get raw votes
app.get("/api/admin/raw-votes", (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Unauthorized" });
  res.json(readJSON(votesFile));
});

// ADMIN - Get results
app.get("/api/admin/results", (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Unauthorized" });

  const candidates = readJSON(candidatesFile);
  const votes = readJSON(votesFile);
  let elected = [];
  let eliminated = [];

  function countFirstChoices() {
    const tally = {};
    candidates.forEach(c => {
      if (!eliminated.includes(c) && !elected.includes(c)) tally[c] = 0;
    });
    votes.forEach(v => {
      for (const choice of v.ballot) {
        if (!eliminated.includes(choice) && !elected.includes(choice)) {
          tally[choice]++;
          break;
        }
      }
    });
    return tally;
  }

  while (elected.length < 14 && elected.length + eliminated.length < candidates.length) {
    const tally = countFirstChoices();
    const entries = Object.entries(tally);
    if (!entries.length) break;
    const [topCandidate] = entries.reduce((a,b)=>a[1]>b[1]?a:b);
    const [bottomCandidate] = entries.reduce((a,b)=>a[1]<b[1]?a:b);
    elected.push(topCandidate);
    eliminated.push(bottomCandidate);
  }

  res.json({ winners: elected.slice(0,14) });
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

