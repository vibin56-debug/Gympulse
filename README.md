# GymPulse Attendance System

## Overview

This project builds a local GymPulse prototype for member QR attendance tracking, Firebase Firestore storage, and a web dashboard.

The flow is:
- New member created and assigned a unique `memberId`
- Python script generates a QR code for the member
- Gym scanner reads the QR code and writes an attendance event to Firestore
- Website dashboard reads Firestore in real time and displays attendance/retention data

## Execution Plan

### 1. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database in production or test mode
3. Add a Web App inside the project and copy the configuration values
4. Create a Service Account for server-side Firebase Admin access
   - Go to Project Settings > Service Accounts
   - Generate a new private key and download `serviceAccountKey.json`
5. Save `serviceAccountKey.json` to `backend/serviceAccountKey.json`

### 2. Firestore Data Model

Use two collections:

- `members/{memberId}`
  - `memberId` (string)
  - `name` (string)
  - `email` (string)
  - `joinDate` (timestamp)
  - `lastScanDate` (timestamp)
  - `visitCount` (number)

- `attendanceRecords/{recordId}`
  - `memberId` (string)
  - `timestamp` (timestamp)

This model keeps membership metadata in `members` and event history in `attendanceRecords`.

### 3. QR Code Generation

Use the Python `qrcode` library to create a unique QR code per member.

The QR payload should contain a stable member identifier, for example:

```text
https://gympulse.example.com/scan?memberId=<memberId>
```

Later, the scanner or kiosk can use that memberId to update Firestore.

### 4. Backend Prototype

The `backend/generate_qr.py` script:
- creates a unique `memberId`
- writes a Firestore `members` document
- generates a QR PNG file in `qrcodes/`

Run locally with:

```powershell
cd c:\Users\Vibin\Desktop\gp2\backend
python -m pip install -r requirements.txt
python generate_qr.py --name "Tejas" --email "tejas@example.com"
```

### 5. Website Dashboard

The dashboard reads Firestore in real time and displays:
- member name
- join date
- last scan date
- visit count
- average visit frequency

The site also includes a local scan simulator to confirm the attendance write flow.

### 6. Local Host Setup

Run the site locally from the `web` folder:

```powershell
cd c:\Users\Vibin\Desktop\gp2\web
python -m http.server 8000
```

Open in browser:

```text
http://127.0.0.1:8000
```

### 7. Connect Firebase to Website

Replace placeholder values in `web/app.js` with your Firebase Web App config:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

### 8. Testing Workflow

1. Use `backend/generate_qr.py` to create a member and QR code.
2. Confirm the member document exists in Firestore.
3. Open the dashboard and verify members appear.
4. Use the scan simulator to write attendance events.
5. Watch `lastScanDate` and `visitCount` update in real time.

## Setup Instructions

### Install Python Dependencies

```powershell
cd c:\Users\Vibin\Desktop\gp2\backend
python -m pip install -r requirements.txt
```

### Start Website Locally

```powershell
cd c:\Users\Vibin\Desktop\gp2\web
python -m http.server 8000
```

### Recommended Next Steps

- Add a kiosk/mobile scan page that extracts `memberId` from a scanned QR URL
- Add authentication to protect the dashboard
- Store member tier, membership status, and retention score
- Add dashboard filters for weekly/monthly attendance

## Files in this project

- `backend/generate_qr.py` — generate member IDs, save Firestore member docs, create QR images
- `backend/requirements.txt` — dependency list
- `web/index.html` — dashboard UI, member registration, and scan simulator
- `web/scan.html` — QR scan landing page for attendance writes
- `web/scan.js` — scan page Firestore write logic
- `web/app.js` — Firestore integration and real-time updates
- `web/style.css` — dashboard styling
- `.gitignore` — ignore service account and Python caches
