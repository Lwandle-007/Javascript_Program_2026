// The assessor's table. Shows every learner with their progress, how many tasks they still have open, how many sessions they attended,
// and when they were last signed in.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection, // points at a whole collection
  query, // lets me ask a question about a collection 
  where,  // the filter part of that question
  getDocs,  // fetches all the records that match
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// This list holds every learner once I've loaded them and I keep it up here so every function can use it.
let allLearners = [];

// Function turns a stored timestamp into a date like "7 Oct 2026
function formatLastActive(lastActiveValue) {
  // A brand new account may not have a timestamp yet.
  if (lastActiveValue === undefined || lastActiveValue === null) {
    return "Never";
  }

  // Firestore uses its own timestamp type, so turn it into
  // a normal JavaScript date first.
  const lastActiveDate = lastActiveValue.toDate();

  // The month names, so I can swap 9 for "Oct".
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Pull the day, month and year out of the date.
  // getMonth() already counts from 0 (January = 0), so it fits the list above with no "minus 1" needed.
  const dayNumber = lastActiveDate.getDate();
  const monthName = monthNames[lastActiveDate.getMonth()];
  const yearNumber = lastActiveDate.getFullYear();

  // Join them together, e.g. "7 Oct 2026".
  return dayNumber + " " + monthName + " " + yearNumber;
}

// Function the gets every learner
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

// Function counts each learner's unfinished tasks
// This is the link between My Tasks and the "Tasks Open" column.
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

// Function counts each learner's attended sessions 
// (Havent worked on the session so far so come back after to link everthing properly)
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

// Function to draw the table with correct info
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

    // Switch to none instead of 0.
    let tasksOpenLabel = learner.openTaskCount + " open";
    if (learner.openTaskCount === 0) {
      tasksOpenLabel = "None";
    }

    // One row, and then one cell for each column.
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

    // And the number next to the bar, e.g. "68%".
    const percentLabel = document.createElement("span");
    percentLabel.textContent = learner.progressPercent + "%";
    progressCell.appendChild(percentLabel);

    const tasksCell = document.createElement("td");
    tasksCell.textContent = tasksOpenLabel;
    const sessionsCell = document.createElement("td");
    sessionsCell.textContent = learner.sessionCount + " attended";
    const lastActiveCell = document.createElement("td");
    lastActiveCell.textContent = formatLastActive(learner.lastActive);

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

// Function to start the page
requireSignedInUser(async function (uid, profile) {
  // Only assessors are allowed on this page.
  if (profile.role !== "assessor") {
    window.location.href = "learner_dashboard.html";
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
