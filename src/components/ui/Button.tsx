import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg" | "icon" | "xl";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10",
      secondary: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20",
      outline: "border border-border bg-transparent hover:bg-muted text-foreground font-semibold",
      ghost: "bg-transparent hover:bg-muted text-foreground font-semibold",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/20",
    };

    const sizes = {
      sm: "h-9 rounded-xl px-4 text-xs font-bold uppercase tracking-wider",
      md: "h-12 rounded-2xl px-6 py-2 text-sm font-bold tracking-tight",
      lg: "h-14 rounded-[1.25rem] px-8 text-base font-bold tracking-tight",
      xl: "h-16 rounded-[1.5rem] px-10 text-lg font-bold tracking-tight",
      icon: "h-12 w-12 p-0 flex items-center justify-center rounded-2xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, cn };
