import React, { useState } from 'react';
import { downloadImage } from '../services/api';

const ImageGrid = ({ images, isLoading }) => {
  const [expandedImage, setExpandedImage] = useState(null);
  
  // 处理图片下载
  const handleDownload = (imageUrl, index) => {
    const filename = `generated-image-${Date.now()}-${index}.png`;
    downloadImage(imageUrl, filename);
  };
  
  // 处理图片展开
  const handleExpand = (image) => {
    setExpandedImage(image);
  };
  
  // 关闭展开的图片
  const handleClose = () => {
    setExpandedImage(null);
  };
  
  // 在加载中时显示骨架屏
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div 
            key={`skeleton-${index}`}
            className="bg-gray-200 rounded-lg overflow-hidden animate-pulse"
            style={{ height: '300px' }}
          />
        ))}
      </div>
    );
  }
  
  // 如果没有图片，显示提示信息
  if (!images || images.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        输入提示词并点击"生成图像"按钮开始创建
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {images.map((image, index) => (
          <div 
            key={`image-${index}`}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="relative group">
              <img 
                src={image.url} 
                alt={`Generated image ${index + 1}`}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => handleExpand(image)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(image.url, index)}
                    className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                    title="下载图片"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleExpand(image)}
                    className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                    title="查看大图"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <div className="text-sm text-gray-500">
                生成时间: {image.responseTime ? new Date(image.responseTime).toLocaleString() : '未知'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 图片查看模态框 */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleClose}>
          <div className="relative max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={handleClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={expandedImage.url} 
              alt="Expanded image" 
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => handleDownload(expandedImage.url, 'expanded')}
                className="bg-white text-gray-800 px-4 py-2 rounded flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>下载图片</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGrid; 