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
      ratio
    });
  };
  
  const applyTemplate = (template) => {
    setPrompt(template);
    setShowTemplates(false);
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