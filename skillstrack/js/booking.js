// We created booking.js to allow  a learner pick a session type, day and time, then saves the request.

import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Remember who is signed in, and what they have chosen so far.
let currentUid = "";
let currentProfile = null;

let selectedType = " ";
let selectedDayIndex = 0;
let selectedTimeIndex = 0;

let dayDates = [];

// The timeLabels is what the learner sees, the timeValues is a 24-hour version that sorts correctly as text.
const timeLabels = ["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:00 PM", "3:30 PM"];
const timeValues = ["09:00", "10:00", "11:30", "13:00", "14:00", "15:30"];

const typeButtonIds = ["typeProgress", "typeCoursework", "typeEvidence", "typeGeneral"];
const typeNames = ["Progress Review", "Coursework Support", "Evidence Review", "General Query"];
const dayButtonIds = ["day1", "day2", "day3", "day4", "day5"];
const timeButtonIds = ["time1", "time2", "time3", "time4", "time5", "time6"];

// Function created to work out the next five weekdays (Monday to Friday only)
function getNextWeekdays() {
  const dayList = [];
  let checkDate = new Date();

  // Keep stepping forward one day at a time until we have five weekdays
  while (dayList.length < 5) {
    checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() + 1);

    // getDay() gives 0 for Sunday and 6 for Saturday so skip those two
    const dayNumber = checkDate.getDay();
    if (dayNumber !== 0 && dayNumber !== 6) {
      dayList.push(checkDate);
    }
  }

  return dayList;
}

// Function created to turn a date into "Mon 11" for the buttons and summary
function formatShortDay(dateValue) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames[dateValue.getDay()] + " " + dateValue.getDate();
}

// Function created to turn a date into "2026-10-12" so it matches the sessions collection
function formatDateForDatabase(dateValue) {
  const year = dateValue.getFullYear();
  const month = dateValue.getMonth() + 1;
  const day = dateValue.getDate();

  // Add a leading zero so 5 becomes "05".
  let monthText = String(month);
  if (month < 10) {
    monthText = "0" + month;
  }
  let dayText = String(day);
  if (day < 10) {
    dayText = "0" + day;
  }

  return year + "-" + monthText + "-" + dayText;
}

// Function created to change the css styling of the buttons and the summary card to match the chosen choices 
function refreshScreen() {
  // Session buttons
  for (let i = 0; i < typeButtonIds.length; i = i + 1) {
    const button = document.getElementById(typeButtonIds[i]);
    if (typeNames[i] === selectedType) {
      button.className = "type-button-active";
    } else {
      button.className = "type-button";
    }
  }

  // Day buttons
  for (let i = 0; i < dayButtonIds.length; i = i + 1) {
    const button = document.getElementById(dayButtonIds[i]);
    if (i === selectedDayIndex) {
      button.className = "day-button-active";
    } else {
      button.className = "day-button";
    }
  }

  // Time buttons
  for (let i = 0; i < timeButtonIds.length; i = i + 1) {
    const button = document.getElementById(timeButtonIds[i]);
    if (i === selectedTimeIndex) {
      button.className = "time-button-active";
    } else {
      button.className = "time-button";
    }
  }

  // The dark summary card.
  const dayText = formatShortDay(dayDates[selectedDayIndex]);
  const timeText = timeLabels[selectedTimeIndex];
  document.getElementById("summaryType").textContent = selectedType;
  document.getElementById("summaryWhen").textContent = dayText + " · " + timeText;
}

// Each of the functions saves the new choice then calls refreshScreen so the colours and summary update
function selectType(newType) {
  selectedType = newType;
  refreshScreen();
}
function selectDay(newIndex) {
  selectedDayIndex = newIndex;
  refreshScreen();
}
function selectTime(newIndex) {
  selectedTimeIndex = newIndex;
  refreshScreen();
}

