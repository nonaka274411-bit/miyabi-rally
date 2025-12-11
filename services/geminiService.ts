import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFortune = async (locationName: string): Promise<string> => {
  if (!apiKey) {
    return "The spirits are quiet today... (API Key missing)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a wise Japanese spirit living at ${locationName}. 
      Write a very short, mystical, and poetic "Omikuji" (fortune) for a traveler who just arrived here.
      It should be 2-3 sentences max. 
      Include a "Lucky Item" at the end.
      Tone: Mystical, elegant, slightly archaic but understandable.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text || "Fortune cloudy, try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The wind whispers unintelligible words... (Network Error)";
  }
};
