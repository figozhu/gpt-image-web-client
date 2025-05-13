/**
 * 项目版本配置文件
 */

// 从package.json获取的应用版本号
export const APP_VERSION = '1.2.1';

// 版本号发布日期
export const VERSION_DATE = '2025-05-13';

// 获取格式化显示的版本信息
export function getVersionInfo() {
  return {
    version: APP_VERSION,
    date: VERSION_DATE,
    display: `v${APP_VERSION}`
  };
}

// 检查版本更新
export async function checkForUpdates() {
  // 这里可以添加版本检查逻辑，如果有远程API
  // 当前是一个前端应用，所以只返回null表示没有更新
  return null;
}

export default {
  APP_VERSION,
  VERSION_DATE,
  getVersionInfo,
  checkForUpdates
}; 