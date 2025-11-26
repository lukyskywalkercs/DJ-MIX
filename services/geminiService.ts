import { GoogleGenAI, Type } from "@google/genai";
import { AIAdvice, SuggestionsResponse } from '../types';

export const getMixingAdvice = async (trackA: string, trackB: string): Promise<AIAdvice> => {
  if (!process.env.API_KEY) {
    console.error("No API KEY");
    return {
        transition: "API Key missing.",
        energy: "N/A",
        technical: "Please configure environment."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a professional DJ. I am mixing two tracks.
    Deck A: "${trackA}"
    Deck B: "${trackB}"
    
    Provide mixing advice in Spanish in a JSON format.
    1. Transition Strategy (how to move from A to B).
    2. Energy Management (how the energy levels compare).
    3. Technical Tips (EQ usage, BPM matching notes).
    Keep it concise (max 2 sentences per field).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transition: { type: Type.STRING },
            energy: { type: Type.STRING },
            technical: { type: Type.STRING }
          },
          required: ["transition", "energy", "technical"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AIAdvice;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      transition: "Error generating advice.",
      energy: "Unknown",
      technical: "Check connection."
    };
  }
};

export const getTrackSuggestions = async (trackA: string | null, trackB: string | null): Promise<SuggestionsResponse> => {
  if (!process.env.API_KEY) return { detectedVibe: "", suggestions: [] };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = [trackA, trackB].filter(Boolean).join(" and ");
  
  const prompt = `
    I am a DJ playing a set. currently playing: ${context || "nothing yet"}.
    
    First, analyze the genre, vibe, and energy of the tracks provided based on their artist and title.
    Then, Suggest 3 distinct songs that would fit perfectly as the NEXT track.
    
    Return a JSON object with:
    - detectedVibe: A short description (in Spanish) of the current musical style/mood detected from the input tracks.
    - suggestions: An array of 3 tracks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedVibe: { type: Type.STRING, description: "Analysis of current genre and mood in Spanish" },
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                    artist: { type: Type.STRING },
                    title: { type: Type.STRING },
                    bpm: { type: Type.STRING },
                    reason: { type: Type.STRING, description: "Reason in Spanish" },
                    },
                    required: ["artist", "title", "bpm", "reason"]
                }
            }
          },
          required: ["detectedVibe", "suggestions"]
        }
      }
    });

    const jsonText = response.text || '{"detectedVibe": "", "suggestions": []}';
    return JSON.parse(jsonText) as SuggestionsResponse;
  } catch (error) {
    console.error("Gemini Suggestions Error:", error);
    return { detectedVibe: "Error analyzing tracks", suggestions: [] };
  }
};