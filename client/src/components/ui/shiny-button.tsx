import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
}

export function ShinyButton({ 
  children, 
  className, 
  isLoading, 
  variant = "primary",
  disabled,
  ...props 
}: ShinyButtonProps) {
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "relative px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
