/* eslint-disable prefer-const */
// The assessor's Overview page four number cards, the pending bookingrequests (with Confirm / Decline), and the learners who need attention.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// A learner shows up under "Attention Needed" if they have this many open tasks or more, or if their progress is below this percentage.
let manyTasksLimit = 3;
let lowProgressLimit = 40;

// Remember who is signed in, and everything we loaded.
let currentUid = "";
let allLearners = [];
let allBookings = [];

// Function turns "2026-10-12" into "Mon 12 Oct" (same as bookings.js)
function formatBookingDate(dateText) {
  let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let parts = dateText.split("-");
  let monthNumber = Number(parts[1]);
  let dayNumber = Number(parts[2]);
  let dateValue = new Date(Number(parts[0]), monthNumber - 1, dayNumber);

  return dayNames[dateValue.getDay()] + " " + dayNumber + " " + monthNames[monthNumber - 1];
}

// Function for the date at the top of the page
function showDate() {
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  let today = new Date();
  document.getElementById("currentDate").textContent =
    today.toLocaleDateString("en-US", options);
}

// Function created to get every learner (same question the Learner Activity page asks)
async function loadLearners() {
  let learnersQuery = query(
    collection(db, "users"),
    where("role", "==", "learner")
  );
  let results = await getDocs(learnersQuery);

  allLearners = [];
  results.forEach(function (userDocument) {
    let learner = userDocument.data();
    learner.uid = userDocument.id;
    learner.openTaskCount = 0;
    allLearners.push(learner);
  });
}

// Function created to count each learner's unfinished tasks
async function countOpenTasks() {
  let openTasksQuery = query(
    collection(db, "tasks"),
    where("completed", "==", false)
  );
  let results = await getDocs(openTasksQuery);

  results.forEach(function (taskDocument) {
    let task = taskDocument.data();

    for (let i = 0; i < allLearners.length; i = i + 1) {
      if (allLearners[i].uid === task.ownerUid) {
        allLearners[i].openTaskCount = allLearners[i].openTaskCount + 1;
      }
    }
  });
}

// function created to get the sessions, fill the number cards, and draw the pending list
async function loadSessions() {
  let results = await getDocs(collection(db, "sessions"));

  // The current month as text, like "2026-10", to match sessionDate.
  let today = new Date();
  let monthNumber = today.getMonth() + 1;
  let monthText = String(monthNumber);
  if (monthNumber < 10) {
    monthText = "0" + monthNumber;
  }
  let thisMonth = today.getFullYear() + "-" + monthText;

  let pendingCount = 0;
  let monthSessionCount = 0;
  allBookings = [];

  results.forEach(function (sessionDocument) {
    let session = sessionDocument.data();
    session.id = sessionDocument.id;

    // A pending request is waiting for the assessor.
    if (session.status === "pending") {
      pendingCount = pendingCount + 1;
      allBookings.push(session);
    }

    // A session this month is one that is confirmed or already attended.
    if (session.status === "confirmed" || session.attended === true) {
      if (session.sessionDate.startsWith(thisMonth)) {
        monthSessionCount = monthSessionCount + 1;
      }
    }
  });

  document.getElementById("pendingBookings").textContent = pendingCount;
  document.getElementById("sessionsThisMonth").textContent = monthSessionCount;

  // Soonest request first. sortKey looks like "2026-10-12 09:00".
  allBookings.sort(function (bookingA, bookingB) {
    if (bookingA.sortKey < bookingB.sortKey) {
      return -1;
    }
    if (bookingA.sortKey > bookingB.sortKey) {
      return 1;
    }
    return 0;
  });
}

// Function created for the Active Learners and Avg. Progress cards
function showLearnerNumbers() {
  document.getElementById("activeLearners").textContent = allLearners.length;

  // Add up everyone's progress, then divide by the number of learners.
  let total = 0;
  for (let i = 0; i < allLearners.length; i = i + 1) {
    total = total + allLearners[i].progressPercent;
  }

  let average = 0;
  if (allLearners.length > 0) {
    average = Math.round(total / allLearners.length);
  }
  document.getElementById("avgProgress").textContent = average + "%";
}

