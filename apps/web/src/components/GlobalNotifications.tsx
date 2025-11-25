"use client";

import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

/**
 * 全局通知组件
 * 显示错误和成功消息
 */
export default function GlobalNotifications() {
  const { error, successMessage, clearError, clearSuccessMessage } = useApp();

  // 自动清除消息
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        clearSuccessMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccessMessage]);

  return (
    <>
      {/* 错误通知 */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-red-400">⚠️</div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功通知 */}
      {successMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-green-400">✅</div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={clearSuccessMessage}
                className="ml-3 flex-shrink-0 text-green-400 hover:text-green-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}