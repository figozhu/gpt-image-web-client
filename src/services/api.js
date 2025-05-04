/**
 * 生成单张图像
 * @param {string} prompt - 图像提示词
 * @param {Array<string>} imageBase64Array - 可选的base64编码图片数组
 * @param {string} apiKey - API密钥
 * @param {string} apiEndpoint - API端点
 * @param {boolean} useProxy - 是否使用代理
 * @param {string} proxyUrl - 代理URL
 * @param {string} ratio - 可选的画面尺寸比例（如："1:1", "3:2", "2:3"）
 * @param {string} model - 图像生成模型名称
 * @returns {Promise} - API响应
 */
export async function generateImage(prompt, imageBase64Array, apiKey, apiEndpoint, useProxy, proxyUrl, ratio, model) {
  const finalEndpoint = useProxy ? `${proxyUrl}${apiEndpoint}` : apiEndpoint;
  
  try {
    // 如果提供了比例，将其添加到提示词内容中
    let textContent = prompt;
    if (ratio) {
      textContent = `${prompt}\n画面尺寸：${ratio}`;
    }
    
    // 构建content数组
    const contentArray = [
      {
        type: "text",
        text: textContent
      }
    ];
    
    // 如果提供了图片数组，添加到content数组
    if (imageBase64Array && imageBase64Array.length > 0) {
      imageBase64Array.forEach(imageBase64 => {
        contentArray.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        });
      });
    }
    
    const requestBody = {
      model: model || 'gpt-4o-image-vip',
      messages: [
        {
          role: "user",
          content: contentArray
        }
      ]
    };
    
    // 导入解混淆函数
    const { deobfuscateApiKey } = await import('./storage');
    // 解密API密钥
    const decodedApiKey = deobfuscateApiKey(apiKey);
    
    const response = await fetch(finalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decodedApiKey}`
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
 * 批量生成图像
 * @param {string} prompt - 图像提示词
 * @param {Array<string>} imageBase64Array - 可选的base64编码图片数组
 * @param {number} count - 生成数量
 * @param {string} apiKey - API密钥
 * @param {string} apiEndpoint - API端点
 * @param {boolean} useProxy - 是否使用代理
 * @param {string} proxyUrl - 代理URL
 * @param {string} ratio - 可选的画面尺寸比例
 * @param {string} model - 图像生成模型名称
 * @returns {Promise} - 所有请求的Promise.all结果
 */
export async function generateBatch(prompt, imageBase64Array, count, apiKey, apiEndpoint, useProxy, proxyUrl, ratio, model) {
  // 导入解混淆函数
  const { deobfuscateApiKey } = await import('./storage');
  // 解密API密钥
  const decodedApiKey = deobfuscateApiKey(apiKey);
  
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(generateImage(prompt, imageBase64Array, decodedApiKey, apiEndpoint, useProxy, proxyUrl, ratio, model));
  }
  
  return await Promise.all(promises);
}

/**
 * 下载图像
 * @param {string} url - 图像URL
 * @param {string} filename - 下载文件名
 */
export function downloadImage(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
} 