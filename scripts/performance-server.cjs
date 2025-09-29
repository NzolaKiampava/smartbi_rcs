#!/usr/bin/env node
// Local performance WebSocket server that collects real machine metrics
// Usage: node scripts/performance-server.cjs

const si = require('systeminformation');
const WebSocket = require('ws');

const PORT = process.env.PERF_PORT || 4000;
const PATH = '/performance';

const wss = new WebSocket.Server({ port: PORT, path: PATH }, () => {
  console.log(`Performance WebSocket server running on ws://localhost:${PORT}${PATH}`);
});

function formatMetricCards(load, mem, fsStats) {
  return [
    { id: 'cpu', title: 'CPU Load', value: `${load.currentLoad.toFixed(1)}%`, change: 0, changeType: 'increase', color: 'bg-blue-500', target: '< 80%', status: load.currentLoad < 80 ? 'good' : 'warning' },
    { id: 'memory', title: 'Memory Usage', value: `${((mem.active / mem.total) * 100).toFixed(1)}%`, change: 0, changeType: 'increase', color: 'bg-green-500', target: '< 80%', status: (mem.active / mem.total) * 100 < 80 ? 'good' : 'warning' },
    { id: 'uptime', title: 'System Uptime', value: `${(si.time().uptime/3600).toFixed(1)}h`, change: 0, changeType: 'increase', color: 'bg-emerald-500', target: '> 0', status: 'excellent' },
    { id: 'disk', title: 'Disk Usage', value: `${fsStats ? fsStats.usedPercent.toFixed(1) : 0}%`, change: 0, changeType: 'increase', color: 'bg-orange-500', target: '< 90%', status: fsStats && fsStats.usedPercent < 90 ? 'good' : 'warning' }
  ];
}

async function collectMetrics() {
  try {
    const load = await si.currentLoad();
    const mem = await si.mem();
    const fs = await si.fsSize();
    const fsStats = fs && fs[0] ? { usedPercent: (fs[0].used / fs[0].size) * 100, mount: fs[0].mount } : null;
  const net = await si.networkStats();

  // compute rx/tx per second for primary interface (if available)
  return { load, mem, fsStats, net };
  } catch (e) {
    console.error('Error collecting metrics', e);
    return null;
  }
}

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

// Broadcast metrics every 1s
setInterval(async () => {
  const m = await collectMetrics();
  if (!m) return;

  // system metrics cards
  const systemMetrics = formatMetricCards(m.load, m.mem, m.fsStats);

  // resource utilization pie-like
  const resourceUtilization = [
    { name: 'CPU', value: Math.round(m.load.currentLoad), color: '#3B82F6' },
    { name: 'Memory', value: Math.round((m.mem.active / m.mem.total) * 100), color: '#10B981' },
    { name: 'Disk', value: Math.round(m.fsStats ? m.fsStats.usedPercent : 0), color: '#F59E0B' }
  ];

  const message1 = { type: 'system_metrics', payload: systemMetrics };
  const message2 = { type: 'resource_utilization', payload: resourceUtilization };

  broadcast(message1);
  broadcast(message2);

  // Network stats: send interface name, rx_bytes, tx_bytes, rx_sec, tx_sec (simple approximation)
  try {
    const nets = await si.networkStats();
    const networkPayload = nets.map(n => ({
      iface: n.iface,
      operstate: n.operstate,
      rx_bytes: n.rx_bytes,
      tx_bytes: n.tx_bytes,
      rx_sec: n.rx_sec,
      tx_sec: n.tx_sec
    }));
    broadcast({ type: 'network_stats', payload: networkPayload });
  } catch (e) {
    // ignore network errors
  }

  // send alert if thresholds exceeded
  if (m.load.currentLoad > 85 || (m.mem.active / m.mem.total) * 100 > 90) {
    const alert = {
      severity: m.load.currentLoad > 85 ? 'critical' : 'warn',
      title: m.load.currentLoad > 85 ? 'High CPU Load' : 'High Memory Usage',
      message: m.load.currentLoad > 85 ? `CPU load is ${m.load.currentLoad.toFixed(1)}%` : `Memory usage is ${((m.mem.active / m.mem.total) * 100).toFixed(1)}%`,
      timestamp: Date.now()
    };
    broadcast({ type: 'alert', payload: alert });
  }

}, 1000);

wss.on('connection', (ws) => {
  console.log('Client connected to performance WS');
  ws.send(JSON.stringify({ type: 'info', payload: { message: 'connected' } }));
});

wss.on('listening', () => {
  // noop
});

wss.on('error', (err) => {
  console.error('WebSocket server error', err);
});
