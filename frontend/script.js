const API_BASE = "https://ranked-voting-app.onrender.com";

// =============== Voting Page ===============
document.addEventListener("DOMContentLoaded", () => {
  const candidatesList = document.getElementById("candidatesList");
  const tokenInput = document.getElementById("tokenInput");
  const submitVote = document.getElementById("submitVote");
  const message = document.getElementById("message");

  if (candidatesList) {
    fetch(`${API_BASE}/api/candidates`)
      .then(res => res.json())
      .then(candidates => {
        candidatesList.innerHTML = candidates.map(c =>
          `<div class="p-4 border rounded-lg bg-gray-50 shadow hover:bg-gray-100 transition cursor-move" draggable="true">${c}</div>`
        ).join("");

        enableDragDrop();
      });
  }

  if (submitVote) {
    submitVote.addEventListener("click", () => {
      const token = tokenInput.value.trim();
      const ballot = [...document.querySelectorAll("#candidatesList div")].map(div => div.textContent);

      fetch(`${API_BASE}/api/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ballot })
      })
        .then(res => res.json())
        .then(data => {
          message.textContent = data.message || data.error;
          message.className = data.error ? "mt-6 text-center text-red-600" : "mt-6 text-center text-green-600";
        });
    });
  }
});

// Enable drag/drop sorting for ranked choices
function enableDragDrop() {
  const list = document.getElementById("candidatesList");
  let dragged;

  list.addEventListener("dragstart", e => {
    dragged = e.target;
    e.target.style.opacity = 0.5;
  });

  list.addEventListener("dragend", e => {
    e.target.style.opacity = "";
  });

  list.addEventListener("dragover", e => {
    e.preventDefault();
  });

  list.addEventListener("drop", e => {
    e.preventDefault();
    if (e.target.parentNode === list && dragged !== e.target) {
      list.insertBefore(dragged, e.target.nextSibling);
    }
  });
}

// =============== Admin Page ===============
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("adminUser").value;
    const password = document.getElementById("adminPass").value;

    fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById("loginSection").classList.add("hidden");
          document.getElementById("dashboardSection").classList.remove("hidden");
          window.adminPassword = password;
        } else {
          document.getElementById("loginMessage").textContent = data.error;
        }
      });
  });
}

function loadTokens() {
  fetch(`${API_BASE}/api/admin/tokens?password=${window.adminPassword}`)
    .then(res => res.json())
    .then(tokens => {
      document.getElementById("adminContent").innerHTML = `
        <h2 class="text-xl font-bold mb-4">Tokens</h2>
        <ul class="space-y-2">${tokens.map(t => `<li>${t.id} - ${t.used ? "✅ Used" : "❌ Unused"}</li>`).join("")}</ul>
      `;
    });
}

function loadResults() {
  fetch(`${API_BASE}/api/admin/results?password=${window.adminPassword}`)
    .then(res => res.json())
    .then(results => {
      document.getElementById("adminContent").innerHTML = `
        <h2 class="text-xl font-bold mb-4">Winners</h2>
        <ol class="list-decimal ml-6">${results.winners.map(w => `<li>${w}</li>`).join("")}</ol>
      `;
    });
}

function loadRawVotes() {
  fetch(`${API_BASE}/api/admin/raw-votes?password=${window.adminPassword}`)
    .then(res => res.json())
    .then(votes => {
      document.getElementById("adminContent").innerHTML = `
        <h2 class="text-xl font-bold mb-4">Raw Votes</h2>
        <pre class="bg-gray-800 text-white p-4 rounded">${JSON.stringify(votes, null, 2)}</pre>
      `;
    });
}

