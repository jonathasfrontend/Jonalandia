CREATE TABLE IF NOT EXISTS guild_configs (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL UNIQUE,
  guild_name VARCHAR(256) NOT NULL,
  owner_id VARCHAR(64) NOT NULL,
  owner_tag VARCHAR(128),
  is_active BOOLEAN DEFAULT true,
  bot_added_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  welcome_channel_id VARCHAR(64),
  goodbye_channel_id VARCHAR(64),
  logs_info_channel_id VARCHAR(64),
  logs_error_channel_id VARCHAR(64),
  rules_channel_id VARCHAR(64),
  moderator_role_id VARCHAR(64),
  immune_role_id VARCHAR(64),
  new_member_role_id VARCHAR(64),
  punishment_config JSONB DEFAULT '{}',
  prefix VARCHAR(8) DEFAULT '!',
  language VARCHAR(8) DEFAULT 'pt-BR',
  timezone VARCHAR(64) DEFAULT 'America/Sao_Paulo',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guild_configs_is_active ON guild_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_guild_configs_owner_id ON guild_configs(owner_id);

CREATE TABLE IF NOT EXISTS channels_server (
  id SERIAL PRIMARY KEY,
  channel_id VARCHAR(64) NOT NULL UNIQUE,
  channel_name VARCHAR(256) NOT NULL,
  channel_type INTEGER NOT NULL,
  guild_id VARCHAR(64) NOT NULL,
  guild_name VARCHAR(256) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS infractions_users (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  username VARCHAR(128) NOT NULL,
  avatar_url TEXT,
  account_created_date TIMESTAMP,
  joined_server_date TIMESTAMP,
  infractions JSONB DEFAULT '{}',
  logs JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_infractions_guild_user ON infractions_users(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_infractions_username ON infractions_users(username);

CREATE TABLE IF NOT EXISTS temp_bans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  username VARCHAR(128) NOT NULL,
  guild_id VARCHAR(64) NOT NULL,
  banned_by VARCHAR(128) NOT NULL,
  ban_reason TEXT NOT NULL,
  ban_date TIMESTAMP DEFAULT NOW(),
  unban_date TIMESTAMP NOT NULL,
  duration VARCHAR(32) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_temp_bans_unban ON temp_bans(unban_date, is_active);
CREATE INDEX IF NOT EXISTS idx_temp_bans_guild ON temp_bans(guild_id);

CREATE TABLE IF NOT EXISTS ticket_configs (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL UNIQUE,
  channel_id VARCHAR(64) DEFAULT NULL,
  category_id VARCHAR(64) DEFAULT NULL,
  support_role_id VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL UNIQUE,
  guild_name VARCHAR(256) NOT NULL,
  moderator_role_id VARCHAR(64) DEFAULT NULL,
  moderator_role_name VARCHAR(256) DEFAULT NULL,
  immune_role_id VARCHAR(64) DEFAULT NULL,
  immune_role_name VARCHAR(256) DEFAULT NULL,
  new_member_role_id VARCHAR(64) DEFAULT NULL,
  new_member_role_name VARCHAR(256) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vote_ban_users (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  target_user_id VARCHAR(64) NOT NULL,
  target_username VARCHAR(128) NOT NULL,
  target_avatar_url TEXT,
  started_by VARCHAR(64) NOT NULL,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP NOT NULL,
  votes JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vote_ban_guild_target ON vote_ban_users(guild_id, target_user_id);

CREATE TABLE IF NOT EXISTS notification_channels (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  channel_id VARCHAR(64) NOT NULL,
  channel_name VARCHAR(256) NOT NULL,
  notification_type VARCHAR(32) NOT NULL CHECK (notification_type IN ('twitch', 'youtube', 'free_games', 'welcome', 'goodbye')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, notification_type)
);

CREATE TABLE IF NOT EXISTS notification_twitch (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  title VARCHAR(512) NOT NULL,
  streamer VARCHAR(256) NOT NULL,
  image TEXT,
  gamer VARCHAR(256),
  notified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, title, streamer)
);

CREATE TABLE IF NOT EXISTS notification_youtube (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  title VARCHAR(512) NOT NULL,
  author VARCHAR(256) NOT NULL,
  thumbnail TEXT,
  description TEXT,
  notified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, title, author)
);

CREATE TABLE IF NOT EXISTS streamers (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, name)
);

CREATE TABLE IF NOT EXISTS youtube_channels (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  name VARCHAR(256) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, name)
);

CREATE TABLE IF NOT EXISTS game_notifications (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(64) NOT NULL,
  title VARCHAR(512) NOT NULL,
  genre VARCHAR(128),
  platform VARCHAR(64),
  release_date VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, title, platform)
);
