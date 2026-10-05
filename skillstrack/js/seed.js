import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firebase.js";

const resourceList = [
  {
    title: "Software	Development	L3	-	Full	Qualification	Guide",
    type: "PDF",
    category: "Software	Dev",
    fileSize: "2.8	MB",
    duration: "",
    updatedAt: "2026-08-01",
    url: "#",
  },
  {
    title: "Python	Fundamentals:	Variables,	Functions	&	Loops",
    type: "PDF",
    category: "Software	Dev",
    fileSize: "1.2	MB",
    duration: "",
    updatedAt: "2026-08-04",
    url: "#",
  },
  {
    title: "Introduction	to	Git	and	Version	Control	-	Video",
    type: "Video",
    category: "Software	Dev",
    fileSize: "",
    duration: "28	min",
    updatedAt: "2026-08-03",
    url: "#",
  },
  {
    title: "Object-Oriented	Programming:	Classes	&	Inheritance",
    type: "Guide",
    category: "Software	Dev",
    fileSize: "940	KB",
    duration: "",
    updatedAt: "2026-07-30",
    url: "#",
  },
  {
    title: "HTML	&	CSS	Essentials	-	Web	Development	L2	Handbook",
    type: "PDF",
    category: "Web	Dev",
    fileSize: "1.9	MB",
    duration: "",
    updatedAt: "2026-08-05",
    url: "#",
  },
  {
    title: "JavaScript	for	Beginners	-	Interactive	Exercises",
    type: "Video",
    category: "Web	Dev",
    fileSize: "",
    duration: "42	min",
    updatedAt: "2026-08-02",
    url: "#",
  },
  {
    title: "Responsive	Design	with	Flexbox	and	Grid",
    type: "Guide",
    category: "Web	Dev",
    fileSize: "680	KB",
    duration: "",
    updatedAt: "2026-07-28",
    url: "#",
  },
  {
    title: "Introduction	to	SQL	and	Relational	Databases",
    type: "PDF",
    category: "Data	Analytics",
    fileSize: "1.4	MB",
    duration: "",
    updatedAt: "2026-08-06",
    url: "#",
  },
  {
    title: "Data	Visualisation	with	Python	(Matplotlib	&	Pandas)",
    type: "Video",
    category: "Data	Analytics",
    fileSize: "",
    duration: "35	min",
    updatedAt: "2026-08-01",
    url: "#",
  },
  {
    title: "Cybersecurity	Fundamentals	-	Threats	&	Defences",
    type: "PDF",
    category: "Cybersecurity",
    fileSize: "2.1	MB",
    duration: "",
    updatedAt: "2026-07-22",
    url: "#",
  },
  {
    title: "Network	Security:	Firewalls,	VPNs	&	Encryption",
    type: "Guide",
    category: "Cybersecurity",
    fileSize: "760	KB",
    duration: "",
    updatedAt: "2026-07-18",
    url: "#",
  },
  {
    title: "How	to	Complete	Your	Evidence	Portfolio",
    type: "Guide",
    category: "General",
    fileSize: "420	KB",
    duration: "",
    updatedAt: "2026-07-15",
    url: "#",
  },
];

async function addAllResources() {
  for (let i = 0; i < resourceList.length; i = i + 1) {
    await addDoc(collection(db, "resources"), resourceList[i]);
    console.log("Added:	" + resourceList[i].title);
  }
  console.log("Finished.	You	can	delete	seed.js	now.");
}

addAllResources();
