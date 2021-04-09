import firebase from "firebase";
const firebaseConfig = {
  apiKey: "AIzaSyA_gVFXP8bjw7cwzPX2PXWMylD3Bvg7B6A",
  authDomain: "whatsapp-2-ed7c3.firebaseapp.com",
  projectId: "whatsapp-2-ed7c3",
  storageBucket: "whatsapp-2-ed7c3.appspot.com",
  messagingSenderId: "339634477230",
  appId: "1:339634477230:web:1f7d66268a2b7e5f69b53f",
};

//to prevent the reinitialized the app again and again bcoz of ssr(server side rendering)
const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();
export { db, auth, provider };
