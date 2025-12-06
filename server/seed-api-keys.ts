import { db } from './db';
import { adminSettings } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface APIKey {
  key: string;
  envVar: string;
  category: string;
  description: string;
  isSensitive: boolean;
}

const apiKeysToSeed: APIKey[] = [
  // NON-SENSITIVE CONFIGURATION (can be stored in database and managed via admin)
  // These are public identifiers, URLs, or non-secret configuration
  
  // Cloudinary (Storage) - cloud name is public
  { key: 'cloudinary_cloud_name', envVar: 'CLOUDINARY_CLOUD_NAME', category: 'storage', description: 'Cloudinary cloud name for image/file storage', isSensitive: false },
  
  // Cloudflare R2 (Storage) - bucket name and public URL are non-sensitive
  { key: 'cloudflare_r2_bucket_name', envVar: 'CLOUDFLARE_R2_BUCKET_NAME', category: 'storage', description: 'Cloudflare R2 bucket name', isSensitive: false },
  { key: 'cloudflare_r2_public_url', envVar: 'CLOUDFLARE_R2_PUBLIC_URL', category: 'storage', description: 'Cloudflare R2 public URL for accessing files', isSensitive: false },
  
  // Email Configuration (non-secret values)
  { key: 'smtp_host', envVar: 'SMTP_HOST', category: 'email', description: 'SMTP server hostname', isSensitive: false },
  { key: 'smtp_port', envVar: 'SMTP_PORT', category: 'email', description: 'SMTP server port', isSensitive: false },
  { key: 'smtp_user', envVar: 'SMTP_USER', category: 'email', description: 'SMTP username/email', isSensitive: false },
  { key: 'email_from_name', envVar: 'EMAIL_FROM_NAME', category: 'email', description: 'Default email sender name', isSensitive: false },
  { key: 'email_from_email', envVar: 'EMAIL_FROM_EMAIL', category: 'email', description: 'Default email sender address', isSensitive: false },
  
  // Supabase (Auth) - URL is public
  { key: 'supabase_url', envVar: 'SUPABASE_URL', category: 'auth', description: 'Supabase project URL', isSensitive: false },
  
  // PayPal environment setting
  { key: 'paypal_environment', envVar: 'PAYPAL_ENVIRONMENT', category: 'payment', description: 'PayPal environment (sandbox or production)', isSensitive: false },
  
  // Agora - App ID is public
  { key: 'agora_app_id', envVar: 'AGORA_APP_ID', category: 'api', description: 'Agora app ID for video/audio calls', isSensitive: false },
  
  // Certifier - Group IDs are non-secret
  { key: 'certifier_certificate_group_id', envVar: 'CERTIFIER_CERTIFICATE_GROUP_ID', category: 'api', description: 'Certifier certificate template group ID', isSensitive: false },
  { key: 'certifier_diploma_group_id', envVar: 'CERTIFIER_DIPLOMA_GROUP_ID', category: 'api', description: 'Certifier diploma template group ID', isSensitive: false },
  
  // WhatsApp - Phone number and account IDs are non-secret
  { key: 'whatsapp_phone_number_id', envVar: 'WHATSAPP_PHONE_NUMBER_ID', category: 'api', description: 'WhatsApp Business phone number ID', isSensitive: false },
  { key: 'whatsapp_business_account_id', envVar: 'WHATSAPP_BUSINESS_ACCOUNT_ID', category: 'api', description: 'WhatsApp Business account ID', isSensitive: false },
  
  // SENSITIVE KEYS - These are stored as placeholders only (for reference)
  // Actual values MUST come from environment variables only
  { key: 'stripe_secret_key', envVar: 'STRIPE_SECRET_KEY', category: 'payment', description: 'Stripe secret key (ENV ONLY)', isSensitive: true },
  { key: 'stripe_publishable_key', envVar: 'STRIPE_PUBLISHABLE_KEY', category: 'payment', description: 'Stripe publishable key (ENV ONLY)', isSensitive: true },
  { key: 'paypal_client_id', envVar: 'PAYPAL_CLIENT_ID', category: 'payment', description: 'PayPal client ID (ENV ONLY)', isSensitive: true },
  { key: 'paypal_client_secret', envVar: 'PAYPAL_CLIENT_SECRET', category: 'payment', description: 'PayPal client secret (ENV ONLY)', isSensitive: true },
  { key: 'cloudinary_api_key', envVar: 'CLOUDINARY_API_KEY', category: 'storage', description: 'Cloudinary API key (ENV ONLY)', isSensitive: true },
  { key: 'cloudinary_api_secret', envVar: 'CLOUDINARY_API_SECRET', category: 'storage', description: 'Cloudinary API secret (ENV ONLY)', isSensitive: true },
  { key: 'cloudflare_account_id', envVar: 'CLOUDFLARE_ACCOUNT_ID', category: 'storage', description: 'Cloudflare account ID (ENV ONLY)', isSensitive: true },
  { key: 'cloudflare_r2_access_key_id', envVar: 'CLOUDFLARE_R2_ACCESS_KEY_ID', category: 'storage', description: 'Cloudflare R2 access key (ENV ONLY)', isSensitive: true },
  { key: 'cloudflare_r2_secret_access_key', envVar: 'CLOUDFLARE_R2_SECRET_ACCESS_KEY', category: 'storage', description: 'Cloudflare R2 secret key (ENV ONLY)', isSensitive: true },
  { key: 'smtp_pass', envVar: 'SMTP_PASS', category: 'email', description: 'SMTP password (ENV ONLY)', isSensitive: true },
  { key: 'vonage_api_key', envVar: 'VONAGE_API_KEY', category: 'sms', description: 'Vonage API key (ENV ONLY)', isSensitive: true },
  { key: 'vonage_api_secret', envVar: 'VONAGE_API_SECRET', category: 'sms', description: 'Vonage API secret (ENV ONLY)', isSensitive: true },
  { key: 'supabase_anon_key', envVar: 'SUPABASE_ANON_KEY', category: 'auth', description: 'Supabase anon key (ENV ONLY)', isSensitive: true },
  { key: 'supabase_service_role_key', envVar: 'SUPABASE_SERVICE_ROLE_KEY', category: 'auth', description: 'Supabase service role key (ENV ONLY)', isSensitive: true },
  { key: 'openai_api_key', envVar: 'OPENAI_API_KEY', category: 'api', description: 'OpenAI API key (ENV ONLY)', isSensitive: true },
  { key: 'anthropic_api_key', envVar: 'ANTHROPIC_API_KEY', category: 'api', description: 'Anthropic API key (ENV ONLY)', isSensitive: true },
  { key: 'agora_app_certificate', envVar: 'AGORA_APP_CERTIFICATE', category: 'api', description: 'Agora app certificate (ENV ONLY)', isSensitive: true },
  { key: 'certifier_api_key', envVar: 'CERTIFIER_API_KEY', category: 'api', description: 'Certifier API key (ENV ONLY)', isSensitive: true },
  { key: 'whatsapp_access_token', envVar: 'WHATSAPP_ACCESS_TOKEN', category: 'api', description: 'WhatsApp access token (ENV ONLY)', isSensitive: true },
  { key: 'whatsapp_webhook_verify_token', envVar: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN', category: 'api', description: 'WhatsApp webhook token (ENV ONLY)', isSensitive: true },
  { key: 'session_secret', envVar: 'SESSION_SECRET', category: 'security', description: 'Session secret (ENV ONLY)', isSensitive: true },
];

export async function seedAPIKeys() {
  console.log('🔑 Seeding API keys from environment variables...');
  
  let seededCount = 0;
  let skippedCount = 0;
  
  for (const apiKey of apiKeysToSeed) {
    try {
      // Check if this key already exists in the database
      const [existing] = await db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.settingKey, apiKey.key))
        .limit(1);
      
      const envValue = process.env[apiKey.envVar];
      
      // SENSITIVE KEYS: Never store actual values in database
      // Only create placeholders for admin UI reference
      if (apiKey.isSensitive) {
        if (!existing) {
          await db.insert(adminSettings).values({
            settingKey: apiKey.key,
            settingValue: null, // Never store sensitive values
            category: apiKey.category,
            description: apiKey.description,
            isEncrypted: true, // Mark as sensitive
            isActive: envValue ? true : false, // Active if env var exists
            updatedBy: 'system'
          });
        }
        skippedCount++;
        continue;
      }
      
      // NON-SENSITIVE KEYS: Can store values from env vars or admin input
      if (existing) {
        // If key exists in DB but env has a value and DB doesn't, update it
        if (envValue && !existing.settingValue) {
          await db
            .update(adminSettings)
            .set({
              settingValue: envValue,
              category: apiKey.category,
              description: apiKey.description,
              isActive: true,
              updatedAt: new Date()
            })
            .where(eq(adminSettings.settingKey, apiKey.key));
          console.log(`  ✅ Updated ${apiKey.key} from environment variable`);
          seededCount++;
        } else {
          skippedCount++;
        }
      } else if (envValue) {
        // Insert new setting only if environment variable exists
        await db.insert(adminSettings).values({
          settingKey: apiKey.key,
          settingValue: envValue,
          category: apiKey.category,
          description: apiKey.description,
          isEncrypted: false,
          isActive: true,
          updatedBy: 'system'
        });
        console.log(`  ✅ Seeded ${apiKey.key} from environment variable`);
        seededCount++;
      } else {
        // Create placeholder entry for keys that don't have env values
        await db.insert(adminSettings).values({
          settingKey: apiKey.key,
          settingValue: null,
          category: apiKey.category,
          description: apiKey.description,
          isEncrypted: false,
          isActive: false,
          updatedBy: 'system'
        });
        console.log(`  ℹ️  Created placeholder for ${apiKey.key} (no env value)`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error seeding ${apiKey.key}:`, error);
    }
  }
  
  console.log(`🔑 API key seeding complete: ${seededCount} seeded/updated, ${skippedCount} skipped/placeholders`);
}
