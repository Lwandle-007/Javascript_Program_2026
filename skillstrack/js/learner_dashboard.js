// learner_dashboard.js Fills the learner's Home page: the four number cards, the three most urgent tasks, the latest feedback, the date and the welcome message.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Function turns the date form "2026-08-12" into "Due 12 Aug" (same as tasks.js)
function formatDueDate(dateText) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const parts = dateText.split("-");
  const monthNumber = Number(parts[1]);
  const dayNumber = Number(parts[2]);

  return "Due " + dayNumber + " " + monthNames[monthNumber - 1];
}

// Function created to give each priority a number so High comes before Medium, then Low
function priorityRank(priority) {
  if (priority === "High") {
    return 1;
  }
  if (priority === "Medium") {
    return 2;
  }
  return 3;
}

// Function for the date at the top of the page
function showDate() {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  const today = new Date();
  document.getElementById("currentDate").textContent =
    today.toLocaleDateString("en-US", options);
}

// Function loadTasks: fill "Tasks Outstanding", "High Priority" and the urgent list
async function loadTasks(uid) {
  // Ask for only this learner's tasks (same question My Tasks asks).
  const tasksQuery = query(
    collection(db, "tasks"),
    where("ownerUid", "==", uid)
  );
  const results = await getDocs(tasksQuery);

  // Keep only the tasks that are not finished yet.
  const openTasks = [];
  results.forEach(function (taskDocument) {
    const task = taskDocument.data();
    if (task.completed === false) {
      openTasks.push(task);
    }
  });

  // Count how many of the open tasks are High priority.
  let highCount = 0;
  for (let i = 0; i < openTasks.length; i = i + 1) {
    if (openTasks[i].priority === "High") {
      highCount = highCount + 1;
    }
  }

  document.getElementById("tasksOutstanding").textContent = openTasks.length;
  document.getElementById("highPriority").textContent = highCount;

  // Most urgent first: High before Medium before Low.
  // If two tasks have the same priority, the earlier due date goes first
  // (dates like "2026-08-12" sort correctly as text).
  openTasks.sort(function (taskA, taskB) {
    const rankA = priorityRank(taskA.priority);
    const rankB = priorityRank(taskB.priority);

    if (rankA !== rankB) {
      return rankA - rankB;
    }
    if (taskA.dueDate < taskB.dueDate) {
      return -1;
    }
    if (taskA.dueDate > taskB.dueDate) {
      return 1;
    }
    return 0;
  });

  showUrgentTasks(openTasks);
}

// Function draws the three urgent task rows
function showUrgentTasks(openTasks) {
  const rowIds = ["task1", "task2", "task3"];

  for (let i = 0; i < rowIds.length; i = i + 1) {
    const row = document.getElementById(rowIds[i]);
    row.innerHTML = "";

    // No task for this row, so hide it. The first row says why instead.
    if (i >= openTasks.length) {
      if (i === 0) {
        const emptyText = document.createElement("span");
        emptyText.className = "task-empty";
        emptyText.textContent = "No outstanding tasks. You are all caught up.";
        row.appendChild(emptyText);
      } else {
        row.style.display = "none";
      }
      continue;
    }

    const task = openTasks[i];

    const titleText = document.createElement("span");
    titleText.className = "task-title";
    titleText.textContent = task.title;

    const detailText = document.createElement("span");
    detailText.className = "task-meta";
    detailText.textContent = task.category + " · " + formatDueDate(task.dueDate);

    const priorityText = document.createElement("span");
    priorityText.textContent = task.priority;
    if (task.priority === "High") {
      priorityText.className = "badge-high";
    }
    if (task.priority === "Medium") {
      priorityText.className = "badge-medium";
    }
    if (task.priority === "Low") {
      priorityText.className = "badge-low";
    }

    row.appendChild(titleText);
    row.appendChild(detailText);
    row.appendChild(priorityText);
  }
}

// Function created to fill "Sessions Booked" and the Recent Feedback card
async function loadSessions(uid) {
  const sessionsQuery = query(
    collection(db, "sessions"),
    where("learnerUid", "==", uid)
  );
  const results = await getDocs(sessionsQuery);

  let bookedCount = 0;
  let latestFeedbackDate = "";
  let latestFeedbackNotes = "";

  results.forEach(function (sessionDocument) {
    const session = sessionDocument.data();

    // A booked session is a request that is waiting or already confirmed.
    if (session.status === "pending" || session.status === "confirmed") {
      bookedCount = bookedCount + 1;
    }

    // Recent Feedback: the notes from the newest session that was attended.
    if (session.attended === true && session.notes !== "") {
      if (session.sessionDate > latestFeedbackDate) {
        latestFeedbackDate = session.sessionDate;
        latestFeedbackNotes = session.notes;
      }
    }
  });

  document.getElementById("sessionsBooked").textContent = bookedCount;

  // if only replace the default message if there is real feedback to show.
  if (latestFeedbackNotes !== "") {
    document.getElementById("feedbackText").textContent = latestFeedbackNotes;
  }
}

// Function created to start the page
showDate();

requireSignedInUser(async function (uid, profile) {
  // Only learners use this page. Assessors go to their own page.
  if (profile.role === "assessor") {
    window.location.href = "learner-activity.html";
    return;
  }

  // Sidebar.
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;

  // Welcome message uses the first word of their full name.
  const firstName = profile.fullName.trim().split(" ")[0];
  document.getElementById("welcomeTitle").textContent = "Welcome back, " + firstName;
  document.getElementById("welcomeSubtitle").textContent = profile.programme + " - Cohort Active";

  // Overall Progress is the number My Progress already saves on the profile.
  document.getElementById("overallProgress").textContent = profile.progressPercent + "%";

  await loadTasks(uid);
  await loadSessions(uid);
});