const Redis = require('ioredis');

const store = new Map();
const mockRedis = {
  isMock: true,
  async get(key) {
    return store.get(key) || null;
  },
  async set(key, value, mode, duration) {
    store.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => store.delete(key), duration * 1000);
    }
    return 'OK';
  },
  async del(key) {
    return store.delete(key) ? 1 : 0;
  },
  async incr(key) {
    const val = parseInt(store.get(key) || '0', 10) + 1;
    store.set(key, val.toString());
    return val;
  },
  async keys(pattern) {
    const keys = Array.from(store.keys());
    if (!pattern || pattern === '*') return keys;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return keys.filter(k => regex.test(k));
  },
  on() {}
};

let client;
let useMock = false;

try {
  client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times > 2) {
        useMock = true;
        console.warn('Redis server unreachable. Switching to in-memory mock.');
        return null;
      }
      return 500;
    }
  });

  client.on('error', (err) => {
    if (!useMock) {
      console.warn('Redis connection error, falling back to mock client:', err.message);
      useMock = true;
    }
  });
} catch (err) {
  console.warn('Failed to initialize Redis client, using mock:', err.message);
  useMock = true;
}

const redisProxy = new Proxy({}, {
  get(target, prop) {
    if (useMock || !client) {
      return mockRedis[prop];
    }
    // Return bound function or property
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

module.exports = redisProxy;
