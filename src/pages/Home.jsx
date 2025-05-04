import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PromptInput from '../components/PromptInput';
import ImageGrid from '../components/ImageGrid';
import { useConfig } from '../contexts/ConfigContext';
import { useHistory } from '../contexts/HistoryContext';
import { generateBatch } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const { addSession } = useHistory();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentImageBase64Array, setCurrentImageBase64Array] = useState([]);
  const [currentBatchSize, setCurrentBatchSize] = useState(config.batchSize || 4);
  
  // 检查API设置
  const isConfigValid = config.apiEndpoint && config.apiKey;
  
  // 重置错误消息
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // 处理图像生成
  const handleGenerate = async ({ prompt, batchSize, ratio, imageBase64Array }) => {
    // 检查配置
    if (!isConfigValid) {
      setError('请先在设置中配置API端点和API密钥');
      setTimeout(() => navigate('/settings'), 2000);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentPrompt(prompt);
    setCurrentImageBase64Array(imageBase64Array || []);
    setCurrentBatchSize(batchSize);
    
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
      setGeneratedImages(processedImages);
      
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
      
    } catch (err) {
      setError(err.message || '图像生成过程中发生错误');
      console.error('生成错误:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    
    const response = await fetch(finalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
        <h1 className="text-3xl font-bold text-center mb-8">GPT图像生成器</h1>
        
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
        
        <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        
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