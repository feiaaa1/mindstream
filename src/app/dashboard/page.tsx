"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
	Home,
	Settings,
	Clock,
	Play,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useApp } from "@/contexts/AppContext";
import type { Task } from "@/types/index";

/**
 * Dashboard 主页面组件
 * 显示用户的任务列表，包括进行中和已完成的任务
 * 提供任务管理、专注模式启动等功能
 */
export default function DashboardScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const { tasks, loadUserTasks } = useApp();
	// 存储展开状态的任务ID集合
	const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

	// 检查用户登录状态
	useEffect(() => {
		if (!user) {
			router.push('/login');
		}
	}, [user, router]);

	/**
		 * 开始专注模式
		 */
		const handleStartFocus = (task: Task) => {
			router.push(`/focus?taskId=${task.id}`);
		};

	/**
	 * 切换任务卡片的展开/收起状态
	 * @param taskId - 要切换状态的任务ID
	 */
	const toggleTaskExpand = (taskId: string) => {
		setExpandedTasks((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(taskId)) {
				newSet.delete(taskId);
			} else {
				newSet.add(taskId);
			}
			return newSet;
		});
	};

	/**
		 * 处理子任务的完成状态切换
		 * 当所有子任务完成时，自动标记主任务为完成并显示庆祝动画
		 * @param task - 包含子任务的主任务对象
		 * @param subtaskId - 要切换状态的子任务ID
		 */
		const handleSubtaskToggle = async (task: Task, subtaskId: string) => {
			// 更新子任务的完成状态
			const updatedSubtasks = task.subtasks.map((st) =>
				st.id === subtaskId ? { ...st, completed: !st.completed } : st
			);

			// 检查是否所有子任务都已完成
			const allCompleted = updatedSubtasks.every((st) => st.completed);

			try {
				// 直接使用 taskService 更新任务
				const { updateTask } = await import('@/lib/taskService');
				const { supabase } = await import('@/lib/supabaseClient');
				
				// 获取当前用户
				const { data: { user } } = await supabase.auth.getUser();
				if (!user) {
					throw new Error('用户未登录');
				}

				// 更新任务状态
				await updateTask(task.id, {
					subtasks: updatedSubtasks,
					completed: allCompleted
				}, user.id);

				// 如果任务完成，触发庆祝动画
				if (allCompleted) {
					showCelebration();
				}

				// 更新成功后刷新任务列表
				await loadUserTasks();
			} catch (error) {
				console.error("Error updating task:", error);
				alert('更新任务失败，请重试');
			}
		};

		/**
		 * 显示庆祝动画
		 */
		const showCelebration = () => {
			// 创建庆祝元素
			const celebration = document.createElement('div');
			celebration.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
			celebration.innerHTML = `
				<div class="celebration-container">
					<div class="text-6xl animate-bounce">🎉</div>
					<div class="text-2xl text-purple-600 font-bold mt-4 animate-pulse">任务完成！</div>
					<div class="text-lg text-gray-600 mt-2">太棒了！继续保持！</div>
				</div>
			`;

			// 添加样式
			const style = document.createElement('style');
			style.textContent = `
				.celebration-container {
					background: rgba(255, 255, 255, 0.95);
					backdrop-filter: blur(10px);
					border-radius: 20px;
					padding: 2rem;
					text-align: center;
					box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
					animation: celebrationPop 0.6s ease-out;
				}
				@keyframes celebrationPop {
					0% { transform: scale(0.5); opacity: 0; }
					50% { transform: scale(1.1); opacity: 1; }
					100% { transform: scale(1); opacity: 1; }
				}
			`;

			document.head.appendChild(style);
			document.body.appendChild(celebration);

			// 2秒后移除庆祝动画
			setTimeout(() => {
				celebration.remove();
				style.remove();
			}, 2000);

			// 添加震动反馈（如果支持）
			if (navigator.vibrate) {
				navigator.vibrate([100, 50, 100]);
			}
		};

	// 筛选出进行中的任务（未完成的任务）
	const activeTasks = tasks?.filter((t) => !t.completed) || [];
	// 筛选出已完成的任务
	const completedTasks = tasks?.filter((t) => t.completed) || [];

	/**
	 * 计算任务的完成进度百分比
	 * @param task - 要计算进度的任务对象
	 * @returns 完成进度百分比（0-100）
	 */
	const getProgress = (task: Task) => {
		if (task.subtasks.length === 0) return 0;
		const completed = task.subtasks.filter((st) => st.completed).length;
		return (completed / task.subtasks.length) * 100;
	};

	/**
	 * 渲染任务卡片组件
	 * @param task - 要渲染的任务对象
	 * @param isCompleted - 是否为已完成任务，默认为false
	 * @returns 任务卡片JSX元素
	 */
	const renderTaskCard = (task: Task, isCompleted: boolean = false) => {
		const progress = getProgress(task); // 获取任务进度
		const isExpanded = expandedTasks.has(task.id); // 检查任务是否展开
		const completedCount = task.subtasks.filter((st) => st.completed).length; // 已完成子任务数量

		return (
			<div
				key={task.id}
				className={`bg-white rounded-2xl shadow-md border-2 transition-all ${
					isCompleted
						? "border-gray-200 opacity-60" // 已完成任务样式
						: "border-purple-100 hover:border-purple-300 hover:shadow-lg" // 进行中任务样式
				}`}
			>
				<div className="p-6">
					{/* 任务标题和操作按钮区域 */}
					<div className="flex items-start justify-between gap-4 mb-4">
						<div className="flex-1">
							{/* 任务标题，已完成任务显示删除线 */}
							<h3 className={isCompleted ? "text-gray-400 line-through" : ""}>
								{task.title}
							</h3>
							{/* 任务标签区域 */}
							<div className="flex gap-3 mt-2 flex-wrap">
								{/* 任务分类标签 */}
								{task.category && (
									<span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
										{task.category}
									</span>
								)}
								{/* 预估时间标签 */}
								<span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
									<Clock className="w-3 h-3" />
									{task.estimatedTime} 分钟
								</span>
							</div>
						</div>

						{/* 专注按钮，仅在未完成任务中显示 */}
					{!isCompleted && (
						<Button
							size="sm"
							onClick={() => handleStartFocus(task)}
							className="bg-purple-600 hover:bg-purple-700 gap-1 min-h-[44px] min-w-[80px]"
						>
							<Play className="w-4 h-4" />
							<span className="text-xs">专注</span>
						</Button>
					)}
					</div>

					{/* 任务进度显示区域 */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm text-gray-600">
							<span>
								{completedCount} / {task.subtasks.length} 已完成
							</span>
							<span>{Math.round(progress)}%</span>
						</div>
						{/* 进度条 */}
						<Progress value={progress} className="h-2" />
					</div>

					{/* 展开/收起子任务按钮 */}
					{task.subtasks.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => toggleTaskExpand(task.id)}
							className="w-full mt-4 gap-2 min-h-[44px]"
						>
							{isExpanded ? (
								<ChevronUp className="w-4 h-4" />
							) : (
								<ChevronDown className="w-4 h-4" />
							)}
							{isExpanded ? "收起" : "展开"} 子任务
						</Button>
					)}
				</div>

				{/* 子任务列表，仅在展开状态下显示 */}
				{isExpanded && (
					<div className="border-t border-gray-100 p-6 pt-4 space-y-3 bg-gray-50">
						{task.subtasks.map((subtask) => (
							<div key={subtask.id} className="flex items-center gap-3">
								{/* 子任务复选框 */}
								<Checkbox
									id={subtask.id}
									checked={subtask.completed}
									onCheckedChange={() => handleSubtaskToggle(task, subtask.id)}
								/>
								{/* 子任务标题，已完成显示删除线 */}
								<label
									htmlFor={subtask.id}
									className={`flex-1 cursor-pointer ${
										subtask.completed ? "text-gray-400 line-through" : ""
									}`}
								>
									{subtask.title}
								</label>
							</div>
						))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen pb-24">
			<div className="max-w-4xl mx-auto p-4 pt-8">
				{/* 页面标题区域 */}
				<div className="mb-8">
					<h1 className="text-purple-600 mb-2">今天，我们先搞定这些</h1>
					<p className="text-gray-600">一步一步来，你可以的 💪</p>
				</div>

				{/* 空状态提示 - 当没有任何任务时显示 */}
					{activeTasks.length === 0 && completedTasks.length === 0 && (
						<div className="text-center py-16">
							<div className="text-6xl mb-4">🧠</div>
							<h3 className="text-xl text-gray-600 mb-2">还没有任何任务</h3>
							<p className="text-gray-400 mb-6">把你脑子里的想法倾倒出来，让我们帮你整理</p>
							<Button
								onClick={() => router.push("/input")}
								className="bg-purple-600 hover:bg-purple-700 min-h-[48px] px-8"
							>
								开始添加想法
							</Button>
						</div>
					)}

				{/* 进行中的任务列表 */}
				{activeTasks.length > 0 && (
					<div className="space-y-4 mb-8">
						{activeTasks.map((task) => renderTaskCard(task, false))}
					</div>
				)}

				{/* 已完成的任务列表 */}
				{completedTasks.length > 0 && (
					<div className="mt-12">
						<h2 className="text-gray-600 mb-4">已完成 🎉</h2>
						<div className="space-y-4">
							{completedTasks.map((task) => renderTaskCard(task, true))}
						</div>
					</div>
				)}
			</div>

			{/* 底部导航栏 */}
				<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
					<div className="max-w-md mx-auto flex justify-around">
						{/* 添加想法按钮 */}
						<Button
							variant="ghost"
							size="lg"
							onClick={() => router.push("/input")}
							className="flex flex-col gap-1 h-auto py-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
						>
							<Home className="w-6 h-6" />
							<span className="text-xs">添加想法</span>
						</Button>
						{/* 设置按钮 */}
						<Button
							variant="ghost"
							size="lg"
							onClick={() => router.push("/settings")}
							className="flex flex-col gap-1 h-auto py-3 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
						>
							<Settings className="w-6 h-6" />
							<span className="text-xs">设置</span>
						</Button>
					</div>
				</div>
		</div>
	);
}