// Function to Draw the pending booking cards (up to five)
function showPendingBookings() {
  let listArea = document.getElementById("pendingList");
  listArea.innerHTML = "";

  if (allBookings.length === 0) {
    let emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No bookings are waiting for you.";
    listArea.appendChild(emptyMessage);
    return;
  }

  for (let i = 0; i < allBookings.length && i < 5; i = i + 1) {
    let booking = allBookings[i];

    let card = document.createElement("div");
    card.className = "request-card";

    // Left side: avatar, name, and what they asked for.
    let userInfo = document.createElement("div");
    userInfo.className = "user-info";

    let avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = booking.learnerInitials;

    let details = document.createElement("div");
    details.className = "details";
    let nameText = document.createElement("div");
    nameText.className = "name";
    nameText.textContent = booking.learnerName;
    let metaText = document.createElement("div");
    metaText.className = "meta";
    metaText.textContent =
      booking.sessionType + " · " + formatBookingDate(booking.sessionDate) + ", " + booking.sessionTime;
    details.appendChild(nameText);
    details.appendChild(metaText);

    userInfo.appendChild(avatar);
    userInfo.appendChild(details);

    // Right side: Confirm and Decline buttons.
    let actions = document.createElement("div");
    actions.className = "actions";

    let confirmButton = document.createElement("button");
    confirmButton.className = "btn-confirm";
    confirmButton.textContent = "Confirm";
    confirmButton.addEventListener("click", function () {
      changeStatus(booking.id, "confirmed");
    });

    let declineButton = document.createElement("button");
    declineButton.className = "btn-decline";
    declineButton.textContent = "Decline";
    declineButton.addEventListener("click", function () {
      changeStatus(booking.id, "declined");
    });

    actions.appendChild(confirmButton);
    actions.appendChild(declineButton);

    card.appendChild(userInfo);
    card.appendChild(actions);
    listArea.appendChild(card);
  }
}

// Function to Draw the "Attention Needed" cards
function showAttention() {
  let listArea = document.getElementById("attentionList");
  listArea.innerHTML = "";

  let shownCount = 0;

  for (let i = 0; i < allLearners.length; i = i + 1) {
    let learner = allLearners[i];

    // Work out which warning pills this learner earns.
    let hasManyTasks = learner.openTaskCount >= manyTasksLimit;
    let hasLowProgress = learner.progressPercent < lowProgressLimit;

    // Skip learners who are doing fine.
    if (hasManyTasks === false && hasLowProgress === false) {
      continue;
    }

    shownCount = shownCount + 1;

    let card = document.createElement("div");
    card.className = "attention-card";

    let avatar = document.createElement("div");
    avatar.className = "attention-avatar";
    avatar.textContent = learner.initials;

    let textBox = document.createElement("div");
    let nameText = document.createElement("div");
    nameText.className = "attention-name";
    nameText.textContent = learner.fullName;
    let programmeText = document.createElement("div");
    programmeText.className = "attention-programme";
    programmeText.textContent = learner.programme;

    let pillBox = document.createElement("div");
    if (hasManyTasks === true) {
      let tasksPill = document.createElement("span");
      tasksPill.className = "pill-tasks";
      tasksPill.textContent = learner.openTaskCount + " tasks open";
      pillBox.appendChild(tasksPill);
    }
    if (hasLowProgress === true) {
      let progressPill = document.createElement("span");
      progressPill.className = "pill-progress";
      progressPill.textContent = "Low progress";
      pillBox.appendChild(progressPill);
    }

    textBox.appendChild(nameText);
    textBox.appendChild(programmeText);
    textBox.appendChild(pillBox);

    card.appendChild(avatar);
    card.appendChild(textBox);
    listArea.appendChild(card);
  }

  if (shownCount === 0) {
    let emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No learners need attention right now.";
    listArea.appendChild(emptyMessage);
  }
}

// Function created to confirm or decline a request, then redraw the page
async function changeStatus(bookingId, newStatus) {
  await updateDoc(doc(db, "sessions", bookingId), {
    status: newStatus,
    assessorUid: currentUid
  });

  await loadSessions();
  showPendingBookings();
}

// Function to start the page
showDate();

requireSignedInUser(async function (uid, profile) {
  currentUid = uid;

  // Only assessors are allowed on this page.
  if (profile.role !== "assessor") {
    window.location.href = "learner_dashboard.html";
    return;
  }

  // Sidebar and heading.
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarJobTitle").textContent = profile.jobTitle;
  document.getElementById("sidebarInitials").textContent = profile.initials;
  document.getElementById("headerMeta").textContent = profile.fullName + " · SkillsTrack Training Centre";

  // Load everything, one step at a time, then draw it.
  await loadLearners();
  await countOpenTasks();
  await loadSessions();

  showLearnerNumbers();
  showPendingBookings();
  showAttention();
});