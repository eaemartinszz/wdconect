// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

// Substitua com as credenciais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmvZBvbYU9yEyqIl_6EcuSJdNtDo_WNtA",
  authDomain: "wdconecta-4e76d.firebaseapp.com",
  projectId: "wdconecta-4e76d",
  storageBucket: "wdconecta-4e76d.firebasestorage.app",
  messagingSenderId: "370334437897",
  appId: "1:370334437897:web:aafc3324738be6a6c21ed8"
};
// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore e exporta para usar em outras partes do projeto
export const db = getFirestore(app);
export const auth = getAuth(app);