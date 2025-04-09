import { NextResponse } from 'next/server';
import os from 'os';
import si from 'systeminformation';

export async function GET() {
  const startTime = performance.now();
  try {
    const cpu = await si.currentLoad();
    const memory = await si.mem();
    const disk = await si.fsSize();
    const network = await si.networkStats();
    
    const healthData = {
      cpu: cpu.currentLoad.toFixed(1),
      memory: ((memory.used / memory.total) * 100).toFixed(1),
      disk: ((disk[0]?.used || 0) / (disk[0]?.size || 1) * 100).toFixed(1),
      network: (network[0]?.rx_sec || 0) / 1024 / 1024, // MB/s
      api: performance.now() - startTime // 计算API响应时间(ms)
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to get system health' },
      { status: 500 }
    );
  }
}
