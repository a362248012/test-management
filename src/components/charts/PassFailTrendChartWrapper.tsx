"use client";

import PassFailTrendChart from "./PassFailTrendChart";

interface PassFailTrendChartWrapperProps {
  data: Array<{
    date: string;
    passRate: number;
    failRate: number;
  }>;
}

export default function PassFailTrendChartWrapper({ data }: PassFailTrendChartWrapperProps) {
  return <PassFailTrendChart data={data} />;
}
