import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBoiobosdZcaMWrfarBsrLNSLYdVBM_J3M",
  authDomain: "pdfcraft-2302a.firebaseapp.com",
  projectId: "pdfcraft-2302a",
  storageBucket: "pdfcraft-2302a.appspot.com",
  messagingSenderId: "17150668970",
  appId: "1:17150668970:web:dummyappid"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();