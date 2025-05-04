import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

// 预设提示模板
const PROMPT_TEMPLATES = [
  {
    name: '写实风格',
    template: '一张写实风格的照片，展示'
  },
  {
    name: '动漫风格',
    template: '一张日本动漫风格的插图，展示'
  },
  {
    name: '水彩画',
    template: '一幅精美的水彩画，描绘'
  },
  {
    name: '3D渲染',
    template: '一张高质量的3D渲染图，展示'
  }
];

// 画面尺寸选项
const RATIO_OPTIONS = [
  { value: "", label: "自动" },
  { value: "1:1", label: "正方形 (1:1)" },
  { value: "3:2", label: "横向 (3:2)" },
  { value: "2:3", label: "纵向 (2:3)" }
];

const PromptInput = ({ onGenerate, isLoading }) => {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState('');
  const [batchSize, setBatchSize] = useState(config.batchSize || 4);
  const [showTemplates, setShowTemplates] = useState(false);
  const [ratio, setRatio] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // 当配置更改时更新batchSize
  useEffect(() => {
    if (config.batchSize) {
      setBatchSize(config.batchSize);
    }
  }, [config.batchSize]);
  
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
  
  const applyTemplate = (template) => {
    setPrompt(template);
    setShowTemplates(false);
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
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showTemplates ? '隐藏模板' : '使用模板'}
            </button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {PROMPT_TEMPLATES.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-left text-sm bg-gray-100 hover:bg-gray-200 p-2 rounded truncate"
                  onClick={() => applyTemplate(item.template)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
          
          <textarea
            id="prompt"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="描述你想要生成的图像，例如：一只在草地上奔跑的金色拉布拉多犬，阳光明媚，背景是蓝天白云"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
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
              <span>批量生成数量:</span>
              <span className="text-blue-600">{batchSize}</span>
            </label>
            <input
              id="batchSize"
              type="range"
              min="1"
              max="10"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          
          <div className="flex-none">
            <button
              type="submit"
              className={`w-full md:w-auto px-6 py-2 rounded-md text-white font-medium ${
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
                `生成 ${batchSize} 张图像`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptInput; 