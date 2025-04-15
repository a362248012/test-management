import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | "default" 
    | "secondary" 
    | "destructive" 
    | "outline" 
    | "ghost" 
    | "link"
    | "gradient" 
    | "soft" 
    | "glow";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  rounded?: "default" | "full" | "none";
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    size = "default", 
    loading = false, 
    loadingText,
    icon,
    iconPosition = "left",
    rounded = "default",
    ...props 
  }, ref) => {
    // 自定义变体
    const customVariants = {
      gradient: "bg-gradient-to-r from-primary to-accent border-0 text-primary-foreground hover:from-primary/90 hover:to-accent/90",
      soft: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
      glow: "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transition-all",
    };

    // 圆角样式
    const roundedStyles = {
      default: "",
      full: "rounded-full",
      none: "rounded-none",
    };

    // 变体判断
    const variantClass = (variant === "gradient" || variant === "soft" || variant === "glow")
      ? customVariants[variant]
      : "";

    return (
      <Button
        ref={ref}
        variant={["gradient", "soft", "glow"].includes(variant) ? "default" : variant}
        size={size}
        className={cn(
          variantClass,
          roundedStyles[rounded],
          loading && "opacity-80 pointer-events-none",
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {icon && iconPosition === "left" && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        
        {loading && loadingText ? loadingText : children}
        
        {icon && iconPosition === "right" && !loading && (
          <span className="ml-2">{icon}</span>
        )}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };
