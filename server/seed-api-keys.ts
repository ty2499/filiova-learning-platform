import { db } from './db';
import { adminSettings } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface APIKey {
  key: string;
  envVar: string;
  category: string;
  description: string;
}

const apiKeysToSeed: APIKey[] = [
  // Stripe
  { key: 'stripe_secret_key', envVar: 'STRIPE_SECRET_KEY', category: 'payment', description: 'Stripe secret key for payment processing' },
  { key: 'stripe_publishable_key', envVar: 'STRIPE_PUBLISHABLE_KEY', category: 'payment', description: 'Stripe publishable key for client-side integration' },
  
  // OpenAI
  { key: 'openai_api_key', envVar: 'OPENAI_API_KEY', category: 'api', description: 'OpenAI API key for AI content generation' },
  
  // Cloudinary
  { key: 'cloudinary_cloud_name', envVar: 'CLOUDINARY_CLOUD_NAME', category: 'storage', description: 'Cloudinary cloud name for image/file storage' },
  { key: 'cloudinary_api_key', envVar: 'CLOUDINARY_API_KEY', category: 'storage', description: 'Cloudinary API key' },
  { key: 'cloudinary_api_secret', envVar: 'CLOUDINARY_API_SECRET', category: 'storage', description: 'Cloudinary API secret' },
  
  // Email/SMTP
  { key: 'smtp_host', envVar: 'SMTP_HOST', category: 'email', description: 'SMTP server hostname' },
  { key: 'smtp_port', envVar: 'SMTP_PORT', category: 'email', description: 'SMTP server port' },
  { key: 'smtp_user', envVar: 'SMTP_USER', category: 'email', description: 'SMTP username/email' },
  { key: 'smtp_pass', envVar: 'SMTP_PASS', category: 'email', description: 'SMTP password' },
  
  // Vonage (SMS)
  { key: 'vonage_api_key', envVar: 'VONAGE_API_KEY', category: 'sms', description: 'Vonage API key for SMS functionality' },
  { key: 'vonage_api_secret', envVar: 'VONAGE_API_SECRET', category: 'sms', description: 'Vonage API secret' },
  
  // PayPal
  { key: 'paypal_client_id', envVar: 'PAYPAL_CLIENT_ID', category: 'payment', description: 'PayPal client ID' },
  { key: 'paypal_client_secret', envVar: 'PAYPAL_CLIENT_SECRET', category: 'payment', description: 'PayPal client secret' },
  { key: 'paypal_environment', envVar: 'PAYPAL_ENVIRONMENT', category: 'payment', description: 'PayPal environment (sandbox or production)' },
  
  // Supabase
  { key: 'supabase_url', envVar: 'SUPABASE_URL', category: 'storage', description: 'Supabase project URL' },
  { key: 'supabase_service_key', envVar: 'SUPABASE_SERVICE_KEY', category: 'storage', description: 'Supabase service role key' },
  
  // Anthropic
  { key: 'anthropic_api_key', envVar: 'ANTHROPIC_API_KEY', category: 'api', description: 'Anthropic API key for Claude AI' },
  
  // Airlift
  { key: 'airlift_api_key', envVar: 'AIRLIFT_API_KEY', category: 'api', description: 'Airlift API key for fast content delivery and performance optimization' },
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
