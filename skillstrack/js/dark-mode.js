// Adds dark mode to every page. 
// The Dark Mode button switches the theme and the choice is saved in the browser so it is remembered next time.

// The name the saved choice is stored under in the browser.
const themeKey = "skillstrackTheme";

// All the dark colours
const darkStyles = `
  body.dark { color: #f0e6d8; }

  /* --- Sidebars --- */
  body.dark .sidebar { background: #13131f; }
  body.dark .sidebar-assessor { background: #171322; }
  body.dark .sidebar-user { background: rgba(255, 255, 255, 0.06); }

  /* --- Main area and headings --- */
  body.dark .main-content { background: #0d0d17; color: #f0e6d8; }
  body.dark .page-title,
  body.dark .card-heading,
  body.dark .game-title,
  body.dark .results-title,
  body.dark .done-title,
  body.dark .booking-name,
  body.dark .booking-date,
  body.dark .summary-title { color: #f3e9dc; }
  body.dark .page-subtitle,
  body.dark .game-instructions,
  body.dark .booking-programme,
  body.dark .booking-time,
  body.dark .booking-empty,
  body.dark .done-details,
  body.dark .results-text,
  body.dark .result-caption,
  body.dark .game-progress-text,
  body.dark .options-label,
  body.dark .unit-grade,
  body.dark .task-row small { color: #8a8a9a; }
  body.dark .booking-step-label,
  body.dark .achievement-name,
  body.dark .task-row span,
  body.dark .booking-type { color: #f0e6d8; }

  /* --- White cards become dark cards --- */
  body.dark .unit-tracker-card,
  body.dark .session-history-card,
  body.dark .achievements-card,
  body.dark .learner-table-card,
  body.dark .task-row,
  body.dark .resource-card,
  body.dark .booking-row,
  body.dark .game-card,
  body.dark .summary-card {
    background: #1a1a28;
    border-color: #2a2a3c;
  }
  body.dark .progress-ring-card { background: #1a1a28; }

  /* --- Rows and table lines --- */
  body.dark .unit-row,
  body.dark .session-row,
  body.dark .learner-table th,
  body.dark .learner-table td { border-bottom-color: #26263a; }
  body.dark .learner-table th { color: #8a8a9a; }
  body.dark .bar-outside { background: #26263a; }

  /* --- Text boxes and buttons --- */
  body.dark .add-task-input,
  body.dark .notes-box {
    background: #1a1a28;
    border-color: #2a2a3c;
    color: #f0e6d8;
  }
  body.dark .type-button,
  body.dark .filter-pill {
    background: #1a1a28;
    border-color: #2a2a3c;
    color: #b6b9c4;
  }
  body.dark .day-button,
  body.dark .time-button { background: #1a1a28; color: #b6b9c4; }
  body.dark .day-button:hover,
  body.dark .time-button:hover { background: #26263a; }
  body.dark .type-button-active { background: #2b1a1a; }
  body.dark .day-button-active,
  body.dark .filter-pill-active {
    background: #26263a;
    border-color: #3a3a52;
    color: #ffffff;
  }
  body.dark .resource-card a {
    background: #26263a;
    border-color: #2a2a3c;
    color: #f0e6d8;
  }

  /* --- Status pills and assessor buttons --- */
  body.dark .status-confirmed { background: #0f3a33; color: #1aa88a; }
  body.dark .status-pending { background: #3a2f12; color: #f5c542; }
  body.dark .status-declined { background: #3a1a1a; color: #ff7b72; }
  body.dark .confirm-button { background: #0f3a33; color: #1aa88a; }
  body.dark .decline-button { background: #3a1a1a; color: #ff7b72; }
  body.dark .booking-avatar { background: #2a2540; color: #c9b8f0; }
  body.dark .done-circle { background: #0f2d29; }

  /* --- Achievements --- */
  body.dark .achievement-badge { border-color: #2a2a3c; }
  body.dark .earned { background: #3a2f1f; }
  body.dark .locked { background: #1a1a28; }

  /* --- Coding practice game --- */
  body.dark .progress-track { background: #26263a; }
  body.dark .progress-fill { background: #f2643f; }
  body.dark .option-button {
    background: #0f0f1a;
    border-color: #2a2a3c;
    color: #f0e6d8;
  }
  body.dark .option-button-active { background: #2b1a1a; }
  body.dark .check-button:disabled { background: #26263a; color: #8a8a9a; }
  body.dark .feedback-correct { background: #0f2d29; }
  body.dark .feedback-wrong { background: #2d1a17; }
  body.dark .feedback-icon { color: #f0e6d8; }
  body.dark .feedback-explanation { color: #b6b9c4; }
  body.dark .next-button { background: #26263a; }
  body.dark .next-button:hover { background: #33334a; }
  body.dark .result-tile-right { background: #0f2d29; }
  body.dark .result-tile-wrong { background: #2d1a17; }
`;

// Function created to add the dark styles to the page inside a style tag
function addDarkStyles() {
  const styleTag = document.createElement("style");
  styleTag.textContent = darkStyles;
  document.head.appendChild(styleTag);
}

// Function turns dark mode on or off and changes the button words to match
function applyTheme(theme) {
  const button = document.getElementById("darkModeBtn");

  if (theme === "dark") {
    document.body.classList.add("dark");
    if (button !== null) {
      button.textContent = "☀ Light Mode";
    }
  } else {
    document.body.classList.remove("dark");
    if (button !== null) {
      button.textContent = "☾ Dark Mode";
    }
  }
}

// Function runs when the button is clicked switch theme then save the choice
function toggleTheme() {
  let newTheme = "dark";
  if (document.body.classList.contains("dark")) {
    newTheme = "light";
  }

  localStorage.setItem(themeKey, newTheme);
  applyTheme(newTheme);
}

// Start add the styles, load the saved choice (light if nothing is saved), wire the button.
addDarkStyles();

let savedTheme = localStorage.getItem(themeKey);
if (savedTheme === null) {
  savedTheme = "light";
}
applyTheme(savedTheme);

const darkModeButton = document.getElementById("darkModeBtn");
if (darkModeButton !== null) {
  darkModeButton.addEventListener("click", toggleTheme);
}