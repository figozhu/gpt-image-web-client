import React, { createContext, useState, useEffect, useContext } from 'react';

const defaultConfig = {
  apiEndpoint: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  batchSize: 4,
  useProxy: false,
  proxyUrl: "",
  model: "gpt-4o-image-vip"
};

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  
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
  }, []);
  
  // 更新配置并保存到LocalStorage
  const updateConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('gptImageConfig', JSON.stringify(newConfig));
  };
  
  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext; 