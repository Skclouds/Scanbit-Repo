/**
 * Test Redis connection
 * Run: node scripts/testRedis.js  (loads REDIS_URL from .env)
 * Or: REDIS_URL="..." node scripts/testRedis.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Redis from 'ioredis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try script dir first, then cwd (for different run contexts)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
if (!process.env.REDIS_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const url = process.env.REDIS_URL || process.argv[2];
if (!url) {
  console.log('Usage: REDIS_URL="redis://..." node scripts/testRedis.js');
  console.log('   Or: node scripts/testRedis.js "redis://..."');
  process.exit(1);
}

const client = new Redis(url, {
  maxRetriesPerRequest: 5,
  connectTimeout: 15000,
});
let lastError = null;
client.on('error', (err) => { lastError = err; });

client
  .ping()
  .then(() => {
    console.log('✓ Redis connected successfully');
    return client.set('scanbit:test', 'ok', 'EX', 10);
  })
  .then(() => client.get('scanbit:test'))
  .then((val) => {
    console.log('✓ Read/Write test:', val === 'ok' ? 'OK' : 'FAIL');
    return client.del('scanbit:test');
  })
  .then(() => {
    console.log('✓ Redis test complete');
    client.quit();
    process.exit(0);
  })
  .catch((err) => {
    const e = lastError || err;
    const msg = e.message || err.message;
    const code = e.code || e.errno;
    if (msg?.includes('ENOTFOUND') || code === 'ENOTFOUND') {
      console.error('✗ Host not found. Check REDIS_URL hostname — use public IP/domain if Redis is public.');
    } else if (msg?.includes('ECONNREFUSED') || code === 'ECONNREFUSED') {
      console.error('✗ Connection refused. Is Redis running? Is port 6379 open on the server?');
    } else if (msg?.includes('ETIMEDOUT') || code === 'ETIMEDOUT') {
      console.error('✗ Connection timeout. Check firewall allows port 6379 from your IP.');
    } else {
      console.error('✗ Redis error:', msg);
    }
    client.quit();
    process.exit(1);
  });
