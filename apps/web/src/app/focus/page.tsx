"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pause, Play, CheckCircle, ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { updateTask } from "@/lib/taskService";
import { useAuth } from "@/components/AuthProvider";
import type { Task } from "@/types/index";

/**
 * 专注模式页面内容组件
 */
function FocusModeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { tasks, loadUserTasks } = useApp();
  
  // 从URL参数获取任务ID
  const taskId = searchParams.get('taskId');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // 计时器状态
  const [timeRemaining, setTimeRemaining] = useState(0); // 剩余时间（秒）
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 当前子任务索引
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(0);
  
  // 初始化任务
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setCurrentTask(task);
        setTimeRemaining(task.estimatedTime * 60); // 转换为秒
        // 找到第一个未完成的子任务
        const firstIncompleteIndex = task.subtasks.findIndex(st => !st.completed);
        setCurrentSubtaskIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      } else {
        router.push('/dashboard');
      }
    } else if (!taskId) {
      router.push('/dashboard');
    }
  }, [taskId, tasks, router]);

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // 时间结束，显示完成提示
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining]);

  /**
   * 开始/暂停计时器
   */
  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  /**
   * 完成当前子任务
   */
  const completeCurrentSubtask = async () => {
    if (!currentTask || !user) return;

    try {
      const updatedSubtasks = [...currentTask.subtasks];
      if (updatedSubtasks[currentSubtaskIndex]) {
        updatedSubtasks[currentSubtaskIndex].completed = true;
      }

      // 检查是否所有子任务都完成
      const allCompleted = updatedSubtasks.every(st => st.completed);

      // 更新数据库
      await updateTask(currentTask.id, {
        subtasks: updatedSubtasks,
        completed: allCompleted
      }, user.id);

      // 更新本地状态
      setCurrentTask({
        ...currentTask,
        subtasks: updatedSubtasks,
        completed: allCompleted
      });

      // 如果所有子任务完成，显示庆祝并返回
      if (allCompleted) {
        await loadUserTasks();
        router.push('/dashboard?completed=true');
        return;
      }

      // 移动到下一个未完成的子任务
      const nextIncompleteIndex = updatedSubtasks.findIndex((st, index) => 
        index > currentSubtaskIndex && !st.completed
      );
      
      if (nextIncompleteIndex >= 0) {
        setCurrentSubtaskIndex(nextIncompleteIndex);
      } else {
        // 没有更多子任务，返回仪表板
        await loadUserTasks();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('完成子任务失败:', error);
      alert('操作失败，请重试');
    }
  };

  /**
   * 提前完成任务
   */
  const finishEarly = () => {
    setIsRunning(false);
    setTimeRemaining(0);
  };

  /**
   * 返回仪表板
   */
  const goBack = () => {
    router.push('/dashboard');
  };

  /**
   * 格式化时间显示
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 计算进度百分比
   */
  const getProgress = () => {
    if (!currentTask) return 0;
    const totalTime = currentTask.estimatedTime * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  if (!currentTask) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  const currentSubtask = currentTask.subtasks[currentSubtaskIndex];
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white flex flex-col">
      {/* 顶部任务信息 */}
      <div className="p-6 text-center">
        <Button
          onClick={goBack}
          variant="ghost"
          className="absolute top-6 left-6 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold mb-2">{currentTask.title}</h1>
        {currentSubtask && (
          <p className="text-purple-200 text-lg">
            当前任务: {currentSubtask.title}
          </p>
        )}
      </div>

      {/* 中央计时器区域 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* 主计时器圆环 */}
          <div className="relative w-80 h-80">
            {/* 背景圆环 */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              {/* 进度圆环 */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* 中央时间显示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold tabular-nums mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-purple-200">
                  {timeRemaining === 0 ? '时间到!' : isRunning && !isPaused ? '专注中' : '已暂停'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部控制按钮 */}
      <div className="p-8 space-y-4">
        <div className="flex justify-center gap-6">
          {/* 暂停/开始按钮 */}
          <Button
            onClick={toggleTimer}
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-4 text-lg"
            disabled={timeRemaining === 0}
          >
            {isRunning && !isPaused ? (
              <>
                <Pause className="w-6 h-6 mr-2" />
                暂停
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                {timeRemaining === 0 ? '已完成' : '开始'}
              </>
            )}
          </Button>

          {/* 完成当前子任务按钮 */}
          {currentSubtask && (
            <Button
              onClick={completeCurrentSubtask}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              完成此步骤
            </Button>
          )}
        </div>

        {/* 提前完成按钮 */}
        {timeRemaining > 0 && (
          <div className="text-center">
            <Button
              onClick={finishEarly}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              提前完成
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 专注模式页面
 * 提供全屏专注体验，帮助用户专注于单个任务
 */
export default function FocusMode() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <FocusModeContent />
    </Suspense>
  );
}