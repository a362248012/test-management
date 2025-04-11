import { EditTestPlan } from "@/app/test-plans/components/EditTestPlan";
import { notFound } from "next/navigation";

async function getTestPlan(id: string) {
  const res = await fetch(`http://localhost:3000/api/test-plans/${id}`);
  if (!res.ok) return undefined;
  return await res.json();
}

export default async function TestPlanEditPage({
  params,
}: {
  params: { id: string };
}) {
  const plan = await getTestPlan(params.id);
  if (!plan) return notFound();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">编辑测试计划</h1>
      <EditTestPlan plan={plan} />
    </div>
  );
}
