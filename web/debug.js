import { db } from "./firebase.js";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
} from "firebase/firestore";

const testInitButton = document.getElementById("testInitButton");
const testReadButton = document.getElementById("testReadButton");
const testWriteButton = document.getElementById("testWriteButton");
const testDeleteButton = document.getElementById("testDeleteButton");
const clearLogsButton = document.getElementById("clearLogsButton");

const testInitResult = document.getElementById("testInitResult");
const testReadResult = document.getElementById("testReadResult");
const testWriteResult = document.getElementById("testWriteResult");
const testDeleteResult = document.getElementById("testDeleteResult");

const logBox = document.getElementById("logBox");

function log(message) {
  console.log(message);
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement("div");
  logEntry.textContent = `[${timestamp}] ${message}`;
  logBox.appendChild(logEntry);
  logBox.scrollTop = logBox.scrollHeight;
}

function setStatus(element, text, success = true) {
  element.textContent = text;
  element.style.color = success ? "#34d399" : "#f87171";
}

testInitButton.addEventListener("click", async () => {
  log("=== Testing Firebase Initialization ===");
  try {
    log("Database instance:", db);
    setStatus(testInitResult, "✓ Firebase initialized successfully", true);
    log("✓ Success");
  } catch (error) {
    setStatus(testInitResult, `✗ Error: ${error.message}`, false);
    log(`✗ Error: ${error.message}`);
  }
});

testReadButton.addEventListener("click", async () => {
  log("=== Testing Read Access ===");
  try {
    log("Querying members collection...");
    const testQuery = query(collection(db, "members"));
    const testSnapshot = await getDocs(testQuery);
    log(`Found ${testSnapshot.size} members`);
    
    testSnapshot.forEach((doc) => {
      log(`  - ${doc.id}: ${doc.data().name}`);
    });
    
    setStatus(testReadResult, `✓ Read access OK (${testSnapshot.size} members)`, true);
    log("✓ Success");
  } catch (error) {
    setStatus(testReadResult, `✗ Read failed: ${error.message}`, false);
    log(`✗ Error (${error.code}): ${error.message}`);
  }
});

testWriteButton.addEventListener("click", async () => {
  log("=== Testing Write Access ===");
  try {
    log("Attempting to write test document...");
    const testRef = collection(db, "members");
    const docRef = await addDoc(testRef, {
      testWrite: true,
      timestamp: new Date(),
      message: "This is a test document",
    });
    log(`✓ Test document created: ${docRef.id}`);
    setStatus(testWriteResult, `✓ Write access OK (${docRef.id})`, true);
    log("✓ Success");
  } catch (error) {
    setStatus(testWriteResult, `✗ Write failed: ${error.message}`, false);
    log(`✗ Error (${error.code}): ${error.message}`);
  }
});

testDeleteButton.addEventListener("click", async () => {
  log("=== Testing Delete Access ===");
  try {
    log("Finding test documents to delete...");
    const testQuery = query(collection(db, "members"));
    const testSnapshot = await getDocs(testQuery);
    
    let deleted = 0;
    for (const document of testSnapshot.docs) {
      if (document.data().testWrite === true) {
        log(`Deleting test document: ${document.id}`);
        await deleteDoc(doc(db, "members", document.id));
        deleted++;
      }
    }
    
    if (deleted > 0) {
      setStatus(testDeleteResult, `✓ Delete access OK (${deleted} test docs deleted)`, true);
      log(`✓ Success - deleted ${deleted} test documents`);
    } else {
      log("No test documents found to delete");
      setStatus(testDeleteResult, "⚠ No test documents to delete", true);
    }
  } catch (error) {
    setStatus(testDeleteResult, `✗ Delete failed: ${error.message}`, false);
    log(`✗ Error (${error.code}): ${error.message}`);
  }
});

clearLogsButton.addEventListener("click", () => {
  logBox.innerHTML = "";
  log("Logs cleared");
});

log("Debug page loaded. Click test buttons above to check Firebase connectivity.");
