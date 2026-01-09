import Config from 'react-native-config';

export interface SyncEnvironment {
  API_URL: string;
  SYNC_INTERVAL: number;
  MAX_RETRIES: number;
  BATCH_SIZE: number;
  TIMEOUT: number;
  CONFLICT_STRATEGY: 'LWW' | 'MANUAL';
  ENABLE_BACKGROUND_SYNC: boolean;
  SQLITE_DB_NAME: string;
}

/**
 * Load sync configuration from environment variables with fallbacks
 */
export function loadSyncEnvironment(): SyncEnvironment {
  return {
    API_URL: Config.API_URL || 'http://localhost:3001/api',
    SYNC_INTERVAL: parseInt(Config.SYNC_INTERVAL || '30000'), // 30 seconds
    MAX_RETRIES: parseInt(Config.SYNC_MAX_RETRIES || '3'),
    BATCH_SIZE: parseInt(Config.SYNC_BATCH_SIZE || '50'),
    TIMEOUT: parseInt(Config.SYNC_TIMEOUT || '45000'), // 45 seconds
    CONFLICT_STRATEGY: (Config.SYNC_CONFLICT_STRATEGY as 'LWW' | 'MANUAL') || 'LWW',
    ENABLE_BACKGROUND_SYNC: Config.ENABLE_BACKGROUND_SYNC === 'true',
    SQLITE_DB_NAME: Config.SQLITE_DB_NAME || 'nilelink_sync.db'
  };
}

/**
 * Validate environment configuration
 */
export function validateSyncEnvironment(config: SyncEnvironment): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.API_URL) {
    errors.push('API_URL is required');
  }

  if (config.SYNC_INTERVAL < 5000) {
    errors.push('SYNC_INTERVAL must be at least 5000ms');
  }

  if (config.MAX_RETRIES < 0 || config.MAX_RETRIES > 10) {
    errors.push('MAX_RETRIES must be between 0 and 10');
  }

  if (config.BATCH_SIZE < 1 || config.BATCH_SIZE > 1000) {
    errors.push('BATCH_SIZE must be between 1 and 1000');
  }

  if (config.TIMEOUT < 10000) {
    errors.push('TIMEOUT must be at least 10000ms');
  }

  if (!['LWW', 'MANUAL'].includes(config.CONFLICT_STRATEGY)) {
    errors.push('CONFLICT_STRATEGY must be either LWW or MANUAL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}