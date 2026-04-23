import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-[10px] font-bold tracking-[0.15em] uppercase ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary/80 hover:bg-primary/90 active:bg-primary/80",
        destructive: "bg-destructive text-destructive-foreground border-destructive/80 hover:bg-destructive/90 active:bg-destructive/80",
        outline: "bg-transparent text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary active:bg-accent/80",
        secondary: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 hover:text-foreground active:bg-secondary",
        ghost: "bg-transparent text-secondary-foreground border-transparent hover:bg-accent hover:text-foreground active:bg-accent/80",
        link: "text-primary border-transparent underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-[9px]",
        lg: "h-10 px-6 text-[11px]",
        icon: "h-9 w-9",
        xl: "h-11 px-8 text-[11px]",
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
