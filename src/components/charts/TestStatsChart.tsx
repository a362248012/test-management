"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/context/theme";

interface StatsData {
  name: string;
  value: number;
  color?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-800 dark:text-gray-200">{payload[0].name}</p>
        <p className="text-gray-600 dark:text-gray-300">
          数量: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function TestStatsChart({ data }: { data: StatsData[] }) {
  const { theme } = useTheme();

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={theme === "dark" ? 0.3 : 1} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: theme === "dark" ? '#9ca3af' : '#6b7280' }}
              axisLine={{ stroke: theme === "dark" ? '#4b5563' : '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: theme === "dark" ? '#9ca3af' : '#6b7280' }}
              axisLine={{ stroke: theme === "dark" ? '#4b5563' : '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-gray-600 dark:text-gray-300">{value}</span>
              )}
            />
            <Bar dataKey="value" fill={theme === "dark" ? "#3b82f6" : "#60a5fa"} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
