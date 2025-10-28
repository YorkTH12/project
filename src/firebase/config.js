// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1t10IcJ-8hf4wXlO7OG1631RknXFB76k",
  authDomain: "find-bottle-shops.firebaseapp.com",
  projectId: "find-bottle-shops",
  storageBucket: "find-bottle-shops.firebasestorage.app",
  messagingSenderId: "239232061613",
  appId: "1:239232061613:web:71f9ba89734b4cc56c7624"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);