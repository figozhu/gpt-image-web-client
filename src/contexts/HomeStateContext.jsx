import React, { createContext, useState, useContext, useEffect } from 'react';

const HomeStateContext = createContext();

export const useHomeState = () => useContext(HomeStateContext);

export const HomeStateProvider = ({ children }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentImageBase64Array, setCurrentImageBase64Array] = useState([]);
  const [currentBatchSize, setCurrentBatchSize] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 记录HomeStateContext的初始化
  useEffect(() => {
    console.log('HomeStateContext初始化');
    return () => {
      console.log('HomeStateContext卸载');
    };
  }, []);

  // 监听currentPrompt变化
  useEffect(() => {
    console.log('HomeStateContext中currentPrompt更新:', currentPrompt);
  }, [currentPrompt]);

  // 更新生成的图片
  const updateGeneratedImages = (images) => {
    console.log('更新generatedImages:', images.length, '张图片');
    setGeneratedImages(images);
  };

  // 更新当前prompt
  const updateCurrentPrompt = (prompt) => {
    console.log('更新currentPrompt:', prompt);
    setCurrentPrompt(prompt);
  };

  // 更新上传的图片数组
  const updateImageBase64Array = (imageArray) => {
    console.log('更新imageBase64Array:', imageArray.length, '张图片');
    setCurrentImageBase64Array(imageArray);
  };

  // 更新批量生成数量
  const updateBatchSize = (size) => {
    console.log('更新batchSize:', size);
    setCurrentBatchSize(size);
  };

  // 更新加载状态
  const updateLoadingState = (loading) => {
    console.log('更新isLoading:', loading);
    setIsLoading(loading);
  };

  // 更新错误信息
  const updateError = (errorMsg) => {
    console.log('更新error:', errorMsg);
    setError(errorMsg);
  };

  // 重置所有状态
  const resetState = () => {
    console.log('重置HomeStateContext');
    setGeneratedImages([]);
    setCurrentPrompt('');
    setCurrentImageBase64Array([]);
    setCurrentBatchSize(4);
    setIsLoading(false);
    setError(null);
  };

  // 将状态数据保存到sessionStorage以防页面刷新
  useEffect(() => {
    try {
      const stateData = {
        currentPrompt,
        currentBatchSize,
        // 不保存图片和生成结果，因为可能太大
      };
      sessionStorage.setItem('homeState', JSON.stringify(stateData));
      console.log('状态已保存到sessionStorage');
    } catch (error) {
      console.error('保存状态到sessionStorage时出错:', error);
    }
  }, [currentPrompt, currentBatchSize]);

  // 从sessionStorage恢复状态
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('homeState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log('从sessionStorage恢复状态:', parsedState);
        
        if (parsedState.currentPrompt && currentPrompt === '') {
          setCurrentPrompt(parsedState.currentPrompt);
        }
        
        if (parsedState.currentBatchSize) {
          setCurrentBatchSize(parsedState.currentBatchSize);
        }
      }
    } catch (error) {
      console.error('从sessionStorage恢复状态时出错:', error);
    }
  }, []);

  return (
    <HomeStateContext.Provider
      value={{
        generatedImages,
        currentPrompt,
        currentImageBase64Array,
        currentBatchSize,
        isLoading,
        error,
        updateGeneratedImages,
        updateCurrentPrompt,
        updateImageBase64Array,
        updateBatchSize,
        updateLoadingState,
        updateError,
        resetState
      }}
    >
      {children}
    </HomeStateContext.Provider>
  );
};

export default HomeStateContext; 