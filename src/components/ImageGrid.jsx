import React, { useState, useEffect } from 'react';
import { downloadImage } from '../services/api';
import { useConfig } from '../contexts/ConfigContext';
import { CACHE_CONFIG } from '../services/config';
import { showImageCacheNotification } from '../services/notification';

const ImageGrid = ({ images, isLoading, batchSize }) => {
  const [expandedImage, setExpandedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [viewMode, setViewMode] = useState('horizontal');
  const { config } = useConfig();
  
  // 缓存计数
  const [cachedImagesCount, setCachedImagesCount] = useState(0);
  
  // 修改预加载和缓存图片的函数
  const preloadAndCacheImage = (url) => {
    if (!url) return;
    
    // 创建新的Image对象
    const img = new Image();
    
    // 加载完成后缓存图片
    img.onload = () => {
      // 检查是否支持Caches API
      if ('caches' in window) {
        const cacheName = 'image-cache-v1';
        caches.open(cacheName).then(cache => {
          // 检查图片是否已经缓存
          cache.match(url).then(cachedResponse => {
            if (!cachedResponse) {
              // 如果未缓存，则添加到缓存
              fetch(url, { 
                mode: 'no-cors',
                cache: 'force-cache',
                headers: {
                  'Cache-Control': `max-age=${CACHE_CONFIG.IMAGE_CACHE_MAX_AGE}`
                }
              })
              .then(response => {
                if (response) {
                  cache.put(url, response);
                  // 更新缓存计数
                  setCachedImagesCount(prev => prev + 1);
                }
              })
              .catch(() => {
                console.warn('无法缓存图片', url);
              });
            }
          });
        });
      }
    };
    
    // 设置图片来源
    img.crossOrigin = 'anonymous';
    img.src = url;
  };
  
  // 当图片数组变化时预加载
  useEffect(() => {
    if (images && images.length > 0) {
      images.forEach(image => {
        if (image.url) {
          preloadAndCacheImage(image.url);
        }
      });
    }
  }, [images]);
  
  // 当图片加载完成后，显示缓存通知
  useEffect(() => {
    if (cachedImagesCount > 0 && !isLoading) {
      // 延迟显示通知，确保所有图片都尝试缓存
      const timer = setTimeout(() => {
        showImageCacheNotification(cachedImagesCount);
        // 重置计数
        setCachedImagesCount(0);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [cachedImagesCount, isLoading]);
  
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
    setIsComparing(false);
  };

  // 处理图片选择
  const handleSelect = (image, event) => {
    // 如果提供了事件，阻止冒泡，以便不会触发展开
    if (event) {
      event.stopPropagation();
    }
    
    setSelectedImages(prev => {
      // 如果图片已经被选中，则移除它
      if (prev.some(img => img.url === image.url)) {
        return prev.filter(img => img.url !== image.url);
      }
      
      // 如果已经选择了两张图片，替换最早选择的那张
      if (prev.length >= 2) {
        return [...prev.slice(1), image];
      }
      
      // 否则，添加到选择列表
      return [...prev, image];
    });
  };
  
  // 处理图片点击
  const handleImageClick = (image, event) => {
    // 如果是批量选择模式（已经选择了一张图片），则选择该图片而不是展开
    if (selectedImages.length > 0) {
      handleSelect(image, event);
    } else {
      handleExpand(image);
    }
  };

  // 开始图片对比
  const startComparing = () => {
    if (selectedImages.length === 2) {
      setIsComparing(true);
    }
  };
  
  // 在加载中时显示骨架屏
  if (isLoading) {
    // 使用传入的batchSize，如果没有则使用配置值，如果配置也没有则默认为4
    const skeletonCount = batchSize || config.batchSize || 4;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
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
      {/* 对比选择工具栏 */}
      {images.length > 1 && (
        <div className="px-4 py-2 mb-2 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-sm text-gray-700">已选择 {selectedImages.length}/2 张图片进行对比</span>
            </div>
            <div>
              {selectedImages.length === 2 ? (
                <button
                  onClick={startComparing}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  对比选中图片
                </button>
              ) : (
                <button
                  className="px-3 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed text-sm"
                  disabled
                >
                  请选择2张图片
                </button>
              )}
              {selectedImages.length > 0 && (
                <button
                  onClick={() => setSelectedImages([])}
                  className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  清除选择
                </button>
              )}
            </div>
          </div>
          
          {selectedImages.length === 0 && (
            <div className="text-xs text-gray-500 mt-1">
              <p>提示: 点击图片或使用图片上的<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>按钮可以选择图片进行对比。</p>
            </div>
          )}
          
          {selectedImages.length === 1 && (
            <div className="text-xs text-gray-500 mt-1">
              <p>请再选择一张图片完成对比选择。</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {images.map((image, index) => (
          <div 
            key={`image-${index}`}
            className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${
              selectedImages.some(img => img.url === image.url) ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="relative group">
              <img 
                src={image.url} 
                alt={`Generated image ${index + 1}`}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={(e) => handleImageClick(image, e)}
                crossOrigin="anonymous"
                loading="lazy"
                onLoad={() => {
                  // 图片加载完成后尝试缓存
                  preloadAndCacheImage(image.url);
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                }}
              />
              
              {/* 选择指示器 */}
              {selectedImages.some(img => img.url === image.url) && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  {selectedImages.findIndex(img => img.url === image.url) + 1}
                </div>
              )}
              
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
                  <button
                    onClick={(e) => handleSelect(image, e)}
                    className={`bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 ${
                      selectedImages.some(img => img.url === image.url) ? 'bg-blue-100' : ''
                    }`}
                    title={selectedImages.some(img => img.url === image.url) ? "取消选择" : "选择进行对比"}
                  >
                    {selectedImages.some(img => img.url === image.url) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <div className="text-sm text-gray-500">
                生成时间: {image.timestamp ? new Date(image.timestamp).toLocaleString() : '未知'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 单图片查看模态框 */}
      {expandedImage && !isComparing && (
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
              alt="查看大图" 
              className="max-w-full max-h-[80vh] object-contain"
              crossOrigin="anonymous"
              loading="eager"
              onLoad={() => preloadAndCacheImage(expandedImage.url)}
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

      {/* 图片对比模态框 */}
      {isComparing && selectedImages.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={handleClose}>
          <div className="relative w-full h-full max-h-screen p-2" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={handleClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* 视图切换按钮 */}
            <div className="absolute top-2 left-2 z-10 flex space-x-2">
              <button 
                className="text-white bg-black bg-opacity-50 rounded px-3 py-1 text-sm hover:bg-opacity-70"
                onClick={() => setViewMode(viewMode === 'horizontal' ? 'vertical' : 'horizontal')}
              >
                切换视图
              </button>
            </div>
            
            <div className={`h-full flex ${viewMode === 'horizontal' ? 'flex-row' : 'flex-col'} space-x-1 space-y-0 ${viewMode === 'vertical' ? 'space-x-0 space-y-1' : ''}`}>
              <div className={`bg-black bg-opacity-30 p-1 rounded ${viewMode === 'horizontal' ? 'w-1/2' : 'h-1/2'}`}>
                <div className="relative h-full flex flex-col">
                  <div className="absolute top-1 left-1 bg-white bg-opacity-75 text-black px-2 py-0.5 rounded text-xs">
                    图片 1
                  </div>
                  <div className="flex-grow flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedImages[0].url} 
                      alt="比较图片 1" 
                      className="max-w-full max-h-full object-contain"
                      crossOrigin="anonymous"
                      loading="eager"
                      onLoad={() => preloadAndCacheImage(selectedImages[0].url)}
                    />
                  </div>
                  <div className="mt-1 text-center">
                    <button
                      onClick={() => handleDownload(selectedImages[0].url, 'compare-1')}
                      className="bg-white text-gray-800 px-3 py-1 rounded text-xs"
                    >
                      下载
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`bg-black bg-opacity-30 p-1 rounded ${viewMode === 'horizontal' ? 'w-1/2' : 'h-1/2'}`}>
                <div className="relative h-full flex flex-col">
                  <div className="absolute top-1 left-1 bg-white bg-opacity-75 text-black px-2 py-0.5 rounded text-xs">
                    图片 2
                  </div>
                  <div className="flex-grow flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedImages[1].url} 
                      alt="比较图片 2" 
                      className="max-w-full max-h-full object-contain"
                      crossOrigin="anonymous"
                      loading="eager"
                      onLoad={() => preloadAndCacheImage(selectedImages[1].url)}
                    />
                  </div>
                  <div className="mt-1 text-center">
                    <button
                      onClick={() => handleDownload(selectedImages[1].url, 'compare-2')}
                      className="bg-white text-gray-800 px-3 py-1 rounded text-xs"
                    >
                      下载
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGrid; 