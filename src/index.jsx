import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

// 注册Service Worker (用于处理后台通知)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/notification-sw.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 