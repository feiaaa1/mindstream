"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";

// AuthContext type
type AuthContextType = {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
};

// 创建context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		// 获取当前session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		// // 监听auth状态变化
		// const {
		// 	data: { subscription },
		// } = supabase.auth.onAuthStateChange((event, session) => {
		// 	setSession(session);
		// 	setUser(session?.user ?? null);
		// 	setIsLoading(false);

		// 	// 在这里处理登录/退出的通知！
		// 	if (event === "SIGNED_IN") {
		// 		// 这是你问题的关键：当检测到 SIGNED_IN 事件时，表示用户已成功登录
		// 		toast.success("登录成功！欢迎回来！");
		// 	} else if (event === "SIGNED_OUT") {
		// 		toast.success("您已成功退出。");
		// 	}
		// });

		// // 组件卸载时，取消订阅，防止内存泄漏
		// return () => {
		// 	subscription?.unsubscribe();
		// };
	}, []);

	// 如果加载中，可以返回一个loading状态
	const value = { user, session, isLoading };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 创建一个自定义 Hook，方便在其他组件中使用
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