// Function used to save the request in the "sessions" collection
async function sendRequest() {
  const messageBox = document.getElementById("bookingMessage");
  messageBox.textContent = "";

  if (currentProfile === null) {
    messageBox.textContent = "Still checking your account. Try again in a moment.";
    return;
  }

  const chosenDate = dayDates[selectedDayIndex];
  const dateText = formatDateForDatabase(chosenDate);

  // Build the record. status "pending" means the assessor has not answered yet.
  // assessorUid stays empty until an assessor confirms the request.
  const newBooking = {
    learnerUid: currentUid,
    learnerName: currentProfile.fullName,
    learnerInitials: currentProfile.initials,
    programme: currentProfile.programme,
    assessorUid: "",
    sessionType: selectedType,
    sessionDate: dateText,
    sessionTime: timeLabels[selectedTimeIndex],
    // sortKey is date + 24-hour time so the assessor's list can be sorted soonest first
    sortKey: dateText + " " + timeValues[selectedTimeIndex],
    notes: document.getElementById("sessionNotes").value,
    status: "pending",
    attended: false,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "sessions"), newBooking);
  } catch (error) {
    messageBox.textContent = "Could not send your request: " + error.message;
    return;
  }

  // Swap the form for the confirmation screen.
  document.getElementById("doneDetails").textContent =
    selectedType + " · " + formatShortDay(chosenDate) + ", " + timeLabels[selectedTimeIndex];
  document.getElementById("bookingForm").style.display = "none";
  document.getElementById("bookingDone").style.display = "block";
}

// Function created for goning back to a fresh form
function bookAnother() {
  selectedType = "";
  selectedDayIndex = 0;
  selectedTimeIndex = 0;
  document.getElementById("sessionNotes").value = "";

  document.getElementById("bookingDone").style.display = "none";
  document.getElementById("bookingForm").style.display = "block";
  refreshScreen();
}

// Form here we start the page. 
// The buttons are wired up straight away, so they change colour
// when clicked even while Firebase is still checking who is signed in.

// Write the five weekday names onto the day buttons.
dayDates = getNextWeekdays();
document.getElementById("day1").textContent = formatShortDay(dayDates[0]);
document.getElementById("day2").textContent = formatShortDay(dayDates[1]);
document.getElementById("day3").textContent = formatShortDay(dayDates[2]);
document.getElementById("day4").textContent = formatShortDay(dayDates[3]);
document.getElementById("day5").textContent = formatShortDay(dayDates[4]);

// One listener per button, written out plainly.
document.getElementById("typeProgress").addEventListener("click", function () { selectType("Progress Review"); });
document.getElementById("typeCoursework").addEventListener("click", function () { selectType("Coursework Support"); });
document.getElementById("typeEvidence").addEventListener("click", function () { selectType("Evidence Review"); });
document.getElementById("typeGeneral").addEventListener("click", function () { selectType("General Query"); });

document.getElementById("day1").addEventListener("click", function () { selectDay(0); });
document.getElementById("day2").addEventListener("click", function () { selectDay(1); });
document.getElementById("day3").addEventListener("click", function () { selectDay(2); });
document.getElementById("day4").addEventListener("click", function () { selectDay(3); });
document.getElementById("day5").addEventListener("click", function () { selectDay(4); });

document.getElementById("time1").addEventListener("click", function () { selectTime(0); });
document.getElementById("time2").addEventListener("click", function () { selectTime(1); });
document.getElementById("time3").addEventListener("click", function () { selectTime(2); });
document.getElementById("time4").addEventListener("click", function () { selectTime(3); });
document.getElementById("time5").addEventListener("click", function () { selectTime(4); });
document.getElementById("time6").addEventListener("click", function () { selectTime(5); });

document.getElementById("sendRequestButton").addEventListener("click", sendRequest);
document.getElementById("bookAnotherButton").addEventListener("click", bookAnother);

// Draw the starting colours and the summary card.
refreshScreen();

// Check who is signed in and fill in the sidebar.
requireSignedInUser(function (uid, profile) {
  currentUid = uid;
  currentProfile = profile;

  // Only learners book sessions. Assessors go to their own page.
  if (profile.role === "assessor") {
    window.location.href = "assessor accept or decline.html";
    return;
  }

  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;
});