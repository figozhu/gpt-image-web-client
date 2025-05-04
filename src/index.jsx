import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

// 注册Service Worker (用于处理后台通知)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 设置Service Worker注册选项
    const swOptions = {
      scope: '/',  // 限制作用域
      updateViaCache: 'none'  // 不使用缓存，而是每次都检查更新
    };
    
    navigator.serviceWorker.register('/notification-sw.js', swOptions)
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
        
        // 检查更新
        registration.update().catch(error => {
          console.warn('Service Worker 更新检查失败:', error);
        });
        
        // 监听Service Worker更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('发现新Service Worker版本，状态:', newWorker.state);
          
          newWorker.addEventListener('statechange', () => {
            console.log('Service Worker状态变化:', newWorker.state);
          });
        });
        
        // 监听控制权更改
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker控制权发生变化');
        });
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error);
      });
      
    // 在页面卸载前尝试释放Service Worker
    window.addEventListener('unload', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAN_UP' });
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 