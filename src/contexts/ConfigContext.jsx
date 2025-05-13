import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getNotificationPermission } from '../services/notification';
import { obfuscateApiKey, deobfuscateApiKey } from '../services/storage';

const defaultConfig = {
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  batchSize: 4,
  useProxy: false,
  proxyUrl: "",
  model: "gpt-4o-image-vip",
  notificationEnabled: true,
  imagesPerRequest: 1
};

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  // 首次加载时从LocalStorage获取配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('gptImageConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse config from localStorage:', error);
      }
    }
    
    // 获取当前通知权限状态
    setNotificationPermission(getNotificationPermission());
  }, []);
  
  // 更新配置并保存到LocalStorage
  const updateConfig = useCallback((updates) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig, ...updates };
      localStorage.setItem('gptImageConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);
  
  // 更新通知权限状态
  const updateNotificationPermission = (permission) => {
    setNotificationPermission(permission);
  };
  
  // 更新每个请求返回的图片数量
  const updateImagesPerRequest = useCallback((count) => {
    updateConfig({ imagesPerRequest: count });
  }, [updateConfig]);
  
  return (
    <ConfigContext.Provider value={{ 
      config, 
      updateConfig, 
      notificationPermission,
      updateNotificationPermission,
      updateImagesPerRequest
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext; 