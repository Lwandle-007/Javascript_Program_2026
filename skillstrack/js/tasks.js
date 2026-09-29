//	tasks.js
//	Loads,	adds,	completes	and	filters	the	signed-in	learner's	tasks.
import { db } from "./firebase-config.js";
import { requireSignedInUser } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
//	Remember	who	is	signed	in,	and	every	task	we	loaded.
let currentUid = "";
let allTasks = [];
let currentFilter = "all";
//	--------------------------------------------------------------
//	HELPER:	turn	"2026-08-12"	into	"Due	12	Aug"
//	--------------------------------------------------------------
function formatDueDate(dateText) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  //	Split	"2026-08-12"	into	["2026",	"08",	"12"].
  const parts = dateText.split("-");
  const monthNumber = Number(parts[1]); //	8
  const dayNumber = Number(parts[2]); //	12

  //	Month	8	sits	at	position	7	in	the	list,	so	take	one	off.
  const monthName = monthNames[monthNumber - 1];
  return "Due	" + dayNumber + "	" + monthName;
}
//	--------------------------------------------------------------
//	Load	every	task	belonging	to	this	learner
//	--------------------------------------------------------------
async function loadTasks() {
  //	Ask	for	tasks	where	ownerUid	matches	the	signed-in	person.
  const tasksQuery = query(
    collection(db, "tasks"),
    where("ownerUid", "==", currentUid)
  );
  const results = await getDocs(tasksQuery);
  //	Empty	the	list,	then	refill	it	from	the	database.
  allTasks = [];
  results.forEach(function (taskDocument) {
    const task = taskDocument.data();
    task.id = taskDocument.id; //	keep	the	ID	so	we	can	tick	it	off	later
    allTasks.push(task);
  });
  showTasks();
  showCounts();
}
//	--------------------------------------------------------------
//	Draw	the	task	list,	respecting	the	current	filter
//	--------------------------------------------------------------
function showTasks() {
  const listArea = document.getElementById("taskList");
  listArea.innerHTML = "";
  for (let i = 0; i < allTasks.length; i = i + 1) {
    const task = allTasks[i];
    //	Skip	this	task	if	it	does	not	match	the	chosen	filter.
    if (currentFilter === "outstanding" && task.completed === true) {
      continue;
    }
    if (currentFilter === "completed" && task.completed === false) {
      continue;
    }
    //	Build	one	row.
    const row = document.createElement("div");
    row.className = "task-row";
    const tickBox = document.createElement("input");
    tickBox.type = "checkbox";
    tickBox.checked = task.completed;
    //	When	the	box	is	clicked,	save	the	new	state.
    tickBox.addEventListener("change", function () {
      toggleTaskDone(task.id, tickBox.checked);
    });
    const titleText = document.createElement("span");
    titleText.textContent = task.title;
    const detailText = document.createElement("small");
    detailText.textContent = task.category + "	·	" + formatDueDate(task.dueDate);
    const priorityText = document.createElement("span");
    priorityText.textContent = task.priority;
    row.appendChild(tickBox);
    row.appendChild(titleText);
    row.appendChild(detailText);
    row.appendChild(priorityText);
    listArea.appendChild(row);
  }
}
//	--------------------------------------------------------------
//	The	"4	outstanding	·	2	completed"	line	under	the	heading
//	--------------------------------------------------------------
function showCounts() {
  let outstandingCount = 0;
  let completedCount = 0;
  for (let i = 0; i < allTasks.length; i = i + 1) {
    if (allTasks[i].completed === true) {
      completedCount = completedCount + 1;
    } else {
      outstandingCount = outstandingCount + 1;
    }
  }
  document.getElementById("taskCounts").textContent =
    outstandingCount + "	outstanding	·	" + completedCount + "	completed";
}
//	--------------------------------------------------------------
//	Tick	a	task	off	(or	un-tick	it)
//	--------------------------------------------------------------
async function toggleTaskDone(taskId, isNowDone) {
  await updateDoc(doc(db, "tasks", taskId), { completed: isNowDone });
  //	Reload	so	the	counts	and	the	assessor's	"open"	number	stay	correct.
  await loadTasks();
}
//	--------------------------------------------------------------
//	Add	a	new	task	from	the	"+	Add	Task"	form
//	--------------------------------------------------------------
async function addNewTask() {
  const titleBox = document.getElementById("newTaskTitle");
  const title = titleBox.value;
  if (title === "") {
    return;
  }
  //	Build	the	new	record.	ownerUid	is	what	ties	it	to	this	learner.
  const newTask = {
    ownerUid: currentUid,
    title: title,
    category: "General",
    dueDate: "2026-09-30",
    priority: "Medium",
    completed: false,
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, "tasks"), newTask);
  titleBox.value = "";
  await loadTasks();
}
//	--------------------------------------------------------------
//	Filter	buttons
//	--------------------------------------------------------------
function setFilter(newFilter) {
  currentFilter = newFilter;
  showTasks();
}
//	--------------------------------------------------------------
//	Start	the	page
//	--------------------------------------------------------------
requireSignedInUser(function (uid, profile) {
  currentUid = uid;
  //	Fill	in	the	sidebar	name	and	initials.
  document.getElementById("sidebarName").textContent = profile.fullName;
  document.getElementById("sidebarProgramme").textContent = profile.programme;
  document.getElementById("sidebarInitials").textContent = profile.initials;
  document
    .getElementById("addTaskButton")
    .addEventListener("click", addNewTask);
  document.getElementById("filterAll").addEventListener("click", function () {
    setFilter("all");
  });

  document
    .getElementById("filterOutstanding")
    .addEventListener("click", function () {
      setFilter("outstanding");
    });

  document
    .getElementById("filterCompleted")
    .addEventListener("click", function () {
      setFilter("completed");
    });
  loadTasks();
});
