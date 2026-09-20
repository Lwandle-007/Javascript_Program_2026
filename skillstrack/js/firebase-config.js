//	firebase-config.js
//	This	file	starts	up	Firebase	once,	and	shares	it	with	the	rest	of	the	app.
//	Bring	in	the	three	Firebase	tools	we	need,	straight	from	Google's	servers.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
//	These	settings	tell	Firebase	which	project	to	connect	to.
//	Replace	every	value	below	with	the	ones	from	your	own	Firebase	console.
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
