import { openai } from '../openai';
import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface GenerateImageOptions {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

interface GeneratedImage {
  filePath: string;
  publicUrl: string;
  originalPrompt: string;
}

export async function generateAndSaveImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const {
    prompt,
    size = '1024x1024',
    quality = 'standard',
    style = 'natural'
  } = options;

  console.log('🎨 Generating image with prompt:', prompt.substring(0, 100) + '...');

  try {
    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: size,
      quality: quality,
      style: style,
      n: 1
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    console.log('✅ Image generated successfully, downloading...');

    // Create a unique filename
    const hash = crypto.randomBytes(4).toString('hex');
    const sanitizedPrompt = prompt
      .substring(0, 50)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    const filename = `${sanitizedPrompt}_${hash}.png`;

    // Ensure the directory exists
    const saveDir = path.join(process.cwd(), 'attached_assets', 'generated_images');
    await fs.mkdir(saveDir, { recursive: true });

    const filePath = path.join(saveDir, filename);

    // Download and save the image
    await downloadImage(imageUrl, filePath);

    console.log(`✅ Image saved to: ${filePath}`);

    return {
      filePath,
      publicUrl: `/attached_assets/generated_images/${filename}`,
      originalPrompt: prompt
    };
  } catch (error: any) {
    console.error('❌ Image generation failed:', error.message);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

async function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = require('fs').createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err: Error) => {
        require('fs').unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// Helper function to generate educational image prompts
export function createEducationalImagePrompt(
  topic: string,
  description: string,
  style: 'diagram' | 'illustration' | 'infographic' | 'realistic' = 'illustration'
): string {
  const styleInstructions = {
    diagram: 'Create a clean, educational diagram with clear labels and simple shapes.',
    illustration: 'Create a colorful, engaging educational illustration suitable for students.',
    infographic: 'Create a modern infographic with icons, text, and visual elements.',
    realistic: 'Create a realistic educational photograph or rendering.'
  };

  return `${styleInstructions[style]} Topic: ${topic}. ${description} Style: professional, educational, appropriate for students, high quality, clear and informative.`;
}
