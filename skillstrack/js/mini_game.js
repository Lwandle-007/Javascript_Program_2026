/* eslint-disable prefer-const */
// Ths file created for Python mini game. Shows one fill-in-the-blank challenge at a time, checks the answer, keeps score, and saves every attempt to Firebase
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// The challenges. codeBefore and codeAfter are the code on either side of the blank, so the blank can show the chosen answer
let challenges = [
  {
    title: "Fix the greeting function",
    instructions: "The function below should return a full greeting. One word is missing. Choose the correct option.",
    codeBefore: 'def greet(name):\n    message = "Hello, " + ',
    codeAfter: '\n    return message\nprint(greet("Amara"))\n# Expected: Hello, Amara',
    options: ["name", '"name"', "Name", "str()"],
    correctAnswer: "name",
    explanation: 'Variables are used without quotes. "name" in quotes prints the literal word, not the value.'
  },
  {
    title: "Complete the loop",
    instructions: "Fill in the blank to make the loop print numbers 1 through 5.",
    codeBefore: "for i in ",
    codeAfter: "(1, 6):\n    print(i)\n# Expected output:\n# 1  2  3  4  5",
    options: ["range", "list", "count", "loop"],
    correctAnswer: "range",
    explanation: "range(1, 6) gives the numbers 1 to 5. The last number is never included."
  },
  {
    title: "Store a value",
    instructions: "Choose the correct operator to assign the value 10 to a variable called score.",
    codeBefore: "score ",
    codeAfter: " 10\nprint(score)\n# Expected: 10",
    options: ["=", "==", "=>", ":="],
    correctAnswer: "=",
    explanation: "A single = stores a value in a variable. A double == only compares two values."
  },
  {
    title: "Check a condition",
    instructions: 'The code should print "Pass" if the mark is 50 or above. Choose the correct comparison.',
    codeBefore: "mark = 72\nif mark ",
    codeAfter: ' 50:\n    print("Pass")\nelse:\n    print("Fail")',
    options: [">=", ">", "<=", "=="],
    correctAnswer: ">=",
    explanation: ">= means greater than or equal to, so a mark of exactly 50 still passes."
  },
  {
    title: "Define a list",
    instructions: "Complete the line to create a list of three programming languages.",
    codeBefore: "languages = ",
    codeAfter: ' "Python", "JavaScript", "SQL"\nprint(languages[0])\n# Expected: Python',
    options: ["[ ]", "{ }", "( )", '" "'],
    correctAnswer: "[ ]",
    explanation: "Square brackets make a list. The first item is at position 0, so languages[0] is Python."
  }
];

// Variables to remember who is signed in and where the player is in the game
let currentUid = "";
let currentIndex = 0;
let rightCount = 0;
let wrongCount = 0;
let selectedAnswer = "";

// The four option buttons
let optionIds = ["option1", "option2", "option3", "option4"];

// Function to draw the code box. The blank shows "___" until an option is picked,
// then it shows the picked option instead.
function drawCode(challenge, pickedText) {
  let codeBox = document.getElementById("codeBlock");
  codeBox.innerHTML = "";

  // The code before the blank.
  codeBox.appendChild(document.createTextNode(challenge.codeBefore));

  // The blank itself.
  let blank = document.createElement("span");
  if (pickedText === "") {
    blank.className = "blank-empty";
    blank.textContent = "___";
  } else {
    blank.className = "blank-filled";
    blank.textContent = pickedText;
  }
  codeBox.appendChild(blank);

  // The code after the blank.
  codeBox.appendChild(document.createTextNode(challenge.codeAfter));
}

// Function created to show the current challenge
function showChallenge() {
  let challenge = challenges[currentIndex];
  selectedAnswer = "";

  document.getElementById("progressText").textContent =
    "Challenge " + (currentIndex + 1) + " of " + challenges.length;
  document.getElementById("scoreRight").textContent = "✓ " + rightCount;
  document.getElementById("scoreWrong").textContent = "✗ " + wrongCount;

  // The bar fills up by the number of challenges already finished.
  let fillPercent = (currentIndex / challenges.length) * 100;
  document.getElementById("progressFill").style.width = fillPercent + "%";

  document.getElementById("challengeLabel").textContent = "PYTHON · CHALLENGE " + (currentIndex + 1);
  document.getElementById("challengeTitle").textContent = challenge.title;
  document.getElementById("challengeInstructions").textContent = challenge.instructions;

  drawCode(challenge, "");

  // Put each option on its button and reset the colours.
  for (let i = 0; i < optionIds.length; i = i + 1) {
    let button = document.getElementById(optionIds[i]);
    button.textContent = challenge.options[i];
    button.className = "option-button";
  }

  // Back to the "pick an answer" view.
  document.getElementById("checkButton").disabled = true;
  document.getElementById("optionsArea").style.display = "block";
  document.getElementById("feedbackArea").style.display = "none";
}

