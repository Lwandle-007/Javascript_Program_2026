// This is a one-off script that puts my 12 learning resources into
// the "resources" collection in Firestore.
// I only run it ONCE, then I delete it. If I ran it twice, every
// resource would be saved twice.

// Bring in our Firestore database from the config file
// import { db } from "./firebase-config.js";

// import {
//   collection,
//   addDoc,
// } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// // The list of resources we want to put into the "resources" collection.
// const resourceList = [
//   {
//     title: "Software Development L3 - Full Qualification Guide",
//     type: "PDF",
//     category: "Software Dev",
//     fileSize: "2.8 MB",
//     duration: "",
//     updatedAt: "2026-08-01",
//     url: "resources/software-development-l3-qualification-guide.pdf",
//   },
//   {
//     title: "Python Fundamentals: Variables, Functions & Loops",
//     type: "PDF",
//     category: "Software Dev",
//     fileSize: "1.2 MB",
//     duration: "",
//     updatedAt: "2026-08-04",
//     url: "https://docs.python.org/3/tutorial/introduction.html",
//   },
//   {
//     title: "Introduction to Git and Version Control - Video",
//     type: "Video",
//     category: "Software Dev",
//     fileSize: "",
//     duration: "28 min",
//     updatedAt: "2026-08-03",
//     url: "https://git-scm.com/video/what-is-version-control",
//   },
//   {
//     title: "Object-Oriented Programming: Classes & Inheritance",
//     type: "Guide",
//     category: "Software Dev",
//     fileSize: "940 KB",
//     duration: "",
//     updatedAt: "2026-07-30",
//     url: "https://docs.python.org/3/tutorial/classes.html",
//   },
//   {
//     title: "HTML & CSS Essentials - Web Development L2 Handbook",
//     type: "PDF",
//     category: "Web Dev",
//     fileSize: "1.9 MB",
//     duration: "",
//     updatedAt: "2026-08-05",
//     url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
//   },
//   {
//     title: "JavaScript for Beginners - Interactive Exercises",
//     type: "Video",
//     category: "Web Dev",
//     fileSize: "",
//     duration: "42 min",
//     updatedAt: "2026-08-02",
//     url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
//   },
//   {
//     title: "Responsive Design with Flexbox and Grid",
//     type: "Guide",
//     category: "Web Dev",
//     fileSize: "680 KB",
//     duration: "",
//     updatedAt: "2026-07-28",
//     url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
//   },
//   {
//     title: "Introduction to SQL and Relational Databases",
//     type: "PDF",
//     category: "Data Analytics",
//     fileSize: "1.4 MB",
//     duration: "",
//     updatedAt: "2026-08-06",
//     url: "https://www.w3schools.com/sql/",
//   },
//   {
//     title: "Data Visualisation with Python (Matplotlib & Pandas)",
//     type: "Video",
//     category: "Data Analytics",
//     fileSize: "",
//     duration: "35 min",
//     updatedAt: "2026-08-01",
//     url: "https://matplotlib.org/stable/users/explain/quick_start.html",
//   },
//   {
//     title: "Cybersecurity Fundamentals - Threats & Defences",
//     type: "PDF",
//     category: "Cybersecurity",
//     fileSize: "2.1 MB",
//     duration: "",
//     updatedAt: "2026-07-22",
//     url: "https://www.cisa.gov/topics/cybersecurity-best-practices",
//   },
//   {
//     title: "Network Security: Firewalls, VPNs & Encryption",
//     type: "Guide",
//     category: "Cybersecurity",
//     fileSize: "760 KB",
//     duration: "",
//     updatedAt: "2026-07-18",
//     url: "https://www.cloudflare.com/learning/security/what-is-a-firewall/",
//   },
//   {
//     title: "How to Complete Your Evidence Portfolio",
//     type: "Guide",
//     category: "General",
//     fileSize: "420 KB",
//     duration: "",
//     updatedAt: "2026-07-15",
//     url: "resources/how-to-complete-your-evidence-portfolio.pdf",
//   },
// ];

// // Go through the list one resource at a time and save each one to Firestore
// async function addAllResources() {
//   for (let i = 0; i < resourceList.length; i = i + 1) {
//     // Save this resource as a new document in the "resources" collection
//     await addDoc(collection(db, "resources"), resourceList[i]);

//     // Show in the console which one was saved
//     console.log("Added: " + resourceList[i].title);
//   }

//   console.log("Finished. You can delete seed.js now.");
// }

// // Start the process
// addAllResources();
