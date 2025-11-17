import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "MindStream",
	description: "倾倒你的思绪，我们来理清脉络",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider>
					<Toaster
						position="top-center" // 设置通知出现的位置
						reverseOrder={false}
					/>
					<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
						{children}
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
