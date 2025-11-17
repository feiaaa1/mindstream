"use client";

// React 核心 hooks，用于状态管理和副作用处理
import { useState, useEffect } from "react";
// UI 组件库，提供按钮、输入框、标签等基础组件
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Supabase 客户端实例，已配置好的数据库连接
import { supabase } from "@/lib/supabaseClient";
// 图标组件，用于界面装饰和功能标识
import { Sparkles, Github } from "lucide-react";
// Next.js 路由钩子，用于页面导航
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

/**
 * 认证页面组件 - 支持登录和注册功能
 *
 * 功能特性：
 * - 用户登录/注册切换
 * - 邮箱密码认证
 * - GitHub OAuth 登录
 * - 邮箱确认机制
 * - 错误处理和用户反馈
 */
export default function AuthScreen() {
	// 表单状态管理
	const [isSignUp, setIsSignUp] = useState(false); // 是否显示注册表单
	const [email, setEmail] = useState(""); // 邮箱输入
	const [password, setPassword] = useState(""); // 密码输入
	const [name, setName] = useState(""); // 姓名输入（仅注册时需要）
	const [error, setError] = useState(""); // 错误信息显示
	const [isLoading, setIsLoading] = useState(false); // 表单提交加载状态
	const [isResending, setIsResending] = useState(false); // 重新发送确认邮件状态
	const router = useRouter(); // 路由对象

	// 页面加载时检查用户登录状态，已登录则跳转到首页
	useEffect(() => {
		const checkUser = async () => {
			// 获取当前会话信息
			const {
				data: { session },
			} = await supabase.auth.getSession();
			// 如果用户已登录，直接跳转到主页
			if (session?.user) {
				router.push("/");
			}
		};
		checkUser();
	}, [router]); // 依赖 router 对象

	/**
	 * 处理用户登录逻辑
	 * @param e - 表单提交事件
	 */
	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault(); // 阻止表单默认提交行为
		setError(""); // 清空之前的错误信息
		setIsLoading(true); // 设置加载状态

		try {
			// 调用 Supabase API 进行邮箱密码登录
			const { data, error: signInError } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});

			// 检查是否有登录错误
			if (signInError) throw signInError;

			// 登录成功，跳转到首页
			if (data.session?.access_token) {
				router.push("/");
				toast.success("登录成功！欢迎回来！");
			}
		} catch (err: any) {
			// 根据不同的错误类型显示相应的错误信息
			if (err.code === "email_not_confirmed") {
				// 邮箱未确认错误，提示用户确认邮箱
				setError(
					"邮箱未确认。请检查您的邮箱并点击确认链接，或者点击下方按钮重新发送确认邮件。"
				);
			} else if (err.code === "invalid_credentials") {
				// 凭据无效错误，提示用户检查输入
				setError("邮箱或密码错误，请检查您的输入");
			} else {
				// 其他未知错误，显示通用错误信息
				setError(err.message || "登录失败，请检查您的邮箱和密码");
			}
		} finally {
			// 无论成功失败都要重置加载状态
			setIsLoading(false);
		}
	};

	/**
	 * 处理重新发送邮箱确认邮件
	 * 当用户邮箱未确认时，可以重新发送确认邮件
	 */
	const handleResendConfirmation = async () => {
		// 检查邮箱是否已输入
		if (!email) {
			setError("请先输入邮箱地址");
			return;
		}

		setIsResending(true); // 设置重新发送状态
		try {
			// 调用 Supabase API 重新发送确认邮件
			const { error } = await supabase.auth.resend({
				type: "signup", // 指定重新发送类型为注册确认
				email: email,
			});

			if (error) throw error;

			// 成功重新发送邮件，提示用户检查邮箱
			setError("确认邮件已重新发送，请检查您的邮箱（包括垃圾邮件文件夹）");
		} catch (err: any) {
			// 发送失败，显示错误信息
			setError(err.message || "重新发送确认邮件失败，请稍后重试");
		} finally {
			// 重置重新发送状态
			setIsResending(false);
		}
	};

	/**
	 * 处理用户注册逻辑
	 * @param e - 表单提交事件
	 */
	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault(); // 阻止表单默认提交行为
		setError(""); // 清空之前的错误信息
		setIsLoading(true); // 设置加载状态

		try {
			// 调用 Supabase API 进行用户注册
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						name: name, // 将用户姓名存储到用户元数据中
					},
				},
			});

			if (signUpError) throw signUpError;

			if (data.user) {
				// 注册成功，自动跳转到首页
				router.push("/");
			}
		} catch (err: any) {
			// 注册失败，显示错误信息
			setError(err.message || "注册失败，请稍后重试");
		} finally {
			// 重置加载状态
			setIsLoading(false);
		}
	};

	/**
	 * 处理 GitHub OAuth 登录
	 * 使用 OAuth 重定向方式进行第三方登录
	 */
	const handleGitHubSignIn = async () => {
		try {
			setError(""); // 清空之前的错误信息
			// 调用 Supabase OAuth API 进行 GitHub 登录
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "github", // 指定使用 GitHub 作为 OAuth 提供商
				options: {
					redirectTo: `${window.location.origin}/`, // 登录成功后重定向到首页
				},
			});

			if (error) throw error;
		} catch (err: any) {
			// 登录失败，记录错误并显示用户友好的错误信息
			console.error("GitHub登录错误:", err);
			setError(err.message || "GitHub登录失败，请稍后重试");
		}
	};

	return (
		// 主容器：全屏居中布局，使用渐变背景色
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
			<div className="w-full max-w-md">
				{/* 品牌标识区域 */}
				<div className="text-center mb-8">
					{/* 应用图标 */}
					<div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
						<Sparkles className="w-8 h-8 text-white" />
					</div>
					{/* 应用名称和标语 */}
					<h1 className="text-purple-600 mb-2">MindStream</h1>
					<p className="text-gray-600">倾倒你的思绪，我们来理清脉络</p>
				</div>

				{/* 登录/注册表单卡片 */}
				<div className="bg-white rounded-2xl shadow-xl p-8">
					{/* 表单主体 */}
					<form
						onSubmit={isSignUp ? handleSignUp : handleSignIn}
						className="space-y-6"
					>
						{/* 注册时显示的姓名输入框 */}
						{isSignUp && (
							<div className="space-y-2">
								<Label htmlFor="name">姓名</Label>
								<Input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="输入您的姓名"
									required={isSignUp}
								/>
							</div>
						)}

						{/* 邮箱输入框 */}
						<div className="space-y-2">
							<Label htmlFor="email">邮箱</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="输入您的邮箱"
								required
							/>
						</div>

						{/* 密码输入框 */}
						<div className="space-y-2">
							<Label htmlFor="password">密码</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="输入您的密码"
								required
							/>
						</div>

						{/* 错误信息显示区域 */}
						{error && (
							<div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
								<div className="mb-2">{error}</div>
								{/* 如果是邮箱未确认错误，显示重新发送按钮 */}
								{error.includes("邮箱未确认") && (
									<button
										type="button"
										onClick={handleResendConfirmation}
										disabled={isResending}
										className="text-red-600 hover:text-red-700 text-sm underline"
									>
										{isResending ? "发送中..." : "重新发送确认邮件"}
									</button>
								)}
							</div>
						)}

						{/* GitHub OAuth 登录按钮 */}
						<Button
							type="button"
							onClick={handleGitHubSignIn}
							className="w-full bg-gray-900 hover:bg-gray-800 cursor-pointer text-white flex items-center justify-center gap-2"
							disabled={isLoading}
						>
							<Github className="w-5 h-5" />
							{isLoading ? "处理中..." : "使用 GitHub 登录"}
						</Button>

						{/* 分隔线 - "或" */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-gray-500">或</span>
							</div>
						</div>

						{/* 主要提交按钮 - 根据当前模式显示登录或注册 */}
						<Button
							type="submit"
							className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer text-white"
							disabled={isLoading}
						>
							{isLoading ? "处理中..." : isSignUp ? "注册" : "登录"}
						</Button>
					</form>

					{/* 切换登录/注册模式的按钮 */}
					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsSignUp(!isSignUp); // 切换模式
								setError(""); // 清空错误信息
							}}
							className="text-purple-600 hover:text-purple-700 cursor-pointer"
						>
							{isSignUp ? "已有账户？立即登录" : "没有账户？立即注册"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
