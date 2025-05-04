/**
 * 生成单张图像
 * @param {string} prompt - 图像提示词
 * @param {string} apiKey - API密钥
 * @param {string} apiEndpoint - API端点
 * @param {boolean} useProxy - 是否使用代理
 * @param {string} proxyUrl - 代理URL
 * @param {string} ratio - 可选的画面尺寸比例（如："1:1", "3:2", "2:3"）
 * @returns {Promise} - API响应
 */
export async function generateImage(prompt, apiKey, apiEndpoint, useProxy, proxyUrl, ratio) {
  const finalEndpoint = useProxy ? `${proxyUrl}${apiEndpoint}` : apiEndpoint;
  
  try {
    // 如果提供了比例，将其添加到提示词内容中
    let content = prompt;
    if (ratio) {
      content = `${prompt}\n画面尺寸：${ratio}`;
    }
    
    const requestBody = {
      model: 'gpt-4o-image-vip',
      messages: [
        {
          content: content,
          role: "user",
        }
      ]
    };
    
    const response = await fetch(finalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误 (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') && !useProxy) {
      throw new Error('跨域请求失败，请尝试启用代理或使用浏览器扩展来解决CORS问题。');
    }
    throw error;
  }
}

/**
 * 生成多张图像（批量请求）
 * @param {string} prompt - 图像提示词
 * @param {number} count - 图像数量
 * @param {string} apiKey - API密钥
 * @param {string} apiEndpoint - API端点
 * @param {boolean} useProxy - 是否使用代理
 * @param {string} proxyUrl - 代理URL
 * @param {string} ratio - 可选的画面尺寸比例
 * @returns {Promise<Array>} - 所有API响应的数组
 */
export async function generateBatch(prompt, count, apiKey, apiEndpoint, useProxy, proxyUrl, ratio) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(generateImage(prompt, apiKey, apiEndpoint, useProxy, proxyUrl, ratio));
  }
  
  return await Promise.allSettled(promises);
}

/**
 * 下载生成的图像
 * @param {string} url - 图像URL
 * @param {string} filename - 保存的文件名
 */
export function downloadImage(url, filename = 'generated-image.png') {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
} 