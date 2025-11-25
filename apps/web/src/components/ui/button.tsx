// React 核心库
import * as React from "react";
// Radix UI 的 Slot 组件，用于组件组合
import { Slot } from "@radix-ui/react-slot";
// class-variance-authority 用于创建类型安全的样式变体
import { cva, type VariantProps } from "class-variance-authority";

// 工具函数，用于合并 CSS 类名
import { cn } from "./utils";

/**
 * 按钮组件的样式变体配置
 * 使用 cva (class-variance-authority) 创建类型安全的样式系统
 */
const buttonVariants = cva(
	// 基础样式：布局、间距、字体、过渡效果、禁用状态、SVG 图标样式、焦点样式等
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md cursor-pointer text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			// 按钮外观变体
			variant: {
				// 默认样式：主色调背景
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				// 危险操作样式：红色背景，用于删除等操作
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				// 轮廓样式：透明背景，带边框
				outline:
					"border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				// 次要样式：次要色调背景
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				// 幽灵样式：透明背景，悬停时显示背景
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				// 链接样式：文本样式，带下划线
				link: "text-primary underline-offset-4 hover:underline",
			},
			// 按钮尺寸变体
			size: {
				// 默认尺寸
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				// 小尺寸
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				// 大尺寸
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				// 图标按钮：正方形
				icon: "size-9 rounded-md",
			},
		},
		// 默认变体配置
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

/**
 * Button 组件
 *
 * 一个高度可定制的按钮组件，支持多种样式变体和尺寸
 * 基于 Radix UI 的 Slot 组件实现，支持组件组合模式
 *
 * @param className - 额外的 CSS 类名
 * @param variant - 按钮样式变体 (default | destructive | outline | secondary | ghost | link)
 * @param size - 按钮尺寸 (default | sm | lg | icon)
 * @param asChild - 是否作为子组件渲染，为 true 时使用 Slot 组件
 * @param props - 其他 button 元素的原生属性
 */
function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	// 根据 asChild 属性决定渲染的组件类型
	// 如果 asChild 为 true，使用 Slot 组件实现组件组合
	// 否则渲染普通的 button 元素
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button" // 用于样式选择器和测试的数据属性
			className={cn(buttonVariants({ variant, size, className }))} // 合并样式变体和自定义类名
			{...props} // 展开其他属性
		/>
	);
}

// 导出 Button 组件和样式变体配置
export { Button, buttonVariants };
