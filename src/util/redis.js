const IORedis = require('ioredis');
const cfg = require('../../config');

class Redis {
  get (key, getter, ttl = 300) {
    return new Promise((res, rej) => {
      this.redis.get(key, async (err, reply) => {
        if (err) {
          console.error('Redis error:', err);
          rej(err);
        } else {
          if (reply === null) {
            const value = await getter();
            this.set(key, value, ttl);
            res(value);
          } else {
            res(reply);
          }
        }
      });
    });
  }

  set (key, value, ttl = 300) {
    if (ttl === 0) {
      this.redis.set(key, value);
    } else {
      this.redis.set(key, value, 'EX', ttl);
    }
  }

  del (key) {
    this.redis.del(key);
  }

  get redis () {
    if (!this._redis) {
      this._redis = new IORedis({
        ...cfg.redis,
        retryStrategy: (times) => Math.min(times * 50, 250)
      });
    }
    return this._redis;
  }
}

module.exports = Redis;
