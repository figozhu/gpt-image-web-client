import React from 'react';
import Header from '../components/Header';
import SettingsForm from '../components/SettingsForm';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">设置</h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">API配置</h2>
            <p className="text-gray-600 mb-6">
              在此页面上配置您的API设置。这些设置将保存在您的浏览器中，不会发送到任何服务器。
            </p>
            
            <SettingsForm />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">关于CORS问题</h2>
            <p className="text-gray-600 mb-4">
              由于浏览器的同源策略，直接从前端调用OpenAI API可能会遇到CORS错误。如果遇到此问题，可以：
            </p>
            
            <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>使用CORS代理</strong> - 启用"使用CORS代理"选项并设置代理URL。
                推荐的公共代理：<code className="bg-gray-100 px-2 py-1 rounded">https://corsproxy.io/?</code>
              </li>
              <li>
                <strong>使用浏览器扩展</strong> - 安装允许跨域请求的浏览器扩展，如"CORS Unblock"。
              </li>
            </ul>
            
            <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800">
              <p className="font-medium">安全提示：</p>
              <p>您的API密钥将保存在浏览器的本地存储中，仅在您的设备上使用。为了安全起见，建议：</p>
              <ul className="list-disc pl-5 mt-2">
                <li>使用具有使用限制和过期时间的API密钥</li>
                <li>不要在公共设备上保存您的API密钥</li>
                <li>定期检查您的API使用情况和账单</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 