import { db } from "./firebase.js";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

const manualMemberIdInput = document.getElementById("manualMemberId");
const manualScanButton = document.getElementById("manualScanButton");
const manualStatus = document.getElementById("manualStatus");
const startCameraButton = document.getElementById("startCameraButton");
const cameraStatus = document.getElementById("cameraStatus");

let qrScanner = null;

function setStatus(element, text, success = true) {
  element.textContent = text;
  element.style.color = success ? "#34d399" : "#f87171";
}

async function recordScan(memberId, statusElement) {
  try {
    const attendanceRef = collection(db, "attendanceRecords");
    const memberRef = doc(db, "members", memberId);

    await addDoc(attendanceRef, {
      memberId,
      timestamp: serverTimestamp(),
    });

    await updateDoc(memberRef, {
      lastScanDate: serverTimestamp(),
      visitCount: increment(1),
    });

    setStatus(statusElement, `Recorded attendance for ${memberId}.`);
  } catch (error) {
    setStatus(statusElement, `Failed to record scan: ${error.message}`, false);
  }
}

function extractMemberIdFromQrText(text) {
  try {
    const url = new URL(text);
    return url.searchParams.get("memberId") || text.trim();
  } catch (error) {
    return text.trim();
  }
}

function onScanSuccess(decodedText) {
  const memberId = extractMemberIdFromQrText(decodedText);
  if (!memberId) {
    setStatus(cameraStatus, "Scanned QR did not contain a memberId.", false);
    return;
  }

  setStatus(cameraStatus, `Scanned memberId: ${memberId}`);
  recordScan(memberId, cameraStatus);
  if (qrScanner) {
    qrScanner.clear().catch(() => {});
    qrScanner = null;
  }
}

function onScanError(errorMessage) {
  console.warn("QR scan error", errorMessage);
}

function startCameraScanner() {
  if (qrScanner) {
    return;
  }

  qrScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 10,
    qrbox: 250,
    disableFlip: false,
  }, false);

  qrScanner.render(onScanSuccess, onScanError);
  setStatus(cameraStatus, "Camera active. Point it at a member QR code.");
}

manualScanButton.addEventListener("click", async () => {
  const memberId = manualMemberIdInput.value.trim();
  if (!memberId) {
    setStatus(manualStatus, "Enter a memberId to scan manually.", false);
    return;
  }
  await recordScan(memberId, manualStatus);
});

startCameraButton.addEventListener("click", () => {
  startCameraScanner();
});
