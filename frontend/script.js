// admin.js

const API_BASE = "https://ranked-voting-app.onrender.com/api"; 

// --- Login ---
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginError = document.getElementById("loginError");

// Change these for your admin login
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "supersecret";

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    loadLinks();
    loadResults();
    loadRawVotes();
  } else {
    loginError.textContent = "Invalid username or password.";
  }
});

// --- Tabs ---
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    tabContents.forEach((content) =>
      content.classList.add("hidden")
    );
    document.getElementById(`${tab}Tab`).classList.remove("hidden");
  });
});

// --- Fetch Voting Links ---
async function loadLinks() {
  try {
    const res = await fetch(`${API_BASE}/tokens`);
    const data = await res.json();
    const list = document.getElementById("linksList");
    list.innerHTML = "";

    data.tokens.forEach((token) => {
      const li = document.createElement("li");
      li.textContent = `https://rankedvotingapp.netlify.app/?token=${token}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching links:", err);
  }
}

// --- Generate New Link ---
document.getElementById("generateLinkBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(`${API_BASE}/generatelink`, {
      method: "POST",
    });
    const data = await res.json();
    alert(`New link: https://rankedvotingapp.netlify.app/?token=${data.token}`);
    loadLinks();
  } catch (err) {
    console.error("Error generating link:", err);
  }
});

// --- Fetch Results ---
async function loadResults() {
  try {
    const res = await fetch(`${API_BASE}/results`);
    const data = await res.json();
    const resultsDisplay = document.getElementById("resultsDisplay");

    resultsDisplay.innerHTML = "";
    Object.entries(data.results).forEach(([option, count]) => {
      const div = document.createElement("div");
      div.textContent = `${option}: ${count} votes`;
      resultsDisplay.appendChild(div);
    });
  } catch (err) {
    console.error("Error fetching results:", err);
  }
}

// --- Fetch Raw Votes ---
async function loadRawVotes() {
  try {
    const res = await fetch(`${API_BASE}/raw-votes`);
    const data = await res.json();
    document.getElementById("rawVotesDisplay").textContent = JSON.stringify(
      data,
      null,
      2
    );
  } catch (err) {
    console.error("Error fetching raw votes:", err);
  }
}
