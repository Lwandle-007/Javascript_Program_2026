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

// Remember who is signed in.
let currentUid = "";

// --------------------------------------------------------------
// HELPER: work out the status of one task
// --------------------------------------------------------------
// Returns "complete", "inprogress" or "notstarted".
// The My Tasks page only saves completed (true/false) right now,
// so today you will only see "complete" and "notstarted".
// If a task ever gets a status field of "inprogress", we use it.
function getTaskStatus(task) {
  if (task.completed === true) {
    return "complete";
  }
  if (task.status === "inprogress") {
    return "inprogress";
  }
  return "notstarted";
}

// --------------------------------------------------------------
// HELPER: turn the status code into words a person can read
// --------------------------------------------------------------
function getStatusLabel(status) {
  if (status === "complete") {
    return "Complete";
  }
  if (status === "inprogress") {
    return "In Progress";
  }
  return "Not Started";
}

// --------------------------------------------------------------
// Load this learner's tasks and draw the Task Tracker
// --------------------------------------------------------------
async function loadTaskTracker() {
  // Ask for only the tasks that belong to the signed-in learner.
  const tasksQuery = query(
    collection(db, "tasks"),
    where("ownerUid", "==", currentUid)
  );
  const results = await getDocs(tasksQuery);

  // Put every task into a plain list.
  const tasks = [];
  results.forEach(function (taskDocument) {
    const task = taskDocument.data();
    task.id = taskDocument.id;
    tasks.push(task);
  });

  // Sort by due date, earliest first.
  // Dates look like "2026-08-12", so comparing them as text works.
  tasks.sort(function (taskA, taskB) {
    if (taskA.dueDate < taskB.dueDate) {
      return -1;
    }
    if (taskA.dueDate > taskB.dueDate) {
      return 1;
    }
    return 0;
  });

  // Clear the tracker before we fill it.
  const trackerArea = document.getElementById("unitTracker");
  trackerArea.innerHTML = "";

  // Start all the counters at zero.
  let completeCount = 0;
  let inProgressCount = 0;

  // If there are no tasks yet, show a friendly message.
  if (tasks.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No tasks yet. Add one on the My Tasks page.";
    trackerArea.appendChild(emptyMessage);
  }

  // Build one row for each task.
  for (let i = 0; i < tasks.length; i = i + 1) {
    const task = tasks[i];
    const status = getTaskStatus(task);

    // Count the statuses as we go.
    if (status === "complete") {
      completeCount = completeCount + 1;
    }
    if (status === "inprogress") {
      inProgressCount = inProgressCount + 1;
    }

    // Left side: the task title.
    const titleText = document.createElement("span");
    titleText.className = "unit-title";
    titleText.textContent = task.title;

    // Middle: the priority, where the unit grade used to be.
    const priorityText = document.createElement("span");
    priorityText.className = "unit-grade";
    priorityText.textContent = task.priority;

    // Right side: the coloured status pill.
    const statusPill = document.createElement("span");
    statusPill.className = "status-pill status-" + status;
    statusPill.textContent = getStatusLabel(status);

    // Put the three pieces into one row.
    const row = document.createElement("div");
    row.className = "unit-row";
    row.appendChild(titleText);
    row.appendChild(priorityText);
    row.appendChild(statusPill);

    trackerArea.appendChild(row);
  }

  // Hand the counts back so the progress card can use them.
  return {
    total: tasks.length,
    complete: completeCount,
    inProgress: inProgressCount,
  };
}

// --------------------------------------------------------------
// Work out the percentage and fill in the dark progress card
// --------------------------------------------------------------
async function showQualificationProgress(counts) {
  // A finished task counts as 1, a task in progress counts as half.
  const score = counts.complete + counts.inProgress * 0.5;

  // Never divide by zero when there are no tasks yet.
  let percent = 0;
  if (counts.total > 0) {
    percent = Math.round((score / counts.total) * 100);
  }

  // Show the big percentage in the ring.
  document.getElementById("progressPercent").textContent = percent + "%";

  // Show "2/6" style text: tasks done out of all tasks.
  document.getElementById("unitsDone").textContent =
    counts.complete + "/" + counts.total;

  // Sessions are not built yet, so show 0 for now.
  document.getElementById("sessionCount").textContent = "0";

  // Save the percentage so the assessor's table shows the same number.
  await updateDoc(doc(db, "users", currentUid), { progressPercent: percent });
}

// --------------------------------------------------------------
// Start the page
// --------------------------------------------------------------
requireSignedInUser(async function (uid, profile) {
  currentUid = uid;

  // Fill in the sidebar.
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;
  document.getElementById("programmeTitle").textContent = profile.programme;

  // Draw the tracker first, then use its counts for the progress card.
  const counts = await loadTaskTracker();
  await showQualificationProgress(counts);
});