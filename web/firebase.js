import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAo8Da_rYEtmqd4gqZ2CBWc_nsNc98fD3w",
  authDomain: "gympulse-46327.firebaseapp.com",
  projectId: "gympulse-46327",
  storageBucket: "gympulse-46327.firebasestorage.app",
  messagingSenderId: "10984639457",
  appId: "1:10984639457:web:8220aacd31f4b6ee5b20a0",
  measurementId: "G-Y1P7D5KVVS",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export { analytics };
