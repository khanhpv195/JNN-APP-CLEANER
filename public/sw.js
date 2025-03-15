self.addEventListener('install', function (event) {
    console.log('Service Worker installed');
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker activated');
});

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icon.png',
            badge: '/badge.png',
            data: data.url,
            actions: [
                {
                    action: 'open',
                    title: 'Open'
                },
                {
                    action: 'close',
                    title: 'Close'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'open') {
        clients.openWindow(event.notification.data);
    }
}); 