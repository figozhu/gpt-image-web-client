import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PromptInput from '../components/PromptInput';
import ImageGrid from '../components/ImageGrid';
import { useConfig } from '../contexts/ConfigContext';
import { useHistory } from '../contexts/HistoryContext';
import { useHomeState } from '../contexts/HomeStateContext';
import { generateBatch } from '../services/api';
import { 
  requestNotificationPermission, 
  showNotification, 
  getNotificationPermission, 
  isNotificationSupported 
} from '../services/notification';
import { getVersionInfo } from '../services/version';

const Home = () => {
  const navigate = useNavigate();
  const { config, updateNotificationPermission } = useConfig();
  const { addSession } = useHistory();
  const { 
    generatedImages, updateGeneratedImages,
    currentPrompt, updateCurrentPrompt,
    currentImageBase64Array, updateImageBase64Array,
    currentBatchSize, updateBatchSize,
    isLoading, updateLoadingState,
    error, updateError,
    resetState
  } = useHomeState();
  
  const [showPermissionBtn, setShowPermissionBtn] = useState(false);
  
  // 检查API设置
  const isConfigValid = config.apiEndpoint && config.apiKey;
  
  // 初始化检查通知权限
  useEffect(() => {
    // 检查通知权限状态
    const checkNotificationPermission = () => {
      const permission = getNotificationPermission();
      // 如果浏览器支持通知且权限状态为默认（未设置）或已被拒绝，显示权限请求按钮
      setShowPermissionBtn(
        isNotificationSupported() && 
        (permission === 'default' || permission === 'denied') && 
        config.notificationEnabled !== false
      );
    };
    
    checkNotificationPermission();
  }, [config.notificationEnabled]);
  
  // 重置错误消息
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        updateError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, updateError]);
  
  // 处理通知权限申请
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    updateNotificationPermission(permission);
    setShowPermissionBtn(permission === 'default');
  };
  
  // 实时更新提示词状态的回调函数
  const updatePromptCallback = useCallback((prompt) => {
    updateCurrentPrompt(prompt);
  }, [updateCurrentPrompt]);
  
  // 处理重置按钮点击
  const handleReset = () => {
    if (isLoading) {
      return; // 在加载状态下不允许重置
    }
    
    // 确认对话框
    if (window.confirm('确定要清空当前所有内容，恢复到初始状态吗？')) {
      resetState();
      // 清除sessionStorage中的状态
      sessionStorage.removeItem('homeState');
    }
  };
  
  // 处理图像生成
  const handleGenerate = async ({ prompt, batchSize, ratio, imageBase64Array }) => {
    // 检查配置
    if (!isConfigValid) {
      updateError('请先在设置中配置API端点和API密钥');
      setTimeout(() => navigate('/settings'), 2000);
      return;
    }
    
    updateLoadingState(true);
    updateError(null);
    updateCurrentPrompt(prompt);
    updateImageBase64Array(imageBase64Array || []);
    updateBatchSize(batchSize);
    
    try {
      // 开始时间
      const startTime = new Date();
      
      // 批量处理函数
      const processInBatches = async (count) => {
        const results = [];
        const batchLimit = 3; // 每批次最多处理的请求数
        const totalBatches = Math.ceil(count / batchLimit);
        
        for (let i = 0; i < totalBatches; i++) {
          const batchStart = i * batchLimit;
          const batchEnd = Math.min(batchStart + batchLimit, count);
          const batchSize = batchEnd - batchStart;
          
          const batchPromises = [];
          for (let j = 0; j < batchSize; j++) {
            batchPromises.push(
              generateImage(
                prompt,
                imageBase64Array,
                config.apiKey,
                config.apiEndpoint,
                config.useProxy,
                config.proxyUrl,
                ratio,
                config.model
              )
            );
          }
          
          const batchResults = await Promise.allSettled(batchPromises);
          results.push(...batchResults);
        }
        
        return results;
      };
      
      // 调用API
      const results = await processInBatches(batchSize);
      
      // 处理结果
      const processedImages = [];
      let hasSuccesses = false;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          
          // 检查API返回的内容格式
          if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            // 提取图像URL (特定于API返回格式)
            // 注意: 这里的逻辑可能需要根据实际API返回格式进行调整
            const imageUrlMatch = data.choices[0].message.content.match(/!\[.*?\]\((.*?)\)/);
            if (imageUrlMatch && imageUrlMatch[1]) {
              const imageUrl = imageUrlMatch[1];
              processedImages.push({
                id: `img-${Date.now()}-${index}`,
                url: imageUrl,
                timestamp: new Date().toISOString(),
                prompt: prompt
              });
              hasSuccesses = true;
            }
          }
        } else {
          console.error(`请求 ${index + 1} 失败:`, result.reason);
        }
      });
      
      // 如果所有请求都失败，显示错误
      if (!hasSuccesses && results.length > 0) {
        const firstError = results.find(r => r.status === 'rejected');
        if (firstError) {
          throw new Error(firstError.reason.message || '所有图像生成请求都失败');
        } else {
          throw new Error('无法从API响应中提取图像URL');
        }
      }
      
      // 更新状态
      updateGeneratedImages(processedImages);
      
      // 计算总耗时
      const endTime = new Date();
      const elapsedTimeMs = endTime - startTime;
      
      // 保存会话到历史记录
      addSession({
        id: `session-${Date.now()}`,
        timestamp: startTime.toISOString(),
        prompt: prompt,
        imageBase64Array: imageBase64Array,
        batchSize: batchSize,
        ratio: ratio,
        model: config.model,
        results: processedImages.map(img => ({
          imageUrl: img.url,
          responseTime: elapsedTimeMs,
          metadata: {}
        }))
      });
      
      // 如果通知功能已启用，显示生成完成通知
      if (config.notificationEnabled !== false && processedImages.length > 0) {
        try {
          console.log('尝试发送通知，当前权限状态:', getNotificationPermission(), '通知功能状态:', config.notificationEnabled);
          
          // 检查页面可见性
          const isPageVisible = document.visibilityState === 'visible';
          console.log('页面是否可见:', isPageVisible);
          
          // 如果页面不可见，那么更需要显示通知
          const shouldShowNotification = !isPageVisible || true; // 无论页面是否可见都显示通知
          
          if (shouldShowNotification) {
            // 再次检查权限状态
            if (getNotificationPermission() === 'granted') {
              const notification = showNotification('图像生成完成', {
                body: `已成功生成 ${processedImages.length} 张图像。`,
                tag: 'image-generation',
                requireInteraction: true,  // 通知会一直显示，直到用户关闭
                renotify: true, // 即使有相同tag的通知，也会再次通知
                silent: false, // 允许声音提醒
                timestamp: Date.now() // 添加时间戳
              });
              
              console.log('通知发送成功:', !!notification);
              
              // 如果通知发送失败，在页面上显示一个提示
              if (!notification) {
                updateError('尝试发送通知失败，请检查浏览器通知设置');
                setTimeout(() => updateError(null), 3000);
              }
            } else {
              console.log('通知权限未授予，当前状态:', getNotificationPermission());
            }
          } else {
            console.log('页面可见，无需显示通知');
          }
        } catch (notificationError) {
          console.error('发送通知时出错:', notificationError);
        }
      } else {
        console.log('未发送通知，通知功能状态:', config.notificationEnabled, '图片数量:', processedImages.length);
      }
      
    } catch (err) {
      updateError(err.message || '图像生成过程中发生错误');
      console.error('生成错误:', err);
    } finally {
      updateLoadingState(false);
    }
  };
  
  // 为handleGenerate增加updatePrompt方法，使其可以被PromptInput使用
  handleGenerate.updatePrompt = updatePromptCallback;
  
  // 辅助函数：调用单个图像生成API
  const generateImage = async (prompt, imageBase64Array, apiKey, apiEndpoint, useProxy, proxyUrl, ratio, model) => {
    const finalEndpoint = useProxy ? `${proxyUrl}${apiEndpoint}` : apiEndpoint;
    
    // 如果提供了比例，将其添加到提示词内容中
    let textContent = prompt;
    if (ratio) {
      textContent = `${prompt}\n画面尺寸：${ratio}`;
    }
    
    // 构建content数组
    const contentArray = [
      {
        type: "text",
        text: textContent
      }
    ];
    
    // 如果提供了图片数组，添加到content数组
    if (imageBase64Array && imageBase64Array.length > 0) {
      imageBase64Array.forEach(imageBase64 => {
        contentArray.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        });
      });
    }
    
    const requestBody = {
      model: model || 'gpt-4o-image-vip',
      messages: [
        {
          role: "user",
          content: contentArray
        }
      ]
    };
    
    // 导入解混淆函数
    const { deobfuscateApiKey } = await import('../services/storage');
    // 解密API密钥
    const decodedApiKey = deobfuscateApiKey(apiKey);
    
    const response = await fetch(finalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decodedApiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误 (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center">
          GPT图像生成器
          <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full shadow-sm transform hover:scale-105 transition-transform duration-300">
            {getVersionInfo().display}
          </span>
        </h1>
        
        <div className="max-w-xl mx-auto mb-6 bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">安全提示</h3>
              <p className="mt-1 text-sm text-green-700">
                本应用采用纯前端实现，使用LocalStorage和IndexedDB本地存储技术，您的API网址和密钥仅保存在您的浏览器中，不会上传到任何服务器。
              </p>
            </div>
          </div>
        </div>
        
        {showPermissionBtn && (
          <div className="max-w-xl mx-auto mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-800 font-medium">
                启用浏览器通知，在图像生成完成时立即收到提醒
              </div>
              <button 
                onClick={handleRequestPermission}
                className="bg-blue-600 text-white py-1 px-4 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getNotificationPermission() === 'denied' ? '重新授予权限' : '允许通知'}
              </button>
            </div>
            {getNotificationPermission() === 'denied' && (
              <p className="text-xs text-red-600">
                您已拒绝通知权限。请在浏览器设置中重新开启通知权限，或点击上方按钮再次尝试。
              </p>
            )}
          </div>
        )}
        
        {!isConfigValid && (
          <div className="max-w-xl mx-auto mb-6 bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm border border-yellow-200">
            您尚未配置API设置。请前往
            <button 
              onClick={() => navigate('/settings')}
              className="text-blue-600 hover:underline ml-1"
            >
              设置页面
            </button>
            完成配置。
          </div>
        )}
        
        {error && (
          <div className="max-w-xl mx-auto mb-6 bg-red-50 p-4 rounded-md text-red-800 text-sm border border-red-200">
            {error}
          </div>
        )}
        
        <PromptInput 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          initialPrompt={currentPrompt} 
          initialBatchSize={currentBatchSize}
          showResetButton={true}
          onReset={handleReset}
        />
        
        {isLoading && (
          <div className="max-w-xl mx-auto mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 text-sm font-medium">正在生成图像...</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-1">
              提示词: {currentPrompt}
            </p>
            {currentImageBase64Array && currentImageBase64Array.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                已上传 {currentImageBase64Array.length} 张参考图片
              </p>
            )}
          </div>
        )}
        
        <div className="mt-8">
          <ImageGrid 
            images={generatedImages} 
            isLoading={isLoading} 
            batchSize={currentBatchSize} 
          />
        </div>
      </main>
    </div>
  );
};

export default Home; 