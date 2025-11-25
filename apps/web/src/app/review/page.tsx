"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Plus, Trash2 } from "lucide-react";
import type { Task } from "@/types/index";

interface ReviewScreenProps {
	tasks: Task[];
	onComplete: (tasks: Task[]) => void;
	onDiscard: () => void;
}

export function ReviewScreen({
	tasks: initialTasks,
	onComplete,
	onDiscard,
}: ReviewScreenProps) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks);

	const updateTask = (taskId: string, updates: Partial<Task>) => {
		setTasks((prev) =>
			prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
		);
	};

	const updateSubtask = (taskId: string, subtaskId: string, title: string) => {
		setTasks((prev) =>
			prev.map((task) => {
				if (task.id === taskId) {
					return {
						...task,
						subtasks: task.subtasks.map((st) =>
							st.id === subtaskId ? { ...st, title } : st
						),
					};
				}
				return task;
			})
		);
	};

	const addSubtask = (taskId: string) => {
		setTasks((prev) =>
			prev.map((task) => {
				if (task.id === taskId) {
					return {
						...task,
						subtasks: [
							...task.subtasks,
							{ id: `st-${Date.now()}`, title: "", completed: false },
						],
					};
				}
				return task;
			})
		);
	};

	const removeSubtask = (taskId: string, subtaskId: string) => {
		setTasks((prev) =>
			prev.map((task) => {
				if (task.id === taskId) {
					return {
						...task,
						subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
					};
				}
				return task;
			})
		);
	};

	const removeTask = (taskId: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== taskId));
	};

	return (
		<div className="min-h-screen p-4 pb-24">
			<div className="max-w-3xl mx-auto pt-8">
				<div className="text-center mb-8">
					<h1 className="text-purple-600 mb-2">这是我为你整理的计划草稿</h1>
					<p className="text-gray-600">
						随意编辑、删除或添加内容，它只是建议而已
					</p>
				</div>

				<div className="space-y-4">
					{tasks.map((task) => (
						<div
							key={task.id}
							className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border-2 border-purple-100 hover:border-purple-300 transition-colors"
						>
							<div className="flex gap-3">
								<div className="flex-1">
									<Input
										value={task.title}
										onChange={(e) =>
											updateTask(task.id, { title: e.target.value })
										}
										className="text-lg border-0 px-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-purple-400 rounded-none"
										placeholder="任务标题"
									/>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => removeTask(task.id)}
									className="text-red-500 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="w-5 h-5" />
								</Button>
							</div>

							<div className="flex gap-4 flex-wrap">
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4 text-gray-400" />
									<Input
										type="number"
										value={task.estimatedTime}
										onChange={(e) =>
											updateTask(task.id, {
												estimatedTime: parseInt(e.target.value) || 0,
											})
										}
										className="w-20 h-8 text-sm"
										min="0"
									/>
									<span className="text-sm text-gray-600">分钟</span>
								</div>

								<Input
									value={task.category}
									onChange={(e) =>
										updateTask(task.id, { category: e.target.value })
									}
									className="h-8 w-32 text-sm"
									placeholder="分类"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-600">子任务</p>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => addSubtask(task.id)}
										className="h-8 gap-1"
									>
										<Plus className="w-4 h-4" />
										<span className="text-xs">添加</span>
									</Button>
								</div>

								<div className="space-y-2 pl-2">
									{task.subtasks.map((subtask) => (
										<div key={subtask.id} className="flex items-center gap-2">
											<div className="w-4 h-4 rounded border-2 border-gray-300"></div>
											<Input
												value={subtask.title}
												onChange={(e) =>
													updateSubtask(task.id, subtask.id, e.target.value)
												}
												className="flex-1 h-8 text-sm"
												placeholder="子任务描述"
											/>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeSubtask(task.id, subtask.id)}
												className="h-8 w-8 text-gray-400 hover:text-red-500"
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
				</div>

				{tasks.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-400">没有任务了，重新开始吧</p>
					</div>
				)}
			</div>

			{/* Fixed bottom buttons */}
			<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
				<div className="max-w-3xl mx-auto flex gap-4">
					<Button
						variant="outline"
						size="lg"
						onClick={onDiscard}
						className="flex-1"
					>
						丢弃全部
					</Button>
					<Button
						size="lg"
						onClick={() => onComplete(tasks)}
						disabled={tasks.length === 0}
						className="flex-1 bg-purple-600 hover:bg-purple-700"
					>
						全部采纳
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function ReviewPage() {
	// This is a placeholder page component
	// The actual ReviewScreen component should be used within the app
	return (
		<div className="min-h-screen flex items-center justify-center">
			<p className="text-gray-500">Review page - component should be integrated into the main app</p>
		</div>
	);
}