import { getUserSettings, getApiKey } from "@/lib/userSettings";
import { getProviderById, getModelById } from "@/lib/aiProviders";

/**
 * 通用的AI文本服务接口
 */
interface AITextService {
	generateText(prompt: string): Promise<string>;
}

/**
 * OpenAI GPT 服务
 */
class OpenAIService implements AITextService {
	private apiKey: string;
	private model: string;

	constructor(apiKey: string, model: string = "gpt-3.5-turbo") {
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: this.model,
				messages: [
					{
						role: "system",
						content:
							"你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 1500,
			}),
		});

		if (!response.ok) {
			throw new Error(`OpenAI API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.choices[0]?.message?.content || "";
	}
}

/**
 * Google Gemini 服务
 */
class GeminiService implements AITextService {
	private apiKey: string;
	private model: string;

	constructor(apiKey: string, model: string = "gemini-pro") {
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{
									text: `你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。\n\n${prompt}`,
								},
							],
						},
					],
					generationConfig: {
						temperature: 0.7,
						maxOutputTokens: 1500,
					},
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Gemini API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.candidates[0]?.content?.parts[0]?.text || "";
	}
}

/**
 * Anthropic Claude 服务
 */
class ClaudeService implements AITextService {
	private apiKey: string;
	private model: string;

	constructor(apiKey: string, model: string = "claude-3-haiku-20240307") {
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 1500,
				messages: [
					{
						role: "user",
						content: `你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。\n\n${prompt}`,
					},
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`Claude API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.content[0]?.text || "";
	}
}

/**
 * DeepSeek 服务
 */
class DeepSeekService implements AITextService {
	private apiKey: string;
	private model: string;

	constructor(apiKey: string, model: string = "deepseek-chat") {
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch(
			"https://api.deepseek.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: this.model,
					messages: [
						{
							role: "system",
							content:
								"你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					temperature: 0.7,
					max_tokens: 1500,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`DeepSeek API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.choices[0]?.message?.content || "";
	}
}

/**
 * 智谱AI GLM 服务
 */
class GLMService implements AITextService {
	private apiKey: string;
	private model: string;

	constructor(apiKey: string, model: string = "glm-4") {
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch(
			"https://open.bigmodel.cn/api/paas/v4/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: this.model,
					messages: [
						{
							role: "system",
							content:
								"你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					temperature: 0.7,
					max_tokens: 1500,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`GLM API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.choices[0]?.message?.content || "";
	}
}

/**
 * Moonshot AI 服务
 */
class MoonshotService implements AITextService {
	private apiKey: string;
	private model: string;

	constructor(apiKey: string, model: string = "moonshot-v1-8k") {
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch(
			"https://api.moonshot.cn/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: this.model,
					messages: [
						{
							role: "system",
							content:
								"你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					temperature: 0.7,
					max_tokens: 1500,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Moonshot API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.choices[0]?.message?.content || "";
	}
}

/**
 * Ollama 本地服务
 */
class OllamaService implements AITextService {
	private model: string;
	private baseUrl: string;

	constructor(
		model: string = "llama2",
		baseUrl: string = "http://localhost:11434"
	) {
		this.model = model;
		this.baseUrl = baseUrl;
	}

	async generateText(prompt: string): Promise<string> {
		const response = await fetch(`${this.baseUrl}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: this.model,
				prompt: `你是一个专业的任务管理助手，擅长将用户的想法转换为结构化的任务列表。\n\n${prompt}`,
				stream: false,
			}),
		});

		if (!response.ok) {
			throw new Error(`Ollama API 错误: ${response.statusText}`);
		}

		const result = await response.json();
		return result.response || "";
	}
}

/**
 * 创建AI服务实例
 */
async function createAIService(userId: string): Promise<AITextService> {
	const settings = await getUserSettings(userId);
	const provider = getProviderById(settings.text_provider);

	if (!provider) {
		throw new Error("未找到文本生成提供商");
	}

	switch (settings.text_provider) {
		case "openai":
			const openaiKey = await getApiKey(userId, "openai");
			if (!openaiKey) {
				throw new Error("请先配置 OpenAI API 密钥");
			}
			return new OpenAIService(openaiKey, settings.text_model);

		case "google":
			const googleKey = await getApiKey(userId, "google");
			if (!googleKey) {
				throw new Error("请先配置 Google API 密钥");
			}
			return new GeminiService(googleKey, settings.text_model);

		case "anthropic":
			const claudeKey = await getApiKey(userId, "anthropic");
			if (!claudeKey) {
				throw new Error("请先配置 Anthropic API 密钥");
			}
			return new ClaudeService(claudeKey, settings.text_model);

		case "deepseek":
			const deepseekKey = await getApiKey(userId, "deepseek");
			if (!deepseekKey) {
				throw new Error("请先配置 DeepSeek API 密钥");
			}
			return new DeepSeekService(deepseekKey, settings.text_model);

		case "zhipu":
			const zhipuKey = await getApiKey(userId, "zhipu");
			if (!zhipuKey) {
				throw new Error("请先配置 智谱AI API 密钥");
			}
			return new GLMService(zhipuKey, settings.text_model);

		case "moonshot":
			const moonshotKey = await getApiKey(userId, "moonshot");
			if (!moonshotKey) {
				throw new Error("请先配置 Moonshot API 密钥");
			}
			return new MoonshotService(moonshotKey, settings.text_model);

		case "ollama":
			return new OllamaService(settings.text_model);

		default:
			throw new Error("不支持的文本生成服务");
	}
}

/**
 * 统一的文本结构化服务
 */
export async function structurizeText(
	text: string,
	userId: string
): Promise<any> {
	try {
		const aiService = await createAIService(userId);

		const prompt = `
用户输入: "${text}"

请将用户的输入文本转换为结构化的任务列表。按照以下JSON格式返回结构化数据，只返回JSON，不要其他内容：

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

		const response = await aiService.generateText(prompt);
		console.log("AI Response:", response);

		// 清理响应，移除可能的 markdown 代码块标记
		let cleanResponse = response.trim();
		
		// 移除 markdown 代码块标记
		if (cleanResponse.startsWith('```json')) {
			cleanResponse = cleanResponse.replace(/^```json\s*/, '');
		}
		if (cleanResponse.startsWith('```')) {
			cleanResponse = cleanResponse.replace(/^```\s*/, '');
		}
		if (cleanResponse.endsWith('```')) {
			cleanResponse = cleanResponse.replace(/\s*```$/, '');
		}
		
		// 移除可能的额外空白字符
		cleanResponse = cleanResponse.trim();
		
		console.log("Cleaned Response:", cleanResponse);

		// 解析 JSON 响应
		const structuredData = JSON.parse(cleanResponse);
		console.log("Structured Data:", structuredData);

		// 验证数据结构
		if (!structuredData.tasks || !Array.isArray(structuredData.tasks)) {
			throw new Error("AI 返回的数据格式不正确");
		}

		return structuredData;
	} catch (error) {
		console.error("文本结构化失败:", error);
		throw error;
	}
}
