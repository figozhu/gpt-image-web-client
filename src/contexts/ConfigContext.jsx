import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotificationPermission } from '../services/notification';
import { obfuscateApiKey, deobfuscateApiKey } from '../services/storage';

const defaultConfig = {
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  batchSize: 4,
  useProxy: false,
  proxyUrl: "",
  model: "gpt-4o-image-vip",
  notificationEnabled: true
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
  const updateConfig = (newConfig) => {
    // 确保API密钥已经被混淆
    if (newConfig.apiKey && !newConfig.apiKey.startsWith('••••')) {
      // 检查是否已经是混淆状态的字符串
      let isAlreadyObfuscated = false;
      try {
        // 尝试解码 - 如果能成功解码，可能已经是混淆状态
        deobfuscateApiKey(newConfig.apiKey);
        isAlreadyObfuscated = true;
      } catch (e) {
        // 解码失败，可能是未混淆的原始密钥
        isAlreadyObfuscated = false;
      }
      
      // 只有在确定密钥未混淆时才进行混淆
      if (!isAlreadyObfuscated) {
        newConfig.apiKey = obfuscateApiKey(newConfig.apiKey);
      }
    }
    
    setConfig(newConfig);
    localStorage.setItem('gptImageConfig', JSON.stringify(newConfig));
  };
  
  // 更新通知权限状态
  const updateNotificationPermission = (permission) => {
    setNotificationPermission(permission);
  };
  
  return (
    <ConfigContext.Provider value={{ 
      config, 
      updateConfig, 
      notificationPermission,
      updateNotificationPermission
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext; 