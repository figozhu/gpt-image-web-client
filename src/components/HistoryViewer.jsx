import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { downloadImage } from '../services/api';

const HistoryViewer = () => {
  const { sessions, removeSession, clearSessions, loading, searchSessions } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const searchTimeoutRef = useRef(null);
  const sessionsPerPage = 5;
  
  // 初始化过滤后的会话列表
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSessions(sessions);
    }
  }, [sessions, searchQuery]);
  
  // 异步搜索处理
  const handleSearch = (value) => {
    setSearchQuery(value);
    setIsSearching(true);
    
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 设置新的定时器
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // 直接处理搜索结果，而不是依赖context中的状态更新
        const results = await searchSessions(value);
        setFilteredSessions(results || []);
      } catch (error) {
        console.error('搜索出错:', error);
        setFilteredSessions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // 计算分页
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  
  // 重置页面当搜索条件变化
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // 处理图片下载
  const handleDownload = (imageUrl, sessionId, index) => {
    const filename = `image-${sessionId.substring(0, 8)}-${index}.png`;
    downloadImage(imageUrl, filename);
  };
  
  // 页面切换
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // 渲染分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-6">
        <nav className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            上一页
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            下一页
          </button>
        </nav>
      </div>
    );
  };
  
  // 显示加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">加载历史记录中...</span>
      </div>
    );
  }
  
  // 如果没有会话且没有搜索查询，显示空状态
  if (sessions.length === 0 && !searchQuery) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">暂无历史记录</div>
        <p className="text-sm text-gray-400">
          当你生成图像时，将在此处显示历史记录
        </p>
      </div>
    );
  }
  
  // 主界面显示 - 即使没有搜索结果也显示
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="搜索提示词..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        {showClearConfirm ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-600">确定要清空所有历史记录吗？</span>
            <button
              onClick={() => {
                clearSessions();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              确定
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            清空历史
          </button>
        )}
      </div>
      
      {/* 没有搜索结果时的提示 */}
      {searchQuery && filteredSessions.length === 0 ? (
        <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-sm">
          <div className="text-gray-500 mb-2">没有找到匹配的结果</div>
          <p className="text-sm text-gray-400">
            尝试使用不同的关键词进行搜索
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {currentSessions.map(session => (
              <div key={session.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium mb-1">{session.prompt}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.timestamp).toLocaleString()} · {session.results.length}张图像
                        {session.ratio && ` · 画面尺寸: ${session.ratio}`}
                      </div>
                      
                      {/* 显示上传的参考图片 */}
                      {session.imageBase64Array && session.imageBase64Array.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm text-gray-500 mb-1">参考图片 ({session.imageBase64Array.length}张)：</div>
                          <div className="flex flex-wrap gap-2">
                            {session.imageBase64Array.map((base64, imgIndex) => (
                              <img 
                                key={imgIndex}
                                src={`data:image/jpeg;base64,${base64}`} 
                                alt={`参考图片 ${imgIndex + 1}`} 
                                className="h-20 w-20 object-cover border border-gray-200 rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 向后兼容，支持旧版的单张图片存储 */}
                      {session.imageBase64 && !session.imageBase64Array && (
                        <div className="mt-3">
                          <div className="text-sm text-gray-500 mb-1">参考图片：</div>
                          <img 
                            src={`data:image/jpeg;base64,${session.imageBase64}`} 
                            alt="参考图片" 
                            className="h-24 object-contain border border-gray-200 rounded"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeSession(session.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="删除此记录"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
                  {session.results.map((result, index) => (
                    <div key={`${session.id}-${index}`} className="relative group">
                      <img 
                        src={result.imageUrl} 
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-40 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iMTIiIHk9IjEyIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDownload(result.imageUrl, session.id, index)}
                          className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                          title="下载图片"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页导航 */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default HistoryViewer; 