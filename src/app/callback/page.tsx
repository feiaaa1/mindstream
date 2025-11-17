"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				// 初始化 Supabase 客户端
				const supabase = createClient(
					`https://${projectId}.supabase.co`,
					publicAnonKey
				);

				const data = await supabase.auth.getUser();

				console.log(data, 999);

				// // 处理 OAuth 回调
				// const { data, error: authError } = await supabase.auth.getSession();

				// if (authError) {
				// 	throw authError;
				// }

				// if (data.session?.access_token) {
				// 	// 验证用户是否已存在，如果不存在则创建
				// 	const { data: profile, error: profileError } = await supabase
				// 		.from("profiles")
				// 		.select("*")
				// 		.eq("id", data.session.user.id)
				// 		.single();

				// 	if (profileError && profileError.code !== "PGRST116") {
				// 		// 如果不是"未找到记录"错误，则抛出异常
				// 		throw profileError;
				// 	}

				// 	if (!profile) {
				// 		// 创建用户资料
				// 		const { error: insertError } = await supabase.from("profiles").insert({
				// 			id: data.session.user.id,
				// 			email: data.session.user.email,
				// 			full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || data.session.user.email?.split("@")[0],
				// 			avatar_url: data.session.user.user_metadata?.avatar_url,
				// 			created_at: new Date().toISOString(),
				// 		});

				// 		if (insertError) {
				// 			throw insertError;
				// 		}
				// 	}

				// 	// 重定向到主页
				// 	router.push("/");
				// } else {
				// 	throw new Error("未获得有效的会话令牌");
				// }
			} catch (err: any) {
				console.error("OAuth 回调处理失败:", err);
				// setError(err.message || "认证失败，请重试");
				// setIsLoading(false);
			}
		};

		handleAuthCallback();
	}, [router]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
					<div className="text-red-600 text-center">
						<h2 className="text-lg font-semibold mb-4">认证失败</h2>
						<p className="mb-4">{error}</p>
						<button
							onClick={() => router.push("/login")}
							className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
						>
							返回登录页面
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
				<h2 className="text-lg font-semibold text-gray-700">正在处理认证...</h2>
				<p className="text-gray-500 mt-2">请稍候，正在为您登录...</p>
			</div>
		</div>
	);
}
