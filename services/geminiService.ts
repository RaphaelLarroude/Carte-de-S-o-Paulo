
import { GoogleGenAI } from "@google/genai";

export async function getGroundedLocationInfo(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Fournissez des informations détaillées et des liens officiels Google Maps sur le lieu ou la région suivante à São Paulo : "${query}". Parlez de son importance historique et de ce que le visiteur peut s'attendre à y trouver. Répondez exclusivement en français.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: -23.5505,
              longitude: -46.6333
            }
          }
        }
      },
    });

    const text = response.text || "Information non disponible pour le moment.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text,
      links: chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any) => ({
          uri: chunk.maps.uri,
          title: chunk.maps.title || "Voir sur Google Maps"
        }))
    };
  } catch (error) {
    console.error("Gemini Grounding Error:", error);
    return { text: "Erreur lors du chargement des données géographiques.", links: [] };
  }
}
