import { NextResponse } from "next/server";
import si from "systeminformation";
import { withAdminAuth, withErrorHandler } from '@/lib/api-middleware';

// 缓存最近的健康数据，避免频繁查询
let cachedHealthData: any = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 缓存30秒

export const GET = withAdminAuth(async () => {
  const now = Date.now();
  
  // 如果缓存数据仍然有效，直接返回
  if (cachedHealthData && (now - cacheTime) < CACHE_TTL) {
    return NextResponse.json({
      ...cachedHealthData,
      fromCache: true
    });
  }
  
  const startTime = performance.now();
  
  // 并行获取所有系统信息
  const [cpu, memory, disk, network] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats()
  ]);
  
  const healthData = {
    cpu: {
      currentLoad: cpu.currentLoad.toFixed(1),
      cores: cpu.cpus?.length || 0
    },
    memory: {
      total: Math.round(memory.total / (1024 * 1024 * 1024)), // GB
      used: Math.round(memory.used / (1024 * 1024 * 1024)),  // GB
      percentUsed: ((memory.used / memory.total) * 100).toFixed(1)
    },
    disk: {
      total: Math.round((disk[0]?.size || 0) / (1024 * 1024 * 1024)), // GB
      used: Math.round((disk[0]?.used || 0) / (1024 * 1024 * 1024)),  // GB
      percentUsed: ((disk[0]?.used || 0) / (disk[0]?.size || 1) * 100).toFixed(1)
    },
    network: {
      rx: ((network[0]?.rx_sec || 0) / 1024 / 1024).toFixed(2), // MB/s
      tx: ((network[0]?.tx_sec || 0) / 1024 / 1024).toFixed(2)  // MB/s
    },
    api: Math.round(performance.now() - startTime), // ms
    timestamp: new Date().toISOString()
  };

  // 更新缓存
  cachedHealthData = healthData;
  cacheTime = now;

  return NextResponse.json(healthData);
});
