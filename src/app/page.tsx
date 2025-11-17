"use client";

// React hooks 导入
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Next.js 路由导入
import { useRouter } from "next/navigation";
// 主应用组件
import MindStreamApp from "@/components/MindStreamApp";

/**
 * 主页组件 - MindStream 应用的首页
 * 功能：
 * 1. 用户身份验证检查
 * 2. 显示用户欢迎界面
 * 3. 提供导航到其他功能页面的入口
 * 4. 处理用户登出
 */
export default function Home() {
	return <MindStreamApp />;
}
