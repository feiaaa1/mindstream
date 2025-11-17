// AI服务提供商配置
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  supportsSpeech: boolean;
  supportsText: boolean;
  models: AIModel[];
  apiKeyRequired: boolean;
  website?: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'speech' | 'text';
  maxTokens?: number;
  costPer1k?: number; // 每1k tokens的成本（美分）
}

// 支持的AI服务提供商
export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: '最流行的AI服务，包括GPT和Whisper',
    isFree: false,
    supportsSpeech: true,
    supportsText: true,
    apiKeyRequired: true,
    website: 'https://openai.com',
    models: [
      {
        id: 'whisper-1',
        name: 'Whisper',
        description: '语音转文字模型',
        type: 'speech',
        costPer1k: 0.6
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '快速且经济的文本生成模型',
        type: 'text',
        maxTokens: 4096,
        costPer1k: 0.5
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: '最强大的文本生成模型',
        type: 'text',
        maxTokens: 8192,
        costPer1k: 3.0
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: '更快的GPT-4版本',
        type: 'text',
        maxTokens: 128000,
        costPer1k: 1.0
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude系列模型，擅长对话和分析',
    isFree: false,
    supportsSpeech: false,
    supportsText: true,
    apiKeyRequired: true,
    website: 'https://anthropic.com',
    models: [
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: '快速且经济的模型',
        type: 'text',
        maxTokens: 200000,
        costPer1k: 0.25
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: '平衡性能和成本',
        type: 'text',
        maxTokens: 200000,
        costPer1k: 3.0
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: '最强大的Claude模型',
        type: 'text',
        maxTokens: 200000,
        costPer1k: 15.0
      }
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Google的多模态AI模型',
    isFree: true,
    supportsSpeech: false,
    supportsText: true,
    apiKeyRequired: true,
    website: 'https://ai.google.dev',
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: '免费的高性能文本模型',
        type: 'text',
        maxTokens: 32768,
        costPer1k: 0
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: '支持图像的多模态模型',
        type: 'text',
        maxTokens: 16384,
        costPer1k: 0
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: '国产优秀AI模型，性价比极高',
    isFree: false,
    supportsSpeech: false,
    supportsText: true,
    apiKeyRequired: true,
    website: 'https://deepseek.com',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: '对话优化模型',
        type: 'text',
        maxTokens: 32768,
        costPer1k: 0.14
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        description: '代码生成专用模型',
        type: 'text',
        maxTokens: 16384,
        costPer1k: 0.14
      }
    ]
  },
  {
    id: 'zhipu',
    name: '智谱AI (GLM)',
    description: '清华系AI公司，中文能力强',
    isFree: false,
    supportsSpeech: false,
    supportsText: true,
    apiKeyRequired: true,
    website: 'https://zhipuai.cn',
    models: [
      {
        id: 'glm-4',
        name: 'GLM-4',
        description: '最新一代GLM模型',
        type: 'text',
        maxTokens: 128000,
        costPer1k: 10.0
      },
      {
        id: 'glm-3-turbo',
        name: 'GLM-3 Turbo',
        description: '快速版GLM模型',
        type: 'text',
        maxTokens: 128000,
        costPer1k: 0.5
      }
    ]
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI (Kimi)',
    description: '月之暗面，超长上下文模型',
    isFree: false,
    supportsSpeech: false,
    supportsText: true,
    apiKeyRequired: true,
    website: 'https://moonshot.cn',
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'Moonshot v1 8K',
        description: '8K上下文模型',
        type: 'text',
        maxTokens: 8192,
        costPer1k: 1.2
      },
      {
        id: 'moonshot-v1-32k',
        name: 'Moonshot v1 32K',
        description: '32K上下文模型',
        type: 'text',
        maxTokens: 32768,
        costPer1k: 2.4
      },
      {
        id: 'moonshot-v1-128k',
        name: 'Moonshot v1 128K',
        description: '128K超长上下文模型',
        type: 'text',
        maxTokens: 131072,
        costPer1k: 5.06
      }
    ]
  },
  {
    id: 'browser-speech',
    name: '浏览器语音识别',
    description: '使用浏览器内置的语音识别API，完全免费',
    isFree: true,
    supportsSpeech: true,
    supportsText: false,
    apiKeyRequired: false,
    models: [
      {
        id: 'browser-speech-api',
        name: '浏览器语音API',
        description: '基于Web Speech API的免费语音识别',
        type: 'speech',
        costPer1k: 0
      }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (本地)',
    description: '在本地运行开源模型，完全免费',
    isFree: true,
    supportsSpeech: false,
    supportsText: true,
    apiKeyRequired: false,
    website: 'https://ollama.ai',
    models: [
      {
        id: 'llama2',
        name: 'Llama 2',
        description: 'Meta开源模型',
        type: 'text',
        maxTokens: 4096,
        costPer1k: 0
      },
      {
        id: 'mistral',
        name: 'Mistral',
        description: '高效的开源模型',
        type: 'text',
        maxTokens: 8192,
        costPer1k: 0
      },
      {
        id: 'qwen',
        name: 'Qwen',
        description: '阿里开源中文模型',
        type: 'text',
        maxTokens: 8192,
        costPer1k: 0
      }
    ]
  }
];

// 获取免费的AI提供商
export const getFreeProviders = (): AIProvider[] => {
  return AI_PROVIDERS.filter(provider => provider.isFree);
};

// 获取支持语音的提供商
export const getSpeechProviders = (): AIProvider[] => {
  return AI_PROVIDERS.filter(provider => provider.supportsSpeech);
};

// 获取支持文本的提供商
export const getTextProviders = (): AIProvider[] => {
  return AI_PROVIDERS.filter(provider => provider.supportsText);
};

// 根据ID获取提供商
export const getProviderById = (id: string): AIProvider | undefined => {
  return AI_PROVIDERS.find(provider => provider.id === id);
};

// 根据ID获取模型
export const getModelById = (providerId: string, modelId: string): AIModel | undefined => {
  const provider = getProviderById(providerId);
  return provider?.models.find(model => model.id === modelId);
};