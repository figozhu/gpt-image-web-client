import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './contexts/ConfigContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { HomeStateProvider } from './contexts/HomeStateContext';
import Home from './pages/Home';
import Settings from './pages/Settings';
import History from './pages/History';

function App() {
  return (
    <ConfigProvider>
      <HistoryProvider>
        <HomeStateProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </BrowserRouter>
        </HomeStateProvider>
      </HistoryProvider>
    </ConfigProvider>
  );
}

export default App; 