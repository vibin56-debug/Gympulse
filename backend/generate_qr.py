import argparse
import os
import uuid
from datetime import datetime

import qrcode
from firebase_admin import credentials, firestore, initialize_app

SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")


def init_firestore():
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        raise FileNotFoundError(
            f"Service account key not found at {SERVICE_ACCOUNT_PATH}.\n"
            "Download it from Firebase and place it there."
        )
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    initialize_app(cred)
    return firestore.client()


def create_member(db, name, email=""):
    member_id = str(uuid.uuid4())
    member_data = {
        "memberId": member_id,
        "name": name,
        "email": email,
        "joinDate": datetime.utcnow(),
        "lastScanDate": None,
        "visitCount": 0,
    }
    db.collection("members").document(member_id).set(member_data)
    return member_id


def generate_qr(member_id, output_folder="qrcodes"):
    os.makedirs(output_folder, exist_ok=True)
    payload = f"https://gympulse.example.com/scan?memberId={member_id}"
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    output_path = os.path.join(output_folder, f"{member_id}.png")
    img.save(output_path)
    return output_path, payload


def main():
    parser = argparse.ArgumentParser(description="Create a new GymPulse member and generate a QR code.")
    parser.add_argument("--name", required=True, help="Member name")
    parser.add_argument("--email", default="", help="Member email")
    args = parser.parse_args()

    db = init_firestore()
    member_id = create_member(db, args.name, args.email)
    output_path, payload = generate_qr(member_id)

    print(f"Created member: {args.name}")
    print(f"memberId: {member_id}")
    print(f"Firestore member document written to members/{member_id}")
    print(f"QR code saved to: {output_path}")
    print(f"Scan payload: {payload}")


if __name__ == "__main__":
    main()
