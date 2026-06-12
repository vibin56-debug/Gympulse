import { db } from "./firebase.js";
import QRCode from "qrcode";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  query,
  orderBy,
} from "firebase/firestore";

const membersList = document.getElementById("membersList");
const dashboardStatus = document.getElementById("dashboardStatus");
const registerNameInput = document.getElementById("registerName");
const registerEmailInput = document.getElementById("registerEmail");
const registerMemberButton = document.getElementById("registerMemberButton");
const registrationResult = document.getElementById("registrationResult");
const registrationOutput = document.getElementById("registrationOutput");
const generatedMemberId = document.getElementById("generatedMemberId");
const generatedMemberName = document.getElementById("generatedMemberName");
const generatedScanLink = document.getElementById("generatedScanLink");
const qrCodeCanvas = document.getElementById("qrCodeCanvas");
const downloadQrButton = document.getElementById("downloadQrButton");

function formatTimestamp(value) {
  if (!value) return "Never";
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString();
}

function computeFrequency(joinDate, visitCount, lastScanDate) {
  if (!joinDate || visitCount === 0) {
    return "N/A";
  }

  const start = joinDate.toDate ? joinDate.toDate() : new Date(joinDate);
  const end = lastScanDate ? (lastScanDate.toDate ? lastScanDate.toDate() : new Date(lastScanDate)) : new Date();
  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  return `${(days / Math.max(1, visitCount)).toFixed(1)} days/visit`;
}

async function createMember() {
  const name = registerNameInput.value.trim();
  const email = registerEmailInput.value.trim();

  if (!name) {
    registrationResult.textContent = "Name is required to create a member.";
    registrationResult.style.color = "#f87171";
    return;
  }

  try {
    const newMemberRef = doc(collection(db, "members"));
    const memberId = newMemberRef.id;
    const scanUrl = `${new URL("scan.html", window.location.href).href}?memberId=${memberId}`;

    const memberData = {
      memberId,
      name,
      email,
      joinDate: new Date(),
      lastScanDate: null,
      visitCount: 0,
    };

    await setDoc(newMemberRef, memberData);

    registrationResult.textContent = "Member created successfully.";
    registrationResult.style.color = "#34d399";
    registrationOutput.classList.remove("hidden");
    generatedMemberId.textContent = memberId;
    generatedMemberName.textContent = name;
    generatedScanLink.textContent = scanUrl;
    generatedScanLink.href = scanUrl;
    
    // Generate QR code with member data
    await QRCode.toCanvas(qrCodeCanvas, memberId, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      width: 200,
    });
    
    registerNameInput.value = "";
    registerEmailInput.value = "";
  } catch (error) {
    registrationResult.textContent = `Error creating member: ${error.message}`;
    registrationResult.style.color = "#f87171";
    registrationOutput.classList.add("hidden");
  }
}

function downloadQrCode() {
  const canvas = document.getElementById("qrCodeCanvas");
  const link = document.createElement("a");
  const memberId = generatedMemberId.textContent;
  link.href = canvas.toDataURL("image/png");
  link.download = `member-qr-${memberId}.png`;
  link.click();
}

async function deleteMember(memberId, memberName) {
  console.log("Delete clicked for:", { memberId, memberName });
  
  const confirmed = window.confirm(
    `Are you sure you want to delete ${memberName} (ID: ${memberId.substring(0, 8)}...)? This action cannot be undone.`
  );
  
  if (!confirmed) {
    console.log("Delete cancelled by user");
    return;
  }

  try {
    console.log("Attempting to delete member with ID:", memberId);
    const memberRef = doc(db, "members", memberId);
    console.log("Member ref created:", memberRef.path);
    
    await deleteDoc(memberRef);
    
    console.log("Member deleted successfully:", memberId);
    alert(`Successfully deleted ${memberName} from the system.`);
  } catch (error) {
    console.error("Delete error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    alert(`Error deleting member: ${error.message}\n\nCode: ${error.code}\n\nCheck browser console (F12) for details.`);
  }
}

function renderMember(docData) {
  const row = document.createElement("tr");
  const memberId = docData.memberId;
  const memberName = docData.name;

  row.innerHTML = `
    <td>${memberName || "Unknown"}</td>
    <td><code>${memberId}</code></td>
    <td>${formatTimestamp(docData.joinDate)}</td>
    <td>${formatTimestamp(docData.lastScanDate)}</td>
    <td>${docData.visitCount || 0}</td>
    <td>${computeFrequency(docData.joinDate, docData.visitCount || 0, docData.lastScanDate)}</td>
    <td><button class="delete-btn">Delete</button></td>
  `;

  const deleteBtn = row.querySelector(".delete-btn");
  deleteBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked:", { memberId, memberName });
    deleteMember(memberId, memberName);
  };

  return row;
}

function startRealtimeDashboard() {
  const membersQuery = query(collection(db, "members"), orderBy("joinDate", "asc"));
  onSnapshot(
    membersQuery,
    (snapshot) => {
      membersList.innerHTML = "";
      snapshot.forEach((doc) => {
        membersList.appendChild(renderMember(doc.data()));
      });
      dashboardStatus.textContent = `Loaded ${snapshot.size} members.`;
    },
    (error) => {
      dashboardStatus.textContent = `Error loading members: ${error.message}`;
      dashboardStatus.style.color = "#f87171";
    }
  );
}

// Test function for debugging - call from browser console: testFirebase()
window.testFirebase = async function() {
  console.log("=== Firebase Test ===");
  console.log("Database instance:", db);
  console.log("Firebase initialized");
  
  try {
    console.log("Attempting to read members collection...");
    const testQuery = query(collection(db, "members"));
    const testSnapshot = await getDocs(testQuery);
    console.log("Members count:", testSnapshot.size);
    testSnapshot.forEach((doc) => {
      console.log("Member:", doc.id, doc.data());
    });
    console.log("✓ Read access working");
  } catch (error) {
    console.error("✗ Read failed:", error);
  }
};

registerMemberButton.addEventListener("click", createMember);
downloadQrButton.addEventListener("click", downloadQrCode);
startRealtimeDashboard();
