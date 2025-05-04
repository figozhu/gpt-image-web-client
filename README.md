# GPT图像生成网页客户端

这是一个纯前端的GPT图像生成应用，允许用户通过调用GPT API来生成图像。

## 特点

- 可配置API地址和API密钥（保存在LocalStorage中）
- 支持同时使用同一个prompt发送多个请求，并自动适配界面显示
- 使用IndexedDB保存会话记录，便于用户查看历史生成结果
- 纯前端实现，无需后端服务

## 技术栈

- **前端框架**: React 
- **UI组件库**: Tailwind CSS
- **状态管理**: React Context API
- **客户端存储**: 
  - LocalStorage (API配置)
  - IndexedDB (会话历史)
- **构建工具**: Vite

## 开始使用

1. 克隆仓库:
   ```
   git clone https://github.com/yourusername/gpt-image-web-client.git
   cd gpt-image-web-client
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 启动开发服务器:
   ```
   npm run dev
   ```

4. 构建生产版本:
   ```
   npm run build
   ```

## 使用说明

1. 首次使用需要在设置页面配置API端点和API密钥
2. 在首页输入提示词并选择生成数量
3. 点击"生成图像"按钮开始创建
4. 生成的图像可以直接下载
5. 历史记录页面可查看和管理之前生成的结果

## CORS问题解决方案

由于浏览器的同源策略限制，直接从前端调用某些API服务可能会遇到CORS错误。解决方案包括：

1. 使用CORS代理（在设置中配置）
2. 安装允许跨域请求的浏览器扩展

## 🌐 One-Click Deploy to Cloudflare Pages

Want to host your own version?

Click the button below to instantly deploy this project to [Cloudflare Pages](https://pages.cloudflare.com/).  
You’ll need to log in with your GitHub and Cloudflare accounts:

[![Deploy to Cloudflare](https://deploy.cloudflare.com/button.svg)](https://deploy.cloudflare.com/?repository=https://github.com/figozhu/gpt-image-web-client)

