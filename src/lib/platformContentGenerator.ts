import OpenAI from 'openai';

export interface ProductData {
  title: string;
  description: string;
  reviews?: string;
  price?: string;
  images?: string[];
}

export interface PlatformContent {
  tiktok: string;
  medium: string;
  reddit: string;
  pinterest: string;
}

const PLATFORM_PROMPTS: Record<keyof PlatformContent, string> = {
  tiktok: `Generate a viral TikTok video script for the following product. Make it engaging, short, and include a call to action.`,
  medium: `Write a Medium article introduction and summary for the following product. Make it informative and persuasive.`,
  reddit: `Create a Reddit post for r/BuyItForLife about the following product. Make it authentic, detailed, and community-focused.`,
  pinterest: `Write a Pinterest pin description for the following product. Make it catchy, visual, and include relevant hashtags.`,
};

export async function generatePlatformContent(
  product: ProductData,
  openaiApiKey: string
): Promise<PlatformContent> {
  const openai = new OpenAI({ apiKey: openaiApiKey });
  const results: Partial<PlatformContent> = {};

  const baseInfo = `Title: ${product.title}\nDescription: ${product.description}\nReviews: ${product.reviews || ''}\nPrice: ${product.price || ''}\nImages: ${(product.images || []).join(', ')}`;

  for (const [platform, prompt] of Object.entries(PLATFORM_PROMPTS)) {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: `You are an expert social media marketer.` },
      { role: 'user', content: `${prompt}\n\n${baseInfo}` },
    ];
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 400,
      temperature: 0.8,
    });
    results[platform as keyof PlatformContent] = response.choices[0]?.message?.content?.trim() || '';
  }

  return results as PlatformContent;
}
