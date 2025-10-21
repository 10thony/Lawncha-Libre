import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-modern hover:shadow-modern-lg hover:scale-105 active:scale-95",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-modern hover:shadow-modern-lg hover:scale-105 active:scale-95",
        outline: "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
        secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-black/20 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        neumorphism: "neumorphism text-gray-700 dark:text-gray-300 hover:shadow-neumorphism-inset active:shadow-neumorphism-inset",
        gradient: "bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
