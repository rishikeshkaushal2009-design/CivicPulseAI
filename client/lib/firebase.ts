import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTgLSnUnvBRW2kmdnlneCj5j074LIPTJs",
  authDomain: "civicpulseai-4e1d0.firebaseapp.com",
  projectId: "civicpulseai-4e1d0",
  storageBucket: "civicpulseai-4e1d0.firebasestorage.app",
  messagingSenderId: "1007841552595",
  appId: "1:1007841552595:web:1801e7c7599cbb209dcc26",
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;