//	auth.js
//	Handles	creating	accounts,	signing	in,	signing	out,
//	and	blocking	pages	when	nobody	is	signed	in.
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
//	--------------------------------------------------------------
//	HELPER:	turn	"Lwandle Sitshi"	into	"LS"	for	the	avatar	circle
//	--------------------------------------------------------------
function makeInitials(fullName) {
  //	Split	the	name	into	separate	words.
  const words = fullName.trim().split("	");
  //	If	there	is	only	one	word,	just	take	its	first	letter.
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  //	Otherwise	take	the	first	letter	of	the	first	word
  //	and	the	first	letter	of	the	last	word.
  const firstLetter = words[0].charAt(0).toUpperCase();
  const lastLetter = words[words.length - 1].charAt(0).toUpperCase();
  return firstLetter + lastLetter;
}
//	--------------------------------------------------------------
//	SIGN	UP
//	--------------------------------------------------------------
async function createAccount() {
  //	Read	what	the	person	typed	into	the	three	boxes.
  const fullName = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;
  const messageBox = document.getElementById("signupMessage");
  //	Stop	early	if	any	box	was	left	empty.
  if (fullName === "" || email === "" || password === "") {
    messageBox.textContent = "Please	fill	in	every	box.";
    return;
  }
  try {
    //	Step	1:	ask	Firebase	Authentication	to	create	the	account.
    const result = await createUserWithEmailAndPassword(auth, email, password);
    //	Step	2:	get	the	unique	ID	Firebase	just	gave	this	person.
    const uid = result.user.uid;
    //	Step	3:	build	the	profile	record	we	want	to	save.
    const profile = {
      fullName: fullName,
      initials: makeInitials(fullName),
      email: email,
      role: role,
      programme: "Software	Development	L3",
      jobTitle: "",
      progressPercent: 0,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    //	Assessors	do	not	follow	a	programme,	so	clear	that	field	for	them.
    if (role === "assessor") {
      profile.programme = "";
      profile.jobTitle = "Lead	Assessor";
    }
    //	Step	4:	save	the	profile	into	the	"users"	collection,
    //	using	the	UID	as	the	document	ID	so	we	can	always	find	it	again.
    await setDoc(doc(db, "users", uid), profile);
    //	Step	6:	send	them	to	the	right	home	page.
    if (role === "assessor") {
      window.location.href = "learner-activity.html";
    } else {
      window.location.href = "tasks.html";
    }
  } catch (error) {
    //	Show	the	problem	instead	of	failing	silently.
    messageBox.textContent = "Could	not	create	account:	" + error.message;
  }
}
//	--------------------------------------------------------------
//	SIGN	IN
//	--------------------------------------------------------------
async function signInUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const messageBox = document.getElementById("loginMessage");
  if (email === "" || password === "") {
    messageBox.textContent = "Please	enter	your	email	and	password.";
    return;
  }
  try {
    //	Step	1:	check	the	email	and	password	with	Firebase.
    const result = await signInWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;
    //	Step	2:	stamp	the	time	so	the	assessor's	"Last	active"	column	is	correct.
    await updateDoc(doc(db, "users", uid), { lastActive: serverTimestamp() });
    //	Step	3:	look	up	their	profile	so	we	know	if	they	are	a	learner	or	assessor.
    const profileSnapshot = await getDoc(doc(db, "users", uid));
    const profile = profileSnapshot.data();
    //	Step	4:	send	them	to	the	correct	portal.
    if (profile.role === "assessor") {
      window.location.href = "learner-activity.html";
    } else {
      window.location.href = "tasks.html";
    }
  } catch (error) {
    messageBox.textContent = "Sign	in	failed.	Check	your	email	and	password.";
  }
}
//	--------------------------------------------------------------
//	SIGN	OUT
//	--------------------------------------------------------------
async function signOutUser() {
  await signOut(auth);
  window.location.href = "index.html";
}
//	--------------------------------------------------------------
//	PAGE	GUARD
//	Every	protected	page	calls	this.	It	waits	for	Firebase	to	say	who	is
//	signed	in,	then	either	kicks	them	out	or	hands	their	profile	back.
//	--------------------------------------------------------------
function requireSignedInUser(whatToDoNext) {
  onAuthStateChanged(auth, async function (user) {
    //	Nobody	is	signed	in,	so	send	them	to	the	login	page.
    if (user === null) {
      window.location.href = "index.html";
      return;
    }
    //	Somebody	is	signed	in.	Fetch	their	profile	from	the	database.
    const profileSnapshot = await getDoc(doc(db, "users", user.uid));
    const profile = profileSnapshot.data();
    //	Update	their	last	active	time	on	every	page	load.
    await updateDoc(doc(db, "users", user.uid), {
      lastActive: serverTimestamp(),
    });
    //	Hand	the	UID	and	the	profile	to	whatever	the	page	wants	to	do	next.
    whatToDoNext(user.uid, profile);
  });
}
//	--------------------------------------------------------------
//	Connect	the	buttons,	but	only	on	pages	where	those	buttons	exist.
//	--------------------------------------------------------------
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
