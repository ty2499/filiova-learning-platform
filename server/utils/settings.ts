import { db } from '../db';
import { adminSettings, systemSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface SettingCache {
  [key: string]: { value: string | null; timestamp: number };
}

const settingsCache: SettingCache = {};
const systemSettingsCache: SettingCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSetting(key: string, fallbackEnvKey?: string): Promise<string | null> {
  const now = Date.now();
  
  // Check cache first
  if (settingsCache[key] && (now - settingsCache[key].timestamp) < CACHE_TTL) {
    return settingsCache[key].value;
  }

  try {
    // Try to get from database first
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, key))
      .limit(1);

    if (setting && setting.settingValue && setting.isActive) {
      // Cache the value
      settingsCache[key] = { value: setting.settingValue, timestamp: now };
      return setting.settingValue;
    }
  } catch (error) {
    console.warn(`Failed to retrieve setting '${key}' from database:`, error);
  }

  // Fallback to environment variable
  const envValue = fallbackEnvKey ? process.env[fallbackEnvKey] : process.env[key];
  
  if (envValue) {
    settingsCache[key] = { value: envValue, timestamp: now };
    return envValue;
  }

  // No value found
  settingsCache[key] = { value: null, timestamp: now };
  return null;
}

export async function getSystemSetting(key: string): Promise<string | null> {
  const now = Date.now();
  
  // Check cache first
  if (systemSettingsCache[key] && (now - systemSettingsCache[key].timestamp) < CACHE_TTL) {
    return systemSettingsCache[key].value;
  }

  try {
    // Get from system_settings table
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (setting && setting.value) {
      // Cache the value
      systemSettingsCache[key] = { value: setting.value, timestamp: now };
      return setting.value;
    }
  } catch (error) {
    console.warn(`Failed to retrieve system setting '${key}' from database:`, error);
  }

  // No value found
  systemSettingsCache[key] = { value: null, timestamp: now };
  return null;
}

export function clearSettingsCache(key?: string) {
  if (key) {
    delete settingsCache[key];
    delete systemSettingsCache[key];
  } else {
    Object.keys(settingsCache).forEach(k => delete settingsCache[k]);
    Object.keys(systemSettingsCache).forEach(k => delete systemSettingsCache[k]);
  }
}

// Specific helper functions for common settings
export async function getStripeSecretKey(): Promise<string | null> {
  return getSetting('stripe_secret_key', 'STRIPE_SECRET_KEY');
}

export async function getStripePublishableKey(): Promise<string | null> {
  return getSetting('stripe_publishable_key', 'STRIPE_PUBLISHABLE_KEY');
}

export async function getOpenAIKey(): Promise<string | null> {
  return getSetting('openai_api_key', 'OPENAI_API_KEY');
}

export async function getCloudinaryConfig(): Promise<{
  cloudName: string | null;
  apiKey: string | null;
  apiSecret: string | null;
}> {
  const [cloudName, apiKey, apiSecret] = await Promise.all([
    getSetting('cloudinary_cloud_name', 'CLOUDINARY_CLOUD_NAME'),
    getSetting('cloudinary_api_key', 'CLOUDINARY_API_KEY'),
    getSetting('cloudinary_api_secret', 'CLOUDINARY_API_SECRET')
  ]);

  return { cloudName, apiKey, apiSecret };
}

export async function getEmailConfig(): Promise<{
  host: string | null;
  port: string | null;
  user: string | null;
  pass: string | null;
}> {
  const [host, port, user, pass] = await Promise.all([
    getSetting('smtp_host', 'SMTP_HOST'),
    getSetting('smtp_port', 'SMTP_PORT'),
    getSetting('smtp_user', 'SMTP_USER'),
    getSetting('smtp_pass', 'SMTP_PASS')
  ]);

  return { host, port, user, pass };
}

export async function getVonageConfig(): Promise<{
  apiKey: string | null;
  apiSecret: string | null;
}> {
  const [apiKey, apiSecret] = await Promise.all([
    getSetting('vonage_api_key', 'VONAGE_API_KEY'),
    getSetting('vonage_api_secret', 'VONAGE_API_SECRET')
  ]);

  return { apiKey, apiSecret };
}

export async function getPayPalConfig(): Promise<{
  clientId: string | null;
  clientSecret: string | null;
  environment: string | null;
}> {
  const [clientId, clientSecret, environment] = await Promise.all([
    getSetting('paypal_client_id', 'PAYPAL_CLIENT_ID'),
    getSetting('paypal_client_secret', 'PAYPAL_CLIENT_SECRET'),
    getSetting('paypal_environment', 'PAYPAL_ENVIRONMENT')
  ]);

  return { clientId, clientSecret, environment };
}
