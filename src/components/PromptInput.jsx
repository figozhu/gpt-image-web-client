import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

// 画面尺寸选项
const RATIO_OPTIONS = [
  { value: "", label: "自动" },
  { value: "1:1", label: "正方形 (1:1)" },
  { value: "3:2", label: "横向 (3:2)" },
  { value: "2:3", label: "纵向 (2:3)" }
];

const PromptInput = ({ onGenerate, isLoading, initialPrompt = '', initialBatchSize = 0, showResetButton = false, onReset }) => {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [batchSize, setBatchSize] = useState(initialBatchSize || config.batchSize || 4);
  const [ratio, setRatio] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // 当组件初次挂载时，打印日志
  useEffect(() => {
    console.log('PromptInput组件挂载，初始提示词:', initialPrompt);
  }, []);
  
  // 当初始值变化时更新状态
  useEffect(() => {
    if (initialPrompt !== undefined && initialPrompt !== null) {
      console.log('初始提示词变化:', initialPrompt);
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (initialBatchSize) {
      setBatchSize(initialBatchSize);
    } else if (config.batchSize) {
      setBatchSize(config.batchSize);
    }
  }, [initialBatchSize, config.batchSize]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    onGenerate({
      prompt: prompt.trim(),
      batchSize,
      ratio,
      imageBase64Array: uploadedImages
    });
  };
  
  // 处理输入变化时同时通知父组件
  const handlePromptChange = (e) => {
    const newValue = e.target.value;
    console.log('输入框内容变化:', newValue);
    setPrompt(newValue);
    // 如果父组件提供了更新方法，则调用
    if (onGenerate && typeof onGenerate.updatePrompt === 'function') {
      console.log('调用父组件updatePrompt方法');
      onGenerate.updatePrompt(newValue);
    } else {
      console.log('父组件未提供updatePrompt方法');
    }
  };
  
  // 处理重置按钮点击
  const handleReset = () => {
    if (isLoading || !onReset) return;
    onReset();
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // 限制上传图片数量
    if (uploadedImages.length + files.length > 5) {
      alert('最多上传5张图片');
      return;
    }
    
    files.forEach(file => {
      // 检查文件类型
      const fileType = file.type;
      if (!fileType.match('image.*')) {
        alert('请上传图片文件');
        return;
      }
      
      // 创建文件预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result.split(',')[1];
        setUploadedImages(prev => [...prev, base64String]);
        setImagePreviews(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
    
    // 清除文件输入，使同一个文件可以重复选择
    e.target.value = '';
  };
  
  const clearImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const clearAllImages = () => {
    setUploadedImages([]);
    setImagePreviews([]);
    // 清除文件输入
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
              输入提示词
            </label>
          </div>
          
          <textarea
            id="prompt"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="9"
            placeholder="描述你想要生成的图像，例如：一只在草地上奔跑的金色拉布拉多犬，阳光明媚，背景是蓝天白云"
            value={prompt}
            onChange={handlePromptChange}
            disabled={isLoading}
          />
          
          <div className="flex justify-end text-xs text-gray-500">
            {prompt.length} 个字符
          </div>
        </div>
        
        {/* 图片上传区域 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              上传参考图片 (可选，最多5张)
            </label>
            {uploadedImages.length > 0 && (
              <button
                type="button"
                onClick={clearAllImages}
                className="text-xs text-red-600 hover:text-red-800"
              >
                清除所有图片
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isLoading || uploadedImages.length >= 5}
            />
            <label
              htmlFor="image-upload"
              className={`px-3 py-2 rounded cursor-pointer text-sm flex items-center ${
                uploadedImages.length >= 5 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              选择图片 {uploadedImages.length > 0 ? `(${uploadedImages.length}/5)` : ''}
            </label>
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`上传的图片预览 ${index + 1}`}
                    className="h-24 w-full object-cover rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => clearImage(index)}
                    className="absolute top-1 right-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-1"
                    title="移除此图片"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <label htmlFor="ratio" className="block text-sm font-medium text-gray-700">
            画面尺寸
          </label>
          <select
            id="ratio"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            {RATIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="flex-1 space-y-2 mb-4 md:mb-0">
            <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 flex justify-between">
              <span>并发请求数量:</span>
              <span className="text-blue-600">{batchSize}</span>
            </label>
            <input
              id="batchSize"
              type="range"
              min="1"
              max="4"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>
          
          <div className="flex-none flex space-x-2">
            <button
              type="submit"
              className={`px-6 py-2 rounded-md text-white font-medium ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </span>
              ) : (
                `并发 ${batchSize} 个请求`
              )}
            </button>
            
            {showResetButton && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md flex items-center text-sm transition-colors ${
                  isLoading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="清空所有输入和生成的图像"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置
              </button>
            )}
          </div>
        </div>
        
        {/* 显示每个请求返回图片数量的信息 */}
        {config.imagesPerRequest && config.imagesPerRequest > 1 && (
          <div className="mt-2 px-3 py-2 bg-blue-50 rounded text-sm text-blue-800 border border-blue-100">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                已设置每个请求返回 <strong>{config.imagesPerRequest}</strong> 张图片
                {batchSize > 1 ? `，总共将返回 ${batchSize * config.imagesPerRequest} 张图片` : ''}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              设置中可以修改每个请求返回的图片数量
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PromptInput; 