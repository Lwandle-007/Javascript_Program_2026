//	Handles	creating	accounts,	signing	in,	signing	out, and	blocking	pages	when	nobody	is	signed	in.
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//	This function truns username	"Lwandle Sitshi"	into	"LS"	for	the	avatar	circle on the sidebar
function makeInitials(fullName) {
  //	Split	the	name	into	separate	words.
  const words = fullName.trim().split(" ");
  //	If	there	is	only	one	word,	just	take	its	first	letter.
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  //	Otherwise	take	the	first	letter	of	the	first	word and	the	first	letter	of	the	last	word
  const firstLetter = words[0].charAt(0).toUpperCase();
  const lastLetter = words[words.length - 1].charAt(0).toUpperCase();
  return firstLetter + lastLetter;
}

//	SIGN	UP - Function created for when they is a new user
async function createAccount() {
  //	Read	what	the	person	typed	into	the	three	boxes
  const fullName = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;
  const messageBox = document.getElementById("signupMessage");

  //	Stop	early	if	any	box	was	left	empty
  if (fullName === "" || email === "" || password === "") {
    messageBox.textContent = "Please	fill	in	every	box.";
    return;
  }
  try {
    //	We ask	Firebase	Authentication	to	create	the	account
    const result = await createUserWithEmailAndPassword(auth, email, password);
    //	Get	the	unique	ID	Firebase	just	gave	this	person
    const uid = result.user.uid;
    //	Build	the	profile	record	we	want	to	save
    const profile = {
      fullName: fullName,
      initials: makeInitials(fullName),
      email: email,
      role: role,
      programme: "Software	Development",
      jobTitle: "",
      progressPercent: 0,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    //	Assessors	do	not	follow	a	programme	so here we	clear	that	field	for	them
    if (role === "assessor") {
      profile.programme = "";
      profile.jobTitle = "Lead	Assessor";
    }
    //	WE saved	the	profile	into	the	"users"	collection, using	the	UID	as	the	document	ID	so	we	can	always	find	it	again
    await setDoc(doc(db, "users", uid), profile);
    //	If statement to send	user	to	the	right	home	page
    if (role === "assessor") {
      window.location.href = "assessor_overview.html";
    } else {
      window.location.href = "learner_dashboard.html";
    }
  } catch (error) {
    //	Show	the	problem	instead	of	failing	silently
    messageBox.textContent = "Could	not	create	account:	" + error.message;
  }
}

//	SIGN	IN - Function for a user that has already created an account
async function signInUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const messageBox = document.getElementById("loginMessage");
  if (email === "" || password === "") {
    messageBox.textContent = "Please	enter	your	email	and	password.";
    return;
  }
  try {
    //  check	the	email	and	password	with	Firebase
    const result = await signInWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;
    //	Stamp	the	time	so	the	assessor's	"Last	active"	column	is	show and correct in the leaner activity page
    await updateDoc(doc(db, "users", uid), { lastActive: serverTimestamp() });
    // looks	up	their	profile	so	we	know	if	they	are	a	learner	or	assessor.
    const profileSnapshot = await getDoc(doc(db, "users", uid));
    const profile = profileSnapshot.data();
    //	Send	the user	to	the	correct	portal.
    if (profile.role === "assessor") {
      window.location.href = "assessor_overview.html";
    } else {
      window.location.href = "learner_dashboard.html";
    }
  } catch (error) {
    messageBox.textContent = "Sign	in	failed.	Check	your	email	and	password.";
  }
}
//	SIGN	OUT - Function for the signout button/link
async function signOutUser() {
  await signOut(auth);
  window.location.href = "index.html";
}

// Every page that needs a signed-in user calls this first.
// It finds out who is signed in, then either kicks them out
// or passes their details on to the page.

function requireSignedInUser(whatToDoNext) {
  onAuthStateChanged(auth, async function (user) {
    //	If nobody	is	signed	in,	so	send	them	to	the	login	page.
    if (user === null) {
      window.location.href = "index.html";
      return;
    }
    //	else Somebody	is	signed	in	Fetch	their	profile	from	the	database
    const profileSnapshot = await getDoc(doc(db, "users", user.uid));
    const profile = profileSnapshot.data();
    //	Update	their	last	active	time	on	every	page	load
    await updateDoc(doc(db, "users", user.uid), {
      lastActive: serverTimestamp(),
    });
    //	Hand	the	UID	and	the	profile	to	whatever	the	page	wants	to	do	next.
    whatToDoNext(user.uid, profile);
  });
}

//	we connect	the	buttons	but	only	on	pages	where	those	buttons	exist.

const loginButton = document.getElementById("loginButton");
if (loginButton !== null) {
  loginButton.addEventListener("click", signInUser);
}
const signupButton = document.getElementById("signupButton");
if (signupButton !== null) {
  signupButton.addEventListener("click", createAccount);
}
const signOutButton = document.getElementById("signOutButton");
if (signOutButton !== null) {
  signOutButton.addEventListener("click", signOutUser);
}
//	Share	the	guard	so	the	other	page	files	can	use	it.
export { requireSignedInUser, signOutUser };
