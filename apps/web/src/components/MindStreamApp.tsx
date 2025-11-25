"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MainInput from "@/app/input/page";
import DashboardScreen from "@/app/dashboard/page";
import TaskResult from "@/app/result/page";
import LoadingPage from "@/components/LoadingPage";
import { saveTasks, getUserTasks } from "@/lib/taskService";
import type { Task } from "@/types/index";

/**
 * 应用的主要状态类型
 */
type AppScreen = 'input' | 'loading' | 'result' | 'dashboard' | 'settings';
type LoadingStage = 'transcribing' | 'structuring' | 'saving' | 'error';

/**
 * MindStream 主应用组件
 * 管理整个应用的状态和页面流转
 */
export default function MindStreamApp() {
  // 当前显示的屏幕
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  // 加载阶段
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('transcribing');
  // 用户任务列表
  const [tasks, setTasks] = useState<Task[]>([]);
  // 生成的任务结果（待确认）
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  // 用户信息
  const [user, setUser] = useState<any>(null);
  // 错误信息
  const [error, setError] = useState<string>('');
  // 转录的文本
  const [transcribedText, setTranscribedText] = useState<string>('');
  
  const router = useRouter();

  // 初始化用户状态和任务
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 获取当前用户
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login');
          return;
        }

        setUser(session.user);
        
        // 加载用户任务
        await loadUserTasks(session.user.id);
      } catch (error) {
        console.error('初始化应用失败:', error);
      }
    };

    initializeApp();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      } else if (session?.user) {
        setUser(session.user);
        loadUserTasks(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  /**
   * 加载用户任务
   */
  const loadUserTasks = async (userId: string) => {
    try {
      const userTasks = await getUserTasks(userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  };

  /**
   * 处理输入完成
   * @param input - 输入内容（可能是原始文本或结构化JSON）
   * @param isVoice - 是否为语音输入
   */
  const handleInputComplete = async (input: string, isVoice: boolean) => {
    try {
      setCurrentScreen('loading');
      setError('');

      if (isVoice) {
        // 语音输入：input 应该是结构化的JSON字符串
        setLoadingStage('structuring');
        setTranscribedText(''); // 这里应该从语音转文字过程中获取
      } else {
        // 文字输入：input 应该是结构化的JSON字符串
        setLoadingStage('structuring');
      }

      // 解析结构化数据
      const structuredData = JSON.parse(input);
      
      // 转换为Task格式
      const tasksToGenerate: Task[] = structuredData.tasks.map((taskData: any) => ({
        id: '', // 将在保存时生成
        title: taskData.title,
        category: taskData.category,
        estimatedTime: taskData.estimatedTime,
        subtasks: taskData.subtasks.map((subtask: any) => ({
          id: '', // 将在保存时生成
          title: subtask.title,
          completed: false
        })),
        completed: false,
        createdAt: new Date().toISOString()
      }));

      setGeneratedTasks(tasksToGenerate);
      setCurrentScreen('result');
      
    } catch (error) {
      console.error('处理输入失败:', error);
      setError(error instanceof Error ? error.message : '处理失败');
      setLoadingStage('error');
    }
  };

  /**
   * 确认保存任务
   */
  const handleConfirmTasks = async (tasksToSave: Task[]) => {
    if (!user) return;

    try {
      setCurrentScreen('loading');
      setLoadingStage('saving');

      // 保存任务到数据库
      await saveTasks(tasksToSave, user.id);
      
      // 重新加载任务列表
      await loadUserTasks(user.id);
      
      // 跳转到仪表板
      setCurrentScreen('dashboard');
      
    } catch (error) {
      console.error('保存任务失败:', error);
      setError(error instanceof Error ? error.message : '保存失败');
      setLoadingStage('error');
    }
  };

  /**
   * 返回修改输入
   */
  const handleBackToInput = () => {
    setCurrentScreen('input');
    setGeneratedTasks([]);
    setError('');
  };

  /**
   * 页面导航
   */
  const handleNavigate = (screen: 'input' | 'dashboard' | 'settings') => {
    setCurrentScreen(screen);
  };

  /**
   * 开始专注模式
   */
  const handleStartFocus = (task: Task) => {
    // TODO: 实现专注模式
    console.log('开始专注模式:', task);
  };

  /**
   * 重试操作
   */
  const handleRetry = () => {
    setCurrentScreen('input');
    setError('');
  };

  // 渲染当前屏幕
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'input':
        return (
          <MainInput
            onInputComplete={handleInputComplete}
            onNavigate={handleNavigate}
            isProcessing={false}
          />
        );

      case 'loading':
        return (
          <LoadingPage
            stage={loadingStage}
            error={error}
            onRetry={handleRetry}
            transcribedText={transcribedText}
          />
        );

      case 'result':
        return (
          <TaskResult
            tasks={generatedTasks}
            onConfirm={handleConfirmTasks}
            onBack={handleBackToInput}
            isSaving={false}
          />
        );

      case 'dashboard':
        return (
          <DashboardScreen
            tasks={tasks}
            onTaskUpdate={(token) => user && loadUserTasks(user.id)}
            onStartFocus={handleStartFocus}
            onNavigate={handleNavigate}
            accessToken={user?.access_token || ''}
          />
        );

      case 'settings':
        // TODO: 实现设置页面
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">设置页面</h1>
              <p className="text-gray-600 mb-4">设置功能正在开发中...</p>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                返回仪表板
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 如果用户未登录，不渲染任何内容（会被重定向）
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentScreen()}
    </div>
  );
}