# MindStream AI 服务配置

## 环境变量配置

复制 `.env.example` 为 `.env.local` 并配置以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API (可选)
OPENAI_API_KEY=your_openai_api_key

# Google Gemini API (可选)
GOOGLE_API_KEY=your_google_api_key

# Anthropic Claude API (可选)
ANTHROPIC_API_KEY=your_anthropic_api_key

# DeepSeek API (可选)
DEEPSEEK_API_KEY=your_deepseek_api_key

# 智谱AI API (可选)
ZHIPU_API_KEY=your_zhipu_api_key

# Moonshot AI API (可选)
MOONSHOT_API_KEY=your_moonshot_api_key
```

## 支持的AI服务

### 🆓 免费服务

#### 1. 浏览器语音识别
- **服务**: Web Speech API
- **功能**: 语音转文字
- **费用**: 完全免费
- **配置**: 无需API密钥
- **限制**: 需要现代浏览器支持

#### 2. Google Gemini
- **服务**: Google AI Studio
- **功能**: 文本生成
- **费用**: 免费额度（每分钟60次请求）
- **获取API密钥**: https://ai.google.dev
- **模型**: 
  - Gemini Pro (免费)
  - Gemini Pro Vision (免费)

#### 3. Ollama (本地部署)
- **服务**: 本地AI模型
- **功能**: 文本生成
- **费用**: 完全免费
- **配置**: 需要本地安装Ollama
- **安装**: https://ollama.ai
- **支持模型**: Llama 2, Mistral, Qwen等

### 💰 付费服务

#### 1. OpenAI
- **服务**: OpenAI API
- **功能**: 语音转文字 + 文本生成
- **获取API密钥**: https://platform.openai.com
- **模型**:
  - Whisper (语音): $0.006/分钟
  - GPT-3.5 Turbo: $0.0005/1K tokens
  - GPT-4: $0.03/1K tokens
  - GPT-4 Turbo: $0.01/1K tokens

#### 2. Anthropic Claude
- **服务**: Anthropic API
- **功能**: 文本生成
- **获取API密钥**: https://console.anthropic.com
- **模型**:
  - Claude 3 Haiku: $0.00025/1K tokens
  - Claude 3 Sonnet: $0.003/1K tokens
  - Claude 3 Opus: $0.015/1K tokens

#### 3. DeepSeek
- **服务**: DeepSeek API
- **功能**: 文本生成
- **获取API密钥**: https://platform.deepseek.com
- **模型**:
  - DeepSeek Chat: $0.00014/1K tokens
  - DeepSeek Coder: $0.00014/1K tokens

#### 4. 智谱AI (GLM)
- **服务**: 智谱AI开放平台
- **功能**: 文本生成
- **获取API密钥**: https://open.bigmodel.cn
- **模型**:
  - GLM-4: ¥0.1/1K tokens
  - GLM-3 Turbo: ¥0.005/1K tokens

#### 5. Moonshot AI (Kimi)
- **服务**: 月之暗面API
- **功能**: 文本生成
- **获取API密钥**: https://platform.moonshot.cn
- **模型**:
  - Moonshot v1 8K: ¥0.012/1K tokens
  - Moonshot v1 32K: ¥0.024/1K tokens
  - Moonshot v1 128K: ¥0.0506/1K tokens

## 推荐配置

### 完全免费方案
```
语音识别: 浏览器语音识别
文本生成: Google Gemini Pro
```

### 性价比方案
```
语音识别: 浏览器语音识别
文本生成: DeepSeek Chat
```

### 高质量方案
```
语音识别: OpenAI Whisper
文本生成: Claude 3 Sonnet
```

### 本地部署方案
```
语音识别: 浏览器语音识别
文本生成: Ollama (Qwen)
```

## 配置步骤

1. **选择服务**: 在应用设置中选择你想要的AI服务提供商
2. **配置API密钥**: 在API密钥页面输入相应的密钥
3. **选择模型**: 为语音识别和文本生成分别选择合适的模型
4. **测试功能**: 尝试语音输入或文字输入来测试配置

## 注意事项

- 免费服务可能有使用限制和速率限制
- API密钥会加密存储在数据库中
- 建议先使用免费服务测试功能
- 付费服务按实际使用量计费，请注意控制成本
- 本地部署需要一定的技术能力和硬件资源