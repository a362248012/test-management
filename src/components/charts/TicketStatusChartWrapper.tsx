"use client";

import TicketStatusChart from "./TicketStatusChart";

interface TicketStatusChartWrapperProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

export default function TicketStatusChartWrapper({ data }: TicketStatusChartWrapperProps) {
  return <TicketStatusChart data={data} />;
}
