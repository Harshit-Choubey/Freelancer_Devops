const express = require('express');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const cacheService = require('../cache/redis');
const env = require('../config/env');

const prisma = new PrismaClient();
const router = express.Router();

// ─── Liveness Probe ───────────────────────────────────────────────────────────
// Kubernetes: If this fails, restart the container.
// Docker: Used by HEALTHCHECK instruction.
router.get('/health', (req, res) => {
  logger.system('Liveness check requested');
  res.status(200).json({
    success: true,
    status: 'up',
    service: 'gigmatrix-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    memory: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
  });
});

// ─── Readiness Probe ──────────────────────────────────────────────────────────
// Kubernetes: If this fails, stop sending traffic to this pod.
// Docker Compose: depends_on healthcheck.
router.get('/ready', async (req, res) => {
  const checks = {
    database: 'unknown',
    cache: env.REDIS.ENABLED ? 'unknown' : 'disabled',
  };

  let allHealthy = true;

  // ── Database Check (MongoDB-compatible) ──
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    checks.database = 'connected';
  } catch (error) {
    checks.database = 'disconnected';
    allHealthy = false;
    logger.sysError('Readiness check: database failed', error);
  }

  // ── Cache Check ──
  if (env.REDIS.ENABLED) {
    try {
      const isUp = await cacheService.ping();
      checks.cache = isUp ? 'connected' : 'disconnected';
      if (!isUp) allHealthy = false;
    } catch (error) {
      checks.cache = 'disconnected';
      allHealthy = false;
      logger.sysError('Readiness check: cache failed', error);
    }
  }

  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: allHealthy,
    status: allHealthy ? 'ready' : 'not_ready',
    service: 'gigmatrix-api',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks,
  });
});

// ─── Metrics Endpoint (Prometheus-friendly) ───────────────────────────────────
// Returns key application metrics in a structured format.
// Can be scraped by Prometheus with a JSON exporter, or extended to text/plain format.
router.get('/metrics', (req, res) => {
  const mem = process.memoryUsage();
  const uptime = Math.floor(process.uptime());
  
  const metricsText = `
# HELP node_uptime_seconds The uptime of the Node.js process in seconds.
# TYPE node_uptime_seconds counter
node_uptime_seconds ${uptime}

# HELP node_memory_heap_used_bytes The heap memory used by the Node.js process in bytes.
# TYPE node_memory_heap_used_bytes gauge
node_memory_heap_used_bytes ${mem.heapUsed}

# HELP node_memory_heap_total_bytes The heap memory total of the Node.js process in bytes.
# TYPE node_memory_heap_total_bytes gauge
node_memory_heap_total_bytes ${mem.heapTotal}

# HELP node_memory_rss_bytes The Resident Set Size (RSS) memory of the Node.js process in bytes.
# TYPE node_memory_rss_bytes gauge
node_memory_rss_bytes ${mem.rss}
`.trim() + '\n';

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metricsText);
});

module.exports = router;
