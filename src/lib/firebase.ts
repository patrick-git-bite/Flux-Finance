import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuHqY5vQzEaJ2_OJ3n8BikUYzrKOc25ao",
  authDomain: "studio-4432826442-a8369.firebaseapp.com",
  projectId: "studio-4432826442-a8369",
  storageBucket: "studio-4432826442-a8369.appspot.com",
  messagingSenderId: "1024534251714",
  appId: "1:1024534251714:web:455040c9aa30d7b912d35b"
};

// Inicializa o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
