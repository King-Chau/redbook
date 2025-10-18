# 小红书文案生成器

## 🌟 项目简介

这是一个基于AI技术的小红书文案生成器，采用小红书官方配色设计，能够根据用户上传的图片智能生成符合小红书风格的优质文案。

## ✨ 核心特性

- 🎨 **小红书官方配色**: 完全模仿小红书的红色系配色方案
- 🤖 **AI智能生成**: 基于Google Gemini AI技术，智能分析图片内容
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🖼️ **多图片上传**: 支持拖拽上传多张图片
- 🎯 **多种风格**: 支持时尚、美食、旅行等10种内容风格
- ⚡ **实时预览**: 提供小红书风格的文案预览效果
- 📋 **一键操作**: 支持文案复制和文件导出
- 🔄 **智能压缩**: 自动优化图片大小，提升加载速度

## 🚀 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

复制 \`.env.example\` 文件为 \`.env.local\`：

\`\`\`bash
cp .env.example .env.local
\`\`\`

在 \`.env.local\` 中配置你的API密钥：

\`\`\`
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

### 3. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 🎨 设计特色

### 小红书风格配色
- **主红色**: #FF2442 (小红书经典红)
- **辅助色**: #FE6B8B (粉红色)
- **强调色**: #FF8E53 (橙红色)
- **背景色**: #FFE0E6 (浅粉色)
- **深色**: #8B1538 (深红色)

### 交互动效
- 悬浮动画效果
- 渐变背景动画
- 平滑过渡动画
- 脉冲提示效果

## 📁 项目结构

\`\`\`
redbook/
├── components/ui/          # UI组件库
│   ├── button.jsx
│   ├── card.jsx
│   ├── input.jsx
│   ├── label.jsx
│   ├── textarea.jsx
│   └── badge.jsx
├── lib/
│   └── utils.js           # 工具函数
├── pages/
│   ├── api/
│   │   └── generate-redbook.js  # API接口
│   ├── _app.js
│   ├── _document.js
│   └── index.js           # 主页面
├── styles/
│   └── globals.css        # 全局样式
├── public/                # 静态资源
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
\`\`\`

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + React 18
- **样式方案**: Tailwind CSS + 自定义小红书主题
- **UI组件**: shadcn/ui (自定义主题)
- **AI服务**: Google Gemini AI
- **图片处理**: browser-image-compression
- **图标库**: Lucide React
- **字体**: Inter (Google Fonts)

## 📖 使用指南

### 1. 上传图片
- 点击上传区域或直接拖拽图片
- 支持JPG、PNG、WEBP格式
- 自动智能压缩，优化加载速度

### 2. 选择风格
- 10种预设风格：时尚、美食、旅行、生活等
- 每种风格都有独特的配色和图标
- 可选填写主题关键词

### 3. 生成文案
- 点击"一键生成精彩文案"按钮
- AI将分析图片内容和风格
- 自动生成符合小红书习惯的文案

### 4. 编辑和导出
- 在文本框中直接编辑文案
- 实时预览小红书效果
- 支持一键复制和文件下载

## 🌈 风格展示

### 时尚风格 👗
专为时尚穿搭、服装展示设计，语言时尚前卫

### 美食风格 🍰  
适合美食分享、餐厅探店，语言生动诱人

### 旅行风格 ✈️
旅游攻略、景点分享专用，充满探索欲望

### 生活风格 🌸
日常生活记录，语言温馨自然

## 🔧 开发指南

### 自定义样式风格

在 \`tailwind.config.js\` 中自定义小红书主题色：

\`\`\`javascript
xiaohongshu: {
  primary: '#FF2442',    // 主红色
  secondary: '#FE6B8B',  // 粉红色  
  accent: '#FF8E53',     // 橙红色
  light: '#FFE0E6',      // 浅粉色背景
  dark: '#8B1538',       // 深红色
}
\`\`\`

### 添加新的内容风格

在 \`pages/index.js\` 中的 \`styles\` 数组添加新风格：

\`\`\`javascript
{ 
  name: '新风格', 
  icon: '🎯', 
  color: 'bg-gradient-to-r from-blue-500 to-purple-500' 
}
\`\`\`

## 📱 移动端适配

项目完全支持移动端访问：
- 响应式布局设计
- 触摸友好的交互
- 移动端优化的上传体验
- 适配小屏幕的界面布局

## 🔒 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| \`GEMINI_API_KEY\` | Google Gemini AI API密钥 | 是 |
| \`NEXTAUTH_URL\` | 应用访问地址 | 否 |

## 📝 更新日志

### v1.0.0 (2024-10-18)
- 🎉 初始版本发布
- ✨ 完整的小红书风格设计
- 🤖 AI文案生成功能
- 📱 响应式设计支持
- 🖼️ 多图片上传功能

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 感谢 [小红书](https://www.xiaohongshu.com) 提供设计灵感
- 感谢 [Google Gemini](https://gemini.google.com) 提供AI技术支持
- 感谢 [Tailwind CSS](https://tailwindcss.com) 和 [shadcn/ui](https://ui.shadcn.com) 提供优秀的UI框架

---

💡 **提示**: 这是一个学习和展示项目，请合理使用AI生成功能，遵守相关平台的使用协议。