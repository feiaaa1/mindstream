// 子任务接口定义
export interface SubTask {
	id: string; // 子任务唯一标识符
	title: string; // 子任务标题
	completed: boolean; // 是否完成
}

// 任务接口定义
export interface Task {
	id: string; // 任务唯一标识符
	title: string; // 任务标题
	estimatedTime: number; // 估计耗时（分钟）
	category: string; // 任务分类
	subtasks: SubTask[]; // 子任务列表
	completed: boolean; // 是否完成
	createdAt: string; // 创建时间
}
