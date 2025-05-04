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
  const [progress, setProgress] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
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
  const handleGenerate = async ({ prompt, batchSize, ratio }) => {
    // 检查配置
    if (!isConfigValid) {
      setError('请先在设置中配置API端点和API密钥');
      setTimeout(() => navigate('/settings'), 2000);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setCurrentPrompt(prompt);
    
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
                config.apiKey,
                config.apiEndpoint,
                config.useProxy,
                config.proxyUrl,
                ratio
              )
            );
          }
          
          const batchResults = await Promise.allSettled(batchPromises);
          results.push(...batchResults);
          
          // 更新进度
          setProgress(Math.floor((results.length / count) * 100));
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
          // 适配新的响应格式
          if (result.value && result.value.choices && result.value.choices.length > 0) {
            hasSuccesses = true;
            const responseTime = new Date();
            const messageContent = result.value.choices[0].message?.content;
            
            if (messageContent) {
              // 提取图像URL，格式可能是Markdown格式: ![image](url)
              const urlMatch = messageContent.match(/!\[.*?\]\((.*?)\)/);
              const imageUrl = urlMatch ? urlMatch[1] : messageContent;
              
              processedImages.push({
                url: imageUrl,
                responseTime: responseTime.toISOString(),
                metadata: result.value
              });
            }
          } else {
            console.error('无效的图像生成响应格式:', result);
          }
        } else {
          console.error('图像生成失败:', result.reason);
        }
      });
      
      // 更新状态
      setGeneratedImages(processedImages);
      
      // 只有当至少有一个成功时才保存会话
      if (hasSuccesses) {
        const session = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: startTime.toISOString(),
          prompt,
          batchSize,
          ratio,
          results: processedImages.map(img => ({
            imageUrl: img.url,
            responseTime: img.responseTime,
            metadata: img.metadata
          }))
        };
        
        addSession(session);
      } else {
        setError('所有图像生成请求都失败了。请检查您的API设置和提示词。');
      }
    } catch (err) {
      console.error('Error generating images:', err);
      setError(`生成图像时出错: ${err.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };
  
  // 辅助函数：调用单个图像生成API
  const generateImage = async (prompt, apiKey, apiEndpoint, useProxy, proxyUrl, ratio) => {
    const finalEndpoint = useProxy ? `${proxyUrl}${apiEndpoint}` : apiEndpoint;
    
    // 如果提供了比例，将其添加到提示词内容中
    let content = prompt;
    if (ratio) {
      content = `${prompt}\n画面尺寸：${ratio}`;
    }
    
    const requestBody = {
      model: 'gpt-4o-image-vip',
      messages: [
        {
          content: content,
          role: "user",
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
            <div className="mb-2 flex justify-between items-center">
              <span className="text-blue-800 text-sm font-medium">正在生成图像...</span>
              <span className="text-blue-800 text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-1">
              提示词: {currentPrompt}
            </p>
          </div>
        )}
        
        <div className="mt-8">
          <ImageGrid images={generatedImages} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default Home; 