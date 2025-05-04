import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">GPT图像生成器</div>
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