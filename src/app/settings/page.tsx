"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Eye,
    EyeOff,
    Save,
    ArrowLeft,
    ExternalLink,
    Trash2,
    LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
	getUserSettings,
	updateUserSettings,
	updateApiKey,
	removeApiKey,
} from "@/lib/userSettings";
import {
	AI_PROVIDERS,
	getFreeProviders,
	getSpeechProviders,
	getTextProviders,
} from "@/lib/aiProviders";
import type { UserSettings } from "@/lib/userSettings";

export default function SettingsPage() {
    const router = useRouter();
	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
	const [tempApiKeys, setTempApiKeys] = useState<Record<string, string>>({});

	// 加载用户设置
	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const userSettings = await getUserSettings(user.id);
			setSettings(userSettings);
			setTempApiKeys(userSettings.api_keys || {});
		} catch (error) {
			console.error("加载设置失败:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveSettings = async () => {
		if (!settings) return;

		try {
			setSaving(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// 保存基本设置
			await updateUserSettings(user.id, {
				speech_provider: settings.speech_provider,
				speech_model: settings.speech_model,
				text_provider: settings.text_provider,
				text_model: settings.text_model,
				auto_save: settings.auto_save,
				default_category: settings.default_category,
				theme: settings.theme,
				language: settings.language,
			});

			// 保存API密钥
			for (const [provider, apiKey] of Object.entries(tempApiKeys)) {
				if (apiKey && apiKey !== settings.api_keys[provider]) {
					await updateApiKey(user.id, provider, apiKey);
				}
			}

			// 重新加载设置
			await loadSettings();
			alert("设置保存成功！");
		} catch (error) {
			console.error("保存设置失败:", error);
			alert("保存设置失败，请重试");
		} finally {
			setSaving(false);
		}
	};

	const handleRemoveApiKey = async (provider: string) => {
        if (!confirm("确定要删除这个API密钥吗？")) return;

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            await removeApiKey(user.id, provider);
            await loadSettings();

            // 清除临时密钥
            const newTempKeys = { ...tempApiKeys };
            delete newTempKeys[provider];
            setTempApiKeys(newTempKeys);

            alert("API密钥已删除");
        } catch (error) {
            console.error("删除API密钥失败:", error);
            alert("删除失败，请重试");
        }
    };

    const handleLogout = async () => {
        if (!confirm("确定要退出登录吗？")) return;

        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("退出登录失败:", error);
                alert("退出登录失败，请重试");
                return;
            }
            
            // 清除本地状态
            setSettings(null);
            setTempApiKeys({});
            
            // 重定向到登录页
            router.push("/login");
        } catch (error) {
            console.error("退出登录失败:", error);
            alert("退出登录失败，请重试");
        }
    };

	const toggleApiKeyVisibility = (provider: string) => {
		setShowApiKeys((prev) => ({
			...prev,
			[provider]: !prev[provider],
		}));
	};

	const getSpeechModels = () => {
		if (!settings) return [];
		const provider = AI_PROVIDERS.find(
			(p) => p.id === settings.speech_provider
		);
		return provider?.models.filter((m) => m.type === "speech") || [];
	};

	const getTextModels = () => {
		if (!settings) return [];
		const provider = AI_PROVIDERS.find((p) => p.id === settings.text_provider);
		return provider?.models.filter((m) => m.type === "text") || [];
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">加载设置中...</p>
				</div>
			</div>
		);
	}

	if (!settings) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">加载设置失败</p>
					<Button onClick={loadSettings}>重试</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-24">
			<div className="max-w-4xl mx-auto p-4 pt-8">
				{/* 页面标题 */}
				<div className="flex items-center gap-4 mb-8">
					<Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回
                    </Button>
					<div>
						<h1 className="text-2xl font-bold text-purple-600">设置</h1>
						<p className="text-gray-600">配置你的AI服务和偏好设置</p>
					</div>
				</div>

				<Tabs defaultValue="ai-services" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="ai-services">AI服务</TabsTrigger>
						<TabsTrigger value="api-keys">API密钥</TabsTrigger>
						<TabsTrigger value="general">通用设置</TabsTrigger>
					</TabsList>

					{/* AI服务配置 */}
					<TabsContent value="ai-services" className="space-y-6">
						{/* 语音识别服务 */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									🎤 语音识别服务
									<Badge variant="secondary">
										{getFreeProviders().some(
											(p) => p.id === settings.speech_provider
										)
											? "免费"
											: "付费"}
									</Badge>
								</CardTitle>
								<CardDescription>选择语音转文字的服务提供商</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>服务提供商</Label>
									<Select
										value={settings.speech_provider}
										onValueChange={(value) =>
											setSettings({ ...settings, speech_provider: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{getSpeechProviders().map((provider) => (
												<SelectItem key={provider.id} value={provider.id}>
													<div className="flex items-center gap-2">
														<span>{provider.name}</span>
														{provider.isFree && (
															<Badge variant="secondary" className="text-xs">
																免费
															</Badge>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>模型</Label>
									<Select
										value={settings.speech_model}
										onValueChange={(value) =>
											setSettings({ ...settings, speech_model: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{getSpeechModels().map((model) => (
												<SelectItem key={model.id} value={model.id}>
													<div>
														<div className="font-medium">{model.name}</div>
														<div className="text-xs text-gray-500">
															{model.description}
														</div>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* 文本生成服务 */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									🤖 文本生成服务
									<Badge variant="secondary">
										{getFreeProviders().some(
											(p) => p.id === settings.text_provider
										)
											? "免费"
											: "付费"}
									</Badge>
								</CardTitle>
								<CardDescription>选择文本结构化的AI模型</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>服务提供商</Label>
									<Select
										value={settings.text_provider}
										onValueChange={(value) =>
											setSettings({ ...settings, text_provider: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{getTextProviders().map((provider) => (
												<SelectItem key={provider.id} value={provider.id}>
													<div className="flex items-center gap-2">
														<span>{provider.name}</span>
														{provider.isFree && (
															<Badge variant="secondary" className="text-xs">
																免费
															</Badge>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>模型</Label>
									<Select
										value={settings.text_model}
										onValueChange={(value) =>
											setSettings({ ...settings, text_model: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{getTextModels().map((model) => (
												<SelectItem key={model.id} value={model.id}>
													<div>
														<div className="font-medium">{model.name}</div>
														<div className="text-xs text-gray-500">
															{model.description}
														</div>
														{model.costPer1k !== undefined && (
															<div className="text-xs text-green-600">
																{model.costPer1k === 0
																	? "免费"
																	: `$${model.costPer1k}/1K tokens`}
															</div>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* API密钥管理 */}
					<TabsContent value="api-keys" className="space-y-6">
						{AI_PROVIDERS.filter((p) => p.apiKeyRequired).map((provider) => (
							<Card key={provider.id}>
								<CardHeader>
									<CardTitle className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											{provider.name}
											{provider.isFree && (
												<Badge variant="secondary">免费</Badge>
											)}
										</div>
										{provider.website && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => window.open(provider.website, "_blank")}
												className="gap-1"
											>
												<ExternalLink className="w-3 h-3" />
												官网
											</Button>
										)}
									</CardTitle>
									<CardDescription>{provider.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>API 密钥</Label>
										<div className="flex gap-2">
											<div className="relative flex-1">
												<Input
													type={showApiKeys[provider.id] ? "text" : "password"}
													value={tempApiKeys[provider.id] || ""}
													onChange={(e) =>
														setTempApiKeys({
															...tempApiKeys,
															[provider.id]: e.target.value,
														})
													}
													placeholder={`输入 ${provider.name} API 密钥`}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3"
													onClick={() => toggleApiKeyVisibility(provider.id)}
												>
													{showApiKeys[provider.id] ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
												</Button>
											</div>
											{settings.api_keys[provider.id] && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleRemoveApiKey(provider.id)}
													className="gap-1 text-red-600 hover:text-red-700"
												>
													<Trash2 className="w-3 h-3" />
													删除
												</Button>
											)}
										</div>
										{settings.api_keys[provider.id] && (
											<p className="text-sm text-green-600">✓ 已配置API密钥</p>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</TabsContent>

					{/* 通用设置 */}
					<TabsContent value="general" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>应用设置</CardTitle>
								<CardDescription>配置应用的基本行为</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label>自动保存</Label>
										<p className="text-sm text-gray-500">
											任务生成后自动保存到数据库
										</p>
									</div>
									<Switch
										checked={settings.auto_save}
										onCheckedChange={(checked) =>
											setSettings({ ...settings, auto_save: checked })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label>默认分类</Label>
									<Select
										value={settings.default_category}
										onValueChange={(value) =>
											setSettings({ ...settings, default_category: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="工作">工作</SelectItem>
											<SelectItem value="生活">生活</SelectItem>
											<SelectItem value="学习">学习</SelectItem>
											<SelectItem value="健康">健康</SelectItem>
											<SelectItem value="其他">其他</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>主题</Label>
									<Select
										value={settings.theme}
										onValueChange={(value) =>
											setSettings({
												...settings,
												theme: value as "light" | "dark" | "auto",
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="auto">跟随系统</SelectItem>
											<SelectItem value="light">浅色</SelectItem>
											<SelectItem value="dark">深色</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>语言</Label>
									<Select
										value={settings.language}
										onValueChange={(value) =>
											setSettings({ ...settings, language: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="zh-CN">简体中文</SelectItem>
											<SelectItem value="en-US">English</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* 免费服务推荐 */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									💡 免费服务推荐
									<Badge variant="secondary">推荐</Badge>
								</CardTitle>
								<CardDescription>
									这些服务提供免费的AI功能，无需API密钥
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{getFreeProviders().map((provider) => (
									<div
										key={provider.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div>
											<div className="font-medium">{provider.name}</div>
											<div className="text-sm text-gray-500">
												{provider.description}
											</div>
											<div className="flex gap-2 mt-1">
												{provider.supportsSpeech && (
													<Badge variant="outline" className="text-xs">
														语音识别
													</Badge>
												)}
												{provider.supportsText && (
													<Badge variant="outline" className="text-xs">
														文本生成
													</Badge>
												)}
											</div>
										</div>
										<Badge variant="secondary">免费</Badge>
									</div>
								))}
							</CardContent>
						</Card>

                        {/* 账户管理 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-red-600">账户管理</CardTitle>
                                <CardDescription>
                                    管理你的账户和登录状态
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-red-800">退出登录</h4>
                                                <p className="text-sm text-red-600">
                                                    退出当前账户，返回登录页面
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                onClick={handleLogout}
                                                className="gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                退出登录
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* 保存按钮 */}
                <div className="flex justify-end pt-6">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "保存中..." : "保存设置"}
                    </Button>
                </div>
			</div>
		</div>
	);
}
