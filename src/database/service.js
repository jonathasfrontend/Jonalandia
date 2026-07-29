const { query } = require('./supabase');
const { v4: uuidv4 } = require('uuid');

function rowToCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

function rowsToCamel(rows) {
  return rows.map(rowToCamel);
}

async function findOne(table, filter) {
  const keys = Object.keys(filter);
  if (keys.length === 0) return null;
  const conditions = keys.map((k, i) => `${k.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`);
  const values = Object.values(filter);
  const { rows } = await query(`SELECT * FROM ${table} WHERE ${conditions.join(' AND ')} LIMIT 1`, values);
  return rows.length ? rowToCamel(rows[0]) : null;
}

async function findMany(table, filter = {}, orderBy = null) {
  const keys = Object.keys(filter);
  let sql = 'SELECT * FROM ' + table;
  const values = [];
  if (keys.length > 0) {
    const conditions = keys.map((k, i) => {
      values.push(filter[k]);
      return `${k.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`;
    });
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  if (orderBy) sql += ' ORDER BY ' + orderBy;
  const { rows } = await query(sql, values);
  return rowsToCamel(rows);
}

async function insertOne(table, data) {
  const snake = {};
  for (const [k, v] of Object.entries(data)) {
    snake[k.replace(/([A-Z])/g, '_$1').toLowerCase()] = v;
  }
  const keys = Object.keys(snake);
  const cols = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = Object.values(snake);
  const { rows } = await query(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

async function insertMany(table, dataArray) {
  if (dataArray.length === 0) return [];
  const results = [];
  for (const data of dataArray) {
    try {
      const result = await insertOne(table, data);
      results.push(result);
    } catch (err) {
      if (err.code !== '23505') throw err;
    }
  }
  return results;
}

async function updateOne(table, filter, data) {
  const filterKeys = Object.keys(filter);
  if (filterKeys.length === 0) return null;
  const filterConditions = filterKeys.map((k, i) => {
    return `${k.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`;
  });
  const filterValues = Object.values(filter);
  const dataSnake = {};
  for (const [k, v] of Object.entries(data)) {
    dataSnake[k.replace(/([A-Z])/g, '_$1').toLowerCase()] = v;
  }
  const dataKeys = Object.keys(dataSnake);
  const setClauses = dataKeys.map((k, i) => {
    return `${k} = $${filterKeys.length + i + 1}`;
  });
  const allValues = [...filterValues, ...Object.values(dataSnake)];
  const { rows } = await query(
    `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${filterConditions.join(' AND ')} RETURNING *`,
    allValues
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

async function upsertOne(table, conflictCols, data) {
  const snake = {};
  for (const [k, v] of Object.entries(data)) {
    snake[k.replace(/([A-Z])/g, '_$1').toLowerCase()] = v;
  }
  const keys = Object.keys(snake);
  const cols = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const updateSet = keys.map(k => `${k} = EXCLUDED.${k}`).join(', ');
  const conflictTarget = conflictCols.map(c => c.replace(/([A-Z])/g, '_$1').toLowerCase()).join(', ');
  const values = Object.values(snake);
  const { rows } = await query(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateSet} RETURNING *`,
    values
  );
  return rows.length ? rowToCamel(rows[0]) : null;
}

async function deleteOne(table, filter) {
  const keys = Object.keys(filter);
  if (keys.length === 0) return null;
  const conditions = keys.map((k, i) => `${k.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`);
  const values = Object.values(filter);
  const { rowCount } = await query(`DELETE FROM ${table} WHERE ${conditions.join(' AND ')}`, values);
  return { deletedCount: rowCount };
}

function parseJsonField(obj, field) {
  if (!obj) return null;
  if (typeof obj[field] === 'string') {
    try { obj[field] = JSON.parse(obj[field]); } catch (e) { obj[field] = {}; }
  }
  if (typeof obj[field] === 'object' && obj[field] !== null && !Array.isArray(obj[field])) {
    return obj[field];
  }
  if (Array.isArray(obj[field])) return obj[field];
  return Array.isArray(obj[field]) ? obj[field] : {};
}

const db = {
  guilds: {
    findOne: (filter) => findOne('guild_configs', filter),
    findByGuildId: (guildId) => findOne('guild_configs', { guildId }),
    getAllActive: () => findMany('guild_configs', { isActive: true }),
    create: (data) => insertOne('guild_configs', data),
    update: (guildId, data) => updateOne('guild_configs', { guildId }, data),
    deactivate: async (guildId) => {
      return updateOne('guild_configs', { guildId }, { isActive: false, leftAt: new Date() });
    },
  },

  channels: {
    findAll: (filter) => findMany('channels_server', filter),
    findByGuild: (guildId) => findMany('channels_server', { guildId }),
    findById: (channelId) => findOne('channels_server', { channelId }),
    create: (data) => insertOne('channels_server', data),
    createMany: (dataArray) => insertMany('channels_server', dataArray),
    deleteOne: (filter) => deleteOne('channels_server', filter),
    deleteMany: (filter) => {
      const keys = Object.keys(filter);
      if (keys.length === 0) return Promise.resolve({ deletedCount: 0 });
      const conditions = keys.map((k, i) => `${k.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${i + 1}`);
      const values = Object.values(filter);
      return query(`DELETE FROM channels_server WHERE ${conditions.join(' AND ')}`, values).then(r => ({ deletedCount: r.rowCount }));
    },
  },

  infractions: {
    findOne: (filter) => findOne('infractions_users', filter),
    findByUsername: async (username) => {
      const { rows } = await query('SELECT * FROM infractions_users WHERE LOWER(username) = LOWER($1) LIMIT 1', [username]);
      return rows.length ? rowToCamel(rows[0]) : null;
    },
    create: (data) => insertOne('infractions_users', data),
    update: (id, data) => updateOne('infractions_users', { id }, data),
    findByGuildAndUser: (guildId, userId) => findOne('infractions_users', { guildId, userId }),
  },

  tempBans: {
    find: (filter) => findMany('temp_bans', filter, 'unban_date ASC'),
    findOne: (filter) => findOne('temp_bans', filter),
    create: (data) => insertOne('temp_bans', data),
    update: (id, data) => updateOne('temp_bans', { id }, data),
    findExpired: async () => {
      const { rows } = await query('SELECT * FROM temp_bans WHERE unban_date <= NOW() AND is_active = true', []);
      return rowsToCamel(rows);
    },
    findByGuildId: (guildId) => findMany('temp_bans', { guildId, isActive: true }, 'unban_date ASC'),
  },

  tickets: {
    findOne: (filter) => findOne('ticket_configs', filter),
    create: (data) => insertOne('ticket_configs', data),
    upsert: (guildId, data) => upsertOne('ticket_configs', ['guild_id'], { guildId, ...data }),
  },

  rolePermissions: {
    findOne: (filter) => findOne('role_permissions', filter),
    create: (data) => insertOne('role_permissions', data),
    upsert: (guildId, data) => upsertOne('role_permissions', ['guild_id'], { guildId, ...data }),
  },

  voteBan: {
    create: (data) => insertOne('vote_ban_users', data),
    findOne: (filter) => findOne('vote_ban_users', filter),
    update: (id, data) => updateOne('vote_ban_users', { id }, data),
  },

  notificationChannels: {
    findOne: (filter) => findOne('notification_channels', filter),
    upsert: (guildId, notificationType, data) =>
      upsertOne('notification_channels', ['guild_id', 'notification_type'], { guildId, notificationType, ...data }),
  },

  twitchNotifications: {
    findOne: (filter) => findOne('notification_twitch', filter),
    create: (data) => insertOne('notification_twitch', data),
  },

  youtubeNotifications: {
    findOne: (filter) => findOne('notification_youtube', filter),
    create: (data) => insertOne('notification_youtube', data),
  },

  streamers: {
    find: (filter) => findMany('streamers', filter),
    findOne: (filter) => findOne('streamers', filter),
    create: (data) => insertOne('streamers', data),
    deleteOne: (filter) => deleteOne('streamers', filter),
  },

  youtubeChannels: {
    find: (filter) => findMany('youtube_channels', filter),
    findOne: (filter) => findOne('youtube_channels', filter),
    create: (data) => insertOne('youtube_channels', data),
    deleteOne: (filter) => deleteOne('youtube_channels', filter),
  },

  gameNotifications: {
    findOne: (filter) => findOne('game_notifications', filter),
    create: (data) => insertOne('game_notifications', data),
  },
};

module.exports = {
  db,
  query,
  rowToCamel,
  rowsToCamel,
  findOne,
  findMany,
  insertOne,
  insertMany,
  updateOne,
  upsertOne,
  deleteOne,
};
