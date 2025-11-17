"use client";

import { useState, useRef } from "react";
import { Mic, Type, ListTodo, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioRecorder, formatRecordingTime } from "@/lib/audioRecorder";
import { transcribeAudio } from "@/lib/speechService";
import { structurizeText } from "@/lib/textService";
import { supabase } from "@/lib/supabaseClient";

/**
 * 主输入组件的属性接口
 */
interface MainInputProps {
	/** 输入完成时的回调函数，传递输入内容和是否为语音输入 */
	onInputComplete: (input: string, isVoice: boolean) => void;
	/** 导航回调函数，用于切换到不同的屏幕 */
	onNavigate: (screen: "dashboard" | "settings") => void;
	/** 是否正在处理中的状态 */
	isProcessing: boolean;
}

/**
 * 主输入组件 - MindStream应用的核心输入界面
 * 支持语音和文字两种输入方式，提供流畅的用户体验
 */
export default function MainInput({
	onInputComplete,
	onNavigate,
	isProcessing,
}: MainInputProps) {
	// 当前输入模式：语音、文字或未选择
	const [inputMode, setInputMode] = useState<"voice" | "text" | null>(null);
	// 文字输入内容
	const [textInput, setTextInput] = useState("");
	// 是否正在录音
	const [isRecording, setIsRecording] = useState(false);
	// 录音时长（秒）
	const [recordingTime, setRecordingTime] = useState(0);
	// 音频录制器实例
	const audioRecorderRef = useRef<AudioRecorder | null>(null);
	// 录音计时器
	const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
	// 语音转文字状态
	const [isTranscribing, setIsTranscribing] = useState(false);
	// 转录后的文本
	const [transcribedText, setTranscribedText] = useState("");

	/**
		 * 处理语音输入的函数
		 * 控制录音的开始和停止，并调用语音转文字API
		 */
		const handleVoiceInput = async () => {
			if (isRecording) {
				// 停止录音
				try {
					setIsRecording(false);
					setIsTranscribing(true);
					
					// 清理计时器
					if (recordingTimerRef.current) {
						clearInterval(recordingTimerRef.current);
						recordingTimerRef.current = null;
					}
					
					// 获取当前用户
					const { data: { user } } = await supabase.auth.getUser();
					if (!user) {
						throw new Error('用户未登录');
					}
					
					// 停止录音并获取音频数据
					if (audioRecorderRef.current) {
						const audioBlob = await audioRecorderRef.current.stopRecording();
						
						// 调用语音转文字API
						const transcribedText = await transcribeAudio(audioBlob, user.id);
						setTranscribedText(transcribedText);
						setIsTranscribing(false);
						
						// 直接处理转录后的文本
						await handleProcessText(transcribedText, true);
					}
				} catch (error) {
					console.error('语音处理失败:', error);
					setIsTranscribing(false);
					setIsRecording(false);
					setRecordingTime(0);
					const errorMessage = error instanceof Error ? error.message : '请重试';
					alert(`语音处理失败: ${errorMessage}`);
				}
			} else {
				// 开始录音
				try {
					if (!AudioRecorder.isSupported()) {
						alert('您的浏览器不支持录音功能');
						return;
					}
					
					audioRecorderRef.current = new AudioRecorder();
					await audioRecorderRef.current.startRecording();
					
					setIsRecording(true);
					setInputMode("voice");
					setRecordingTime(0);
					
					// 启动录音计时器
					recordingTimerRef.current = setInterval(() => {
						setRecordingTime((prev) => prev + 1);
					}, 1000);
					
				} catch (error) {
					console.error('开始录音失败:', error);
					alert('无法开始录音，请检查麦克风权限');
				}
			}
		};

	/**
	 * 处理文字输入提交的函数
	 * 验证输入内容并调用完成回调
	 */
	const handleTextSubmit = async () => {
		if (textInput.trim()) {
			await handleProcessText(textInput, false);
			setTextInput(""); // 清空输入框
			setInputMode(null); // 重置输入模式
		}
	};

	/**
		 * 处理文本的通用函数
		 * 调用大模型进行结构化处理
		 */
		const handleProcessText = async (text: string, isVoice: boolean) => {
			try {
				// 获取当前用户
				const { data: { user } } = await supabase.auth.getUser();
				if (!user) {
					throw new Error('用户未登录');
				}
				
				// 调用结构化处理
				const structuredData = await structurizeText(text, user.id);
				
				// 传递给父组件处理
				onInputComplete(JSON.stringify(structuredData), isVoice);
			} catch (error) {
				console.error('文本处理失败:', error);
				const errorMessage = error instanceof Error ? error.message : '请重试';
				alert(`文本处理失败: ${errorMessage}`);
			}
		};

	// 处理中状态的加载界面
	if (isProcessing || isTranscribing) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				<div className="text-center space-y-6">
					{/* 多层旋转加载动画 */}
					<div className="relative w-24 h-24 mx-auto">
						{/* 外层静态圆环 */}
						<div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
						{/* 中层顺时针旋转圆环 */}
						<div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
						{/* 内层逆时针旋转圆环 */}
						<div
							className="absolute inset-2 border-4 border-blue-400 rounded-full border-b-transparent animate-spin"
							style={{
								animationDirection: "reverse",
								animationDuration: "1.5s",
							}}
						></div>
					</div>
					{/* 加载提示文字 */}
					<div className="space-y-2">
						<h2 className="text-purple-600">
							{isTranscribing ? "正在转换语音..." : "正在为你理清思绪..."}
						</h2>
						<p className="text-gray-600">
							{isTranscribing ? "AI 正在理解你的话语" : "魔法进行中，别急，我们来搞定混乱"}
						</p>
						{transcribedText && (
							<div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-md">
								<p className="text-sm text-gray-700">识别到的文字：</p>
								<p className="text-gray-900">{transcribedText}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// 文字输入模式界面
	if (inputMode === "text") {
		return (
			<div className="min-h-screen flex flex-col p-4">
				<div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pt-8">
					{/* 页面标题和说明 */}
					<div className="mb-6 text-center">
						<h1 className="text-purple-600 mb-2">MindStream</h1>
						<p className="text-gray-600">把你脑子里的想法全部倾倒出来</p>
					</div>

					{/* 文字输入区域 */}
					<Textarea
						value={textInput}
						onChange={(e) => setTextInput(e.target.value)}
						placeholder="输入你所有的想法、待办事项、灵感... 不用担心格式，我们会帮你整理好"
						className="flex-1 min-h-[300px] text-lg p-6 resize-none border-2 border-purple-200 focus:border-purple-400 rounded-2xl"
						autoFocus
					/>

					{/* 操作按钮区域 */}
					<div className="mt-6 flex gap-4">
						<Button
							onClick={() => setInputMode(null)}
							variant="outline"
							className="flex-1"
						>
							返回
						</Button>
						<Button
							onClick={handleTextSubmit}
							disabled={!textInput.trim()}
							className="flex-1 bg-purple-600 hover:bg-purple-700"
						>
							完成
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// 默认主界面 - 语音输入模式
	return (
		<div className="min-h-screen flex flex-col">
			{/* 主要内容区域 */}
			<div className="flex-1 flex flex-col items-center justify-center p-8">
				{/* 应用标题和描述 */}
				<div className="text-center mb-12">
					<h1 className="text-purple-600 mb-4">MindStream</h1>
					<p className="text-gray-600 text-lg">倾倒你的思绪，我们来理清脉络</p>
				</div>

				{/* 语音输入按钮区域 */}
				<div className="relative">
					{/* 主麦克风按钮 */}
					<button
						onClick={handleVoiceInput}
						className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
							isRecording
								? "bg-red-500 hover:bg-red-600 scale-110"
								: "bg-purple-600 hover:bg-purple-700 hover:scale-105"
						} shadow-2xl`}
					>
						<Mic className="w-24 h-24 text-white" />
					</button>

					{/* 录音时的动画效果 */}
					{isRecording && (
						<div className="absolute inset-0 -z-10">
							<div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
							<div className="absolute inset-0 bg-red-400 rounded-full animate-pulse opacity-30"></div>
						</div>
					)}

					{/* 录音计时器显示 */}
						{isRecording && (
							<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
								<p className="text-gray-600">录音中...</p>
								<p className="text-2xl text-red-600 tabular-nums">
									{formatRecordingTime(recordingTime)}
								</p>
							</div>
						)}
				</div>

				{/* 文字输入选项（仅在非录音状态显示） */}
				{!isRecording && (
					<div className="mt-16">
						<Button
							onClick={() => setInputMode("text")}
							variant="outline"
							size="lg"
							className="gap-2"
						>
							<Type className="w-5 h-5" />
							或使用文字输入
						</Button>
					</div>
				)}
			</div>

			{/* 底部导航栏 */}
			<div className="border-t bg-white p-4">
				<div className="max-w-md mx-auto flex justify-around">
					<Button
						variant="ghost"
						size="lg"
						onClick={() => onNavigate("dashboard")}
						className="flex flex-col gap-1 h-auto py-3"
					>
						<ListTodo className="w-6 h-6" />
						<span className="text-xs">今日待办</span>
					</Button>
					<Button
						variant="ghost"
						size="lg"
						onClick={() => onNavigate("settings")}
						className="flex flex-col gap-1 h-auto py-3"
					>
						<Settings className="w-6 h-6" />
						<span className="text-xs">设置</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
