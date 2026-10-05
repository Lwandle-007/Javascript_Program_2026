// learner-activity.js
// The assessor's table. Shows every learner with their progress,
// how many tasks they still have open, how many sessions they attended,
// and when they were last signed in.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
let allLearners = [];
// ---------------------------------------------------------------
// HELPER: turn a stored timestamp into "Today" / "Yesterday" / "3days ago"
// ---------------------------------------------------------------
function describeLastActive(lastActiveValue) {
  // A brand new account may not have a timestamp yet.
  if (lastActiveValue === undefined || lastActiveValue === null) {
    return "Never";
  }
  // Firestore gives us its own timestamp type, so convert it
  // into a normal JavaScript date.
  const lastActiveDate = lastActiveValue.toDate();
  const today = new Date();
  // Compare whole days only, ignoring the time of day.
  const lastActiveDay = new Date(
    lastActiveDate.getFullYear(),
    lastActiveDate.getMonth(),
    lastActiveDate.getDate()
  );
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  // There are 86,400,000 milliseconds in one day.
  const millisecondsApart = todayDay.getTime() - lastActiveDay.getTime();
  const daysApart = Math.round(millisecondsApart / 86400000);
  if (daysApart === 0) {
    return "Today";
  }
  if (daysApart === 1) {
    return "Yesterday";
  }
  return daysApart + " days ago";
}
// ---------------------------------------------------------------
// Step 1: get every learner
// ---------------------------------------------------------------
async function loadLearners() {
  const learnersQuery = query(
    collection(db, "users"),
    where("role", "==", "learner")
  );
  const results = await getDocs(learnersQuery);
  allLearners = [];
  results.forEach(function (userDocument) {
    const learner = userDocument.data();
    // The document ID is the learner's UID. We need it to match their tasks.
    learner.uid = userDocument.id;
    // Start both counts at zero. We fill them in next.
    learner.openTaskCount = 0;
    learner.sessionCount = 0;
    allLearners.push(learner);
  });
}
// ---------------------------------------------------------------
// Step 2: count each learner's unfinished tasks
// This is the link between My Tasks and the "Tasks Open" column.
// ---------------------------------------------------------------
async function countOpenTasks() {
  // Ask for every task that is not finished, across all learners.
  const openTasksQuery = query(
    collection(db, "tasks"),
    where("completed", "==", false)
  );
  const results = await getDocs(openTasksQuery);
  results.forEach(function (taskDocument) {
    const task = taskDocument.data();
    // Find the learner this task belongs to, and add one to their count.
    for (let i = 0; i < allLearners.length; i = i + 1) {
      if (allLearners[i].uid === task.ownerUid) {
        allLearners[i].openTaskCount = allLearners[i].openTaskCount + 1;
      }
    }
  });
}
// ---------------------------------------------------------------
// Step 3: count each learner's attended sessions
// This is the link between the Sessions page and the "Sessions" column.
// ---------------------------------------------------------------
async function countSessions() {
  const attendedQuery = query(
    collection(db, "sessions"),
    where("attended", "==", true)
  );
  const results = await getDocs(attendedQuery);
  results.forEach(function (sessionDocument) {
    const session = sessionDocument.data();
    for (let i = 0; i < allLearners.length; i = i + 1) {
      if (allLearners[i].uid === session.learnerUid) {
        allLearners[i].sessionCount = allLearners[i].sessionCount + 1;
      }
    }
  });
}
// ---------------------------------------------------------------
// Step 4: draw the table
// ---------------------------------------------------------------
function showTable(searchText) {
  const tableBody = document.getElementById("learnerTableBody");
  tableBody.innerHTML = "";
  for (let i = 0; i < allLearners.length; i = i + 1) {
    const learner = allLearners[i];
    // If the assessor typed in the search box, skip names that do not match.
    if (searchText !== "") {
      const nameInLowerCase = learner.fullName.toLowerCase();
      const searchInLowerCase = searchText.toLowerCase();
      if (nameInLowerCase.includes(searchInLowerCase) === false) {
        continue;
      }
    }
    // The screenshot shows "None" instead of "0 open".
    let tasksOpenLabel = learner.openTaskCount + " open";
    if (learner.openTaskCount === 0) {
      tasksOpenLabel = "None";
    }
    const row = document.createElement("tr");
    const initialsCell = document.createElement("td");
    initialsCell.textContent = learner.initials;
    const nameCell = document.createElement("td");
    nameCell.textContent = learner.fullName;
    const programmeCell = document.createElement("td");
    programmeCell.textContent = learner.programme;
    // The progress bar. The inner div's width is the percentage.
    const progressCell = document.createElement("td");
    const barOutside = document.createElement("div");
    barOutside.className = "bar-outside";
    const barInside = document.createElement("div");
    barInside.className = "bar-inside";
    barInside.style.width = learner.progressPercent + "%";
    barOutside.appendChild(barInside);
    progressCell.appendChild(barOutside);
    const percentLabel = document.createElement("span");
    percentLabel.textContent = learner.progressPercent + "%";
    progressCell.appendChild(percentLabel);
    const tasksCell = document.createElement("td");
    tasksCell.textContent = tasksOpenLabel;
    const sessionsCell = document.createElement("td");
    sessionsCell.textContent = learner.sessionCount + " attended";
    const lastActiveCell = document.createElement("td");
    lastActiveCell.textContent = describeLastActive(learner.lastActive);
    row.appendChild(initialsCell);
    row.appendChild(nameCell);
    row.appendChild(programmeCell);
    row.appendChild(progressCell);
    row.appendChild(tasksCell);
    row.appendChild(sessionsCell);
    row.appendChild(lastActiveCell);
    tableBody.appendChild(row);
  }
}
// ---------------------------------------------------------------
// Start the page
// ---------------------------------------------------------------
requireSignedInUser(async function (uid, profile) {
  // Only assessors are allowed on this page.
  if (profile.role !== "assessor") {
    window.location.href = "tasks.html";
    return;
  }
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarJobTitle").textContent = profile.jobTitle;
  document.getElementById("sidebarInitials").textContent = profile.initials;
  // Run the four steps in order. Each one depends on the one before it.

  await loadLearners();
  await countOpenTasks();
  await countSessions();
  showTable("");
  // Re-draw the table whenever the assessor types in the search box.
  const searchBox = document.getElementById("learnerSearch");
  searchBox.addEventListener("input", function () {
    showTable(searchBox.value);
  });
});
