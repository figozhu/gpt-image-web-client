import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getVersionInfo } from '../services/version';

const Header = () => {
  const location = useLocation();
  const { display: versionDisplay } = getVersionInfo();
  
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold flex items-center">
          GPT图像生成器
          <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded-full text-blue-300">
            {versionDisplay}
          </span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/" 
                className={`hover:text-blue-300 transition-colors ${
                  location.pathname === '/' ? 'text-blue-300 font-semibold' : ''
                }`}
              >
                首页
              </Link>
            </li>
            <li>
              <Link 
                to="/history" 
                className={`hover:text-blue-300 transition-colors ${
                  location.pathname === '/history' ? 'text-blue-300 font-semibold' : ''
                }`}
              >
                历史记录
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={`hover:text-blue-300 transition-colors ${
                  location.pathname === '/settings' ? 'text-blue-300 font-semibold' : ''
                }`}
              >
                设置
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 