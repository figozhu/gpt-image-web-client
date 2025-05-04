import React from 'react';
import Header from '../components/Header';
import HistoryViewer from '../components/HistoryViewer';

const History = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">历史记录</h1>
          <p className="text-gray-600">
            查看和管理您之前生成的所有图像，可按提示词搜索特定记录
          </p>
        </div>
        
        <HistoryViewer />
      </main>
    </div>
  );
};

export default History; 