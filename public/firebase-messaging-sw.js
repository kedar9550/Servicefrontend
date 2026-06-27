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
  // Note: Since the backend sends a "notification" payload, Firebase SDK 
  // will automatically display the notification. 
  // We do not need to call self.registration.showNotification() here, 
  // otherwise it may cause duplicate notifications or errors.
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  event.notification.close();
  
  // Open the app when the notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(self.registration.scope);
      }
    })
  );
});
