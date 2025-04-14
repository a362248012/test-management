import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* ...existing header content... */}
        
        <div className="flex items-center gap-2">
          {/* 其他按钮或导航项 */}
          <ThemeToggle />
          {/* 用户菜单或其他项目 */}
        </div>
      </div>
    </header>
  );
}