"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";

/**
 * 加载页面的属性接口
 */
interface LoadingPageProps {
  /** 当前加载阶段 */
  stage: 'transcribing' | 'structuring' | 'saving' | 'error';
  /** 错误信息（如果有） */
  error?: string;
  /** 重试回调函数 */
  onRetry?: () => void;
  /** 转录后的文本（可选显示） */
  transcribedText?: string;
}

/**
 * 专门的加载页面组件
 * 显示不同阶段的加载状态和进度
 */
export default function LoadingPage({
  stage,
  error,
  onRetry,
  transcribedText
}: LoadingPageProps) {
  // 获取当前阶段的配置
  const getStageConfig = () => {
    switch (stage) {
      case 'transcribing':
        return {
          title: "正在转换语音...",
          description: "AI 正在理解你的话语",
          color: "blue",
          progress: 33
        };
      case 'structuring':
        return {
          title: "正在整理思绪...",
          description: "AI 正在为你创建结构化任务",
          color: "purple",
          progress: 66
        };
      case 'saving':
        return {
          title: "正在保存任务...",
          description: "马上就好，请稍等",
          color: "green",
          progress: 100
        };
      case 'error':
        return {
          title: "处理失败",
          description: error || "发生了未知错误",
          color: "red",
          progress: 0
        };
      default:
        return {
          title: "处理中...",
          description: "请稍等",
          color: "purple",
          progress: 50
        };
    }
  };

  const config = getStageConfig();

  // 错误状态
  if (stage === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          {/* 错误图标 */}
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          
          {/* 错误信息 */}
          <div className="space-y-2">
            <h2 className="text-red-600 text-xl font-semibold">{config.title}</h2>
            <p className="text-gray-600">{config.description}</p>
          </div>

          {/* 重试按钮 */}
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 正常加载状态
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* 动态加载动画 */}
        <div className="relative w-32 h-32 mx-auto">
          {/* 外层进度环 */}
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          
          {/* 进度环 */}
          <div 
            className={`absolute inset-0 border-4 rounded-full border-t-transparent transition-all duration-1000 ${
              config.color === 'blue' ? 'border-blue-600 animate-spin' :
              config.color === 'purple' ? 'border-purple-600 animate-spin' :
              config.color === 'green' ? 'border-green-600 animate-spin' :
              'border-gray-600 animate-spin'
            }`}
            style={{
              transform: `rotate(${(config.progress / 100) * 360}deg)`
            }}
          ></div>
          
          {/* 中心图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className={`w-8 h-8 ${
              config.color === 'blue' ? 'text-blue-600' :
              config.color === 'purple' ? 'text-purple-600' :
              config.color === 'green' ? 'text-green-600' :
              'text-gray-600'
            } animate-pulse`} />
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              config.color === 'blue' ? 'bg-blue-600' :
              config.color === 'purple' ? 'bg-purple-600' :
              config.color === 'green' ? 'bg-green-600' :
              'bg-gray-600'
            }`}
            style={{ width: `${config.progress}%` }}
          ></div>
        </div>

        {/* 状态文字 */}
        <div className="space-y-2">
          <h2 className={`text-xl font-semibold ${
            config.color === 'blue' ? 'text-blue-600' :
            config.color === 'purple' ? 'text-purple-600' :
            config.color === 'green' ? 'text-green-600' :
            'text-gray-600'
          }`}>
            {config.title}
          </h2>
          <p className="text-gray-600">{config.description}</p>
        </div>

        {/* 转录文本显示 */}
        {transcribedText && stage === 'structuring' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">识别到的文字：</p>
            <p className="text-gray-900 text-left">{transcribedText}</p>
          </div>
        )}

        {/* 阶段指示器 */}
        <div className="flex justify-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            ['transcribing', 'structuring', 'saving'].includes(stage) ? 'bg-blue-600' : 'bg-gray-300'
          }`}></div>
          <div className={`w-3 h-3 rounded-full ${
            ['structuring', 'saving'].includes(stage) ? 'bg-purple-600' : 'bg-gray-300'
          }`}></div>
          <div className={`w-3 h-3 rounded-full ${
            stage === 'saving' ? 'bg-green-600' : 'bg-gray-300'
          }`}></div>
        </div>
      </div>
    </div>
  );
}