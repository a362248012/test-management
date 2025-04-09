"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "@/context/theme";

interface TrendData {
  date: string;
  passRate: number;
  failRate: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-green-600 dark:text-green-500">
          通过率: <span className="font-bold">{payload[0].value}%</span>
        </p>
        <p className="text-red-500 dark:text-red-400">
          失败率: <span className="font-bold">{payload[1].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PassFailTrendChart({ data }: { data: TrendData[] }) {
  const { theme } = useTheme();
  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">通过率/失败率趋势</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === "dark" ? "#16a34a" : "#4ade80"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme === "dark" ? "#16a34a" : "#4ade80"} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === "dark" ? "#dc2626" : "#f87171"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme === "dark" ? "#dc2626" : "#f87171"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={theme === "dark" ? 0.3 : 1} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: theme === "dark" ? '#9ca3af' : '#6b7280' }}
              axisLine={{ stroke: theme === "dark" ? '#4b5563' : '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: theme === "dark" ? '#9ca3af' : '#6b7280' }}
              axisLine={{ stroke: theme === "dark" ? '#4b5563' : '#e5e7eb' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-gray-600 dark:text-gray-300">{value}</span>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="passRate" 
              stroke={theme === "dark" ? "#16a34a" : "#4ade80"}
              fillOpacity={1} 
              fill="url(#colorPass)" 
              name="通过率(%)"
              strokeWidth={2}
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="failRate" 
              stroke={theme === "dark" ? "#dc2626" : "#f87171"}
              fillOpacity={1}
              fill="url(#colorFail)" 
              name="失败率(%)"
              strokeWidth={2}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
