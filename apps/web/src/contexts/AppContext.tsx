"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveTasks, getUserTasks } from "@/lib/taskService";
import type { Task } from "@/types/index";

/**
 * 应用全局状态类型
 */
interface AppContextType {
  // 任务相关
  tasks: Task[];
  generatedTasks: Task[];
  setGeneratedTasks: (tasks: Task[]) => void;
  loadUserTasks: () => Promise<void>;
  saveTasksToDatabase: (tasks: Task[]) => Promise<void>;
  
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // 错误处理
		error: string;
		setError: (error: string) => void;
		clearError: () => void;
		
		// 成功消息
		successMessage: string;
		setSuccessMessage: (message: string) => void;
		clearSuccessMessage: () => void;
  
  // 转录文本
  transcribedText: string;
  setTranscribedText: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [transcribedText, setTranscribedText] = useState('');

  /**
   * 加载用户任务
   */
  const loadUserTasks = async () => {
    if (!user) return;
    
    try {
      const userTasks = await getUserTasks(user.id);
      setTasks(userTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
      setError(error instanceof Error ? error.message : '加载任务失败');
    }
  };

  /**
   * 保存任务到数据库
   */
  const saveTasksToDatabase = async (tasksToSave: Task[]) => {
    if (!user) throw new Error('用户未登录');

    try {
      setIsLoading(true);
      await saveTasks(tasksToSave, user.id);
      await loadUserTasks(); // 重新加载任务列表
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存任务失败';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
	 * 清除错误信息
	 */
	const clearError = () => {
		setError('');
	};

	/**
	 * 清除成功消息
	 */
	const clearSuccessMessage = () => {
		setSuccessMessage('');
	};

  // 当用户登录时加载任务
  useEffect(() => {
    if (user) {
      loadUserTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  const value: AppContextType = {
		tasks,
		generatedTasks,
		setGeneratedTasks,
		loadUserTasks,
		saveTasksToDatabase,
		isLoading,
		setIsLoading,
		error,
		setError,
		clearError,
		successMessage,
		setSuccessMessage,
		clearSuccessMessage,
		transcribedText,
		setTranscribedText,
	};

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * 使用应用上下文的 Hook
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}