// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgXe4yo_R-KvNblWygDFn3TQ5CIxyyexc",
  authDomain: "ofte-landing-unab.firebaseapp.com",
  projectId: "ofte-landing-unab",
  storageBucket: "ofte-landing-unab.firebasestorage.app",
  messagingSenderId: "76733059112",
  appId: "1:76733059112:web:2e9343a1229d124503a51d",
  measurementId: "G-XVTG14TKMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);