import { GoogleGenAI, Modality } from "@google/genai";
import type { Commodity } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. The actual API key is expected to be
  // injected by the execution environment.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generatePodcastScript(commodity: Commodity): Promise<string> {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    En tant qu'expert des marchés pour le groupement UNL, recherche sur le web les informations les plus récentes (tendances de prix, facteurs d'offre et de demande, perspectives) sur le marché du ${commodity.name}.

    Ensuite, utilise ces informations pour rédiger un script de podcast. Le dialogue doit se faire entre Eric André, Président du groupement UNL, et Olivier Deschamps, directeur.

    Format du script:
    - Dialogue clair utilisant les noms complets comme préfixes, par exemple "Eric André:" et "Olivier Deschamps:".
    - Olivier Deschamps pose des questions pour guider la discussion.
    - Eric André répond avec les informations clés que tu as trouvées, de manière synthétique et accessible.
    - Le ton doit être professionnel et adapté aux adhérents du groupement UNL.
    - Le script doit durer environ 2 minutes (300-350 mots).
    - Ne retourne que le script, sans préambule ni texte additionnel.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Error generating script for ${commodity.name}:`, error);
    throw new Error(`Failed to generate script. Please check API configuration.`);
  }
}

export async function generatePodcastAudio(script: string): Promise<string> {
  const model = "gemini-2.5-flash-preview-tts";
  
  const ttsPrompt = `TTS the following conversation between Eric André and Olivier Deschamps:\n${script}`;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: ttsPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                    {
                        speaker: 'Eric André',
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Charon' } // Voix d'expert, posée et masculine
                        }
                    },
                    {
                        speaker: 'Olivier Deschamps',
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Puck' } // Voix de journaliste, dynamique et masculine
                        }
                    }
              ]
            }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error("Failed to generate audio. The model may be unavailable or the script was invalid.");
  }
}