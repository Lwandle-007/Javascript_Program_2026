// booking.js
// Handles session-type, day, and time selection, plus the request
// summary and submission, for the "Book a Support Session" page.

let currentDay = "";
let currentTime = "";

/**
 * Displays the chosen session type in the request summary.
 * @param {string} value - Label of the selected session type
 *   (e.g. "Progress Review").
 */
function selectType(value) {
  document.getElementById("summaryType").innerHTML = value;
}

/**
 * Records the selected day and refreshes the combined day/time summary.
 * @param {string} value - The selected day (e.g. "Mon 11").
 */
function selectDay(value) {
  currentDay = value;
  updateDayTimeSummary();
}

/**
 * Records the selected time and refreshes the combined day/time summary.
 * @param {string} value - The selected time slot (e.g. "9:00 AM").
 */
function selectTime(value) {
  currentTime = value;
  updateDayTimeSummary();
}

/**
 * Builds and displays the "day - time" summary text.
 * Shared by selectDay and selectTime so the string-building logic
 * only lives in one place.
 */
function updateDayTimeSummary() {
  document.getElementById("summaryTime").innerHTML =
    `${currentDay} - ${currentTime}`;
}

/**
 * Sends the booking request.
 * Currently a placeholder — replace with a real Firebase POST
 * once the backend booking endpoint is wired up.
 */
function sendRequest() {
  alert("Request sent! We'll confirm your session shortly.");
}

/**
 * Wires up every button on the page using addEventListener instead
 * of inline onclick attributes, so behaviour stays out of the markup.
 * Buttons are matched using data-* attributes set in the HTML.
 */
function initBookingForm() {
  document.querySelectorAll("[data-session-type]").forEach((button) => {
    button.addEventListener("click", () => {
      selectType(button.dataset.sessionType);
    });
  });

  document.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      selectDay(button.dataset.day);
    });
  });

  document.querySelectorAll("[data-time]").forEach((button) => {
    button.addEventListener("click", () => {
      selectTime(button.dataset.time);
    });
  });

  document
    .getElementById("send-request-btn")
    .addEventListener("click", sendRequest);
}

document.addEventListener("DOMContentLoaded", initBookingForm);
