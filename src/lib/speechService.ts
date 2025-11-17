import { getUserSettings, getApiKey } from '@/lib/userSettings';
import { getProviderById, getModelById } from '@/lib/aiProviders';

/**
 * 浏览器语音识别服务
 */
class BrowserSpeechService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'zh-CN';
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  async transcribe(): Promise<string> {
    if (!this.recognition) {
      throw new Error('浏览器不支持语音识别');
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`语音识别失败: ${event.error}`));
      };

      this.recognition.start();
    });
  }
}

/**
 * OpenAI Whisper 语音识别服务
 */
class OpenAIWhisperService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'zh');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 错误: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
  }
}

/**
 * 统一的语音转文字服务
 */
export async function transcribeAudio(audioBlob: Blob, userId: string): Promise<string> {
  try {
    const settings = await getUserSettings(userId);
    const provider = getProviderById(settings.speech_provider);
    
    if (!provider) {
      throw new Error('未找到语音识别提供商');
    }

    switch (settings.speech_provider) {
      case 'browser-speech':
        const browserService = new BrowserSpeechService();
        if (!browserService.isSupported()) {
          throw new Error('浏览器不支持语音识别，请使用其他服务');
        }
        return await browserService.transcribe();

      case 'openai':
        const apiKey = await getApiKey(userId, 'openai');
        if (!apiKey) {
          throw new Error('请先配置 OpenAI API 密钥');
        }
        const openaiService = new OpenAIWhisperService(apiKey);
        return await openaiService.transcribe(audioBlob);

      default:
        throw new Error('不支持的语音识别服务');
    }
  } catch (error) {
    console.error('语音转文字失败:', error);
    throw error;
  }
}