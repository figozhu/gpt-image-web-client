import React, { useState } from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { downloadImage } from '../services/api';

const HistoryViewer = () => {
  const { sessions, removeSession, clearSessions } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // 过滤会话
  const filteredSessions = sessions.filter(session => 
    session.prompt && session.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 处理图片下载
  const handleDownload = (imageUrl, sessionId, index) => {
    const filename = `image-${sessionId.substring(0, 8)}-${index}.png`;
    downloadImage(imageUrl, filename);
  };
  
  // 如果没有会话，显示空状态
  if (sessions.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">暂无历史记录</div>
        <p className="text-sm text-gray-400">
          当你生成图像时，将在此处显示历史记录
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="搜索提示词..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
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
      
      <div className="space-y-8">
        {filteredSessions.map(session => (
          <div key={session.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <div className="font-medium">{session.prompt}</div>
                <div className="text-sm text-gray-500">
                  {new Date(session.timestamp).toLocaleString()} · {session.results.length}张图像
                  {session.ratio && ` · 画面尺寸: ${session.ratio}`}
                </div>
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
      
      {filteredSessions.length === 0 && searchQuery && (
        <div className="text-center p-8 text-gray-500">
          没有找到匹配的历史记录
        </div>
      )}
    </div>
  );
};

export default HistoryViewer; 