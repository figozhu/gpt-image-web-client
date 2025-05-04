import React, { createContext, useState, useEffect, useContext } from 'react';
import { initDB, saveSession, getSessions, deleteSession, clearAllSessions, searchSessionsByKeyword } from '../services/db';

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 初始化数据库
  useEffect(() => {
    let isMounted = true;
    
    initDB()
      .then(() => {
        if (isMounted) {
          setDbReady(true);
          loadSessions();
        }
      })
      .catch(error => {
        console.error('Failed to initialize database:', error);
      });
      
    return () => {
      isMounted = false;
    };
  }, []);
  
  // 加载所有会话
  const loadSessions = async () => {
    setLoading(true);
    try {
      const result = await getSessions();
      setSessions(result);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 搜索会话
  const searchSessions = async (query) => {
    setLoading(true);
    try {
      if (!query || query.trim() === '') {
        // 如果查询为空，加载所有会话
        const result = await getSessions();
        setSessions(result);
        return result;
      } else {
        // 搜索匹配的会话，但不更新主sessions状态
        const result = await searchSessionsByKeyword(query);
        // 只更新过滤后的会话状态，返回给组件处理
        return result;
      }
    } catch (error) {
      console.error('Failed to search sessions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // 添加新的会话
  const addSession = async (session) => {
    try {
      await saveSession(session);
      loadSessions(); // 重新加载会话
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };
  
  // 删除会话
  const removeSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      loadSessions(); // 重新加载会话
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };
  
  // 清除所有会话
  const clearSessions = async () => {
    try {
      await clearAllSessions();
      setSessions([]);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  };
  
  return (
    <HistoryContext.Provider 
      value={{ 
        sessions, 
        loading, 
        dbReady, 
        addSession, 
        removeSession, 
        clearSessions, 
        loadSessions,
        searchSessions 
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export default HistoryContext; 