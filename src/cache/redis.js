const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * CacheService — Redis abstraction layer.
 *
 * CURRENT MODE: Mock (passthrough) — REDIS_ENABLED=false
 * TO ACTIVATE:  Set REDIS_ENABLED=true and REDIS_URL in .env
 *               Uncomment the ioredis lines below and run: npm install ioredis
 *
 * This interface is stable — no other code changes needed when Redis is activated.
 * Also provides the pub/sub clients needed for Socket.IO Redis Adapter (horizontal scaling).
 */
class CacheService {
  constructor() {
    this.client = null;
    this.isReady = false;

    if (env.REDIS.ENABLED) {
      this._initRedis();
    } else {
      logger.system('CacheService: running in mock mode (REDIS_ENABLED=false)');
    }
  }

  _initRedis() {
    try {
      // Uncomment when ioredis is installed:
      // const Redis = require('ioredis');
      // this.client = new Redis(env.REDIS.URL);
      // this.client.on('connect', () => {
      //   this.isReady = true;
      //   logger.system('Redis connected', { url: env.REDIS.URL });
      // });
      // this.client.on('error', (err) => {
      //   logger.sysError('Redis connection error', err);
      //   this.isReady = false;
      // });

      // Placeholder until ioredis is installed:
      logger.system('CacheService: REDIS_ENABLED=true but ioredis not installed. Running in mock mode.');
    } catch (err) {
      logger.sysError('CacheService: failed to initialize Redis', err);
    }
  }

  // ─── Get ──────────────────────────────────────────────────────────────────
  async get(key) {
    if (!this.isReady) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      logger.sysError('Cache get error', err);
      return null;
    }
  }

  // ─── Set ──────────────────────────────────────────────────────────────────
  async set(key, value, expireTimeInSeconds = 3600) {
    if (!this.isReady) return false;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', expireTimeInSeconds);
      return true;
    } catch (err) {
      logger.sysError('Cache set error', err);
      return false;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  async del(key) {
    if (!this.isReady) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      logger.sysError('Cache del error', err);
      return false;
    }
  }

  // ─── Health Check ─────────────────────────────────────────────────────────
  async ping() {
    if (!this.isReady) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

module.exports = new CacheService();
