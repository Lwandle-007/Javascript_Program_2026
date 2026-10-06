// resources.js
// Loads the shared resource library and filters it by category.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
let allResources = [];
let currentCategory = "All";
// Load every resource. There is no ownerUid because everybody seesthe same list.
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
function showResources() {
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
    const card = document.createElement("div");
    card.className = "resource-card";
    const titleText = document.createElement("h3");
    titleText.textContent = resource.title;

    const metaText = document.createElement("p");
    metaText.textContent =
      resource.type +
      " " +
      resource.category +
      " " +
      sizeOrLength +
      " Updated " +
      resource.updatedAt;
    const openLink = document.createElement("a");
    openLink.href = resource.url;
    openLink.textContent = "Open";
    card.appendChild(titleText);
    card.appendChild(metaText);
    card.appendChild(openLink);
    gridArea.appendChild(card);
  }
}
function setCategory(newCategory) {
  currentCategory = newCategory;
  showResources();
}
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
