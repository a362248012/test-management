"use client";

import { useEffect, useState } from "react";

interface HealthData {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  api: number;
}

export default function SystemHealth() {
  const [healthData, setHealthData] = useState<HealthData>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    api: 0,
  });

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/system-health');
      const data = await response.json();
      setHealthData({
        cpu: parseFloat(data.cpu),
        memory: parseFloat(data.memory),
        disk: parseFloat(data.disk),
        network: parseFloat(data.network),
        api: parseFloat(data.api),
      });
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value < 60) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">系统健康状态</h2>
      <div className="space-y-4">
        {Object.entries(healthData).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
              <span>{value}{key === 'api' ? 'ms' : key === 'network' ? 'Mbps' : '%'}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${getStatusColor(value)} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(value, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}
