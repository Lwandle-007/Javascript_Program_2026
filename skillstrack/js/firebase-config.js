//	This	file	starts	up	Firebase	once,	and	shares	it	with	the	rest	of	the	app.
// I set it up once here, and every other file borrows it from here.

// I'm pulling in three tools from Google's servers, one for each job.
// initializeApp = starts Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// getAuth = gives me the login system
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// getFirestore = gives me the database
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// These settings are the address of MY Firebase project (skillstrack).
const firebaseConfig = {
  apiKey: "AIzaSyCMRGMyy2sjC6CF2asxxVOm3YQ0JLf9Bys",
  authDomain: "skillstrack-c9591.firebaseapp.com",
  projectId: "skillstrack-c9591",
  storageBucket: "skillstrack-c9591.firebasestorage.app",
  messagingSenderId: "780408370394",
  appId: "1:780408370394:web:29fca21abe35f0a77aa1e3",
};
//	Start	Firebase	using	those	settings.
const app = initializeApp(firebaseConfig);
//	"auth"	handles	signing	users	in	and	out.
const auth = getAuth(app);
//	"db"	handles	reading	and	writing	the	database.
const db = getFirestore(app);
//	Share	auth	and	db	so	the	other	JavaScript	files	can	use	them.
export { auth, db };