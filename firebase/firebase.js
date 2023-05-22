import { getStorage } from "@firebase/storage";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBn0cqGp0AsGs_5PNHxFR7AkGoGAL8DfZY",
    authDomain: "blog-app-4c5c7.firebaseapp.com",
    projectId: "blog-app-4c5c7",
    storageBucket: "blog-app-4c5c7.appspot.com",
    messagingSenderId: "238793667706",
    appId: "1:238793667706:web:f6b8eb5ea6f77f276e77c3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };
