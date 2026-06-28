import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB1V8_vu4bb-brwQ4bu0KwGXGJMywh4M5Y",
  authDomain: "ticketgenaration.firebaseapp.com",
  projectId: "ticketgenaration",
  storageBucket: "ticketgenaration.firebasestorage.app",
  messagingSenderId: "885799958102",
  appId: "1:885799958102:web:7c37e1ec53b73adf5eadf7",
  measurementId: "G-WF0P2SLMQR"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    let registration = null;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const currentToken = await getToken(messaging, { 
      vapidKey: 'BPEFVVbYgrkGA3wZDKFRQRciKLMAKV3QPC4KILnkrgivYxFY4cJwJk4uG6mZX0BW5p2NjvI3c6QwpUnscMEhLPg',
      serviceWorkerRegistration: registration 
    });
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    throw err;
  }
};

export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
