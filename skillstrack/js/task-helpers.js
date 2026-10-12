// Shared task rules used by every page, so the due date and priority are
// worked out the same way everywhere and saved in Firebase.

import { db } from "./firebase-config.js";
import {
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Function turns a date into text like "2026-10-26" so it matches what is saved in Firebase
function dateToText(dateValue) {
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

// Function works out the date two weeks from today and returns it like "2026-10-26"
export function getDefaultDueDate() {
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
  return dateToText(dueDate);
}

// Function works out the priority by comparing the due date to two cut-off dates
export function getPriority(dateText) {
  const today = new Date();

  // The last day that counts as High (3 days from now) and as Medium (7 days from now).
  const highLimit = dateToText(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3));
  const mediumLimit = dateToText(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));

  if (dateText <= highLimit) {
    return "High";
  }
  if (dateText <= mediumLimit) {
    return "Medium";
  }
  return "Low";
}

// Function checks a list of tasks and fixes the saved priority in Firebase
// when the due date getting closer has changed it.
// Each task needs its .id, which the pages already add when they load tasks.
export async function refreshPriorities(tasks) {
  for (let i = 0; i < tasks.length; i = i + 1) {
    const task = tasks[i];

    // Finished tasks keep the priority they had, and tasks with no date are skipped.
    if (task.completed === true || task.dueDate === undefined) {
      continue;
    }

    const newPriority = getPriority(task.dueDate);
    if (newPriority !== task.priority) {
      // If saving fails the page still carries on with the old value.
      try {
        await updateDoc(doc(db, "tasks", task.id), { priority: newPriority });
        task.priority = newPriority;
      } catch (error) {
        console.log("Could not update priority: " + error.message);
      }
    }
  }
}