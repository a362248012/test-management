"use client";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between py-4">
        <div>
          {/* 应用logo或标题 */}
          <h1 className="text-xl font-bold">测试平台</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 其他导航项目 */}
          {/* 用户菜单或其他功能按钮 */}
        </div>
      </div>
    </nav>
  );
}
