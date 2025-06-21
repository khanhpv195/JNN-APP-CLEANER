if ('serviceWorker' in navigator && 'PushManager' in window) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker đã đăng ký thành công:', registration);
                requestNotificationPermission();
            })
            .catch(error => {
                console.error('Lỗi đăng ký ServiceWorker:', error);
            });
    });
}

async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            // Lấy subscription để gửi lên server
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
            });

            // Gửi subscription lên server
            await sendSubscriptionToServer(subscription);
        }
    } catch (error) {
        console.error('Lỗi khi xin quyền notification:', error);
    }
} 