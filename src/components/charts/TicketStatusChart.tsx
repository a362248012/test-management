/** @format */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TicketStatusData {
  name: string;
  value: number;
  color: string;
}

interface TicketStatusChartProps {
  data: TicketStatusData[];
}

export default function TicketStatusChart({ data }: TicketStatusChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">暂无数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value}个工单`, '数量']} 
          labelFormatter={(name) => `状态: ${name}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