// Function created so that the player clicks one of the four options
function chooseOption(optionNumber) {
  let challenge = challenges[currentIndex];
  selectedAnswer = challenge.options[optionNumber];

  // Only the chosen option gets the orange "active" look.
  for (let i = 0; i < optionIds.length; i = i + 1) {
    let button = document.getElementById(optionIds[i]);
    if (i === optionNumber) {
      button.className = "option-button-active";
    } else {
      button.className = "option-button";
    }
  }

  // Show the choice inside the code, and let them press Check Answer.
  drawCode(challenge, selectedAnswer);
  document.getElementById("checkButton").disabled = false;
}

// Function for when the player clicks "Check Answer"
async function checkAnswer() {
  let challenge = challenges[currentIndex];
  let isCorrect = false;

  if (selectedAnswer === challenge.correctAnswer) {
    isCorrect = true;
  }

  // Update the score and the message.
  let feedbackBox = document.getElementById("feedbackArea");
  if (isCorrect === true) {
    rightCount = rightCount + 1;
    feedbackBox.className = "feedback-area feedback-correct";
    document.getElementById("feedbackIcon").textContent = "✓";
    document.getElementById("feedbackTitle").textContent = "Correct!";
  } else {
    wrongCount = wrongCount + 1;
    feedbackBox.className = "feedback-area feedback-wrong";
    document.getElementById("feedbackIcon").textContent = "✗";
    document.getElementById("feedbackTitle").textContent =
      "Not quite — the answer is: " + challenge.correctAnswer;
  }
  document.getElementById("feedbackExplanation").textContent = challenge.explanation;
  document.getElementById("scoreRight").textContent = "✓ " + rightCount;
  document.getElementById("scoreWrong").textContent = "✗ " + wrongCount;

  // The last challenge leads to the results instead of another challenge.
  if (currentIndex === challenges.length - 1) {
    document.getElementById("nextButton").textContent = "See Results →";
  } else {
    document.getElementById("nextButton").textContent = "Next Challenge →";
  }

  // Swap the options for the message.
  document.getElementById("optionsArea").style.display = "none";
  feedbackBox.style.display = "block";

  // Save the attempt. If saving fails we made the game so that it still carries on.
  if (currentUid !== "") {
    try {
      await addDoc(collection(db, "quizAttempts"), {
        learnerUid: currentUid,
        challengeNumber: currentIndex + 1,
        challengeTitle: challenge.title,
        selectedAnswer: selectedAnswer,
        correct: isCorrect,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.log("Could not save attempt: " + error.message);
    }
  }
}

// Function for when the player clicks "Next Challenge" or "See Results"
function nextChallenge() {
  currentIndex = currentIndex + 1;

  if (currentIndex < challenges.length) {
    showChallenge();
  } else {
    showResults();
  }
}

// Function created to show the results screen
function showResults() {
  let total = challenges.length;
  let percent = Math.round((rightCount / total) * 100);

  // Pick a heading that matches the score.
  let heading = "Keep practising!";
  if (percent >= 50) {
    heading = "Good effort!";
  }
  if (percent >= 80) {
    heading = "Excellent work!";
  }

  document.getElementById("resultTitle").textContent = heading;
  document.getElementById("resultText").textContent =
    "You scored " + rightCount + " out of " + total + " — " + percent + "%";
  document.getElementById("resultRight").textContent = rightCount;
  document.getElementById("resultWrong").textContent = wrongCount;

  document.getElementById("gameHeader").style.display = "none";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("resultsArea").style.display = "block";
}

// Function created from "Try Again" which starts from challenge 1 with a clean score
function tryAgain() {
  currentIndex = 0;
  rightCount = 0;
  wrongCount = 0;

  document.getElementById("resultsArea").style.display = "none";
  document.getElementById("gameHeader").style.display = "flex";
  document.getElementById("gameArea").style.display = "block";
  showChallenge();
}

// Function created to start the page
// WE made the buttons wired up straight away so that the game works even while Firebase is still checking who is signed in.
document.getElementById("option1").addEventListener("click", function () { chooseOption(0); });
document.getElementById("option2").addEventListener("click", function () { chooseOption(1); });
document.getElementById("option3").addEventListener("click", function () { chooseOption(2); });
document.getElementById("option4").addEventListener("click", function () { chooseOption(3); });

document.getElementById("checkButton").addEventListener("click", checkAnswer);
document.getElementById("nextButton").addEventListener("click", nextChallenge);
document.getElementById("tryAgainButton").addEventListener("click", tryAgain);

showChallenge();

requireSignedInUser(function (uid, profile) {
  currentUid = uid;

  // Only learners use this page. Assessors go to their own page.
  if (profile.role === "assessor") {
    window.location.href = "assessor_overview.html";
    return;
  }

  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;
});