"use client";

import dynamic from "next/dynamic";

const TestStatsChart = dynamic(
  () => import("./TestStatsChart"),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function TestStatsChartWrapper() {
  return <TestStatsChart />;
}
