"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function TestStatsChart() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">测试执行统计</h2>
      <div className="h-64">
        <BarChart
          width={500}
          height={300}
          data={[
            { name: '通过', value: 45 },
            { name: '失败', value: 8 },
            { name: '阻塞', value: 3 },
            { name: '未执行', value: 12 },
          ]}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
}
