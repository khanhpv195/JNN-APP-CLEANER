importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAwJq6jz0RHEB9Dqm9LqYJYssARi7Semh0",
    authDomain: "jnn-crm.firebaseapp.com",
    projectId: "jnn-crm",
    storageBucket: "jnn-crm.firebasestorage.app",
    messagingSenderId: "659587303892",
    appId: "1:659587303892:web:a88a9e6128128472582e41"
});

const messaging = firebase.messaging();

// Xử lý khi nhận thông báo ở background
messaging.onBackgroundMessage((payload) => {
    // Hiển thị notification
    self.registration.showNotification(
        payload.notification.title,
        {
            body: payload.notification.body,
            // Thêm action để mở app
            actions: [{
                action: 'open_app',
                title: 'Mở ứng dụng'
            }]
        }
    );
});

// Xử lý khi click vào notification
self.addEventListener('notificationclick', (event) => {
    // Đóng notification
    event.notification.close();

    // Kiểm tra xem app đã mở chưa
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // Nếu app đã mở, focus vào app
                for (const client of clientList) {
                    if (client.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Nếu app chưa mở, mở app mới
                if (clients.openWindow) {
                    // Mở đến màn hình cụ thể nếu có
                    const url = event.notification.data?.screen
                        ? `/${event.notification.data.screen}`
                        : '/';
                    return clients.openWindow(url);
                }
            })
    );
}); 