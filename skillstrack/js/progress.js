// progress.js
// Loads the learner's units, works out their overall percentage,
// saves it, and lists their past sessions and earned achievements.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
let currentUid = "";
// ---------------------------------------------------------------
// Load the six units and draw the Unit Tracker
// ---------------------------------------------------------------
async function loadUnits() {
  const results = await getDocs(collection(db, "users", currentUid, "units"));
  const units = [];
  results.forEach(function (unitDocument) {
    units.push(unitDocument.data());
  });
  // Sort so Unit 1 always comes before Unit 2.
  units.sort(function (unitA, unitB) {
    return unitA.number - unitB.number;
  });
  const trackerArea = document.getElementById("unitTracker");
  trackerArea.innerHTML = "";
  let completeCount = 0;
  let inProgressCount = 0;
  for (let i = 0; i < units.length; i = i + 1) {
    const unit = units[i];
    if (unit.status === "complete") {
      completeCount = completeCount + 1;
    }
    if (unit.status === "inprogress") {
      inProgressCount = inProgressCount + 1;
    }
    // Turn the stored code into words a person can read.
    let statusLabel = "Not Started";
    if (unit.status === "complete") {
      statusLabel = "Complete";
    }
    if (unit.status === "inprogress") {
      statusLabel = "In Progress";
    }
    const row = document.createElement("div");
    row.className = "unit-row";
    row.textContent =
      "Unit " +
      unit.number +
      " – " +
      unit.title +
      " " +
      statusLabel +
      " " +
      unit.grade;
    trackerArea.appendChild(row);
  }
  // A finished unit is worth a full share, a unit in progress isworth half.
  // With 6 units: 2 complete + 1 in progress = 2.5 / 6 = 41.6% → 42%.
  const score = completeCount + inProgressCount * 0.5;
  const percent = Math.round((score / units.length) * 100);
  // Show it on this page.
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("unitsDone").textContent =
    completeCount + "/" + units.length;
  // Save it so the assessor's table shows the same number.
  await updateDoc(doc(db, "users", currentUid), { progressPercent: percent });
  return completeCount;
}
// ---------------------------------------------------------------
// Load this learner's session history
// ---------------------------------------------------------------
async function loadSessions() {
  const sessionsQuery = query(
    collection(db, "sessions"),
    where("learnerUid", "==", currentUid)
  );
  const results = await getDocs(sessionsQuery);
  const sessions = [];
  results.forEach(function (sessionDocument) {
    sessions.push(sessionDocument.data());
  });
  // Newest first. Because dates are stored as "2026-07-24",
  // comparing them as text sorts them correctly.
  sessions.sort(function (sessionA, sessionB) {
    if (sessionA.sessionDate < sessionB.sessionDate) {
      return 1;
    }
    if (sessionA.sessionDate > sessionB.sessionDate) {
      return -1;
    }
    return 0;
  });
  const historyArea = document.getElementById("sessionHistory");
  historyArea.innerHTML = "";
  for (let i = 0; i < sessions.length; i = i + 1) {
    const session = sessions[i];
    const row = document.createElement("div");
    row.className = "session-row";
    row.textContent =
      session.sessionType + " — " + session.sessionDate + " · " + session.notes;
    historyArea.appendChild(row);
  }
  // Show the session count on the dark card.
  document.getElementById("sessionCount").textContent = sessions.length;
  return sessions.length;
}
// ---------------------------------------------------------------
// Work out which achievements have been earned
// ---------------------------------------------------------------
async function showAchievements(sessionCount, completedUnits) {
  // Count how many tasks this learner has finished.
  const tasksQuery = query(
    collection(db, "tasks"),
    where("ownerUid", "==", currentUid),
    where("completed", "==", true)
  );
  const taskResults = await getDocs(tasksQuery);
  const completedTaskCount = taskResults.size;
  // Each badge is checked separately so the rules are obvious.
  let firstSessionEarned = false;
  if (sessionCount >= 1) {
    firstSessionEarned = true;
  }
  let fiveSessionsEarned = false;
  if (sessionCount >= 5) {
    fiveSessionsEarned = true;
  }
  let tenSessionsEarned = false;
  if (sessionCount >= 10) {
    tenSessionsEarned = true;
  }
  let taskClearedEarned = false;
  if (completedTaskCount >= 1) {
    taskClearedEarned = true;
  }
  let firstUnitEarned = false;
  if (completedUnits >= 1) {
    firstUnitEarned = true;
  }

  let allUnitsEarned = false;
  if (completedUnits >= 6) {
    allUnitsEarned = true;
  }
  // Mark each badge on the page as earned or not.
  markBadge("badgeFirstSession", firstSessionEarned);
  markBadge("badgeFiveSessions", fiveSessionsEarned);
  markBadge("badgeTaskCleared", taskClearedEarned);
  markBadge("badgeFirstUnit", firstUnitEarned);
  markBadge("badgeTenSessions", tenSessionsEarned);
  markBadge("badgeAllUnits", allUnitsEarned);
}
function markBadge(badgeId, isEarned) {
  const badge = document.getElementById(badgeId);
  if (isEarned === true) {
    badge.classList.add("earned");
    badge.classList.remove("locked");
  } else {
    badge.classList.add("locked");
    badge.classList.remove("earned");
  }
}
// ---------------------------------------------------------------
// Start the page
// ---------------------------------------------------------------
requireSignedInUser(async function (uid, profile) {
  currentUid = uid;
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;
  document.getElementById("programmeTitle").textContent = profile.programme;
  const completedUnits = await loadUnits();
  const sessionCount = await loadSessions();
  await showAchievements(sessionCount, completedUnits);
});
