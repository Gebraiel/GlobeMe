import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { CountryConfig } from '../types';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a variant of the uploaded person in a specific country context.
 * Single attempt only (no retries/waiting) for maximum speed.
 */
export const generateCountryVariant = async (
  base64Image: string,
  mimeType: string,
  country: CountryConfig
): Promise<string> => {
  
  // Clean base64 string if it includes the data URI prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

  const prompt = `
    Task: Generate a photo of the SPECIFIC PERSON from the input image situated in ${country.name}.
    
    CRITICAL INSTRUCTION: IDENTITY PRESERVATION
    - You MUST PRESERVE the exact facial features, skin tone, age, gender, and facial proportions of the input image.
    - The person in the output MUST be recognizable as the EXACT same person from the source.
    - Do not "westernize" or "localize" the person's facial features. Only change the environment and clothing.
    
    Scene Description:
    - ${country.promptModifier}
    - The lighting should be realistic and match the environment.
    
    Style:
    - Photorealistic, 8k resolution.
    - Shot on a 85mm portrait lens.
    - Natural skin texture (do not airbrush).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: cleanBase64, mimeType: mimeType } },
        ],
      },
      config: {
        temperature: 0.3,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      }
    });

    // Safely access candidates
    const candidate = response.candidates?.[0];

    if (!candidate) throw new Error("No candidates returned from the API.");

    if (!candidate.content) {
      const reason = (candidate as any).finishReason || 'Unknown';
      throw new Error(`Generation blocked by safety filters. Reason: ${reason}`);
    }

    const parts = candidate.content.parts;
    if (!parts || parts.length === 0) throw new Error("No content parts available in the response.");

    // Extract the image from the response
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If no image found
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
       throw new Error(`Model returned text instead of image: ${textPart.text.substring(0, 100)}...`);
    }
    throw new Error('No image data found in response.');

  } catch (error: any) {
    // CLEAN THE ERROR MESSAGE
    // The API often returns a JSON object inside the error.message string.
    let cleanMessage = error.message || 'Unknown error';
    
    // Attempt to extract JSON { "error": ... } from the string to get the clean message
    const jsonMatch = cleanMessage.match(/(\{.*"error":.*\})/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.error && parsed.error.message) {
          cleanMessage = parsed.error.message;
        }
      } catch (e) {
        // Parsing failed, strip prefix
        cleanMessage = cleanMessage.replace(/^[A-Za-z]+Error:\s*/, '');
      }
    }

    console.error(`Error generating image for ${country.name}:`, cleanMessage);
    throw new Error(cleanMessage);
  }
};