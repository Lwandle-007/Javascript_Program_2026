// ===== Memory for the page =====
// These two variables "remember" the day and time the user picked,
// so the summary line can combine both even though they're chosen
// by two separate buttons at two separate times.
// They start empty because nothing has been picked yet.
let currentDay = "";
let currentTime = "";

// ===== Runs when a Session Type button is clicked =====
function selectType(value) {
  document.getElementById("summaryType").innerHTML = value;
}

// ===== Runs when a Preferred Day button is clicked =====
function selectDay(value) {
  currentDay = value;
  document.getElementById("summaryTime").innerHTML =
    currentDay + " - " + currentTime;
}

// ===== Runs when a Preferred Time button is clicked =====
function selectTime(value) {
  currentTime = value;
  document.getElementById("summaryTime").innerHTML =
    currentDay + " - " + currentTime;
}

// ===== Runs when the "Send Request" button is clicked =====
// Creates a NEW <li> element in the booking log — this is the
// "create a DOM element based on user interaction" evidence.
function sendRequest() {
  let list = document.getElementById("bookingLog");

  let item = document.createElement("li");
  item.textContent = currentDay + " - " + currentTime;
  list.appendChild(item);

  alert("Request sent! We'll confirm your session shortly");
}

// ===== Runs when the "Clear Last" button is clicked =====
// Removes the most recently added <li> — the "remove a DOM element
// based on user interaction" evidence.
function clearLast() {
  let list = document.getElementById("bookingLog");
  if (list.lastChild) {
    list.removeChild(list.lastChild);
  }
}

// ===== Attach all event listeners here instead of using =====
// ===== inline onclick="..." attributes in the HTML          =====
document.addEventListener("DOMContentLoaded", function () {
  // Session type buttons
  document
    .getElementById("btnProgressReview")
    .addEventListener("click", function () {
      selectType("Progress Review");
    });
  document
    .getElementById("btnGeneralSupport")
    .addEventListener("click", function () {
      selectType("General Support");
    });
  // add one addEventListener line per session type button you have

  // Day buttons
  document.getElementById("btnMonday").addEventListener("click", function () {
    selectDay("Monday");
  });
  document.getElementById("btnTuesday").addEventListener("click", function () {
    selectDay("Tuesday");
  });
  // add one line per day button you have

  // Time buttons
  document.getElementById("btnMorning").addEventListener("click", function () {
    selectTime("Morning");
  });
  document
    .getElementById("btnAfternoon")
    .addEventListener("click", function () {
      selectTime("Afternoon");
    });
  // add one line per time button you have

  // Send / Clear
  document
    .getElementById("btnSendRequest")
    .addEventListener("click", sendRequest);
  document.getElementById("btnClearLast").addEventListener("click", clearLast);
});
