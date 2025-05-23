// 通知Service Worker
const VERSION = 'v1';

// 缓存名称
const CACHE_NAME = `notification-sw-${VERSION}`;
const IMAGE_CACHE_NAME = `image-cache-${VERSION}`;

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/favicon.svg'
];

// Service Worker安装
self.addEventListener('install', event => {
  console.log('通知Service Worker正在安装...');
  
  // 缓存静态资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('已打开缓存:', CACHE_NAME);
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch(error => {
        console.error('静态资源缓存失败:', error);
      })
  );
});

// Service Worker激活
self.addEventListener('activate', event => {
  console.log('通知Service Worker已激活');
  
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            (cacheName.startsWith('notification-sw-') && cacheName !== CACHE_NAME) ||
            (cacheName.startsWith('image-cache-') && cacheName !== IMAGE_CACHE_NAME)
          )
          .map(cacheName => {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // 不立即接管所有客户端，让正常的页面生命周期管理发挥作用
  // 注释掉: return self.clients.claim();
});

// 处理通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('通知被点击', event.notification.tag);
  
  // 关闭通知
  event.notification.close();
  
  // 尝试聚焦到已打开的标签页，但不强制打开新窗口
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // 查找已打开的窗口
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // 不自动打开新窗口，避免Service Worker保持运行
        // 注释掉: return clients.openWindow('/');
        return Promise.resolve(); // 返回已完成的Promise
      })
      .catch(error => {
        console.error('处理通知点击失败:', error);
      })
  );
});

// 处理Push消息 - 保持为空实现，因为我们不使用推送通知
self.addEventListener('push', event => {
  // 空实现，确保不会意外处理推送消息
});

// 添加周期性清理任务
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_UP') {
    // 执行清理操作
    console.log('Service Worker执行清理操作');
    // 可以在这里清理任何资源
  }
});

// 拦截fetch请求，使用缓存响应图标请求和图片请求
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 判断是否为图片请求
  const isImageRequest = 
    url.pathname.endsWith('.jpg') || 
    url.pathname.endsWith('.jpeg') || 
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.gif') || 
    url.pathname.endsWith('.webp') ||
    // 针对特定的API CDN域名进行匹配（需要替换为实际的API域名）
    url.hostname.includes('oaidalleapiprodscus.blob.core.windows.net') ||
    url.hostname.includes('cdn.openai.com');

  // 处理图片请求
  if (isImageRequest) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          // 如果找到缓存的响应，返回它
          if (response) {
            console.log('图片缓存命中:', url.pathname);
            return response;
          }
          
          // 否则发起网络请求并缓存结果
          return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              console.log('缓存新图片:', url.pathname);
              // 复制响应，因为响应流只能使用一次
              const responseToCache = networkResponse.clone();
              cache.put(event.request, responseToCache);
            }
            return networkResponse;
          }).catch(error => {
            console.error('获取图片失败:', error);
            throw error;
          });
        });
      })
    );
  } 
  // 处理图标请求
  else if (event.request.url.includes('favicon.svg')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
}); 