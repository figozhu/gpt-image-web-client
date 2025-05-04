import React from 'react';
import Header from '../components/Header';
import HistoryViewer from '../components/HistoryViewer';

const History = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">历史记录</h1>
        
        <HistoryViewer />
      </main>
    </div>
  );
};

export default History; 