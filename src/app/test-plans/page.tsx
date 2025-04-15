import { TestPlanList } from "./components/TestPlanList";
import SidebarLayout from "@/components/layout/SidebarLayout";

export default async function TestPlansPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">测试计划管理</h1>
      <TestPlanList />
    </div>
  );
}
