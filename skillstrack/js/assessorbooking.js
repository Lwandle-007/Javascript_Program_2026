//We created this assessorbooking.js to list every learner request and lets the assessor confirm or decline the pending ones
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Remember who is signed in, every booking we loaded, and the chosen filter.
let currentUid = "";
let allBookings = [];
let currentFilter = "all";

// Function turns "2026-10-12" into "Mon 12 Oct"
function formatBookingDate(dateText) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Split "2026-10-12" into ["2026", "10", "12"].
  const parts = dateText.split("-");
  const year = Number(parts[0]);
  const monthNumber = Number(parts[1]);
  const dayNumber = Number(parts[2]);

  // Build a real date so we can ask which day of the week it is.
  const dateValue = new Date(year, monthNumber - 1, dayNumber);

  return dayNames[dateValue.getDay()] + " " + dayNumber + " " + monthNames[monthNumber - 1];
}

// Function Load every booking request from the "sessions" collection
async function loadBookings() {
  const results = await getDocs(collection(db, "sessions"));

  allBookings = [];
  results.forEach(function (sessionDocument) {
    const booking = sessionDocument.data();
    booking.id = sessionDocument.id;

    // Older session records past attended sessions have no status,so they are not booking requests. Skip them.
    if (booking.status === undefined) {
      return;
    }

    allBookings.push(booking);
  });

  // If statement used to set the Soonest Bookings first. 
  allBookings.sort(function (bookingA, bookingB) {
    if (bookingA.sortKey < bookingB.sortKey) {
      return -1;
    }
    if (bookingA.sortKey > bookingB.sortKey) {
      return 1;
    }
    return 0;
  });

  showBookings();
}

// Function created to draw the list, respecting the current filter
function showBookings() {
  const listArea = document.getElementById("bookingList");
  listArea.innerHTML = "";

  let shownCount = 0;

  for (let i = 0; i < allBookings.length; i = i + 1) {
    const booking = allBookings[i];

    // Skip this booking if it does not match the chosen filter.
    if (currentFilter === "pending" && booking.status !== "pending") {
      continue;
    }
    if (currentFilter === "confirmed" && booking.status !== "confirmed") {
      continue;
    }

    shownCount = shownCount + 1;

    // Build one row.
    const row = document.createElement("div");
    row.className = "booking-row";
    // The circle with the learner's initials
    const avatar = document.createElement("div");
    avatar.className = "booking-avatar";
    avatar.textContent = booking.learnerInitials;
    // The learner's name with their programme underneath
    const whoBox = document.createElement("div");
    whoBox.className = "booking-who";
    const nameText = document.createElement("div");
    nameText.className = "booking-name";
    nameText.textContent = booking.learnerName;
    const programmeText = document.createElement("div");
    programmeText.className = "booking-programme";
    programmeText.textContent = booking.programme;
    whoBox.appendChild(nameText);
    whoBox.appendChild(programmeText);
    // The type of session they asked for
    const typeText = document.createElement("div");
    typeText.className = "booking-type";
    typeText.textContent = booking.sessionType;
    // The date with the time underneath
    const whenBox = document.createElement("div");
    whenBox.className = "booking-when";
    const dateText = document.createElement("div");
    dateText.className = "booking-date";
    dateText.textContent = formatBookingDate(booking.sessionDate);
    const timeText = document.createElement("div");
    timeText.className = "booking-time";
    timeText.textContent = booking.sessionTime;
    whenBox.appendChild(dateText);
    whenBox.appendChild(timeText);

    // The coloured status pill (Confirmed, Pending or Declined)
    const statusText = document.createElement("div");
    statusText.className = "booking-status";
    const statusPill = document.createElement("span");
    if (booking.status === "confirmed") {
      statusPill.className = "status-confirmed";
      statusPill.textContent = "Confirmed";
    }
    if (booking.status === "pending") {
      statusPill.className = "status-pending";
      statusPill.textContent = "Pending";
    }
    if (booking.status === "declined") {
      statusPill.className = "status-declined";
      statusPill.textContent = "Declined";
    }
    statusText.appendChild(statusPill);

     // The Confirm and Decline buttons only show up on pending requests
    const actionsBox = document.createElement("div");
    actionsBox.className = "booking-actions";
    if (booking.status === "pending") {
      const confirmButton = document.createElement("button");
      confirmButton.className = "confirm-button";
      confirmButton.textContent = "Confirm";
      confirmButton.addEventListener("click", function () {
        changeStatus(booking.id, "confirmed");
      });

      const declineButton = document.createElement("button");
      declineButton.className = "decline-button";
      declineButton.textContent = "Decline";
      declineButton.addEventListener("click", function () {
        changeStatus(booking.id, "declined");
      });

      actionsBox.appendChild(confirmButton);
      actionsBox.appendChild(declineButton);
    }
    // Put all the pieces into the row, then put the row on the page
    row.appendChild(avatar);
    row.appendChild(whoBox);
    row.appendChild(typeText);
    row.appendChild(whenBox);
    row.appendChild(statusText);
    row.appendChild(actionsBox);
    listArea.appendChild(row);
  }

  // If nothing matched the filter, show a message instead of a blank page
  if (shownCount === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "booking-empty";
    emptyMessage.textContent = "No bookings to show.";
    listArea.appendChild(emptyMessage);
  }
}

// Confirm or decline a request, then reload the list
async function changeStatus(bookingId, newStatus) {
  // assessorUid records which assessor answered the request.
  await updateDoc(doc(db, "sessions", bookingId), {
    status: newStatus,
    assessorUid: currentUid
  });

  await loadBookings();
}

// Function created to filter buttons
function setFilter(newFilter) {
  currentFilter = newFilter;

  // Give the chosen pill the dark "active" look and the others the plain look.
  document.getElementById("filterAllBookings").className = "filter-pill";
  document.getElementById("filterPending").className = "filter-pill";
  document.getElementById("filterConfirmed").className = "filter-pill";

  if (newFilter === "all") {
    document.getElementById("filterAllBookings").className = "filter-pill-active";
  }
  if (newFilter === "pending") {
    document.getElementById("filterPending").className = "filter-pill-active";
  }
  if (newFilter === "confirmed") {
    document.getElementById("filterConfirmed").className = "filter-pill-active";
  }

  showBookings();
}

// Function created to start the page
requireSignedInUser(function (uid, profile) {
  currentUid = uid;

  // Only assessors are allowed on this page.
  if (profile.role !== "assessor") {
    window.location.href = "tasks.html";
    return;
  }

  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarJobTitle").textContent = profile.jobTitle;
  document.getElementById("sidebarInitials").textContent = profile.initials;

  document.getElementById("filterAllBookings").addEventListener("click", function () { setFilter("all"); });
  document.getElementById("filterPending").addEventListener("click", function () { setFilter("pending"); });
  document.getElementById("filterConfirmed").addEventListener("click", function () { setFilter("confirmed"); });

  loadBookings();
});