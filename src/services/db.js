/**
 * IndexedDB服务，用于存储和管理历史记录
 */

const DB_NAME = 'GPTImageHistory';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

/**
 * 初始化数据库
 * @returns {Promise} - 数据库初始化Promise
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('无法打开数据库：' + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * 获取数据库连接
 * @returns {Promise} - 包含数据库连接的Promise
 */
function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('无法打开数据库：' + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

/**
 * 保存会话到数据库
 * @param {Object} session - 会话对象 
 * @param {string} session.prompt - 提示词
 * @param {string} [session.imageBase64] - 可选的图片base64编码
 * @param {number} session.batchSize - 批量大小
 * @param {string} [session.ratio] - 可选的画面比例
 * @param {Array} session.results - 生成结果
 * @returns {Promise} - 保存操作的Promise
 */
export async function saveSession(session) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // 确保每个会话都有唯一ID和时间戳
    if (!session.id) {
      session.id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!session.timestamp) {
      session.timestamp = new Date().toISOString();
    }
    
    const request = store.put(session);
    
    request.onerror = (event) => {
      reject('保存会话失败：' + event.target.error);
    };
    
    request.onsuccess = () => {
      resolve(session);
    };
  });
}

/**
 * 获取所有会话
 * @returns {Promise<Array>} - 包含所有会话的Promise
 */
export async function getSessions() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev'); // 按时间戳降序排列
    
    const sessions = [];
    
    request.onerror = (event) => {
      reject('获取会话失败：' + event.target.error);
    };
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        sessions.push(cursor.value);
        cursor.continue();
      } else {
        resolve(sessions);
      }
    };
  });
}

/**
 * 获取单个会话
 * @param {string} id - 会话ID
 * @returns {Promise<Object>} - 包含会话的Promise
 */
export async function getSession(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onerror = (event) => {
      reject('获取会话失败：' + event.target.error);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

/**
 * 删除会话
 * @param {string} id - 会话ID
 * @returns {Promise} - 删除操作的Promise
 */
export async function deleteSession(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = (event) => {
      reject('删除会话失败：' + event.target.error);
    };
    
    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * 清空所有会话
 * @returns {Promise} - 清空操作的Promise
 */
export async function clearAllSessions() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onerror = (event) => {
      reject('清空会话失败：' + event.target.error);
    };
    
    request.onsuccess = () => {
      resolve();
    };
  });
} 