import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  borderStyle?: "none" | "default" | "accent";
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, title, description, icon, footer, children, hover = true, glow = false, gradient = false, borderStyle = "default", ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "overflow-hidden",
          hover && "transition-all duration-300 hover:-translate-y-1",
          glow && "hover:shadow-lg hover:shadow-primary/10",
          gradient && "bg-gradient-to-br from-card to-background",
          borderStyle === "none" && "border-none",
          borderStyle === "accent" && "border-primary/20",
          className
        )}
        {...props}
      >
        {(title || description || icon) && (
          <CardHeader className={cn("flex", icon ? "flex-row items-center gap-4" : "")}>
            {icon && <div className="shrink-0 rounded-lg bg-muted p-2">{icon}</div>}
            <div>
              {title && (typeof title === "string" ? <CardTitle>{title}</CardTitle> : title)}
              {description && (typeof description === "string" ? <CardDescription>{description}</CardDescription> : description)}
            </div>
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export { EnhancedCard };
