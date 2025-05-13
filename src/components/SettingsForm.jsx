import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { deobfuscateApiKey, obfuscateApiKey } from '../services/storage';
import { requestNotificationPermission, isNotificationSupported } from '../services/notification';

const SettingsForm = () => {
  const { config, updateConfig, notificationPermission, updateNotificationPermission } = useConfig();
  
  const [formData, setFormData] = useState({
    apiEndpoint: '',
    apiKey: '',
    batchSize: 1,
    useProxy: false,
    proxyUrl: '',
    model: 'gpt-4o-image-vip',
    notificationEnabled: true,
    imagesPerRequest: 4
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // 加载当前配置到表单
  useEffect(() => {
    setFormData({
      apiEndpoint: config.apiEndpoint || '',
      apiKey: config.apiKey ? (showApiKey ? deobfuscateApiKey(config.apiKey) : '••••••••••••••••') : '',
      batchSize: config.batchSize || 4,
      useProxy: config.useProxy || false,
      proxyUrl: config.proxyUrl || '',
      model: config.model || 'gpt-4o-image-vip',
      notificationEnabled: config.notificationEnabled !== false,
      imagesPerRequest: config.imagesPerRequest || 1
    });
  }, [config, showApiKey]);
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 创建更新后的配置对象
    const updatedConfig = {
      ...config,
      apiEndpoint: formData.apiEndpoint,
      batchSize: formData.batchSize,
      useProxy: formData.useProxy,
      proxyUrl: formData.proxyUrl,
      model: formData.model,
      notificationEnabled: formData.notificationEnabled,
      imagesPerRequest: formData.imagesPerRequest
    };
    
    // 只有当API密钥被修改时才更新它
    if (formData.apiKey && formData.apiKey !== '••••••••••••••••') {
      updatedConfig.apiKey = obfuscateApiKey(formData.apiKey);
    }
    
    // 更新配置
    updateConfig(updatedConfig);
    
    // 显示成功消息
    setSaveStatus('success');
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };
  
  // 处理输入变化
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // 重置表单
  const handleReset = () => {
    setFormData({
      apiEndpoint: config.apiEndpoint || '',
      apiKey: config.apiKey ? '••••••••••••••••' : '',
      batchSize: config.batchSize || 4,
      useProxy: config.useProxy || false,
      proxyUrl: config.proxyUrl || '',
      model: config.model || 'gpt-4o-image-vip',
      notificationEnabled: config.notificationEnabled !== false,
      imagesPerRequest: config.imagesPerRequest || 1
    });
    setShowApiKey(false);
  };
  
  // 请求通知权限
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    updateNotificationPermission(permission);
  };
  
  // 获取通知权限状态显示信息
  const getPermissionStatusText = () => {
    switch (notificationPermission) {
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
    switch (notificationPermission) {
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
  
  // 判断是否可以请求权限
  const canRequestPermission = () => {
    return isNotificationSupported() && notificationPermission !== 'granted';
  };
  
  // 处理显示/隐藏API密钥
  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-2">
          <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700">
            API端点
          </label>
          <input
            type="text"
            id="apiEndpoint"
            name="apiEndpoint"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如: https://api.openai.com/v1/images/generations"
            value={formData.apiEndpoint}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API密钥
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              name="apiKey"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="你的API密钥"
              value={formData.apiKey}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={toggleApiKeyVisibility}
            >
              {showApiKey ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            此API密钥将保存在您的浏览器中，仅在您的设备上使用。
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">
            模型名称
          </label>
          <input
            type="text"
            id="model"
            name="model"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如: gpt-4o-image-vip"
            value={formData.model}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-gray-500">
            输入支持图像生成的模型名称，默认为 gpt-4o-image-vip
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700">
            默认并发请求数量: {formData.batchSize}
          </label>
          <input
            type="range"
            id="batchSize"
            name="batchSize"
            min="1"
            max="4"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            value={formData.batchSize}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            每个请求返回图片数量
          </label>
          <div className="flex space-x-2">
            {[1, 2, 4].map(num => (
              <button
                key={num}
                type="button"
                className={`px-4 py-2 rounded ${
                  formData.imagesPerRequest === num 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, imagesPerRequest: num }))}
              >
                {num}张
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            每个API请求返回的图片数量。使用gpt-4o-image-vip模型时，更多图片不会增加API费用。
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useProxy"
              name="useProxy"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.useProxy}
              onChange={handleChange}
            />
            <label htmlFor="useProxy" className="ml-2 block text-sm text-gray-700">
              使用CORS代理
            </label>
          </div>
          
          {formData.useProxy && (
            <div className="space-y-2">
              <label htmlFor="proxyUrl" className="block text-sm font-medium text-gray-700">
                代理URL
              </label>
              <input
                type="text"
                id="proxyUrl"
                name="proxyUrl"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: https://corsproxy.io/?"
                value={formData.proxyUrl}
                onChange={handleChange}
                required={formData.useProxy}
              />
              <p className="text-xs text-gray-500">
                代理URL将用于解决CORS限制问题。您可以使用免费的公共CORS代理服务。
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-md font-medium text-gray-700">通知设置</h3>
          
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="notificationEnabled"
              name="notificationEnabled"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.notificationEnabled}
              onChange={handleChange}
              disabled={!isNotificationSupported()}
            />
            <label htmlFor="notificationEnabled" className="ml-2 block text-sm text-gray-700">
              启用浏览器通知（图像生成完成后通知）
            </label>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <div>
              <p className="text-sm text-gray-700">当前通知权限状态:</p>
              <p className={`font-medium ${getPermissionStatusColor()}`}>
                {getPermissionStatusText()}
              </p>
            </div>
            
            {canRequestPermission() && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="bg-blue-600 text-white py-1 px-3 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                申请通知权限
              </button>
            )}
          </div>
          
          {!isNotificationSupported() && (
            <p className="text-xs text-red-500">
              您的浏览器不支持通知功能。请使用支持Web通知API的现代浏览器。
            </p>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            保存设置
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            重置
          </button>
        </div>
        
        {saveStatus === 'success' && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            设置已成功保存。
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsForm; 