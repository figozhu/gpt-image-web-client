// 检查浏览器是否支持通知
export const isNotificationSupported = () => {
  const isSupported = 'Notification' in window;
  console.log('浏览器通知支持状态:', isSupported);
  return isSupported;
};

// 检查浏览器是否支持 Service Worker
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// 获取当前通知权限状态
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  
  const permission = Notification.permission;
  console.log('当前通知权限状态:', permission);
  return permission;
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('浏览器不支持通知，无法请求权限');
    return 'unsupported';
  }
  
  try {
    console.log('尝试请求通知权限...');
    
    // 在一些浏览器中，Notification.requestPermission可能返回Promise或使用回调
    const permission = await new Promise((resolve) => {
      const permissionPromise = Notification.requestPermission();
      
      if (permissionPromise && typeof permissionPromise.then === 'function') {
        // 如果返回Promise
        permissionPromise.then(resolve);
      } else {
        // 如果使用回调形式
        resolve(permissionPromise);
      }
    });
    
    console.log('通知权限请求结果:', permission);
    return permission;
  } catch (error) {
    console.error('请求通知权限时出错:', error);
    return 'denied';
  }
};

// 显示通知
export const showNotification = (title, options = {}) => {
  console.log('开始尝试显示通知...');
  
  if (!isNotificationSupported()) {
    console.warn('浏览器不支持通知功能，无法显示通知');
    return false;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('通知权限未授予，无法显示通知，当前权限:', Notification.permission);
    return false;
  }
  
  try {
    // 检查页面可见性
    const isPageVisible = document.visibilityState === 'visible';
    console.log('页面是否可见:', isPageVisible);
    
    // 设置默认选项
    const notificationOptions = {
      icon: '/favicon.svg',
      silent: false,
      requireInteraction: true, // 通知不会自动消失
      vibrate: [200, 100, 200], // 振动模式 - 用于移动设备
      renotify: !isPageVisible, // 如果页面不可见，即使有相同tag的通知，也会再次提醒
      ...options
    };
    
    console.log('创建通知，标题:', title, '选项:', notificationOptions);
    
    // 对于Chrome中的后台标签页，需要特殊处理
    if (!isPageVisible && navigator.serviceWorker && navigator.serviceWorker.controller) {
      // 如果有Service Worker注册，尝试通过Service Worker发送通知
      console.log('尝试通过Service Worker发送通知');
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, notificationOptions);
      });
      return true;
    }
    
    // 如果没有Service Worker或页面可见，使用普通Notification API
    const notification = new Notification(title, notificationOptions);
    
    // 添加通知事件监听
    notification.onclick = function() {
      console.log('通知被点击');
      // 如果页面在后台，将其切换到前台
      if (!isPageVisible) {
        window.focus();
      }
      this.close();
    };
    
    notification.onshow = function() {
      console.log('通知已显示');
    };
    
    notification.onclose = function() {
      console.log('通知已关闭');
    };
    
    notification.onerror = function(e) {
      console.error('通知显示出错:', e);
    };
    
    return notification;
  } catch (error) {
    console.error('显示通知时出错:', error);
    return false;
  }
}; 