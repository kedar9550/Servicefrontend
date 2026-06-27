importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB1V8_vu4bb-brwQ4bu0KwGXGJMywh4M5Y",
  authDomain: "ticketgenaration.firebaseapp.com",
  projectId: "ticketgenaration",
  storageBucket: "ticketgenaration.firebasestorage.app",
  messagingSenderId: "885799958102",
  appId: "1:885799958102:web:7c37e1ec53b73adf5eadf7",
  measurementId: "G-WF0P2SLMQR"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
