"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, ArrowLeft, Save } from "lucide-react";
import type { Task } from "@/types/index";

/**
 * 任务生成结果页面的属性接口
 */
interface TaskResultProps {
  /** 生成的任务数据 */
  tasks: Task[];
  /** 确认保存任务的回调函数 */
  onConfirm: (tasks: Task[]) => void;
  /** 返回修改的回调函数 */
  onBack: () => void;
  /** 是否正在保存 */
  isSaving: boolean;
}

/**
 * 任务生成结果展示页面
 * 显示AI生成的结构化任务，允许用户预览、编辑和确认
 */
export default function TaskResult({
  tasks,
  onConfirm,
  onBack,
  isSaving
}: TaskResultProps) {
  // 编辑状态管理
  const [editingTasks, setEditingTasks] = useState<Task[]>(tasks || []);
  const [isEditing, setIsEditing] = useState(false);

  /**
   * 更新任务标题
   */
  const updateTaskTitle = (taskIndex: number, newTitle: string) => {
    const updatedTasks = [...editingTasks];
    updatedTasks[taskIndex].title = newTitle;
    setEditingTasks(updatedTasks);
  };

  /**
   * 更新子任务标题
   */
  const updateSubtaskTitle = (taskIndex: number, subtaskIndex: number, newTitle: string) => {
    const updatedTasks = [...editingTasks];
    updatedTasks[taskIndex].subtasks[subtaskIndex].title = newTitle;
    setEditingTasks(updatedTasks);
  };

  /**
   * 更新任务分类
   */
  const updateTaskCategory = (taskIndex: number, newCategory: string) => {
    const updatedTasks = [...editingTasks];
    updatedTasks[taskIndex].category = newCategory;
    setEditingTasks(updatedTasks);
  };

  /**
   * 更新预估时间
   */
  const updateEstimatedTime = (taskIndex: number, newTime: number) => {
    const updatedTasks = [...editingTasks];
    updatedTasks[taskIndex].estimatedTime = newTime;
    setEditingTasks(updatedTasks);
  };

  /**
   * 保存编辑
   */
  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  /**
   * 取消编辑
   */
  const handleCancelEdit = () => {
    setEditingTasks(tasks || []);
    setIsEditing(false);
  };

  /**
   * 确认保存所有任务
   */
  const handleConfirm = () => {
    onConfirm(editingTasks);
  };

  // 保存中状态
  if (isSaving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-green-600">正在保存任务...</h2>
            <p className="text-gray-600">马上就好，请稍等</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-purple-600 mb-2">任务生成完成 ✨</h1>
          <p className="text-gray-600">
            AI 已经为你整理好了任务，你可以预览、编辑或直接保存
          </p>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回修改
          </Button>
          
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑任务
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                variant="outline"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                保存编辑
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
              >
                取消
              </Button>
            </div>
          )}
        </div>

        {/* 任务列表 */}
        <div className="space-y-6 mb-8">
          {editingTasks?.map((task, taskIndex) => (
            <div
              key={taskIndex}
              className="bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6"
            >
              {/* 任务标题和基本信息 */}
              <div className="mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTaskTitle(taskIndex, e.target.value)}
                    className="text-xl font-semibold w-full p-2 border rounded-lg mb-2"
                  />
                ) : (
                  <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                )}
                
                <div className="flex gap-4 flex-wrap">
                  {/* 分类 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">分类:</span>
                    {isEditing ? (
                      <select
                        value={task.category}
                        onChange={(e) => updateTaskCategory(taskIndex, e.target.value)}
                        className="text-sm px-2 py-1 border rounded"
                      >
                        <option value="工作">工作</option>
                        <option value="生活">生活</option>
                        <option value="学习">学习</option>
                        <option value="健康">健康</option>
                        <option value="其他">其他</option>
                      </select>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {task.category}
                      </span>
                    )}
                  </div>
                  
                  {/* 预估时间 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">预估时间:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={task.estimatedTime}
                        onChange={(e) => updateEstimatedTime(taskIndex, parseInt(e.target.value) || 0)}
                        className="text-sm px-2 py-1 border rounded w-20"
                        min="5"
                        max="480"
                      />
                    ) : (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {task.estimatedTime} 分钟
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 子任务列表 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">子任务:</h4>
                {task.subtasks?.map((subtask, subtaskIndex) => (
                  <div key={subtaskIndex} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => updateSubtaskTitle(taskIndex, subtaskIndex, e.target.value)}
                        className="flex-1 p-1 border rounded"
                      />
                    ) : (
                      <span className="flex-1">{subtask.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 确认按钮 */}
        <div className="text-center">
          <Button
            onClick={handleConfirm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            disabled={isEditing}
          >
            确认保存所有任务
          </Button>
        </div>
      </div>
    </div>
  );
}