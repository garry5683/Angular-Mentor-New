
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARPDFGfSx1ZrRJCYgtgLCKfwqNF9c7boU",
  authDomain: "angular-mentor-1215e.firebaseapp.com",
  projectId: "angular-mentor-1215e",
  storageBucket: "angular-mentor-1215e.firebasestorage.app",
  messagingSenderId: "629400109366",
  appId: "1:629400109366:web:fd90356cdad40086ec3397",
  measurementId: "G-BZTJBMHX5F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
};
