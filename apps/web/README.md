# MindStream - AI规划助手

> 倾倒你的思绪，我们来理清脉络

## 📖 项目简介

MindStream 是一款专为神经多样性（特别是ADHD）人群设计的AI规划应用。它旨在解决用户在任务启动、时间管理（时间盲视）和任务执行方面的核心痛点。应用的核心功能是将用户凌乱、发散的语音或文本"想法流" (Brain Dump)，通过AI自动转化为结构清晰、可执行的待办事项列表，并附带预估时间和建议的子任务。

## 🎯 核心价值主张

**"倾倒你的思绪，我们来理清脉络，让你轻松开始。"**

## 👥 目标用户

- 患有ADHD、自闭症谱系或其他执行功能障碍的成年人
- 学生和专业人士
- 任何需要帮助整理思绪和管理任务的用户

## ✨ 核心功能

### 🎤 语音输入
- 大型醒目的麦克风按钮，一键开始录音
- 实时录音动画和计时器
- 支持语音转文字功能

### 🤖 AI智能处理
- 语音转文字识别
- 自动结构化任务生成
- 智能预估时间和分解子任务
- 自动分类和标签

### 📝 任务管理
- 可展开的任务卡片设计
- 子任务进度跟踪
- 任务完成状态管理
- 直观的进度条显示

### 🎯 专注模式
- 全屏沉浸式专注体验
- 可视化计时器（彩色圆环）
- 暂停、开始、完成功能
- 子任务逐步完成引导

### 🎉 庆祝反馈
- 任务完成时的庆祝动画
- 震动反馈（支持的设备）
- 正向多巴胺奖励机制

### ⚙️ 个性化设置
- **多AI服务支持**: 8+种AI提供商可选，包含免费和付费选项
- **灵活配置**: 语音识别和文本生成可独立选择不同服务商
- **安全管理**: API密钥加密存储，支持查看/隐藏/删除
- **个性化**: 主题切换、语言设置、默认分类配置
- **账户管理**: 完整的登录/退出功能

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 16 (React 19)
- **样式**: Tailwind CSS 4
- **UI组件**: Radix UI
- **状态管理**: React Context + Zustand
- **图标**: Lucide React
- **通知**: React Hot Toast

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **实时同步**: Supabase Realtime
- **AI服务**: 多提供商支持（OpenAI、Anthropic、Google Gemini、DeepSeek、智谱AI、Moonshot、浏览器语音API、Ollama本地模型等）

### 核心库
- **语音处理**: Web Audio API
- **AI集成**: OpenAI SDK
- **类型安全**: TypeScript

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router页面
│   ├── dashboard/         # 仪表板页面
│   ├── focus/            # 专注模式页面
│   ├── input/            # 主输入页面
│   ├── login/            # 登录页面
│   ├── result/           # 结果展示页面
│   └── settings/         # 设置页面
├── components/            # 可复用组件
│   ├── ui/               # UI基础组件
│   ├── AuthProvider.tsx  # 认证提供者
│   └── GlobalNotifications.tsx # 全局通知
├── contexts/             # React Context
│   └── AppContext.tsx    # 应用全局状态
├── lib/                  # 工具库和服务
│   ├── aiProviders.ts    # AI服务提供商配置
│   ├── audioRecorder.ts  # 音频录制
│   ├── speechService.ts  # 语音服务
│   ├── taskService.ts    # 任务管理服务
│   └── supabaseClient.ts # Supabase客户端
└── types/                # TypeScript类型定义
    └── index.ts          # 核心类型
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 环境配置
创建 `.env.local` 文件并配置以下环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意**: AI服务的API密钥通过应用内设置页面进行配置，支持多种AI服务提供商：
- **OpenAI**: GPT-4、GPT-3.5、Whisper语音识别
- **Anthropic**: Claude 3系列模型
- **Google**: Gemini Pro（免费）
- **DeepSeek**: 高性价比国产模型
- **智谱AI**: GLM系列中文优化模型
- **Moonshot**: 超长上下文Kimi模型
- **浏览器语音API**: 免费的本地语音识别
- **Ollama**: 本地运行的开源模型（完全免费）

### 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看应用。

## 🎨 设计原则

### 低认知负荷 (Low Cognitive Load)
- 界面极简，无干扰元素
- 一次只专注于一件事

### 零摩擦输入 (Frictionless Input)
- 将想法记录下来的过程必须比忘记它更快、更容易
- 语音优先设计

### 宽容与灵活 (Forgiving & Flexible)
- AI的建议是"草稿"而非"圣旨"，用户可以轻松修改
- 没有"失败"状态，只有"下一步"

### 视觉化与具象化 (Visual & Tangible)
- 将抽象的时间和任务进度变得可见
- 使用进度条、倒计时圈等可视化元素

### 即时正反馈 (Instant Dopamine Hits)
- 每完成一个小步骤都有积极的、令人愉悦的反馈
- 庆祝动画、震动反馈等多巴胺奖励

## 🔄 核心用户流程

1. **倾倒 (Dump)**: 用户打开App，点击麦克风按钮，倾诉所有脑子里的事
2. **处理 (Process)**: AI在后台处理：语音转文字 → 文本结构化 → 生成任务
3. **审阅 (Review)**: AI以卡片列表形式呈现整理好的计划草案，用户可编辑
4. **执行 (Execute)**: 接受后的任务进入"待办"视图，可启动专注模式
5. **完成 (Complete)**: 完成任务后触发庆祝动画，提供正向反馈

## 🛠️ 主要特性

### 🎯 专注模式
- 全屏沉浸式体验
- 可视化计时器（彩色圆环进度）
- 支持暂停、继续、提前完成
- 子任务逐步完成引导

### 🎉 庆祝反馈系统
- 任务完成时的弹出式庆祝动画
- 设备震动反馈（如果支持）
- 正向的多巴胺奖励体验

### 🔧 灵活的AI配置
- 支持8+种AI服务提供商（OpenAI、Anthropic、Google、DeepSeek等）
- 免费选项：Google Gemini、浏览器语音API、Ollama本地模型
- 用户可在设置中自由选择和配置AI服务
- 安全的API密钥加密存储
- 支持语音识别和文本生成的独立配置

### 📱 响应式设计
- 移动端优先设计
- 适配各种屏幕尺寸
- 触摸友好的交互设计

## 🔐 安全性

- 使用Supabase进行安全的用户认证
- API密钥加密存储
- 行级安全策略(RLS)保护用户数据
- HTTPS加密传输

## 🚧 开发状态

当前版本: **v1.0.0**

### ✅ 已完成功能
- [x] 用户认证系统
- [x] 语音输入和转文字
- [x] AI任务生成和结构化
- [x] 任务管理和进度跟踪
- [x] 专注模式
- [x] 庆祝反馈系统
- [x] 设置和配置管理
- [x] 响应式设计

### 🔄 计划中功能 (v1.1)
- [ ] 手写识别输入
- [ ] 日历集成
- [ ] 高级分析和统计
- [ ] 社交/互助功能
- [ ] 番茄工作法集成

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 项目仓库: [GitHub](https://github.com/your-username/mindstream)
- 邮箱: your-email@example.com

---

**MindStream** - 让思绪变得清晰，让行动变得简单。