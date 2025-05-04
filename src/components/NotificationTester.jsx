import React from 'react';
import { 
  requestNotificationPermission, 
  showNotification, 
  getNotificationPermission, 
  isNotificationSupported 
} from '../services/notification';
import { useConfig } from '../contexts/ConfigContext';

const NotificationTester = () => {
  const { config, updateNotificationPermission } = useConfig();
  
  // 获取通知权限状态显示信息
  const getPermissionStatusText = () => {
    switch (getNotificationPermission()) {
      case 'granted':
        return '已授权';
      case 'denied':
        return '已拒绝';
      case 'default':
        return '未设置';
      case 'unsupported':
        return '浏览器不支持';
      default:
        return '未知状态';
    }
  };
  
  // 获取通知权限状态的颜色类
  const getPermissionStatusColor = () => {
    switch (getNotificationPermission()) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'default':
        return 'text-yellow-600';
      case 'unsupported':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // 请求通知权限
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    updateNotificationPermission(permission);
  };
  
  // 测试发送通知
  const handleTestNotification = () => {
    const notification = showNotification('测试通知', {
      body: '这是一条测试通知，证明通知功能正常工作。',
      requireInteraction: true
    });
    
    if (!notification) {
      alert('发送通知失败，请检查浏览器通知权限设置。');
    }
  };
  
  // 如果浏览器不支持通知功能，或通知功能已被用户禁用，显示相应提示
  if (!isNotificationSupported() || config.notificationEnabled === false) {
    return null;
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">通知状态测试</h3>
      
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-600">当前通知权限状态:</p>
          <p className={`font-medium ${getPermissionStatusColor()}`}>
            {getPermissionStatusText()}
          </p>
        </div>
        
        <div className="space-x-2">
          {getNotificationPermission() !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="bg-blue-600 text-white py-1 px-3 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getNotificationPermission() === 'denied' ? '重新授予权限' : '授予权限'}
            </button>
          )}
          
          {getNotificationPermission() === 'granted' && (
            <button
              onClick={handleTestNotification}
              className="bg-green-600 text-white py-1 px-3 text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              测试通知
            </button>
          )}
        </div>
      </div>
      
      {getNotificationPermission() === 'denied' && (
        <p className="text-xs text-red-600 mt-1">
          您已拒绝通知权限。请在浏览器设置中重新开启通知权限，或点击上方按钮再次尝试。
        </p>
      )}
      
      {getNotificationPermission() === 'default' && (
        <p className="text-xs text-yellow-600 mt-1">
          请点击"授予权限"按钮以启用通知功能，这样在图像生成完成时可以收到提醒。
        </p>
      )}
    </div>
  );
};

export default NotificationTester; 