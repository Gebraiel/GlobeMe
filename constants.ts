import { CountryConfig } from './types';

export const COUNTRIES: CountryConfig[] = [
  {
    id: 'egypt',
    name: 'Egypt',
    promptModifier: 'Location: Busy street in downtown Cairo or Khan el-Khalili market. Lighting: Warm, golden hour sun with long shadows. Vibe: Authentic, lively, dusty atmosphere. Clothing: Casual modern outfit mixed with local style.'
  },
  {
    id: 'usa',
    name: 'United States',
    promptModifier: 'Location: New York City Brooklyn brownstone street or Santa Monica pier. Lighting: Bright, natural daylight, slightly cool tones. Vibe: Energetic, urban, candid. Clothing: Casual American streetwear, denim, relaxed fit.'
  },
  {
    id: 'saudi_arabia',
    name: 'Saudi Arabia',
    promptModifier: 'Location: Modern Riyadh Boulevard or historic Diriyah district. Lighting: Soft, diffused sunset light, warm desert hues. Vibe: Elegant, respectful, high-end. Clothing: Wearing a high-quality traditional Thobe (men) or elegant Abaya/Modest fashion (women).'
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    promptModifier: 'Location: Dubai Marina waterfront with blurred skyscrapers in background. Lighting: Crystal clear, bright high-noon sunlight, high contrast. Vibe: Luxury, futuristic, clean. Clothing: Smart casual, polished, expensive-looking fabric.'
  },
  {
    id: 'germany',
    name: 'Germany',
    promptModifier: 'Location: Berlin Kreuzberg street art district or Munich Englischer Garten. Lighting: Overcast, soft diffuse light (cloudy day), muted colors. Vibe: Cool, moody, hipster, sharp. Clothing: Stylish winter coat, scarf, layered European fashion.'
  },
  {
    id: 'china',
    name: 'China',
    promptModifier: 'Location: Shanghai Bund waterfront at dusk with neon lights reflecting or a Beijing Hutong. Lighting: Mixed lighting (natural fading light + city neon), cinematic. Vibe: Dynamic, bustling. Clothing: Modern Asian urban fashion, trendy.'
  }
];

export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
