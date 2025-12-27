import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Reemplaza con tu configuración de Firebase
// La obtendrás desde Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDP25VlCoNaE4P1mRt5RKoxUjjaF4l_x7M",
  authDomain: "bingo-online-9e0aa.firebaseapp.com",
  projectId: "bingo-online-9e0aa",
  storageBucket: "bingo-online-9e0aa.firebasestorage.app",
  messagingSenderId: "436381033410",
  appId: "1:436381033410:web:2c1927fe4fa4a303c4ac5b",
  measurementId: "G-B3BP86VZZX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
