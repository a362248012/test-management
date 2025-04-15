"use client";

import TestPlanProgressChart from "./TestPlanProgressChart";

interface TestPlanProgressChartWrapperProps {
  progress: number;
}

export default function TestPlanProgressChartWrapper({ progress }: TestPlanProgressChartWrapperProps) {
  return <TestPlanProgressChart progress={progress} />;
}
