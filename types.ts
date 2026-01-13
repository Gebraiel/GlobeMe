export interface CountryConfig {
  id: string;
  name: string;
  promptModifier: string;
}

export interface GeneratedImage {
  countryId: string;
  imageUrl: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface GenerationRequest {
  base64Image: string;
  mimeType: string;
}
