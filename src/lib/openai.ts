import OpenAI from 'openai';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 允许在浏览器中使用
});

/**
 * 语音转文字服务
 * @param audioBlob - 音频文件 Blob 对象
 * @returns Promise<string> - 转换后的文字
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // 将 Blob 转换为 File 对象
    const audioFile = new File([audioBlob], 'audio.webm', {
      type: 'audio/webm'
    });

    // 调用 OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'zh', // 指定中文
      response_format: 'text'
    });

    return transcription as string;
  } catch (error) {
    console.error('语音转文字失败:', error);
    throw new Error('语音转文字失败，请重试');
  }
}

/**
 * 文本结构化服务
 * 使用大模型将用户输入的文本转换为结构化的任务JSON
 * @param text - 用户输入的文本
 * @returns Promise<any> - 结构化的任务数据
 */
export async function structurizeText(text: string): Promise<any> {
  try {
    const prompt = `
你是一个专业的任务管理助手。请将用户的输入文本转换为结构化的任务列表。

用户输入: "${text}"

请按照以下JSON格式返回结构化数据，只返回JSON，不要其他内容：

{
  "tasks": [
    {
      "title": "任务标题",
      "category": "工作|生活|学习|健康|其他",
      "estimatedTime": 30,
      "subtasks": [
        {
          "title": "子任务标题",
          "completed": false
        }
      ]
    }
  ]
}

规则：
1. 从文本中识别出所有可能的任务
2. 为每个任务分配合适的分类
3. 估算每个任务的时间（分钟）
4. 将复杂任务拆分为2-5个子任务
5. 简单任务可以只有1个子任务
6. 任务标题要简洁明确
7. 子任务要具体可执行
8. 时间估算要合理（15-120分钟）
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('AI 响应为空');
    }

    // 解析 JSON 响应
    const structuredData = JSON.parse(response);
    
    // 验证数据结构
    if (!structuredData.tasks || !Array.isArray(structuredData.tasks)) {
      throw new Error('AI 返回的数据格式不正确');
    }

    return structuredData;
  } catch (error) {
    console.error('文本结构化失败:', error);
    throw new Error('文本结构化失败，请重试');
  }
}