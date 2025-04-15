"use client";

import TestStatsChart from "./TestStatsChart";

interface TestStatsChartWrapperProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export default function TestStatsChartWrapper({ data }: TestStatsChartWrapperProps) {
  return <TestStatsChart data={data} />;
}
