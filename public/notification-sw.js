// 通知Service Worker
self.addEventListener('install', event => {
  console.log('通知Service Worker已安装');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('通知Service Worker已激活');
  return self.clients.claim();
});

// 处理通知相关事件
self.addEventListener('notificationclick', event => {
  console.log('通知被点击', event);
  
  // 关闭通知
  event.notification.close();
  
  // 尝试聚焦到已打开的标签页
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 如果没有找到打开的窗口，则打开一个新的
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
}); 