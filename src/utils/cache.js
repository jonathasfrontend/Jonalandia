const { db } = require('../database/service');

class MemoryCache {
  constructor(ttlMs = 60000) {
    this.store = new Map();
    this.ttl = ttlMs;
    this.pending = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttl) {
    this.store.set(key, { value, expiry: Date.now() + (ttl || this.ttl) });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  async getOrFetch(key, fetcher, ttl) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fetcher().then(value => {
      this.set(key, value, ttl);
      this.pending.delete(key);
      return value;
    }).catch(err => {
      this.pending.delete(key);
      throw err;
    });

    this.pending.set(key, promise);
    return promise;
  }
}

const rolePermCache = new MemoryCache(30000);
const channelBlockCache = new MemoryCache(30000);
const guildConfigCache = new MemoryCache(60000);

async function getRolePermissions(guildId) {
  return rolePermCache.getOrFetch(`rp_${guildId}`,
    () => db.rolePermissions.findOne({ guildId })
  );
}

async function getBlockedChannels(guildId) {
  const cached = channelBlockCache.get(`bc_${guildId}`);
  if (cached) return cached;
  const channels = await db.channels.findByGuild(guildId);
  const ids = channels.map(c => c.channelId);
  channelBlockCache.set(`bc_${guildId}`, ids);
  return ids;
}

function invalidateGuildCache(guildId) {
  rolePermCache.delete(`rp_${guildId}`);
  channelBlockCache.delete(`bc_${guildId}`);
  guildConfigCache.delete(`gc_${guildId}`);
}

function invalidateAllCache() {
  rolePermCache.clear();
  channelBlockCache.clear();
  guildConfigCache.clear();
}

module.exports = {
  MemoryCache,
  rolePermCache,
  channelBlockCache,
  guildConfigCache,
  getRolePermissions,
  getBlockedChannels,
  invalidateGuildCache,
  invalidateAllCache,
};
