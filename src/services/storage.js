/**
 * 本地存储服务，用于LocalStorage操作
 */

const CONFIG_KEY = 'gptImageConfig';

/**
 * 保存配置到LocalStorage
 * @param {Object} config - 配置对象
 */
export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('保存配置到LocalStorage失败:', error);
  }
}

/**
 * 从LocalStorage获取配置
 * @returns {Object|null} - 配置对象或null（如果不存在）
 */
export function getConfig() {
  try {
    const configStr = localStorage.getItem(CONFIG_KEY);
    return configStr ? JSON.parse(configStr) : null;
  } catch (error) {
    console.error('从LocalStorage获取配置失败:', error);
    return null;
  }
}

/**
 * 清除LocalStorage中的配置
 */
export function clearConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error('清除配置失败:', error);
  }
}

/**
 * 简单的API密钥混淆（注意：这不是真正的加密，只是基本的混淆）
 * @param {string} apiKey - 要混淆的API密钥
 * @returns {string} - 混淆后的API密钥
 */
export function obfuscateApiKey(apiKey) {
  // 简单的Base64编码
  return btoa(apiKey);
}

/**
 * 解混淆API密钥
 * @param {string} obfuscatedKey - 混淆后的API密钥
 * @returns {string} - 原始API密钥
 */
export function deobfuscateApiKey(obfuscatedKey) {
  try {
    // 解码Base64
    return atob(obfuscatedKey);
  } catch (error) {
    console.error('解混淆API密钥失败:', error);
    return '';
  }
} 