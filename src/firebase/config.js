import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVeqlBZxnuXj_nY3Wj-I4qziIrsTs4kTI",
  authDomain: "ruang-siasat-2.firebaseapp.com",
  databaseURL: "https://ruang-siasat-2-default-rtdb.firebaseio.com/",
  projectId: "ruang-siasat-2",
  storageBucket: "ruang-siasat-2.firebasestorage.app",
  messagingSenderId: "927830982352",
  appId: "1:927830982352:web:b3cfe3b8072d348e56a8d5",
  measurementId: "G-DPP0166H5M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "ruang-siasat-v3";