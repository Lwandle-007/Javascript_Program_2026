// Loads the shared resource library and filters it by category.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// remember every resource I've loaded, and which category button is selected.
let allResources = [];
let currentCategory = "All";

// Function loads every resource and we no ownerUid because everybody sees the same list.
async function loadResources() {
  const results = await getDocs(collection(db, "resources"));
  allResources = [];
  results.forEach(function (resourceDocument) {
    const resource = resourceDocument.data();
    resource.id = resourceDocument.id;
    allResources.push(resource);
  });
  showResources();
}

// Function draws the resource cards, respecting the chosen category
function showResources() {
  // Clear the grid first, so cards don't get added twice.
  const gridArea = document.getElementById("resourceGrid");
  gridArea.innerHTML = "";

  for (let i = 0; i < allResources.length; i = i + 1) {
    const resource = allResources[i];
    // Skip anything outside the chosen category.
    if (currentCategory !== "All" && resource.category !== currentCategory) {
      continue;
    }
    // Videos show a length, everything else shows a file size.
    let sizeOrLength = resource.fileSize;
    if (resource.type === "Video") {
      sizeOrLength = resource.duration;
    }
    // Build one card.
    const card = document.createElement("div");
    card.className = "resource-card";
    // The title at the top of the card.
    const titleText = document.createElement("h3");
    titleText.textContent = resource.title;
    // The small details line e.g. PDF Software Dev 2.8 MB Updated 2026-08-01.
    const metaText = document.createElement("p");
    metaText.textContent =
      resource.type +
      " " +
      resource.category +
      " " +
      sizeOrLength +
      " Updated " +
      resource.updatedAt;

    // The Open link. It goes to the resource's url.
    const openLink = document.createElement("a");
    openLink.href = resource.url;
    openLink.textContent = "Open";
    // Put the three pieces into the card, then the card into the grid.
    card.appendChild(titleText);
    card.appendChild(metaText);
    card.appendChild(openLink);
    gridArea.appendChild(card);
  }
}

// function category button remember which category was picked, then redraw the cards.
function setCategory(newCategory) {
  currentCategory = newCategory;
  showResources();
}

// Function to start the page
requireSignedInUser(function (uid, profile) {
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;
  // One listener per filter button, written out plainly.
  document.getElementById("catAll").addEventListener("click", function () {
    setCategory("All");
  });
  document
    .getElementById("catSoftwareDev")
    .addEventListener("click", function () {
      setCategory("Software Dev");
    });
  document.getElementById("catWebDev").addEventListener("click", function () {
    setCategory("Web Dev");
  });
  document
    .getElementById("catDataAnalytics")
    .addEventListener("click", function () {
      setCategory("Data Analytics");
    });
  document
    .getElementById("catCybersecurity")
    .addEventListener("click", function () {
      setCategory("Cybersecurity");
    });
  document.getElementById("catGeneral").addEventListener("click", function () {
    setCategory("General");
  });
  loadResources();
});
